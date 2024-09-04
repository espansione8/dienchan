import { json as json$1 } from '@sveltejs/kit';
import { writeFile, mkdir, unlink, readdir, rmdir } from 'fs';

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // Allow the `mask` parameter to be optional
        cb = mask;
        mask = 0o744;
    }
    mkdir(path, { mode: mask, recursive: true }, function (err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // Ignore the error if the folder already exists
            else cb(err); // Something else went wrong
        } else cb(null); // Successfully created folder
    });
}

export const POST = async ({ request }) => {

    const body = await request.json();
    const file = body.image
    const dir = body.directory
    const filesArray = body.filesArray
    const reqType = body.reqType
    const fileName = body.fileName
    if (reqType === 'delete') {
        console.log('delete file');
        const path = `static/${dir}/${fileName}`
        unlink(path, (err) => {
            if (err) {
                console.error(err)
                return {
                    status: 500,
                    body: {
                        message: 'remove file upload'
                    }
                }
            }
            //file removed

            readdir(`static/${dir}`, (err, files) => {
                if (err)
                    console.log('readdir', err);
                else {
                    console.log('directory files:', files, files.length);
                    if (files.length === 0) {
                        rmdir(`static/${dir}`, (err) => {
                            if (err) {
                                return console.log("error occurred in deleting directory", err);
                            }
                            //console.log("Directory deleted successfully");
                        });
                    }
                }
            })

        })
        //console.log('file deleted');

        return json$1({
            message: `file removed: ${fileName}`,
            file: fileName
        })
    } else {
        let jpgCheck = false
        filesArray.forEach(element => {
            const check = element.includes(".pdf") || element.includes(".PDF")
            if (!check) {
                jpgCheck = false
            } else {
                jpgCheck = true
            }
        });

        //console.log('upload body', body);
        // ensureExists(`static/${dir}`, 0o744, function (err) {
        //     if (err || !jpgCheck) {
        //         console.log('upload err', err);

        //     }
        //     else {
        //         writeFile(`static/${dir}/${fileName}`, file, 'base64', (err) => {
        //             if (err) { console.log('file err', err); }
        //             // else {
        //             //     console.log("File written successfully\n");
        //             // }
        //         }
        //         )
        //     }
        // });
        if (!jpgCheck) {
            return json$1({
                message: 'error file upload'
            }, {
                status: 500
            })
        } else {
            return json$1({
                message: 'file uploaded'
            })
        }
    }
    // const data = JSON.parse((await request.body.read()).toString());
    //const file = data['image'];
}