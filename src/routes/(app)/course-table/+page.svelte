<script lang="ts">
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import Papa from 'papaparse';
	import { enhance } from '$app/forms';
	import { notification } from '$lib/stores/notifications';
	import { province, months, days, hours, minutes, pdfValue, layoutArray } from '$lib/stores/arrays';
	import Modal from '$lib/components/Modal.svelte';
	import { courseKeysToDelete } from '$lib/stores/arrays';
	import Loader from '$lib/components/Loader.svelte';
	import { Image } from '@unpic/svelte';
	import {
		Funnel,
		CircleX,
		Trash2,
		Calendar,
		Pen,
		Users,
		Building2,
		Send,
		List,
		Calculator,
		CopyPlus,
		Settings,
		RefreshCcw,
		FileDown,
		ShieldAlert,
		UserRoundCheck,
		Handshake,
		Link,
		ToggleRight,
		ToggleLeft,
		UserRoundX
	} from 'lucide-svelte';

	// PDF maker
	import * as pdfMake from 'pdfmake/build/pdfmake';
	// PDF Fonts
	const pdfFonts = {
		// download default Roboto font from cdnjs.com
		Roboto: {
			normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
			bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
			italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
			bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
		},
		Albatros: {
			normal: `${PUBLIC_BASE_URL}/font/albatros.ttf`
		},

		Montserrat: {
			normal: `${PUBLIC_BASE_URL}/font/Montserrat-SemiBold.ttf`
		}
	};

	const { data } = $props();
	const { getTable, getTableNames, userData, getLayout } = $derived(data);
	let tableList = $state(getTable);
	let loading = $state(false);

	// certification
	let showCheckboxes = $state(false);
	let selectedSubscriber = $state<string[]>([]);
	let certificationStatus = $state(false);
	const toggleCheckboxes = () => {
		showCheckboxes = !showCheckboxes;
		if (!showCheckboxes) {
			selectedSubscriber = [];
		}
	};

	const handleCheckboxChange = (item: any, isChecked: boolean) => {
		if (isChecked) {
			selectedSubscriber = [...selectedSubscriber, item];
		} else {
			selectedSubscriber = selectedSubscriber.filter((user: any) => user.userId !== item.userId);
		}
	};

	const createPDFcert = (item, user) => {
		if (!item?.layoutView?.layoutId || !user?.name || !user?.surname || !user?.certificationDate) {
			notification.error('Dati mancanti per generare il certificato');
			return;
		}
		//console.log('item', item);
		const layoutId = item.layoutView.layoutId;
		// if (layoutId === 'XW7LYV2LG2BU') pdfLayout = pdfBase;
		// if (layoutId === '794792843') pdfLayout = pdfAvanzato;
		// if (layoutId === '3GLAAQRJF2A9') pdfLayout = pdfSoccorso;
		let pdfLayout;
		switch (layoutId) {
			case $layoutArray.base:
				pdfLayout = $pdfValue.base;
				break;
			case $layoutArray.avanzato:
				pdfLayout = $pdfValue.avanzato;
				break;
			case $layoutArray.soccorso:
				pdfLayout = $pdfValue.soccorso;
				break;
			case $layoutArray.difese:
				pdfLayout = $pdfValue.difese;
				break;
			case $layoutArray.occhiVista:
				pdfLayout = $pdfValue.occhiVista;
				break;
			case $layoutArray.occhiVistaCorso:
				pdfLayout = $pdfValue.occhiVistaCorso;
				break;
			case $layoutArray.bellezzaViso:
				pdfLayout = $pdfValue.bellezzaViso;
				break;
			case $layoutArray.bellezzaPancia:
				pdfLayout = $pdfValue.bellezzaPancia;
				break;
			case $layoutArray.dimagriamoInsieme:
				pdfLayout = $pdfValue.dimagriamoInsieme;
				break;
			case $layoutArray.respirazione:
				pdfLayout = $pdfValue.respirazione;
				break;
			default:
				notification.error('Layout certificato non riconosciuto');
				return;
		}

		const dateObject = new Date(user.certificationDate);
		const year = dateObject.getFullYear();
		const month = dateObject.getMonth() + 1; // getMonth() returns 0-11, so add 1 for 1-12
		const day = dateObject.getDate();
		const doc = {
			compress: true,
			pageSize: 'A4',
			pageOrientation: 'landscape', // portrait or landscape
			pageMargins: pdfLayout.pageMargins, // [left, top, right, bottom]
			background: {
				image: 'background',
				width: 841.89, // A4 landscape width in points
				height: 595.28, // A4 landscape height in points
				absolutePosition: { x: 0, y: 0 }
			},
			// header: {
			// 	width: 200,
			// 	image: '/images/cert-header.png',
			// 	margin: [10, 10]
			// },
			content: [
				{
					text: `${user.name} ${user.surname}`,
					font: 'Albatros',
					style: ['header', { color: '#333333' }, { fontSize: 55 }, { alignment: 'center' }]
				},
				{
					text: '',
					margin: pdfLayout.separatorMargin1 // [left, top, right, bottom]
				},
				{
					alignment: 'center',
					columns: [
						{ width: 200, text: '' },
						{ width: pdfLayout.placeCenterWidth, text: '' },
						{ width: 200, text: user.certificationPlace, style: [{ color: '#333333' }, { fontSize: 20 }, { alignment: 'left' }] }
					]
				},
				{
					text: '',
					margin: pdfLayout.separatorMargin2 // [left, top, right, bottom]
				},
				{
					alignment: 'center',
					columns: [
						{
							width: pdfLayout.formatoreWidth,
							text: `${item.name} ${item.surname}`,
							font: 'Albatros',
							style: [{ color: '#333333' }, { fontSize: 34 }, { alignment: 'left' }]
						},
						{ width: pdfLayout.centerWidth, text: '' },
						{ width: pdfLayout.dateWidth, text: `${day} / ${month} / ${year}`, style: [{ color: '#333333' }, { fontSize: 24 }] }
					]
				}
			],

			images: {
				// in browser is supported loading images via url (https or http protocol) (minimal version: 0.1.67)
				background: pdfLayout.background
			}
			//images: ['/training/base.jpg'] // DEPRECATED
		};
		// DEPRECATED
		// const fetchImage = (url) => {
		// 	return fetch(url)
		// 		.then((response) => response.blob())
		// 		.then(
		// 			(blob) =>
		// 				new Promise((resolve, reject) => {
		// 					const reader = new FileReader();
		// 					reader.onloadend = () => resolve(reader.result);
		// 					reader.onerror = reject;
		// 					reader.readAsDataURL(blob);
		// 				})
		// 		);
		// };

		// const fetches = [];
		// doc.images.forEach((src) => {
		// 	fetches.push(
		// 		fetchImage(src).then((data) => {
		// 			doc.images[src] = data;
		// 		})
		// 	);
		// });

		// Promise.all(fetches).then(() => {
		// 	pdfMake.createPdf(doc, null, pdfFonts).download(`${item.shortDescription}-attestato.pdf`);
		// });

		pdfMake.createPdf(doc, null, pdfFonts).download(`Attestato_${item.layoutView.title}_${user.name}_${user.surname}.pdf`);
	};

	const createPDFUserList = (courseItem, subscribers) => {
		// console.log('createPDFUserList', courseItem, subscribers);

		if (!courseItem || !subscribers || subscribers.length === 0) {
			notification.error('Dati mancanti per generare la lista partecipanti');
			return;
		}

		const getPaidCount = (subscribers) => {
			return subscribers.filter((sub) => sub.paymentStatus === 'done').length;
		};

		const tableBody = [
			[
				{ text: 'Nome', style: 'tableHeader' },
				{ text: 'Cognome', style: 'tableHeader' },
				{ text: 'Città', style: 'tableHeader' },
				{ text: 'Regione', style: 'tableHeader' },
				{ text: 'Email', style: 'tableHeader' },
				{ text: 'Telefono', style: 'tableHeader' },
				{ text: 'Metodo Pagamento', style: 'tableHeader' },
				{ text: 'Stato Pagamento', style: 'tableHeader' },
				{ text: 'Importo', style: 'tableHeader' }
			]
		];

		subscribers.forEach((subscriber, index) => {
			tableBody.push([
				{ text: subscriber.name || 'N/A', style: 'tableData' },
				{ text: subscriber.surname || 'N/A', style: 'tableData' },
				{ text: subscriber.city || 'N/A', style: 'tableData' },
				{ text: subscriber.county || 'N/A', style: 'tableData' },
				{ text: subscriber.email || 'N/A', style: 'tableData' },
				{ text: subscriber.mobilePhone || subscriber.phone || 'N/A', style: 'tableData' },
				{ text: subscriber.paymentMethod || 'Non trovato', style: 'tableData' },
				{ text: subscriber.paymentStatus || 'Non trovato', style: 'tableData' },
				{ text: subscriber.paidAmount ? `€ ${subscriber.paidAmount}` : 'N/A', style: 'tableData' }
			]);
		});

		const doc = {
			compress: true,
			pageSize: 'A4',
			pageOrientation: 'portrait',
			pageMargins: [20, 60, 20, 60],

			content: [
				{
					text: 'LISTA PARTECIPANTI',
					style: 'mainHeader',
					alignment: 'center',
					margin: [0, 0, 0, 20]
				},

				{
					columns: [
						{
							width: '*',
							stack: [
								{
									text: [
										{ text: 'Corso: ', style: 'labelBold' },
										{ text: `${courseItem.layoutView?.title} (${courseItem.prodId})` || 'N/A', style: 'valueText' }
									]
								},
								{
									text: [
										{ text: 'Formatore: ', style: 'labelBold' },
										{ text: `${courseItem.name} ${courseItem.surname}`, style: 'valueText' }
									],
									margin: [0, 5, 0, 0]
								},
								{
									text: [
										{ text: 'Data: ', style: 'labelBold' },
										{ text: `${courseItem.eventStartDate} - ${courseItem.timeStartDate}`, style: 'valueText' }
									],
									margin: [0, 5, 0, 0]
								}
							]
						},
						{
							width: '*',
							stack: [
								{
									text: [
										{ text: 'Luogo: ', style: 'labelBold' },
										{ text: courseItem.location || 'N/A', style: 'valueText' }
									]
								},
								{
									text: [
										{ text: 'Provincia: ', style: 'labelBold' },
										{ text: courseItem.county?.join(', ') || 'N/A', style: 'valueText' }
									],
									margin: [0, 5, 0, 0]
								},
								{
									text: [
										{ text: 'Totale Partecipanti: ', style: 'labelBold' },
										{ text: subscribers.length.toString(), style: 'valueText' }
									],
									margin: [0, 5, 0, 0]
								}
							]
						}
					],
					margin: [0, 0, 0, 30]
				},

				{
					table: {
						headerRows: 1,
						// table column width - ottimizzato per migliore leggibilità
						widths: ['3%', '11%', '11%', '13%', '10%', '18%', '10%', '9%', '8%', '7%'],
						body: [
							[
								{ text: '  ', style: 'tableHeader' },
								{ text: 'Nome', style: 'tableHeader' },
								{ text: 'Cognome', style: 'tableHeader' },
								{ text: 'Città', style: 'tableHeader' },
								{ text: 'Regione', style: 'tableHeader' },
								{ text: 'Email', style: 'tableHeader' },
								{ text: 'Telefono', style: 'tableHeader' },
								{ text: 'Metodo Pagamento', style: 'tableHeader' },
								{ text: 'Stato Pagamento', style: 'tableHeader' },
								{ text: 'Importo', style: 'tableHeader' }
							],
							...subscribers.map((subscriber) => [
								// Checkbox come primo elemento di ogni riga
								{
									text: ' ', // Carattere Unicode per checkbox vuoto
									style: 'tableCheckbox',
									alignment: 'center'
								},
								{ text: subscriber.name || 'N/A', style: 'tableData' },
								{ text: subscriber.surname || 'N/A', style: 'tableData' },
								{ text: subscriber.city || 'N/A', style: 'tableData' },
								{ text: subscriber.county || 'N/A', style: 'tableData' },
								{ text: subscriber.email || 'N/A', style: 'tableData' },
								{ text: subscriber.mobilePhone || subscriber.phone || 'N/A', style: 'tableData' },
								{ text: subscriber.paymentMethod || 'N/A', style: 'tableData' },
								{
									text: subscriber.paymentStatus === 'done' ? 'Pagato' : 'In sospeso',
									style: subscriber.paymentStatus === 'done' ? 'tablePaid' : 'tablePending'
								},
								{
									text: subscriber.value ? `€ ${subscriber.value}` : 'N/A',
									style: 'tableData'
								}
							])
						]
					},
					layout: {
						fillColor: function (rowIndex, node, columnIndex) {
							return rowIndex === 0 ? '#4472C4' : rowIndex % 2 === 0 ? '#F2F2F2' : null;
						},
						hLineWidth: function (i, node) {
							return 1;
						},
						vLineWidth: function (i, node) {
							return 1;
						},
						hLineColor: function (i, node) {
							return '#CCCCCC';
						},
						vLineColor: function (i, node) {
							return '#CCCCCC';
						}
					}
				},

				// Riepilogo pagamenti
				{
					text: 'RIEPILOGO PAGAMENTI',
					style: 'sectionHeader',
					margin: [0, 30, 0, 10]
				},
				{
					columns: [
						{
							width: '*',
							stack: [
								{
									text: [
										{ text: 'Pagamenti completati: ', style: 'labelBold' },
										{ text: getPaidCount(subscribers).toString(), style: 'valueText' }
									]
								},
								{
									text: [
										{ text: 'Pagamenti in sospeso: ', style: 'labelBold' },
										{ text: (subscribers.length - getPaidCount(subscribers)).toString(), style: 'valueText' }
									],
									margin: [0, 5, 0, 0]
								}
							]
						},
						{
							width: '*',
							stack: [
								{
									text: [
										{ text: 'Prezzo corso: ', style: 'labelBold' },
										{ text: `€ ${courseItem.layoutView?.price || 0}`, style: 'valueText' }
									]
								}
							]
						}
					]
				},

				// Footer
				{
					text: `Lista generata il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}`,
					style: 'footer',
					alignment: 'right',
					margin: [0, 20, 0, 0]
				}
			],

			styles: {
				mainHeader: {
					fontSize: 18,
					bold: true,
					color: '#2E5BBA'
				},
				sectionHeader: {
					fontSize: 14,
					bold: true,
					color: '#2E5BBA'
				},
				labelBold: {
					fontSize: 10,
					bold: true,
					color: '#333333'
				},
				valueText: {
					fontSize: 10,
					color: '#555555'
				},
				tableHeader: {
					fontSize: 8,
					bold: true,
					color: 'white',
					alignment: 'center'
				},
				tableData: {
					fontSize: 6,
					color: '#333333'
				},
				tableCheckbox: {
					fontSize: 12,
					color: '#333333'
				},
				tablePaid: {
					fontSize: 7,
					color: '#008000',
					bold: true
				},
				tablePending: {
					fontSize: 7,
					color: '#FF6600'
				},
				footer: {
					fontSize: 8,
					italics: true,
					color: '#888888'
				}
			}
		};

		pdfMake
			.createPdf(doc, null, pdfFonts)
			.download(`ListaPartecipanti_${courseItem.layoutView?.title}_${new Date().toISOString().split('T')[0]}.pdf`);
	};

	// Date & Time
	const now = new Date();
	let currentYear = now.getFullYear().toString();
	let currentMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() return 0-11, need to add 1
	let currentDay = now.getDate().toString().padStart(2, '0');
	let currentHour = now.getHours().toString().padStart(2, '0');
	//let currentMinute = now.getMinutes();

	// form
	let title = $state('');
	let prodId = $state('');
	let descrLong = $state('');
	let infoExtra = $state('');
	let productCorsoUserId = $state(userData.userId);
	let productCorsoStatus = $state('enabled');
	let county = $state('');
	let location = $state('');
	let layoutId = $state('');
	let isEvent = $state(false);
	let userId = $state('');
	let tagArray: any[] = $state([]);
	let tag = $state('');
	let stockQty = $state(1);
	let notificationEmail = $state([userData.email]);
	let inputEmail = $state('');
	let price = $state(1);
	let startYear = $state(currentYear);
	let startMonth = $state(currentMonth);
	let startDay = $state(currentDay);
	let startHour = $state(currentHour);
	let startMinute = $state('00');
	let mode = $state('ONLINE');
	let provinceArray = $state([]);
	let subscribers = $state([]);
	// filter Data
	let sortDirection = $state('asc');
	let sortColumn = $state('createdAt');

	// modal
	let currentModal = $state('');
	let currentObj: any = $state();
	let openModal = $state(false);
	let postAction = $state('?/');
	let modalTitle = $state('');
	let resetActive = $state(false);

	// year input
	let max = new Date().getFullYear() + 2;
	let min = max - 3;
	let years = [];
	for (let i = max; i >= min; i--) {
		years.push(i.toString());
	}

	let eventStartDate = $derived(new Date(`${startYear}-${startMonth}-${startDay}T${startHour}:${startMinute}:00.000+00:00`));

	// const sortTable = (column: string) => {
	// 	if (sortColumn === column) {
	// 		// Se la colonna è già selezionata, invertiamo la direzione
	// 		sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
	// 	} else {
	// 		// Altrimenti, impostiamo la nuova colonna e resettiamo la direzione
	// 		sortColumn = column;
	// 		sortDirection = 'asc';
	// 	}

	// 	tableList = tableList.sort((a: any, b: any) => {
	// 		let valueA = column === 'eventStartDate' ? new Date(a[column]) : a[column];
	// 		let valueB = column === 'eventStartDate' ? new Date(b[column]) : b[column];

	// 		if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
	// 		if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
	// 		return 0;
	// 	});
	// };

	//CSV file
	const csvCreate = (content: any[]) => {
		content.forEach((item) => {
			delete item.userView;
		});

		const flattenObject = (obj, prefix = '') => {
			let result = {};

			for (const key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					const value = obj[key];
					const newPrefix = prefix ? `${prefix}.${key}` : key;

					// Special handling for the 'listSubscribers' array
					if (newPrefix === 'listSubscribers' && Array.isArray(value)) {
						const cartString = value
							.map((cartItem) => {
								return cartItem?.name && cartItem?.surname ? `(${cartItem.name} ${cartItem.surname})` : '(not found)';
							})
							.filter(Boolean) // Remove any empty strings
							.join(', ');
						result[newPrefix] = cartString;
					} else if (Array.isArray(value)) {
						// Existing logic for other arrays
						value.forEach((item, index) => {
							if (typeof item === 'object' && item !== null) {
								Object.assign(result, flattenObject(item, `${newPrefix}.${index}`));
							} else {
								result[`${newPrefix}.${index}`] = item;
							}
						});
					} else if (typeof value === 'object' && value !== null) {
						Object.assign(result, flattenObject(value, newPrefix));
					} else {
						result[newPrefix] = value;
					}
				}
			}
			return result;
		};

		const dataToExport = content.map((order) => {
			const flatOrder: any = flattenObject(order);

			if (flatOrder.createdAt) flatOrder.createdAt = (flatOrder.createdAt as string).substring(0, 10);
			// if (flatOrder.birthdate) flatOrder.birthdate = (flatOrder.birthdate as string).substring(0, 10);

			$courseKeysToDelete.forEach((key: string) => delete (flatOrder as any)[key]);
			return flatOrder;
		});

		//CSV UNPARSE
		const csv = Papa.unparse(dataToExport, {
			quotes: false, //or array of booleans
			quoteChar: '"',
			escapeChar: '"',
			delimiter: ';',
			header: true,
			//newline: '\r\n',
			skipEmptyLines: false //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
		});
		//console.log('csv', csv);

		//DOWNLOAD file
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		// create a link element to download the zip archive
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `TableExport_Corsi.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};

	const resetFields = () => {
		layoutId = '';
		isEvent = false;
		price = 1;
		startYear = currentYear;
		startMonth = currentMonth;
		startDay = currentDay;
		startHour = currentHour;
		startMinute = '00';
		stockQty = 1;
		county = '';
		inputEmail = '';
		title = '';
		descrLong = '';
		infoExtra = '';
		location = '';
		productCorsoUserId = userData.userId;
		productCorsoStatus = 'enabled';
		notificationEmail = [userData.email];
		tag = '';
		tagArray = [];
		modalTitle = '';
		postAction = '?/';
		mode = 'ONLINE';
		provinceArray = [];
		showCheckboxes = false;
	};

	const refresh = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getTable;
		notification.info('Pagina ricaricata');
	};

	const selectLayout = (layout: any) => {
		const course = getLayout.find((item: any) => item.layoutId == layout); // layoutId
		//console.log('course', course, layoutId);
		title = course.title;
		descrLong = course.descr;
		price = course.price;
		isEvent = course.isEvent;
	};

	const addItem = (item: any, type: string) => {
		if (type == 'email') {
			var mailformat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,6})$/;
			if (item.match(mailformat)) {
				if (!notificationEmail.includes(item)) {
					notificationEmail.push(item);
				} else {
					notification.error('Email già inserita');
				}
			} else {
				notification.error('Email NON valida');
			}
		}
		if (type == 'tag')
			if (tag != '') {
				if (!tagArray.includes(item)) {
					tagArray.push(item);
				} else {
					notification.error('Tag già inserito');
				}
			} else {
				notification.error('Tag NON valido');
			}
		if (type == 'province') {
			if (county != '') {
				if (!provinceArray.includes(item)) {
					provinceArray.push(item);
					county = '';
				} else {
					notification.error('Provincia già inserita');
				}
			} else {
				notification.error('Provincia NON valida');
			}
		}

		inputEmail = '';
		tag = '';
		county = '';
	};

	const removeItem = (index: number, type: string) => {
		if (index !== -1) {
			if (type == 'email') notificationEmail.splice(index, 1);
			if (type == 'tag') tagArray.splice(index, 1); /// TAG
			if (type == 'province') provinceArray.splice(index, 1); /// PROVINCE
		}
	};

	const onClickModal = (type: string, item: any) => {
		currentModal = type;
		currentObj = item;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo Corso';
		}
		if (type == 'modify') {
			postAction = `?/modify`;
			modalTitle = 'Modifica Corso';
			prodId = item.prodId;
			layoutId = item.layoutId;
			isEvent = item.isEvent;
			price = item.layoutView.price;
			stockQty = item.stockQty;
			county = item.county;
			notificationEmail = item.notificationEmail;
			tagArray = item.tag;
			provinceArray = item.county;
			title = item.layoutView.title;
			descrLong = item.layoutView.descr;
			infoExtra = item.infoExtra;
			location = item.location;
			mode = item.county && item.county.length > 0 && item.county[0] === 'Online' ? 'ONLINE' : 'IN_PRESENZA';
			startYear = item.eventStartDate.substring(0, 4);
			startMonth = item.eventStartDate.substring(5, 7);
			startDay = item.eventStartDate.substring(8, 10);
			startHour = item.timeStartDate.substring(0, 2);
			startMinute = item.timeStartDate.substring(3, 5);
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Conferma rimozione';
			prodId = item.prodId;
			//console.log('item.prodId', item.prodId);
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtri di Ricerca';
			county = '';
			layoutId = '';
			userId = '';
		}
		if (type == 'subscribers') {
			modalTitle = 'Lista iscritti';
			prodId = item.prodId ?? '';
			subscribers = item.listSubscribers ?? [];
			certificationStatus = item.certificationStatus;
			postAction = `?/createCertification`;
		}
		if (type == 'resetCert') {
			postAction = `?/resetCertifications`;
			modalTitle = 'Conferma Reset Certificazioni';
			prodId = item.prodId;
		}
	};

	const onCloseModal = () => {
		openModal = false;
		currentModal = '';
		resetFields();
	};

	const onCloseModify = () => {
		openModal = false;
		currentModal = '';
		refresh();
	};

	const formSubmit = () => {
		loading = true;

		// DEBUG: Log prima dell'invio
		// console.log('=== DEBUG FORM SUBMIT ===');
		// console.log('currentModal:', currentModal);
		// console.log('postAction:', postAction);
		// if (currentModal === 'subscribers' && postAction === '?/createCertification') {
		// 	console.log('selectedSubscriber:', selectedSubscriber);
		// 	console.log('Numero utenti selezionati:', selectedSubscriber.length);
		// }
		// console.log('========================');
		//return async ({ result }: { result: ActionResult }) => {
		//await invalidateAll();
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await update();
			if (result.type === 'success' && result.data) {
				const { action, message, payload } = result.data; // { action, success, message, payload }
				//onclick={() => createPDFUserList(currentObj, subscribers)}
				if (action == 'filter') {
					resetActive = true;
					tableList = payload;
				} else if (action == 'coursePdf') {
					//console.log('payload', payload);
					createPDFUserList(currentObj, payload);
				} else {
					resetActive = false;
					tableList = getTable;
				}

				notification.info(message);
			}
			if (result.type === 'failure') {
				notification.error(result.data.message);
			}
			if (result.type === 'error') {
				notification.error(result.error.message);
			}
			// 'update()' is called by default by use:enhance
			// call 'await update()' if you need to ensure it completes before further client logic.
			openModal = false;
			resetFields();
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>Lista corsi</title>
</svelte:head>

{#if !getTable || loading}
	<Loader />
{:else}
	<div class="overflow-x-auto table-zebra mt-5 px-4 mb-5">
		<div class="flex flex-col gap-4 mb-4">
			<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista corsi</h1>
			<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
				<button type="button" class="btn btn-info text-white w-full sm:w-auto" onclick={refresh} aria-label="Ricarica">
					<RefreshCcw />
				</button>
				{#if resetActive == true}
					<button type="button" class="btn btn-error rounded-md text-white" onclick={refresh}>
						<CircleX class="mt-1" /> Reset Filtro
					</button>
				{:else}
					<button type="button" class="btn btn-info rounded-md text-white" onclick={() => onClickModal('filter', null)}>
						<Funnel class="mt-1" /> Filtra
					</button>
				{/if}
				<button type="button" class="btn btn-info rounded-md text-white" onclick={() => onClickModal('new', null)}>
					<CopyPlus /> Nuovo
				</button>
				<button type="button" class="btn btn-info text-white w-full sm:w-auto" onclick={() => csvCreate(tableList)}>
					<FileDown />CSV
				</button>
			</div>
		</div>

		<table class="table mt-5 bg-white border-2">
			<!-- head -->
			<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
				<tr class="">
					<th>ID</th>
					<th>Immagine</th>
					<th>Data inserimento</th>
					<th>Riflessologo</th>
					<th>Titolo</th>
					<th>Data</th>
					<th>Luogo</th>
					<th>Prezzo</th>
					<th>Adesioni</th>
					{#if userData.level == 'admin' || userData.level == 'superadmin'}
						<th>Certificazioni status</th>
					{/if}

					<th>Azioni</th>
				</tr>
			</thead>
			<!-- body -->
			<tbody>
				<!-- row -->
				{#if !tableList || tableList.length == 0}
					<tr class="hover:bg-gray-300">
						<td> </td>
					</tr>
				{:else}
					{#each tableList ?? [] as row}
						<tr class="hover:bg-gray-300">
							<td>{row.prodId}</td>

							<td>
								<!-- img start -->
								<div class="card-body p-4">
									<div class="flex items-center">
										<figure class="flex-shrink-0">
											<Image
												layout="constrained"
												aspectRatio={1}
												src={row.layoutView?.urlPic || '/images/placeholder.jpg'}
												alt="product-primary"
												class="object-cover rounded-md max-w-16 max-h-16 h-auto"
											/>
										</figure>
									</div>
								</div>
								<!-- img end -->
							</td>

							<td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString('it-IT') : 'N/A'}</td>

							<td>{row.name} {row.surname}</td>

							<td>{row.layoutView?.title}</td>

							<td>{row.eventStartDate ? new Date(row.eventStartDate).toLocaleDateString('it-IT') : 'N/A'} - {row.timeStartDate || 'N/A'}</td>

							<td>
								<p class="card-text">
									{row.county}
								</p>
							</td>

							<td>{row.layoutView.price} €</td>

							<td>
								<button
									type="button"
									class="btn"
									onclick={() => onClickModal('subscribers', row)}
									aria-label={`Iscritti: ${row.listSubscribers.length}`}
									disabled={row.listSubscribers.length == 0}
								>
									<UserRoundCheck />
									{row.listSubscribers.length}
								</button>
							</td>

							{#if userData.level == 'admin' || userData.level == 'superadmin'}
								<td>
									<form method="POST" action={`?/toggleCertificationStatus`} use:enhance={formSubmit}>
										<input type="hidden" name="prodId" value={prodId} />
										<input type="hidden" name="userId" value={row.userId} />
										<input type="hidden" name="currentStatus" value={row.certificationStatus} />

										<span class="flex items-center">
											{#if row.certificationStatus}
												<button type="submit" class="btn btn-ghost btn-sm font-semibold">
													<ToggleRight color="darkgreen" />
												</button>
											{:else}
												<button type="submit" class="btn btn-ghost btn-sm font-semibold">
													<ToggleLeft color="darkred" />
												</button>
											{/if}
										</span>
									</form>

									{#if row.certificationStatus}
										<button type="button" class="btn btn-warning btn-xs" onclick={() => onClickModal('resetCert', row)}>
											<UserRoundX size={14} /> Annulla Certificati
										</button>
									{/if}
								</td>
							{/if}
							<td class="flex items-center space-x-4">
								<button type="button" class="btn btn-sm" aria-label="Modifica" onclick={() => onClickModal('modify', row)}><Settings /> </button>
								<button type="button" class="btn btn-error btn-sm" aria-label="Elimina" onclick={() => onClickModal('delete', row)}
									><Trash2 />
								</button>
								<button
									type="button"
									class="btn btn-sm btn-info"
									aria-label="Copia link corso"
									onclick={() => {
										const link = `${window.location.origin}/course-detail/${row.prodId}`;
										navigator.clipboard.writeText(link).then(() => {
											notification.info('Link corso copiato negli appunti');
										});
									}}
								>
									<Link />
								</button>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
		{#if !tableList || tableList.length == 0}
			<div class="alert alert-warning shadow-lg flex item-center text-center justify-center rounded-md mt-3 mx-auto w-full max-w-lg">
				<div>
					<ShieldAlert />
					<br />
					<span class="mt-2 text-semibold"> Nessun corso trovato. Cambia parametri o resetta il filtro. </span>
				</div>
			</div>
		{/if}
	</div>
{/if}

{#if currentModal == 'modify' || currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-4xl">
		{#if currentModal == 'modify'}
			<button type="button" class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModify}>✕</button>
		{:else}
			<button type="button" class="btn btn-sm btn-circle btn-error absolute right-2 top-2" aria-label="Chiudi modale" onclick={onCloseModal}>✕</button
			>
		{/if}

		{#if loading}
			<Loader />
		{/if}
		<form
			method="POST"
			action={postAction}
			use:enhance={formSubmit}
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			{#if currentModal == 'modify'}
				<section class="col-span-4 md:col-span-4">
					<label for="prodId" class="form-label">
						<p class="font-bold mb-2">ID codice</p>
					</label>

					<div class="join join-horizontal w-full">
						<button type="button" class="join-item bg-gray-300 px-3"><Pen /></button>
						<input
							class="input input-bordered join-item w-full"
							id="prodId"
							name="prodId"
							type="text"
							placeholder="prodId"
							bind:value={prodId}
							readonly
						/>
					</div>
				</section>
			{/if}

			<!-- Categoria  -->
			<section class="col-span-4 md:col-span-2">
				<label for="layoutId" class="form-label">
					<p class="font-bold mb-2">Tipo corso</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button type="button" class="join-item bg-gray-300 px-3"><Pen /></button>
					<select
						class="select select-bordered w-full rounded-md rounded-l-none"
						id="layoutId"
						name="layoutId"
						bind:value={layoutId}
						onchange={() => selectLayout(layoutId)}
						required
					>
						<option disabled value="">Scegli</option>
						{#each getLayout as option}
							<option value={option.layoutId}>
								{option.title}
							</option>
						{/each}
					</select>
				</div>
			</section>

			<!-- Prezzo corso -->
			<section class="col-span-4 md:col-span-2">
				<label for="price" class="form-label">
					<p class="font-bold mb-2">Prezzo corso</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button type="button" class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="price"
						name="price"
						type="number"
						placeholder="Prezzo €"
						bind:value={price}
						readonly
					/>
				</div>
			</section>

			<!-- Data Inizio -->
			<section class="col-span-4 md:col-span-2">
				<label for="data-inizio" class="form-label">
					<p class="font-bold mb-2">Data inizio</p>
				</label>
				<div class="join join-vertical md:join-horizontal rounded-md">
					<button type="button" class="join-item bg-gray-300 px-3"><Calendar /></button>
					<!-- Giorno Dropdown -->
					<select
						id="productCorsoDataInizioGiorno"
						name="productCorsoDataInizioGiorno"
						class="join-item select select-bordered w-full md:w-20"
						aria-label="Seleziona Giorno"
						bind:value={startDay}
						required
					>
						<option value="" disabled selected>Giorno</option>
						{#each $days as day}
							<option value={day}>{day}</option>
						{/each}
					</select>
					<button type="button" class="join-item bg-gray-300 px-3"> - </button>
					<!-- Mese Dropdown -->
					<select
						id="productCorsoDataInizioMese"
						name="productCorsoDataInizioMese"
						class="join-item select select-bordered w-full md:w-32"
						aria-label="Seleziona Mese"
						bind:value={startMonth}
						required
					>
						<option value="" disabled selected>Mese</option>
						{#each $months as month}
							<option value={month.value}>{month.title}</option>
						{/each}
					</select>
					<button type="button" class="join-item bg-gray-300 px-3"> - </button>
					<!-- Anno Dropdown -->
					<select
						id="productCorsoDataInizioAnno"
						name="productCorsoDataInizioAnno"
						class="join-item select select-bordered w-full md:w-26 rounded-r-md"
						aria-label="Seleziona Anno"
						bind:value={startYear}
						required
					>
						{#if currentModal == 'modify'}
							<option value={startYear}>{startYear}</option>
						{:else}
							<option value="" disabled>Anno</option>
						{/if}

						{#each years as year}
							<option value={year}>{year}</option>
						{/each}
					</select>
				</div>
			</section>
			<!-- Orario Inizio -->
			<section class="ml-10 col-span-4 md:col-span-2">
				<label for="orario-inizio" class="form-label">
					<p class="font-bold mb-2">Orario inizio</p>
				</label>
				<div class="join join-horizontal rounded-md">
					<!-- Ore Dropdown -->
					<select
						id="productCorsoDataInizioOra"
						name="productCorsoDataInizioOra"
						class="join-item select select-bordered w-20 rounded-l-md"
						aria-label="Seleziona Ora"
						bind:value={startHour}
						required
					>
						<option value="" disabled selected>Ore</option>
						{#each $hours as hour}
							<option value={hour}>{hour}</option>
						{/each}
					</select>
					<button type="button" class="join-item bg-gray-300 px-3"> : </button>
					<!-- Minuti Dropdown -->
					<select
						id="productCorsoDataInizioMinuto"
						name="productCorsoDataInizioMinuto"
						class="join-item select select-bordered w-20 rounded-r-md"
						aria-label="Seleziona Minuti"
						bind:value={startMinute}
						required
					>
						<option value="" disabled selected>Minuti</option>
						{#each $minutes as minute}
							<option value={minute}>{minute}</option>
						{/each}
					</select>
				</div>
				<!-- <div id="data-inizio-orario-Help" class="text-gray-600 mt-2 text-sm">
			Esempio orario: 23:59
		</div> -->
			</section>
			<!-- Numero partecipanti -->
			<section class="col-span-4 md:col-span-4">
				<label for="stockQty" class="form-label">
					<p class="font-bold mb-2">Numero partecipanti</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button type="button" class="join-item bg-gray-300 px-3"><Users /></button>
					<input
						class="input input-bordered join-item w-full"
						id="stockQty"
						name="stockQty"
						type="number"
						placeholder="N."
						step="1"
						min="0"
						bind:value={stockQty}
						required
					/>
				</div>
			</section>

			<!-- Modalità corso -->
			<section class="col-span-4">
				<p class="font-bold mb-2">Modalità corso</p>
				<div class="flex gap-4">
					<label class="label cursor-pointer flex gap-2">
						<input type="radio" name="mode" value="ONLINE" bind:group={mode} class="radio" />
						<span class="label-text">Online</span>
					</label>
					<label class="label cursor-pointer flex gap-2">
						<input type="radio" name="mode" value="IN_PRESENZA" bind:group={mode} class="radio" />
						<span class="label-text">In presenza</span>
					</label>
				</div>
			</section>

			{#if mode == 'IN_PRESENZA'}
				<!-- Provincia -->
				<section class="col-span-4 md:col-span-2">
					<label for="county" class="form-label">
						<p class="font-bold mb-2">Provincia</p>
					</label>
					<div class="join join-horizontal rounded-md w-full mb-2">
						<button type="button" class="join-item bg-gray-300 px-3"><Building2 /></button>
						<input type="hidden" name="provinceArray" bind:value={provinceArray} />
						<select
							class="select select-bordered w-full rounded-md rounded-l-none"
							id="county"
							name="county"
							bind:value={county}
							onchange={() => addItem(county, 'province')}
						>
							<option disabled value="">Scegli</option>
							{#each $province as provincia}
								<option value={provincia.title}>
									{provincia.title} ({provincia.region})
								</option>
							{/each}
						</select>
						<!-- <button type="button" class="join-item btn btn-primary" onclick={() => addItem(county, 'province')}> Aggiungi </button> -->
					</div>

					{#if provinceArray.length > 0}
						{#each provinceArray as prov, i}
							<div class="btn btn-primary btn-sm m-1 rounded-md">
								{prov}
								<button type="button" class="badge badge-error ml-2" onclick={() => removeItem(i, 'province')}> X </button>
							</div>
						{/each}
					{/if}
				</section>

				<!-- Luogo -->
				<section class="col-span-4 md:col-span-2">
					<label for="location" class="form-label">
						<p class="font-bold mb-2">Luogo (indirizzo, città, CAP)</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button type="button" class="join-item bg-gray-300 px-3"><Pen /></button>
						<input
							class="input input-bordered join-item w-full"
							id="location"
							name="location"
							type="text"
							placeholder="es: via Roma, 1, Vigasio, 37069"
							bind:value={location}
							required
						/>
					</div>
				</section>
			{/if}

			{#if mode == 'ONLINE'}
				<!-- Luogo -->

				<section class="col-span-4 md:col-span-4">
					<input type="hidden" name="provinceArray" value="Online" />
					<label for="location" class="form-label">
						<p class="font-bold mb-2">Luogo</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button type="button" class="join-item bg-gray-300 px-3"><Pen /></button>
						<input
							class="input input-bordered join-item w-full"
							id="location"
							name="location"
							type="text"
							placeholder="es: via Roma, 1, Vigasio, 37069"
							value="Online"
							readonly
						/>
					</div>
				</section>
			{/if}

			<!-- Tag -->
			<!-- <section class="col-span-4 md:col-span-2">
				<label for="tag" class="form-label">
					<p class="font-bold mb-2">Tag</p>
				</label>
				<div class="join join-horizontal rounded-md w-full mb-2">
					<button type="button" class="join-item bg-gray-300 px-3"><List /></button>
					<input type="hidden" name="tagArray" bind:value={tagArray} />
					<input class="input input-bordered join-item w-full" id="tag" name="tag" type="text" placeholder="Aggiungi Tag" bind:value={tag} />
					<button type="button" class="join-item btn btn-primary disabled:blue-500 disabled:cursor-not-allowed" onclick={() => addItem(tag, 'tag')}>
						Aggiungi
					</button>
				</div>
				{#if tagArray.length !== 0}
					{#each tagArray as badgeTag, i}
						<div class="btn btn-primary btn-sm m-1 rounded-md">
							{badgeTag}
							{' '}
							<button type="button" class="badge badge-error felx items-center" onclick={() => removeItem(i, 'tag')}> X </button>
						</div>
					{/each}
				{/if}
			</section> -->
			<!-- Notifica email -->
			<!-- <section class="col-span-4 md:col-span-2">
				<label for="notificationEmail" class="form-label">
					<p class="font-bold mb-2">Notifica Email</p>
				</label>
				<div class="join join-horizontal rounded-md w-full mb-2">
					<div class="join-item bg-gray-300 px-3"><Send /></div>
					<input type="hidden" name="notificationEmail" bind:value={notificationEmail} />
					<input
						class="input input-bordered join-item w-full"
						id="inputEmail"
						name="inputEmail"
						type="email"
						placeholder="Aggiungi Email"
						aria-label="InputEmailNotifica"
						aria-describedby="basic-InputEmailNotifica"
						bind:value={inputEmail}
					/>
					<button type="button" class="join-item btn btn-primary" onclick={() => addItem(inputEmail, 'email')}> Aggiungi </button>
				</div>
				{#if notificationEmail.length > 0}
					{#each notificationEmail as badgeEmailNotifica, i}
						<div class="btn btn-primary btn-sm m-1 rounded-md">
							{badgeEmailNotifica} &nbsp;
							<button type="button" class="badge badge-error felx items-center" onclick={() => removeItem(i, 'email')}> X </button>
						</div>
					{/each}
				{/if}
			</section> -->
			<!-- Notifica email -->
			<section class="col-span-4 md:col-span-2">
				<label for="notificationEmail" class="form-label">
					<p class="font-bold mb-2">Notifica email</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button type="button" class="join-item bg-gray-300 px-3"><Pen /></button>
					<input
						class="input input-bordered join-item w-full"
						id="notificationEmail"
						name="notificationEmail"
						type="text"
						placeholder="Email notifica"
						bind:value={notificationEmail}
						readonly
					/>
				</div>
			</section>
			<!-- Titolo -->
			<section class="col-span-4 md:col-span-2">
				<label for="title" class="form-label">
					<p class="font-bold mb-2">Titolo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button type="button" class="join-item bg-gray-300 px-3"><Pen /></button>
					<input class="input input-bordered join-item w-full" id="title" name="title" type="text" placeholder="Titolo" bind:value={title} readonly />
				</div>
			</section>
			<!-- Descrizione -->
			<section class="col-span-4 md:col-span-4">
				<!-- Descrizione -->
				<label for="descrLong" class="form-label">
					<p class="font-bold mb-2">Descrizione</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button type="button" class="join-item bg-gray-300 px-3"><Pen /></button>
					<textarea
						class="textarea textarea-bordered h-24 join-item w-full"
						id="descrLong"
						name="descrLong"
						placeholder="Descrizione"
						bind:value={descrLong}
						readonly
					></textarea>
				</div>
			</section>
			<!-- ALtre informazione -->
			<section class="col-span-4">
				<label for="infoExtra" class="form-label">
					<p class="font-bold mb-2">Altre informazioni</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button type="button" class="join-item bg-gray-300 px-3"><Pen /></button>
					<textarea
						class="textarea textarea-bordered join-item w-full"
						id="infoExtra"
						name="infoExtra"
						rows="6"
						placeholder="Altre informazioni"
						bind:value={infoExtra}
					></textarea>
				</div>
			</section>

			<!-- button -->
			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					{#if currentModal == 'modify'}
						<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModify}> Annulla </button>
					{:else}
						<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
					{/if}

					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">
						{#if currentModal == 'new'}
							Registra
						{:else if currentModal == 'modify'}
							Modifica
						{/if}
					</button>
				</div>
			</div>
			<input type="hidden" name="eventStartDate" value={eventStartDate} />
			<input type="hidden" name="isEvent" value={isEvent} />
		</form>
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button type="button" class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<form
			method="POST"
			action={postAction}
			use:enhance={formSubmit}
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="prodId" value={prodId} />
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">Conferma rimozione</header>
			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
					<button type="submit" class="btn btn-error btn-sm mx-2 text-white"> Elimina </button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button type="button" class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="courseid" class="block text-sm font-medium text-gray-700 mb-1">ID corso</label>

					<input class="input input-bordered w-full" id="courseid" name="courseid" type="text" placeholder="ID corso" bind:value={prodId} />
				</div>

				{#if userData.level === 'admin' || userData.level === 'superadmin'}
					<div>
						<label for="county" class="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
						<select
							id="county"
							name="county"
							bind:value={county}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli una Provincia</option>
							{#each $province as item}
								<option value={item.title}>{item.title}</option>
							{/each}
						</select>
					</div>
				{/if}
				<div>
					<label for="layoutId" class="block text-sm font-medium text-gray-700 mb-1">Tipo corso</label>
					<select
						id="layoutId"
						name="layoutId"
						bind:value={layoutId}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli un tipo</option>
						{#each getLayout as option}
							<option value={option.layoutId}>{option.title}</option>
						{/each}
					</select>
				</div>
				{#if userData.level === 'admin' || userData.level === 'superadmin'}
					<div>
						<label for="userId" class="block text-sm font-medium text-gray-700 mb-1">Riflessologo</label>
						<select
							id="userId"
							name="userId"
							bind:value={userId}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli un riflessologo</option>
							{#each getTableNames as item}
								<option value={item.userId}>{item.surname} {item.name}</option>
							{/each}
						</select>
					</div>
				{/if}
			</div>

			<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2 mb-140">
				<button type="button" class="btn btn-error btn-sm rounded-md hover:bg-red-300" onclick={onCloseModal}> Annulla </button>
				<button type="submit" class="btn btn-success btn-sm rounded-md hover:bg-green-400"> Applica Filtri </button>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'subscribers'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button type="button" class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<div class="p-4 lg:p-8">
			{#if showCheckboxes}
				<form method="POST" action={postAction} use:enhance={formSubmit} class="mb-8 p-6 rounded-box shadow-lg bg-base-100">
					<h2 class="text-lg font-semibold mb-2 text-primary">Dettagli Attestato</h2>

					<div class="form-control mb-4">
						<label for="certificationPlace" class="label">
							<span class="label-text">Luogo</span>
						</label>
						<input type="text" id="certificationPlace" name="certificationPlace" placeholder="Scrivere luogo" class="input input-bordered w-full" />
					</div>

					<div class="form-control mb-6">
						<label for="certificationDate" class="label">
							<span class="label-text">Data</span>
						</label>
						<input type="date" id="certificationDate" name="certificationDate" class="input input-bordered w-full" />
					</div>

					<input type="hidden" name="selectedSubscriber" value={JSON.stringify(selectedSubscriber)} />
					<input type="hidden" name="prodId" value={currentObj.prodId} />

					<button type="submit" class="btn btn-success" disabled={selectedSubscriber.length === 0}> Crea Attestati </button>
					{#if selectedSubscriber.length === 0}
						<p class="text-sm text-error mt-2">
							<span class="label-text">Selezionare almeno un partecipante</span>
						</p>
					{/if}
				</form>
			{/if}

			<div class="mb-6 flex justify-between items-center gap-2">
				<div class="flex gap-2">
					{#if currentObj.type !== 'event'}
						<button
							type="button"
							class="btn"
							class:btn-error={showCheckboxes}
							aria-pressed={showCheckboxes}
							onclick={toggleCheckboxes}
							disabled={certificationStatus}
						>
							{showCheckboxes ? 'Annulla' : 'Genera Attestati'}
						</button>
					{/if}
				</div>

				<form method="POST" action="?/coursePdf" use:enhance={formSubmit}>
					<input type="hidden" name="prodId" value={prodId} />
					<input type="hidden" name="subscribers" value={JSON.stringify(subscribers)} />
					<button type="submit" class="btn btn-info text-white" disabled={!subscribers || subscribers.length === 0}>
						<FileDown /> Partecipanti
					</button>
				</form>
			</div>

			<div class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8">
				{#each subscribers || [] as item}
					<div
						class="col-span-4 p-4 rounded-box shadow-md bg-base-200
           flex flex-col gap-y-2"
					>
						<div class="flex items-center justify-between gap-x-6">
							{#if showCheckboxes}
								<label class="flex items-center cursor-pointer gap-2">
									<input
										type="checkbox"
										class="checkbox checkbox-primary"
										checked={selectedSubscriber.includes(item)}
										onchange={(e) => handleCheckboxChange(item, e.currentTarget.checked)}
									/>
									<span class="font-bold text-lg text-primary">{item.name} {item.surname}</span>
								</label>
							{:else}
								<span class="font-bold text-lg text-primary">{item.name} {item.surname}</span>
							{/if}
							<div class="flex-grow"></div>
						</div>

						<div class="flex flex-wrap gap-x-6">
							<span class="text-info-content break-words">{item.email}</span>
						</div>

						<div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
							<div class="flex flex-wrap items-center gap-x-6 gap-y-2">
								<span class="text-sm text-base-content">{item.phone}</span>
								<span class="text-sm text-base-content">{item.mobilePhone}</span>
							</div>

							{#if item.certificationStatus}
								<button type="button" class="btn btn-sm btn-outline btn-info shrink-0" onclick={() => createPDFcert(currentObj, item)}>
									Download Attestato
								</button>
							{/if}
						</div>
						<div class="flex flex-wrap gap-x-6">
							{#if item.promoterId}
								<span class="text-info-content break-words"><Handshake />: {item.promoterId}</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</Modal>
{/if}

{#if currentModal == 'resetCert'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button type="button" class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<form
			method="POST"
			action={postAction}
			use:enhance={formSubmit}
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="prodId" value={prodId} />

			<div class="col-span-4">
				<div class="alert alert-warning">
					<ShieldAlert />
					<div>
						<h3 class="font-bold">Attenzione!</h3>
						<p class="text-sm">Questa azione resetterà:</p>
						<ul class="list-disc list-inside text-sm mt-2">
							<li>Lo stato di certificazione del corso</li>
							<li>Lo stato di certificazione di tutti i partecipanti</li>
							<li>Luogo e data di certificazione</li>
						</ul>
						<p class="text-sm mt-2 font-semibold">Sarà possibile rigenerare i certificati successivamente.</p>
					</div>
				</div>
			</div>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
					<button type="submit" class="btn btn-warning btn-sm mx-2"> Conferma Reset </button>
				</div>
			</div>
		</form>
	</Modal>
{/if}
