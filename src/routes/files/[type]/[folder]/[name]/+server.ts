import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import type { RequestHandler } from './$types';

const FILES_DIR = './uploads';

// Ensure uploads directory exists
if (!fsSync.existsSync(FILES_DIR)) {
    fsSync.mkdirSync(FILES_DIR, { recursive: true });
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
    svg: 'image/svg+xml',
    gif: 'image/gif',
    // Audio
    mp3: 'audio/mp3',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    // Video
    webm: 'video/webm',
    mp4: 'video/mp4',
    avi: 'video/avi',
    mov: 'video/quicktime',

    lookup(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase().slice(1);
        return (ext && this[ext as keyof typeof mimes]) ?? 'application/octet-stream';
    }
} as const;

const isPathSafe = (filePath: string, baseDir: string): boolean => {
    const resolvedPath = path.resolve(filePath);
    const resolvedBase = path.resolve(baseDir);
    return resolvedPath.startsWith(resolvedBase);
};

const sanitizePathComponent = (component: string): string => {
    // Remove or replace dangerous characters
    //return component.replace(/[<>:"|?*\x00-\x1f]/g, '_').trim();
    return component.replace(/[<>:"|?*\u0000-\u001f]/g, '_').trim();
};

export const GET: RequestHandler = async ({ params, request }) => {
    try {
        // Validate and sanitize path parameters
        if (!params.type || !params.folder || !params.name) {
            return new Response('Missing required parameters', { status: 400 });
        }

        const sanitizedType = sanitizePathComponent(params.type);
        const sanitizedFolder = sanitizePathComponent(params.folder);
        const sanitizedName = sanitizePathComponent(params.name);

        // Construct file path
        const filePath = path.join(FILES_DIR, sanitizedType, sanitizedFolder, sanitizedName);

        // Security check: ensure path is within uploads directory
        if (!isPathSafe(filePath, FILES_DIR)) {
            console.warn('Path traversal attempt blocked:', filePath);
            return new Response('Forbidden', { status: 403 });
        }

        // Check if file exists and get stats
        let stats;
        try {
            stats = await fs.stat(filePath);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return new Response('File not found', { status: 404 });
            }
            throw error; // Re-throw other errors
        }

        // Ensure it's a file, not a directory
        if (!stats.isFile()) {
            return new Response('Not a file', { status: 400 });
        }

        // Generate ETag for caching
        const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`;

        // Handle conditional requests
        const ifNoneMatch = request.headers.get('if-none-match');
        if (ifNoneMatch === etag) {
            return new Response(null, { status: 304 });
        }

        // Determine content type
        const contentType = mimes.lookup(filePath);

        // Prepare headers
        const headers = new Headers({
            'ETag': etag,
            'Content-Type': contentType,
            'Content-Length': stats.size.toString(),
            'Cache-Control': 'max-age=604800, public',
            'Last-Modified': stats.mtime.toUTCString(),
            'Accept-Ranges': 'bytes'
        });

        // Handle range requests for large files
        const range = request.headers.get('range');
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

            if (start >= stats.size || end >= stats.size || start > end) {
                return new Response('Range Not Satisfiable', { status: 416 });
            }

            const chunkSize = (end - start) + 1;
            const stream = fsSync.createReadStream(filePath, { start, end });
            const webStream = Readable.toWeb(stream);

            headers.set('Content-Range', `bytes ${start}-${end}/${stats.size}`);
            headers.set('Content-Length', chunkSize.toString());

            return new Response(webStream, {
                status: 206,
                headers
            });
        }

        // Create read stream and convert to web stream
        const nodeStream = fsSync.createReadStream(filePath);
        const webStream = Readable.toWeb(nodeStream);

        // Handle stream errors
        nodeStream.on('error', (error) => {
            console.error('Stream error:', error);
        });

        return new Response(webStream, { headers });

    } catch (error) {
        console.error('Error serving file:', error);

        // Provide more specific error information in development
        const isDev = process.env.NODE_ENV === 'development';
        const errorMessage = isDev
            ? `Internal Server Error: ${(error as Error).message}`
            : 'Internal Server Error';

        return new Response(errorMessage, { status: 500 });
    }
};