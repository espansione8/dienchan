import type { Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import Tesseract from 'tesseract.js';

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const receiptFile = formData.get('receipt') as File;

        if (!receiptFile || receiptFile.size === 0) {
            return fail(400, { message: 'Please upload a receipt image.' });
        }

        try {
            const fileBuffer = await receiptFile.arrayBuffer();
            const result = await Tesseract.recognize(
                Buffer.from(fileBuffer),
                'ita',
                {
                    //logger: m => console.log(m),
                    //tessedit_pageseg_mode: 1,
                    tessjs_load_language: 'ita',
                    tessjs_load_language_model: true,
                    tessdata_path: '/data', // Assuming /data is in your public/static folder
                }
            );

            //console.log(result);

            const { data } = await Tesseract.recognize(
                Buffer.from(fileBuffer),
                'ita', // 'eng' 'ita'
            );

            //const ocrText = data.text;
            const ocrText = result.data.text;
            //const dateRegex = /\b\d{2}([\/-])\d{2}\1\d{4}\b/; // regex to find date format
            const dateRegex = /\d{2}([-/])\d{2}\1(\d{4}|\d{2})/;

            let receiptDate: string | null = null;
            const match = ocrText.match(dateRegex);
            if (match) {
                // match[0] contains the full string that matched the regex
                receiptDate = match[0];
                console.log(`receipt date: ${receiptDate}`);
            } else {
                console.log("no date");
            }

            return { extractedText: ocrText, extractedDate: receiptDate };
        } catch (e) {
            console.error('Error during OCR:', e);
            return error(500, { message: 'Failed to process the receipt image.' });
        }
    },
};