// ${BASE_URL}/api/uploads/files
import { json } from '@sveltejs/kit';
import { promises as fsPromises } from 'node:fs';
import fsSync from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { RequestHandler } from './$types';

const FILES_DIR = './uploads';

if (!fsSync.existsSync(FILES_DIR)) {
    fsSync.mkdirSync(FILES_DIR, { recursive: true });
    console.log(`Directory ${FILES_DIR} creata.`);
} else {
    console.log(`Directory ${FILES_DIR} esiste già.`);
}

export const POST: RequestHandler = async (event) => {
    if (!event.request.body) {
        return json({ message: 'No request body' }, { status: 400 });
    }

    const fileName = event.request.headers.get('x-file-name');
    const folderName = event.request.headers.get('x-folder-name');

    if (!fileName || !folderName) {
        console.error('Errore: Header x-file-name o x-folder-name mancante.');
        await event.request.body.cancel();
        return json({ message: 'Missing fileName or folderName header' }, { status: 400 });
    }

    const folderComponents = folderName.split(/[\\/]/).filter(Boolean);
    const sanitizedFolderComponents = folderComponents.map(component =>
        component.replace(/[^a-zA-Z0-9_-]/g, '').trim() // Permette solo caratteri alfanumerici, underscore e trattini
    ).filter(Boolean); // Rimuove eventuali componenti che diventano vuoti dopo la sanitizzazione

    if (sanitizedFolderComponents.length === 0) {
        console.error(`Errore: Nome cartella non valido dopo sanitizzazione dei componenti. folderName originale: '${folderName}'.`);
        await event.request.body.cancel();
        return json({ message: 'Invalid folder name after sanitization.' }, { status: 400 });
    }

    //const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '').trim(); // OLD
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._\- ]/g, '').trim(); // GPT

    if (!sanitizedFileName) {
        console.error(`Errore: Nome file non valido dopo sanitizzazione. fileName originale: '${fileName}'.`);
        await event.request.body.cancel();
        return json({ message: 'Invalid fileName after sanitization.' }, { status: 400 });
    }

    // Validate filename for security
    const validFileNameRegex = /^[a-zA-Z0-9._\- ]+$/;
    if (!validFileNameRegex.test(fileName) || fileName !== fileName.trim()) {
        console.error(`Errore: Nome file non valido. fileName originale: '${fileName}'.`);
        await event.request.body.cancel();
        return json({ message: 'Invalid fileName. Contains forbidden characters or leading/trailing spaces.' }, { status: 400 });
    }

    const dirPath = path.join(FILES_DIR, ...sanitizedFolderComponents);
    //const filePath = path.join(dirPath, sanitizedFileName);
    const filePath = path.join(dirPath, fileName);

    // console.log(`Tentativo di upload: folderName='${folderName}' (sanitizzato a '${sanitizedFolderComponents.join(path.sep)}'), fileName='${sanitizedFileName}'`);
    // console.log(`Percorso directory: ${dirPath}`);
    // console.log(`Percorso file completo: ${filePath}`);

    try {
        await fsPromises.mkdir(dirPath, { recursive: true });
        //console.log(`Directory '${dirPath}' assicurata/creata.`);

        // Configura gli stream
        const webReadStream: any = event.request.body;
        const nodeReadStream = Readable.fromWeb(webReadStream);
        const writeStream = fsSync.createWriteStream(filePath);
        //console.log(`WriteStream creato per '${filePath}'. Inizio pipeline...`);

        // Utilizza pipeline per una gestione robusta dello stream
        await pipeline(nodeReadStream, writeStream);
        //console.log(`Pipeline completata. File caricato con successo: ${filePath}`);

        return json({ message: 'Upload OK' }, { status: 200 });

    } catch (error) {
        console.error('Errore durante l\'upload:', error);

        try {
            // Controlla se il file esiste prima di tentare di eliminarlo
            if (fsSync.existsSync(filePath)) {
                await fsPromises.unlink(filePath);
                console.log(`File parzialmente caricato eliminato: ${filePath}`);
            } else {
                console.log(`Nessun file parziale trovato da eliminare: ${filePath}`);
            }
        } catch (unlinkError) {
            console.error('Errore durante la pulizia del file parzialmente caricato:', unlinkError);
        }

        const errorMessage = (error instanceof Error) ? error.message : 'Unknown upload error';
        return json({ message: `Upload failed: ${errorMessage}` }, { status: 500 });
    }
};

import fs from 'node:fs';
export const DELETE = async ({ request }) => {
    try {
        const body = await request.json();
        const { dir, fileName } = body;

        if (!dir || !fileName) return json({ message: 'Missing dir or fileName' }, { status: 400 });

        const filePath = path.join(FILES_DIR, dir, fileName);
        const dirPath = path.join(FILES_DIR, dir);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err)
                return json({ message: 'User file delete error' }, { status: 500 });
            }
            //file removed

            //// remove dir
            fs.readdir(dirPath, (err, files) => {
                if (err)
                    console.log('readdir', err);
                else {
                    //console.log('directory files:', files, files.length);
                    if (files.length === 0) {
                        fs.rmdir(dirPath, (err) => {
                            if (err) {
                                return console.log("error occurred in deleting directory", err);
                            }
                            //console.log("Directory deleted successfully");
                        });
                    }
                }
            })

        })
        return json({ message: 'file removed' }, { status: 200 });
        // const dirPath = path.join(FILES_DIR, dir);
        // const files = await fs.readdir(dirPath);

        // if (files.length == 0) {
        //     await fs.rmdir(dirPath);
        // }
    } catch (error) {
        console.error('Delete error:', error);
        return json({ message: 'Error deleting file' }, { status: 500 });
    }
};