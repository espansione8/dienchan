import fs from 'node:fs';
import path from 'node:path';
//import { Readable } from 'node:stream';
// import { pipeline, PassThrough } from 'node:stream';
// import { promisify } from 'node:util';

const FILES_DIR = './uploads';
if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
}


/** @type {import('./$types').RequestHandler} */
export async function GET({ params, request }) {
    const file_path = path.normalize(path.join(FILES_DIR, params.type, params.folder, params.name));

    if (!fs.existsSync(file_path)) {
        return new Response('not found', { status: 400 });
    }

    const stats = fs.statSync(file_path);
    const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`;

    if (request.headers.get('if-none-match') === etag) {
        return new Response(null, { status: 304 });
    }

    const headers = {
        ETag: etag,
        'Content-Type': mimes.lookup(file_path),
        'Content-Length': stats.size,
        'Cache-Control': 'max-age=60', // default
        //'Cache-Control': 'no-cache', // response can be stored in caches, but the response must be validated with the origin server before each reuse
        //'Cache-Control': 'no-store', // any caches of any kind (private or shared) should not store this response.
        'Last-Modified': stats.mtime.toUTCString()
    };

    try {
        // const nodejs_rstream = fs.createReadStream(file_path);
        // return new Response(nodejs_rstream, { headers });
        const fileBuffer = fs.readFileSync(file_path);
        return new Response(fileBuffer, { headers });
    } catch (error) {
        console.error('Error handling request1:', error);
        return new Response('Internal Server Error1', { status: 500 });
    }

}

const mimes = {
    // Text
    txt: 'text/plain',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Images
    webp: 'image/webp',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    avif: 'image/avif',
    // Audio
    mp3: 'audio/mp3',
    // Video
    webm: 'video/webm',
    mp4: 'video/mp4',

    /** @param {string} string */
    lookup(string) {
        const ext = string.toLowerCase().split('.').at(-1);
        return (ext && this[/** @type {keyof typeof mimes} */ (ext)]) ?? 'application/octet-stream';
    }
};