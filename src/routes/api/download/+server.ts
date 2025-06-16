// src/routes/api/download-csv/+server.ts
import { error } from '@sveltejs/kit';
import Papa from 'papaparse'; // Assicurati di aver installato papaparse: npm install papaparse
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    try {
        // Leggi il corpo della richiesta come JSON
        const { exportData, fileName } = await request.json();

        // Verifica che i dati essenziali siano presenti
        if (!exportData || !Array.isArray(exportData) || !fileName) {
            throw error(400, 'Dati per l\'esportazione o nome del file mancanti/invalidi.');
        }

        // --- Converti i Dati in Stringa CSV ---
        const csvString = Papa.unparse(exportData, {
            quotes: false,
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ',',
            header: true,
            skipEmptyLines: false
        });

        // --- Prepara i Dettagli del File ---
        const finalFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`; // Assicura estensione .csv
        const contentType = 'text/csv';
        const csvBuffer = Buffer.from(csvString, 'utf-8');

        // Restituisci la Response con il contenuto del file
        return new Response(csvBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(finalFileName)}`,
                'Content-Length': csvBuffer.length.toString(),
            },
        });

    } catch (e) {
        console.error('Errore durante la generazione e il download del CSV dall\'API:', e);
        // Utilizza error() di SvelteKit per gestire gli errori HTTP
        if (e instanceof Error && (e as any).status) { // Se è un errore HTTP lanciato da SvelteKit
            throw e;
        }
        throw error(500, 'Si è verificato un errore durante la generazione del report.');
    }
}