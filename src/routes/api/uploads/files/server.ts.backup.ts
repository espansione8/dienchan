// ${BASE_URL}/api/uploads/files
// import { json } from '@sveltejs/kit';
// import fs from 'node:fs';

// // import { promises as fsPromises } from 'node:fs';
// // import * as fs from 'node:fs';

// import path from 'node:path';
// import { Readable } from 'node:stream';
// import { pipeline } from 'node:stream/promises';

// const FILES_DIR = 'uploads'
// if (!fs.existsSync(FILES_DIR)) {
//     fs.mkdirSync(FILES_DIR, { recursive: true });
// }

// export const POST = async (event) => {
//     if (!event.request.body) {
//         return json({ message: 'No request body' }, { status: 400 });
//     }

//     const fileName = event.request.headers.get('x-file-name');
//     const folderName = event.request.headers.get('x-folder-name');

//     if (!fileName || !folderName) {
//         await event.request.body.cancel();
//         return json({ message: 'Missing fileName or folderName header' }, { status: 400 });
//     }

//     const filePath = path.normalize(path.join(FILES_DIR, folderName, fileName));
//     const dirPath = path.normalize(path.join(FILES_DIR, folderName));

//     try {
//         //await fs.mkdir(dirPath, { recursive: true });
//         await fs.mkdirSync(dirPath, { recursive: true });  // Create directory if it doesn't exist

//         // Setup streams
//         const webReadStream = event.request.body;
//         const nodeReadStream = Readable.fromWeb(webReadStream);
//         const writeStream = fs.createWriteStream(filePath);

//         // Write file
//         await pipeline(nodeReadStream, writeStream);
//         return json({ message: 'Upload OK' }, { status: 200 });

//     } catch (error) {
//         fs.unlinkSync(filePath); // delete file
//         console.error('Upload error:', error);
//         return json({ message: 'Upload error' }, { status: 500 });
//     }
// };

// export const DELETE = async ({ request }) => {
//     try {
//         const body = await request.json();
//         const { dir, fileName } = body;

//         if (!dir || !fileName) return json({ message: 'Missing dir or fileName' }, { status: 400 });

//         const filePath = path.join(FILES_DIR, dir, fileName);
//         const dirPath = path.join(FILES_DIR, dir);

//         fs.unlink(filePath, (err) => {
//             if (err) {
//                 console.error(err)
//                 return json({ message: 'User file delete error' }, { status: 500 });
//             }
//             //file removed

//             //// remove dir
//             fs.readdir(dirPath, (err, files) => {
//                 if (err)
//                     console.log('readdir', err);
//                 else {
//                     //console.log('directory files:', files, files.length);
//                     if (files.length === 0) {
//                         fs.rmdir(dirPath, (err) => {
//                             if (err) {
//                                 return console.log("error occurred in deleting directory", err);
//                             }
//                             //console.log("Directory deleted successfully");
//                         });
//                     }
//                 }
//             })

//         })
//         return json({ message: 'file removed' }, { status: 200 });
//         // const dirPath = path.join(FILES_DIR, dir);
//         // const files = await fs.readdir(dirPath);

//         // if (files.length == 0) {
//         //     await fs.rmdir(dirPath);
//         // }
//     } catch (error) {
//         console.error('Delete error:', error);
//         return json({ message: 'Error deleting file' }, { status: 500 });
//     }
// };
////////////////