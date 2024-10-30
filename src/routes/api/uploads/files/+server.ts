import { json } from '@sveltejs/kit';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const FILES_DIR = 'uploads';

const initializeUploadsDir = async () => {
    try {
        await fs.access(FILES_DIR);
    } catch {
        await fs.mkdir(FILES_DIR, { recursive: true });
    }
}
await initializeUploadsDir();

export const POST = async (event) => {
    if (!event.request.body) {
        return json({ message: 'No request body' }, { status: 400 });
    }

    const fileName = event.request.headers.get('x-file-name');
    const folderName = event.request.headers.get('x-folder-name');

    if (!fileName || !folderName) {
        await event.request.body.cancel();
        return json({ message: 'Missing fileName or folderName header' }, { status: 400 });
    }

    const filePath = path.normalize(path.join(FILES_DIR, folderName, fileName));
    const dirPath = path.normalize(path.join(FILES_DIR, folderName));

    try {
        // Create directory if it doesn't exist
        await fs.mkdir(dirPath, { recursive: true });

        // // Check if file already exists
        // try {
        //     await fs.access(filePath);
        //     await event.request.body.cancel();
        //     return json({message: 'File already exists'}, { status: 409 });
        // } catch {
        //     // File doesn't exist, we can proceed
        // }

        // Setup streams
        const webReadStream = event.request.body;
        const nodeReadStream = Readable.fromWeb(webReadStream);
        const writeStream = fs.createWriteStream(filePath);

        // Write file
        await pipeline(nodeReadStream, writeStream);
        return json({ message: 'File created successfully' }, { status: 200 });

    } catch (error) {
        // Clean up file if it was partially written
        try {
            await fs.access(filePath);
            await fs.unlink(filePath);
        } catch {
            // File didn't exist or was already deleted
        }

        console.error('Upload error:', error);
        return json({ message: 'Internal server error during upload' }, { status: 500 });
    }
};

export const DELETE = async ({ request }) => {
    try {
        const body = await request.json();
        const { dir, fileName } = body;
        if (!dir || !fileName) return json({ message: 'Missing dir or fileName' }, { status: 400 });

        const filePath = path.join(FILES_DIR, dir, fileName);

        // Check if file exists before attempting deletion
        try {
            await fs.access(filePath);
        } catch {
            return json({ message: 'File not found' }, { status: 404 });
        }

        // Delete the file
        await fs.unlink(filePath);

        // remove empty directory
        try {
            const dirPath = path.join(FILES_DIR, dir);
            const files = await fs.readdir(dirPath);

            if (files.length == 0) {
                await fs.rmdir(dirPath);
            }
        } catch (error) {
            console.error('Error cleaning up empty directory:', error);
            //no err if directory remove fails
        }

        return json({ message: 'File deleted' }, { status: 200 });
    } catch (error) {
        console.error('Delete error:', error);
        return json({ message: 'Error deleting file' }, { status: 500 });
    }
};