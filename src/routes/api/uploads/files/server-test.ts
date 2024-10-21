import { json } from '@sveltejs/kit';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const FILES_DIR = 'uploads';
if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
}

export const POST = async (event) => {
    if (!event.request.body) {
        return new Response(null, { status: 400 });
    }

    const file_name = event.request.headers.get('x-file-name');
    const folder_name = event.request.headers.get('x-folder-name');

    if (!file_name || !folder_name) {
        event.request.body.cancel();
        return new Response(null, { status: 400 });
    }

    const file_path = path.normalize(path.join(FILES_DIR, folder_name, file_name));
    const dir_path = path.normalize(path.join(FILES_DIR, folder_name));

    try {
        await fs.mkdir(dir_path, { recursive: true });
    } catch (err: any) {
        if (err.code !== 'EEXIST') {
            throw err; // Something else went wrong
        }
    }

    const nodejs_wstream = fs.createWriteStream(file_path);
    const web_rstream = event.request.body;
    const nodejs_rstream = Readable.fromWeb(web_rstream);

    try {
        await pipeline(nodejs_rstream, nodejs_wstream);
    } catch (e) {
        await fs.unlink(file_path);
        return new Response(null, { status: 500 });
    }

    return new Response();
}

export const DELETE = async ({ request }) => {
    const body = await request.json();
    const dir = body.userId;
    const fileName = body.fileName;
    const filePath = path.join(FILES_DIR, dir, fileName);

    try {
        await fs.unlink(filePath);
        // Optionally, remove the directory if it's empty
        await fs.rmdir(path.dirname(filePath), { recursive: true });

        return json({ message: 'User file removed' }, { status: 200 });
    } catch (err) {
        console.error(err);
        return json({ message: 'User file delete error' }, { status: 500 });
    }
}