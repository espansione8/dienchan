// src/lib/tools/trainingPdf.ts
// Builder condiviso del PDF "Riepilogo formazione": lo usano /profile-area (il socio stampa il proprio storico)
// e /user-table (l'admin stampa lo storico di qualsiasi utente), così il layout resta unico.
// Client-side come gli altri PDF del progetto (pdfmake dal bundle browser) e richiede PUBLIC_BASE_URL per il logo.
import { PUBLIC_BASE_URL } from '$env/static/public';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { notification } from '$lib/stores/notifications';
import { formatDate } from '$lib/tools/tools';

// PDF Fonts
const pdfFonts = {
	// download default Roboto font from cdnjs.com
	Roboto: {
		normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
		bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
		italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
		bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
	}
};

export const createPDFtraining = (user) => {
	if (!user?.name || !user?.surname) {
		notification.error('Dati utente incompleti per generare il riepilogo formazione');
		return;
	}
	const entries = [...(user.trainingHistory || [])].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
	if (entries.length === 0) {
		notification.error('Nessuna voce di formazione da esportare');
		return;
	}
	// totali coerenti con i contatori a schermo: solo le voci approvate
	const approvedEntries = entries.filter((entry) => entry.approved === true);
	const approvedHours = approvedEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
	const tableBody = [
		[
			{ text: 'Data', style: 'tableHeader' },
			{ text: 'Descrizione', style: 'tableHeader' },
			{ text: 'Ore', style: 'tableHeader', alignment: 'center' },
			{ text: 'Stato', style: 'tableHeader', alignment: 'center' }
		],
		...entries.map((entry) => [
			{ text: formatDate(entry.date), style: 'tableData' },
			{ text: entry.description || 'N/A', style: 'tableData' },
			{ text: (entry.hours || 0).toString(), style: 'tableData', alignment: 'center' },
			{
				text: entry.approved === true ? 'Approvato' : 'In attesa',
				style: entry.approved === true ? 'statusApproved' : 'statusPending',
				alignment: 'center'
			}
		]),
		[
			{ text: 'Totale ore approvate', colSpan: 2, style: 'totalLabelBold', alignment: 'right' },
			{},
			{ text: approvedHours.toString(), style: 'totalValueBold', alignment: 'center' },
			{
				text: `${approvedEntries.length} / ${entries.length} approvate`,
				style: 'totalValueBold',
				alignment: 'center'
			}
		]
	];

	const doc = {
		compress: true,
		pageSize: 'A4',
		pageOrientation: 'portrait', // portrait or landscape
		pageMargins: [40, 140, 40, 60], // [left, top, right, bottom]

		header: {
			margin: [40, 20, 40, 0],
			stack: [
				// fit mantiene le proporzioni del logo senza dipendere dalle sue dimensioni reali
				{ image: 'logo', fit: [130, 60], alignment: 'center', margin: [0, 0, 0, 8] },
				{ text: 'Associazione DIEN CHAN - BQC - ITALIA', style: 'companyName', alignment: 'center' },
				{ text: 'Via Ticino, 12F 25015', style: 'companyInfo', alignment: 'center' },
				{ text: 'Desenzano del Garda - Brescia', style: 'companyInfo', alignment: 'center' },
				{ text: 'C.F. 94016070172', style: 'companyInfo', alignment: 'center' },
				{ text: 'info@riflessologiadienchan.it', style: 'companyInfo', alignment: 'center' }
			]
		},

		footer: (currentPage, pageCount) => ({
			text: `Riepilogo formazione generato il ${new Date().toLocaleDateString('it-IT')} - Pagina ${currentPage} di ${pageCount}`,
			style: 'footer',
			alignment: 'center',
			margin: [40, 10, 40, 0]
		}),

		content: [
			{
				text: 'RIEPILOGO FORMAZIONE',
				style: 'mainHeader',
				alignment: 'center',
				margin: [0, 0, 0, 10]
			},
			{
				text: `${user.name} ${user.surname}`,
				style: 'sectionHeader',
				alignment: 'center'
			},
			{
				text: `ID socio: ${user.userId || 'N/A'}`,
				style: 'valueText',
				alignment: 'center',
				margin: [0, 0, 0, 20]
			},

			{
				text: 'VOCI DI FORMAZIONE',
				style: 'sectionHeader',
				margin: [0, 10, 0, 10]
			},
			{
				table: {
					headerRows: 1,
					widths: ['15%', '*', '10%', '20%'],
					body: tableBody
				},
				layout: {
					fillColor: function (rowIndex) {
						return rowIndex === 0 ? '#2E5BBA' : rowIndex % 2 === 0 ? '#F2F2F2' : null;
					},
					hLineWidth: function () {
						return 1;
					},
					vLineWidth: function () {
						return 1;
					},
					hLineColor: function () {
						return '#CCCCCC';
					},
					vLineColor: function () {
						return '#CCCCCC';
					}
				}
			}
		],

		styles: {
			companyName: {
				fontSize: 14,
				bold: true,
				color: '#2E5BBA'
			},
			companyInfo: {
				fontSize: 9,
				color: '#555555'
			},
			mainHeader: {
				fontSize: 20,
				bold: true,
				color: '#2E5BBA'
			},
			sectionHeader: {
				fontSize: 12,
				bold: true,
				color: '#2E5BBA'
			},
			valueText: {
				fontSize: 10,
				color: '#555555'
			},
			tableHeader: {
				fontSize: 10,
				bold: true,
				color: 'white'
			},
			tableData: {
				fontSize: 9,
				color: '#333333'
			},
			totalLabelBold: {
				fontSize: 10,
				bold: true,
				color: '#2E5BBA'
			},
			totalValueBold: {
				fontSize: 10,
				bold: true,
				color: '#2E5BBA'
			},
			statusApproved: {
				fontSize: 9,
				bold: true,
				color: '#008000'
			},
			statusPending: {
				fontSize: 9,
				bold: true,
				color: '#FF6600'
			},
			footer: {
				fontSize: 8,
				italics: true,
				color: '#888888'
			}
		},

		images: {
			// in browser is supported loading images via url (https or http protocol) (minimal version: 0.1.67)
			logo: `${PUBLIC_BASE_URL}/images/logo-dien-chan-new.png`
		}
	};

	try {
		pdfMake
			.createPdf(doc, null, pdfFonts)
			.download(`Formazione_${user.name}_${user.surname}_${new Date().toISOString().split('T')[0]}.pdf`);
	} catch (error) {
		console.error('PDF generation failed:', error);
		notification.error('Errore nella generazione del riepilogo formazione');
	}
};
