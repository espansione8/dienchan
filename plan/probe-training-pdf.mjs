// plan/probe-training-pdf.mjs — probe T-4/T-5: esegue il VERO corpo di createPDFtraining estratto dal modulo condiviso
// src/lib/tools/trainingPdf.ts e rende un PDF reale con il printer server-side di pdfmake.
// Cancellabile: artefatto di verifica, non codice di produzione.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import PdfPrinter from 'pdfmake';

const root = process.cwd();
const source = readFileSync(join(root, 'src/lib/tools/trainingPdf.ts'), 'utf8');

const start = source.indexOf('const createPDFtraining = (user) => {');
assert.notEqual(start, -1, 'createPDFtraining non trovata nel modulo condiviso');
const end = source.indexOf('\n};', start);
assert.notEqual(end, -1, 'fine di createPDFtraining non trovata');
const body = source.slice(source.indexOf('{', start) + 1, end);

const user = {
	userId: 'TEST12345678',
	name: 'Marco',
	surname: 'Rossi',
	trainingHistory: [
		{ date: '2025-09-20', description: 'Seminario Bellezza del Viso', hours: 6, approved: false },
		{ date: '2025-03-14', description: 'Corso Base Dien Chan', hours: 16, approved: true },
		{ date: '2025-06-02', description: 'Aggiornamento Occhi e Vista', hours: 8, approved: true }
	]
};

let doc = null;
let fileName = '';
const pdfMakeStub = {
	createPdf: (d) => {
		doc = d;
		return { download: (name) => (fileName = name) };
	}
};
const notificationStub = { error: (message) => assert.fail(`notification.error inatteso: ${message}`) };
const formatDate = (date) => new Date(date).toLocaleDateString('it-IT');

// il body estratto è esattamente quello della pagina: nessuna copia che possa divergere
const run = new Function('user', 'pdfMake', 'notification', 'PUBLIC_BASE_URL', 'formatDate', 'pdfFonts', body);
run(user, pdfMakeStub, notificationStub, join(root, 'static'), formatDate, {});

assert.ok(doc, 'nessun documento generato');
const tableBody = doc.content.find((item) => item.table)?.table.body;
assert.equal(tableBody.length, 5, 'tabella: 1 riga intestazione + 3 voci + 1 riga totali');
assert.equal(tableBody[0][0].text, 'Data');
assert.deepEqual(
	tableBody.slice(1, 4).map((row) => row[1].text),
	['Seminario Bellezza del Viso', 'Aggiornamento Occhi e Vista', 'Corso Base Dien Chan'],
	'voci ordinate per data decrescente'
);
assert.equal(tableBody[1][3].text, 'In attesa', 'voce non approvata');
assert.equal(tableBody[2][3].text, 'Approvato');
assert.equal(tableBody[4][0].colSpan, 2, 'riga totali: etichetta su due colonne');
assert.equal(tableBody[4][2].text, '24', 'totale ore solo delle approvate');
assert.equal(tableBody[4][3].text, '2 / 3 approvate');
assert.equal(doc.header.stack[0].image, 'logo', 'logo Dienchan in testa');
assert.ok(doc.images.logo.endsWith('images/logo-dien-chan-new.png'), 'immagine logo');
assert.ok(doc.footer(1, 2).text.includes('Pagina 1 di 2'), 'footer con numero pagina');
assert.match(fileName, /^Formazione_Marco_Rossi_\d{4}-\d{2}-\d{2}\.pdf$/, 'nome file PDF');

const printer = new PdfPrinter({
	Roboto: {
		normal: join(root, 'static/fonts/Roboto/Roboto-Regular.ttf'),
		bold: join(root, 'static/fonts/Roboto/Roboto-Medium.ttf'),
		italics: join(root, 'static/fonts/Roboto/Roboto-Italic.ttf'),
		bolditalics: join(root, 'static/fonts/Roboto/Roboto-MediumItalic.ttf')
	}
});
const pdfDoc = printer.createPdfKitDocument(doc);
const chunks = [];
await new Promise((resolve, reject) => {
	pdfDoc.on('data', (chunk) => chunks.push(chunk));
	pdfDoc.on('end', resolve);
	pdfDoc.on('error', reject);
	pdfDoc.end();
});
const buffer = Buffer.concat(chunks);
assert.ok(buffer.length > 5000, `PDF troppo piccolo (${buffer.length} byte): probabile logo o tabella non renderizzati`);
writeFileSync(join(root, 'plan/probe-training-sample.pdf'), buffer);

console.log('OK - tabella 5 righe (intestazione + 3 voci + totali), totali 24 ore / 2 su 3 approvate');
console.log(`OK - PDF renderizzato: plan/probe-training-sample.pdf (${buffer.length} byte)`);
