// ${BASE_URL}/api/uploads/files
import { json } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const FILES_DIR = 'uploads'
if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
}

/** @type {import('./$types').RequestHandler} */
export const POST = async (event) => {
    if (!event.request.body) {
        return new Response(null, { status: 400 });
    }

    const file_name = event.request.headers.get('x-file-name');
    const folder_name = event.request.headers.get('x-folder-name');

    if (!file_name || !folder_name) {
        event.request.body.cancel();
        // Note: This does not do anything if the body is cancelled
        // but we return it anyway
        return new Response(null, { status: 400 });
    }

    const file_path = path.normalize(path.join(FILES_DIR, folder_name, file_name));
    const dir_path = path.normalize(path.join(FILES_DIR, folder_name));

    try {
        await fs.mkdirSync(dir_path, { recursive: true });
    } catch (err: any) {
        if (err.code == 'EEXIST') return; // Ignore the error if the folder already exists
        throw err; // Something else went wrong
    }

    // if (fs.existsSync(file_path)) {
    //     fs.mkdirSync(file_path, { recursive: true });
    //     event.request.body.cancel();
    //     // Note: This does not do anything if the body is cancelled
    //     // but we return it anyway
    //     return new Response(null, { status: 400 });
    // }

    const nodejs_wstream = fs.createWriteStream(file_path);
    // Convert Web `ReadableStream` to a Node.js `Readable` stream
    const web_rstream = event.request.body;
    const nodejs_rstream = Readable.fromWeb(web_rstream);
    // Write file to disk and wait for it to finish
    try {
        await pipeline(nodejs_rstream, nodejs_wstream);
    } catch (e) {
        fs.unlinkSync(file_path);
        return new Response(null, { status: 500 });
    }

    return new Response();
}

export const DELETE = async ({ request }) => {
    const body = await request.json();
    const dir = body.userId
    const fileName = body.fileName
    const path = `uploads/${dir}/${fileName}`

    fs.unlink(path, (err) => {
        if (err) {
            console.error(err)
            // return {
            //     status: 500,
            //     body: {
            //         message: 'User pic update error'
            //     }
            // }
            return json({ message: 'User file delete error' }, { status: 500 });
        }
        //file removed

        //// remove dir
        // fs.readdir(`static/${dir}`, (err, files) => {
        //     if (err)
        //         console.log('readdir', err);
        //     else {
        //         console.log('directory files:', files, files.length);
        //         if (files.length === 0) {
        //             fs.rmdir(`static/${dir}`, (err) => {
        //                 if (err) {
        //                     return console.log("error occurred in deleting directory", err);
        //                 }
        //                 //console.log("Directory deleted successfully");
        //             });
        //         }
        //     }
        // })

    })
    return json({ message: 'User file removed' }, { status: 200 });
}
