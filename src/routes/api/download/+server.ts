// src/routes/api/download-csv/+server.ts
import { error } from '@sveltejs/kit';
import Papa from 'papaparse';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { exportData, fileName } = await request.json();

        if (!exportData || !Array.isArray(exportData) || !fileName) {
            throw error(400, 'Dati per l\'esportazione o nome del file mancanti/invalidi.');
        }

        const csvString = Papa.unparse(exportData, {
            quotes: false,
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ',',
            header: true,
            skipEmptyLines: false
        });

        const finalFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
        const contentType = 'text/csv';
        const csvBuffer = Buffer.from(csvString, 'utf-8');

        return new Response(csvBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(finalFileName)}`,
                'Content-Length': csvBuffer.length.toString(),
            },
        });

    } catch (err) {
        console.error('Errore durante la generazione e il download del CSV dall\'API:', err);
        if (err instanceof Error && 'status' in err) {
            throw err;
        }
        throw error(500, 'Si è verificato un errore durante la generazione del report.');
    }
}