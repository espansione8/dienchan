<script lang="ts">
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import type { ActionResult } from '@sveltejs/kit';
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { notification } from '$lib/stores/notifications';
	import { Image } from '@unpic/svelte';
	import DragDrop from '$lib/components/DragDrop.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import { province, country_list, pdfValue, layoutArray } from '$lib/stores/arrays.js';
	import { imgCheck, formatDate } from '$lib/tools/tools';
	import {
		HandCoins,
		X,
		XCircle,
		CheckCircle,
		Check,
		Eye,
		ToggleLeft,
		ToggleRight,
		Trash2,
		Award,
		Mail,
		MapPin,
		Phone,
		User,
		Calendar,
		ShoppingBag,
		FileDown,
		Clock,
		ChevronDown,
		ChevronUp,
		SquarePen,
		Camera,
		Shield,
		Package,
		BadgeCheck,
		IdCard,
		House,
		NotebookPen,
		Plus,
		FileText,
		Upload,
		CalendarClock,
		CalendarPlus,
		ExternalLink,
		MapPinned,
		CirclePlay
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
		}
	};

	const { data } = $props();
	const { userData, orderData, courseData } = $derived(data);

	let loading = $state(false);

	let provinceFilterate = $province.filter((p) => p.title !== 'Online');

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

	// profile input
	let closedInput = $state(true);
	const openInput = () => (closedInput = false);
	const closeInput = () => {
		invalidateAll();
		resetFields();
	};

	let name = $state(userData.name || '');
	let surname = $state(userData.surname || '');
	let address = $state(userData.address || '');
	let city = $state(userData.city || '');
	let countyArray = $state(userData.county || []); // provincia
	let county = $state(''); // provincia input
	let postalCode = $state(userData.postalCode || '');
	let country = $state(userData.country || '');
	let phone = $state(userData.phone || '');
	let mobilePhone = $state(userData.mobilePhone || '');
	let email = $state(userData.email || '');
	let membershipLevel = $state(userData.membership.membershipLevel || '');
	//let membershipStatus = $state(userData.membership.membershipStatus || '');
	let membershipExpiry = $state(userData.membership.membershipExpiry || '');
	let addressPublic = $state(userData.addressPublic || false);
	let cityPublic = $state(userData.cityPublic || false);
	let countyPublic = $state(userData.countyPublic || false);
	let postalCodePublic = $state(userData.postalCodePublic || false);
	let countryPublic = $state(userData.countryPublic || false);
	let phonePublic = $state(userData.phonePublic || false);
	let mobilePhonePublic = $state(userData.mobilePhonePublic || false);
	let namePublic = $state(userData.namePublic || false);
	let surnamePublic = $state(userData.surnamePublic || false);
	let emailPublic = $state(userData.emailPublic || false);
	let level = $state(userData.level || '');
	let activeTab = $state('dashboard'); // dashboard profile orders training certificates
	let expandedOrderId = $state('');
	// let passwordNew = $state('');
	// let passwordOld = $state('');

	// Check for missing required fields
	let missingFields = $state<string[]>([]);
	let showMissingFieldsModal = $state(false);

	// Training
	let trainingDate = $state('');
	let trainingDescription = $state('');
	let trainingHours = $state<number>(0);
	let setTrainingFile = $state<File | null>(null);

	const formatoreLevels = new Set(['formatore base', 'master', 'formatore avanzato']);
	const isFormatore = level ? formatoreLevels.has(level.toLowerCase()) : false;

	const checkMissingFields = () => {
		const fields = [
			{ value: name, label: 'Nome' },
			{ value: surname, label: 'Cognome' },
			{ value: address, label: 'Indirizzo' },
			{ value: city, label: 'Città' },
			{ value: countyArray.length > 0, label: 'Provincia' },
			{ value: postalCode, label: 'CAP' },
			{ value: country, label: 'Nazione' },
			{ value: phone, label: 'Telefono' },
			{ value: mobilePhone, label: 'Cellulare' },
			{ value: email, label: 'Email' }
		];

		const missing = fields.filter((field) => !field.value).map((field) => field.label);
		missingFields = missing;

		if (missing.length > 0) {
			showMissingFieldsModal = true;
		}
	};

	const createPDFReceipt = (order) => {
		if (!order) {
			notification.error('Dati ordine mancanti');
			return;
		}

		const pdfFonts = {
			Roboto: {
				normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
				bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
				italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
				bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
			}
		};

		const cartTableBody = [
			[
				{ text: 'Descrizione', style: 'tableHeader' },
				{ text: 'Quantità', style: 'tableHeader', alignment: 'center' },
				{ text: 'Prezzo Unit.', style: 'tableHeader', alignment: 'right' },
				{ text: 'Totale', style: 'tableHeader', alignment: 'right' }
			]
		];

		order.cart.forEach((item) => {
			let description = '';
			let quantity = 1;
			let unitPrice = 0;
			let total = 0;

			if (item.type === 'course' || item.type === 'event') {
				description = item.layoutView?.title || item.title || 'N/A';
				unitPrice = item.layoutView?.price || item.price || 0;
				total = unitPrice;
			} else if (item.type === 'membership') {
				description = item.title || 'N/A';
				unitPrice = item.price || 0;
				total = unitPrice;
			} else {
				description = item.title || 'N/A';
				quantity = item.orderQuantity || 1;
				unitPrice = item.price || 0;
				total = unitPrice * quantity;
			}

			cartTableBody.push([
				{ text: description, style: 'tableData' },
				{ text: quantity.toString(), style: 'tableData', alignment: 'center' },
				{ text: `€ ${unitPrice.toFixed(2)}`, style: 'tableData', alignment: 'right' },
				{ text: `€ ${total.toFixed(2)}`, style: 'tableData', alignment: 'right' }
			]);
		});

		const doc = {
			compress: true,
			pageSize: 'A4',
			pageOrientation: 'portrait',
			pageMargins: [40, 120, 40, 60],

			header: {
				margin: [40, 20, 40, 0],
				stack: [
					{ text: 'DIENCHAN ITALIA', style: 'companyName', alignment: 'center' },
					{ text: 'Via Example 123', style: 'companyInfo', alignment: 'center' },
					{ text: 'Milano, MI 20100', style: 'companyInfo', alignment: 'center' },
					{ text: 'P.IVA: 12345678901', style: 'companyInfo', alignment: 'center' },
					{ text: 'info@dienchan.it', style: 'companyInfo', alignment: 'center' }
				]
			},

			content: [
				{
					text: "RICEVUTA D'ORDINE",
					style: 'mainHeader',
					alignment: 'center',
					margin: [0, 0, 0, 20]
				},

				{
					columns: [
						{
							width: '50%',
							stack: [
								{ text: 'DATI ORDINE', style: 'sectionHeader', margin: [0, 0, 0, 10] },
								{
									text: [
										{ text: 'N° Ordine: ', style: 'labelBold' },
										{ text: order.orderId || 'N/A', style: 'valueText' }
									]
								},
								{
									text: [
										{ text: 'Data: ', style: 'labelBold' },
										{ text: new Date(order.orderDate).toLocaleDateString('it-IT'), style: 'valueText' }
									],
									margin: [0, 5, 0, 0]
								},
								{
									text: [
										{ text: 'Tipo: ', style: 'labelBold' },
										{ text: order.type?.toUpperCase() || 'N/A', style: 'valueText' }
									],
									margin: [0, 5, 0, 0]
								}
							]
						},
						{
							width: '50%',
							stack: [
								{ text: 'CLIENTE', style: 'sectionHeader', margin: [0, 0, 0, 10] },
								{
									text: `${order.shipping?.name || ''} ${order.shipping?.surname || ''}`,
									style: 'valueText'
								},
								{
									text: order.shipping?.email || 'N/A',
									style: 'valueText',
									margin: [0, 5, 0, 0]
								},
								{
									text: order.shipping?.phone || order.shipping?.mobile || 'N/A',
									style: 'valueText',
									margin: [0, 5, 0, 0]
								}
							]
						}
					],
					margin: [0, 0, 0, 20]
				},

				{
					text: 'INDIRIZZO DI SPEDIZIONE',
					style: 'sectionHeader',
					margin: [0, 10, 0, 10]
				},
				{
					text: [
						{ text: `${order.shipping?.address || 'N/A'}\n`, style: 'valueText' },
						{ text: `${order.shipping?.postalCode || ''} ${order.shipping?.city || ''} (${order.shipping?.county || ''})\n`, style: 'valueText' },
						{ text: `${order.shipping?.country || 'Italia'}`, style: 'valueText' }
					],
					margin: [0, 0, 0, 20]
				},

				// Indirizzo di fatturazione (se presente)
			...(order.invoicing?.businessName || order.invoicing?.name ? [
				{
					text: 'INDIRIZZO DI FATTURAZIONE',
					style: 'sectionHeader',
					margin: [0, 10, 0, 10]
				},
				{
					text: [
						...(order.invoicing.businessName ? [
							{ text: `${order.invoicing.businessName}\n`, style: 'valueText', bold: true },
							...(order.invoicing.vatNumber ? [{ text: `P.IVA: ${order.invoicing.vatNumber}\n`, style: 'valueText' }] : [])
						] : []),
						...(order.invoicing.name || order.invoicing.surname ? [
							{ text: `${order.invoicing.name || ''} ${order.invoicing.surname || ''}\n`, style: 'valueText' }
						] : []),
						{ text: `${order.invoicing?.address || 'N/A'}\n`, style: 'valueText' },
						{ text: `${order.invoicing?.postalCode || ''} ${order.invoicing?.city || ''} ${order.invoicing?.county ? `(${order.invoicing.county})` : ''}\n`, style: 'valueText' },
						{ text: `${order.invoicing?.country || 'Italia'}`, style: 'valueText' }
					],
					margin: [0, 0, 0, 20]
				}
			] : []),

				{
					text: 'DETTAGLIO ORDINE',
					style: 'sectionHeader',
					margin: [0, 10, 0, 10]
				},
				{
					table: {
						headerRows: 1,
						widths: ['*', '15%', '20%', '20%'],
						body: cartTableBody
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
				},

				{
					columns: [
						{ width: '*', text: '' },
						{
							width: '40%',
							stack: [
								{
									columns: [
										{ text: 'Subtotale:', style: 'totalLabel', alignment: 'right' },
										{ text: `€ ${order.totalValue.toFixed(2)}`, style: 'totalValue', alignment: 'right' }
									],
									margin: [0, 10, 0, 5]
								},
								{
									columns: [
										{ text: 'Sconto:', style: 'totalLabel', alignment: 'right' },
										{ text: `€ ${order.totalDiscount?.toFixed(2) || '0.00'}`, style: 'totalValue', alignment: 'right' }
									],
									margin: [0, 0, 0, 5]
								},
								{
									columns: [
										{ text: 'IVA:', style: 'totalLabel', alignment: 'right' },
										{ text: `€ ${order.totalVAT?.toFixed(2) || '0.00'}`, style: 'totalValue', alignment: 'right' }
									],
									margin: [0, 0, 0, 10]
								},
								{
									canvas: [
										{
											type: 'line',
											x1: 0,
											y1: 0,
											x2: 515,
											y2: 0,
											lineWidth: 1
										}
									],
									margin: [0, 0, 0, 10]
								},
								{
									columns: [
										{ text: 'TOTALE:', style: 'totalLabelBold', alignment: 'right' },
										{ text: `€ ${order.totalValue.toFixed(2)}`, style: 'totalValueBold', alignment: 'right' }
									]
								}
							]
						}
					]
				},

				{
					text: 'INFORMAZIONI PAGAMENTO',
					style: 'sectionHeader',
					margin: [0, 20, 0, 10]
				},
				{
					columns: [
						{
							width: '50%',
							stack: [
								{
									text: [
										{ text: 'Metodo: ', style: 'labelBold' },
										{ text: order.payment?.method || 'N/A', style: 'valueText' }
									]
								},
								{
									text: [
										{ text: 'Stato: ', style: 'labelBold' },
										{
											text:
												order.payment?.statusPayment === 'done' ? 'PAGATO' : order.payment?.statusPayment === 'pending' ? 'IN ATTESA' : 'CANCELLATO',
											style: order.payment?.statusPayment === 'done' ? 'statusPaid' : 'statusPending'
										}
									],
									margin: [0, 5, 0, 0]
								}
							]
						},
						{ width: '50%', text: '' }
						
					]
				},

				order.orderNotes
					? {
							text: 'NOTE',
							style: 'sectionHeader',
							margin: [0, 20, 0, 10]
						}
					: {},
				order.orderNotes
					? {
							text: order.orderNotes,
							style: 'valueText'
						}
					: {},

				{
					text: `Ricevuta generata il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}`,
					style: 'footer',
					alignment: 'center',
					margin: [0, 30, 0, 0]
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
					fontSize: 10,
					bold: true,
					color: 'white'
				},
				tableData: {
					fontSize: 9,
					color: '#333333'
				},
				totalLabel: {
					fontSize: 10,
					color: '#333333'
				},
				totalValue: {
					fontSize: 10,
					color: '#333333'
				},
				totalLabelBold: {
					fontSize: 12,
					bold: true,
					color: '#2E5BBA'
				},
				totalValueBold: {
					fontSize: 12,
					bold: true,
					color: '#2E5BBA'
				},
				statusPaid: {
					fontSize: 10,
					bold: true,
					color: '#008000'
				},
				statusPending: {
					fontSize: 10,
					bold: true,
					color: '#FF6600'
				},
				footer: {
					fontSize: 8,
					italics: true,
					color: '#888888'
				}
			}
		};

		pdfMake.createPdf(doc, null, pdfFonts).download(`Ricevuta_${order.orderId}_${new Date().toISOString().split('T')[0]}.pdf`);
	};

	const addItem = (item: any, type: string) => {
		if (type == 'county') {
			if (county != '') {
				if (!countyArray.includes(item)) {
					countyArray.push(item);
					county = '';
				} else {
					notification.error('Provincia già inserita');
				}
			} else {
				notification.error('Provincia NON valida');
			}
		}

		county = '';
	};

	const removeItem = (index: number, type: string) => {
		if (index !== -1) {
			if (type == 'county') countyArray.splice(index, 1); /// PROVINCE
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
		if (isNaN(dateObject.getTime())) {
			notification.error('Data di certificazione non valida');
			return;
		}
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

		try {
			pdfMake.createPdf(doc, null, pdfFonts).download(`Attestato_${item.layoutView.title}_${user.name}_${user.surname}.pdf`);
		} catch (error) {
			console.error('PDF generation failed:', error);
			notification.error('Errore nella generazione del certificato');
		}
	};
	const createPDFmembership = (user) => {
		if (!user?.name || !user?.surname || !user?.userId || !user?.membership?.membershipExpiry) {
			notification.error('Dati utente incompleti per generare la tessera');
			return;
		}
		// const dateObject = new Date(user.membership.membershipExpiry);
		// if (isNaN(dateObject.getTime())) {
		// 	notification.error('Data tessera non valida');
		// 	return;
		// }
		// const year = dateObject.getFullYear();
		// const month = dateObject.getMonth() + 1; // getMonth() returns 0-11, so add 1 for 1-12
		// const day = dateObject.getDate();
		const currentYear = new Date().getFullYear();
		// const layout = {
		// 	line1: [115, 68, 0, 0],
		// 	line2: [115, 4, 0, 0],
		// 	line3: [95, 3, 0, 0],
		// 	line4: [300, 15, 0, 0]
		// };
		const doc = {
			compress: true,
			pageSize: {
				width: 481.89,
				height: 155.91
			},
			pageOrientation: 'landscape', // portrait or landscape
			pageMargins: [0, 0, 0, 0], // [left, top, right, bottom]
			background: {
				image: 'background',
				width: 481.89, // your 17cm converted to points
				height: 155.91, // your 5.5cm converted to point
				absolutePosition: { x: 0, y: 0 }
			},
			// header: {
			// 	width: 200,
			// 	image: '/images/cert-header.png',
			// 	margin: [10, 10]
			// },
			content: [
				// line 1
				{
					text: `${user.name}`,
					margin: [115, 68, 0, 0], //[left, top, right, bottom]
					style: [{ color: '#000000' }, { fontSize: 10 }, 'bold', { alignment: 'left' }]
				},
				// line 2
				{
					text: `${user.surname}`,
					margin: [115, 4, 0, 0], //[left, top, right, bottom]
					style: [{ color: '#000000' }, { fontSize: 10 }, { alignment: 'left' }]
				},
				// line 3
				{
					text: `${user.userId} - Anno: ${currentYear}`,
					margin: [95, 3, 0, 0], //[left, top, right, bottom]
					style: [{ color: '#000000' }, { fontSize: 10 }, { alignment: 'left' }]
				},
				// line 4
				{
					text: `TESSERA SOCIO ${currentYear}`,
					margin: [300, 15, 0, 0], //[left, top, right, bottom]
					font: 'Roboto',
					bold: true,
					style: [{ color: '#000000' }, { fontSize: 13 }, 'bold', { alignment: 'left' }]
				}
			],

			images: {
				// in browser is supported loading images via url (https or http protocol) (minimal version: 0.1.67)
				background: `${PUBLIC_BASE_URL}/images/membership_base.jpg`
			}
			//images: ['/training/base.jpg'] // DEPRECATED
		};

		try {
			pdfMake.createPdf(doc, null, pdfFonts).download(`Tessera_Dienchan_${user.name}_${user.surname}.pdf`);
		} catch (error) {
			console.error('PDF generation failed:', error);
			notification.error('Errore nella generazione tessera');
		}
	};

	const [send, receive] = crossfade({
		duration: 300, // Adjust duration as needed
		easing: quintOut,
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
          transform: ${transform} scale(${t});
          opacity: ${t}
        `
			};
		}
	});

	const onSwitchPublicProfile = async (type: string, value: boolean) => {
		if (type == 'namePublic') namePublic = !value;
		if (type == 'surnamePublic') surnamePublic = !value;
		if (type == 'emailPublic') emailPublic = !value;
		if (type == 'addressPublic') addressPublic = !value;
		if (type == 'cityPublic') cityPublic = !value;
		if (type == 'countyPublic') countyPublic = !value;
		if (type == 'postalCodePublic') postalCodePublic = !value;
		if (type == 'countryPublic') countryPublic = !value;
		if (type == 'phonePublic') phonePublic = !value;
		if (type == 'mobilePhonePublic') mobilePhonePublic = !value;
	};

	const toggleOrderDetails = (orderId: string) => {
		if (expandedOrderId === orderId) {
			expandedOrderId = '';
		} else {
			expandedOrderId = orderId;
		}
	};

	const resetFields = () => {
		closedInput = true;
		namePublic = userData.namePublic;
		surnamePublic = userData.surnamePublic;
		emailPublic = userData.emailPublic;
		addressPublic = userData.addressPublic;
		cityPublic = userData.cityPublic;
		countyPublic = userData.countyPublic;
		postalCodePublic = userData.postalCodePublic;
		countryPublic = userData.countryPublic;
		phonePublic = userData.phonePublic;
		mobilePhonePublic = userData.mobilePhonePublic;
		//
		trainingDate = '';
		trainingDescription = '';
		trainingHours = 0;
		setTrainingFile = null;
	};

	const onClickModal = (type: string, item: any) => {
		currentModal = type;
		openModal = true;
		if (type == 'upload-photo') {
			postAction = `?/setProfilePic`;
			modalTitle = 'Upload foto';
		}
		if (type == 'reset-password') {
			postAction = `?/changePassword`;
			modalTitle = 'Cambio password';
		}
		if (type == 'points') {
			modalTitle = 'Storico Punti';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		currentModal = '';
	};

	const onCloseMissingFieldsModal = () => {
		showMissingFieldsModal = false;
		activeTab = 'profile';
		openInput();
	};

	const formSubmit = () => {
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { message } = result.data; // { action, success, message, payload }
				notification.info(message);
				onCloseModal();
				resetFields();
			}
			if (result.type === 'failure') {
				notification.error(result.data.message);
			}
			if (result.type === 'error') {
				notification.error(result.error.message);
			}
			// 'update()' is called by default by use:enhance
			// call 'await update()' if you need to ensure it completes before further client logic.
			loading = false;
		};
	};

	if (!userData.name && !userData.surname) {
		notification.info('Registrazione effettuta, completare il profilo');
	}

	$effect(() => {
		if (activeTab !== 'profile') {
			checkMissingFields();
		}
	});
</script>

<svelte:head>
	<title>Area Personale | {userData.name} {userData.surname}</title>
</svelte:head>

<div class="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-teal-50 to-emerald-300">
	{#if loading}
		<Loader />
	{/if}
	<div class="container mx-auto px-4">
		<!-- Header Section -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-base-content">Area Personale</h1>
			<p class="text-base-content/70">Gestisci il tuo profilo e visualizza i tuoi ordini</p>
		</div>

		<!-- Main Content -->
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
			<!-- Left Column - Profile Summary -->
			<div class="lg:col-span-1">
				<div class="bg-base-100 rounded-xl shadow-md overflow-hidden">
					<!-- Profile Header -->
					<div class="bg-primary text-primary-content p-6">
						<div class="flex flex-col items-center">
							<div class="relative mb-4">
								{#if userData.uploadfiles.some((file) => file.type === 'profile')}
									<div class="avatar">
										<div class="w-48 h-48 rounded-full ring ring-emerald-600 ring-offset-base-100 ring-offset-2 overflow-hidden">
											<Image
												layout="constrained"
												aspectRatio={1}
												src={imgCheck.single(userData.uploadfiles, 'profile')}
												alt="Profile"
												class="object-cover w-full h-full"
											/>
										</div>
									</div>
									<form method="POST" action={`?/delProfilePic`} use:enhance={formSubmit}>
										<input type="hidden" name="userId" value={userData.userId} />
										<input type="hidden" name="fileName" value={imgCheck.fileName(userData.uploadfiles, 'profile')} />
										<button class="absolute bottom-0 right-0 btn btn-circle btn-lg btn-error" type="submit" aria-label="Delete image">
											<Trash2 size="24" />
										</button>
									</form>
								{:else}
									<div class="avatar placeholder">
										<div class="w-48 h-48 rounded-full bg-primary-focus text-primary-content ring ring-primary ring-offset-base-100 ring-offset-2">
											<Image layout="constrained" aspectRatio={1} src="/images/placeholder.jpg" alt="Profile" class="object-cover w-full h-full" />
										</div>
										<button class="absolute bottom-0 right-0 btn btn-circle btn-lg btn-primary" onclick={() => onClickModal('upload-photo', null)}>
											<Camera />
										</button>
									</div>
								{/if}
							</div>

							<h2 class="text-2xl font-bold">{userData.name} {userData.surname}</h2>
							<p class="opacity-90">{userData.email}</p>
						</div>
					</div>

					<!-- Membership Info -->
					<div class="p-6 border-b border-base-200">
						<div class="flex items-center gap-3 mb-4">
							{#if userData.membership.membershipStatus}
								<div class="badge badge-lg badge-success">Attivo</div>
							{:else}
								<div class="badge badge-lg badge-error">Scaduto</div>
							{/if}

							<h3 class="font-semibold text-base-content flex items-center gap-2">
								<Award size={18} class="text-primary" />
								{membershipLevel}
							</h3>
						</div>

						{#if membershipExpiry}
							<div class="flex items-center gap-2 text-sm text-base-content/70">
								<Calendar size={16} />
								<span>Scadenza: {formatDate(typeof membershipExpiry === 'string' ? membershipExpiry : membershipExpiry.toISOString())}</span>
							</div>
						{/if}

						<div class="flex items-center gap-2 text-sm text-base-content/70 mt-2">
							<BadgeCheck size={16} />
							<span>Livello: {level || 'Base'}</span>
						</div>
						<div class="flex items-center gap-2 text-sm text-base-content/70 mt-2">
							<HandCoins size={16} />
							<span>Punti: {userData.pointsBalance || 0}</span>
						</div>

						<div class="flex items-center gap-2 text-sm text-base-content/70 mt-2">
							<IdCard size={16} />
							<span>ID: {userData.userId}</span>
						</div>
					</div>

					<!-- Navigation -->
					<div class="p-4">
						<div class="flex flex-col gap-2">
							<button
								class="btn btn-ghost justify-start gap-3 {activeTab === 'dashboard' ? 'btn-active' : ''}"
								onclick={() => (activeTab = 'dashboard')}
							>
								<House size={18} />
								Dashboard
							</button>
							<button class="btn btn-ghost justify-start gap-3 {activeTab === 'profile' ? 'btn-active' : ''}" onclick={() => (activeTab = 'profile')}>
								<User size={18} />
								Profilo
							</button>
							<!-- <button
								class="btn btn-ghost justify-start gap-3 {activeTab === 'membership' ? 'btn-active' : ''}"
								onclick={() => (activeTab = 'membership')}
							>
								<IdCard size={18} />
								Tessera
							</button> -->

							<button class="btn btn-ghost justify-start gap-3 {activeTab === 'orders' ? 'btn-active' : ''}" onclick={() => (activeTab = 'orders')}>
								<ShoppingBag size={18} />
								Ordini
							</button>
							<button
								class="btn btn-ghost justify-start gap-3 {activeTab === 'training' ? 'btn-active' : ''}"
								onclick={() => {
									activeTab = 'training';
									postAction = `?/setTraining`;
								}}
							>
								<NotebookPen size={18} />
								Formazione
							</button>
							<button
								class="btn btn-ghost justify-start gap-3 {activeTab === 'certificates' ? 'btn-active' : ''}"
								onclick={() => (activeTab = 'certificates')}
							>
								<Award size={18} />
								Certificati
							</button>
							{#if userData.membership.membershipStatus === true}
								<a
									href="https://accademia-online.riflessologiadienchan.it/"
									class="btn btn-ghost justify-start gap-3"
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink size={18} />
									Corsi Online
								</a>
								<a
									href="https://riflessologiadienchan.it/scheda/scheda.php"
									class="btn btn-ghost justify-start gap-3"
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink size={18} />
									Mappatura punti online
								</a>
								<a
									href="https://riflessologiadienchan.it/auto-dien-chan/"
									class="btn btn-ghost justify-start gap-3"
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink size={18} />
									Auto Dien Chan (programma interattivo)
								</a>
							{/if}
							{#if isFormatore || level === 'superadmin' || level === 'admin'}
								<a href="https://riflessologiadienchan.it/login/" class="btn btn-ghost justify-start gap-3" target="_blank" rel="noopener noreferrer">
									<ExternalLink size={18} />
									Vecchio report eventi
								</a>
							{/if}

							<a href="/profile-public/{userData.userId}" class="btn btn-ghost justify-start gap-3">
								<Eye size={18} />
								Anteprima profilo pubblico
							</a>
							<button class="btn btn-ghost justify-start gap-3 text-error" onclick={() => onClickModal('reset-password', null)}>
								<Shield size={18} />
								Cambia password
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column - Main Content -->
			<div class="lg:col-span-3">
				{#if activeTab === 'dashboard'}
					<!-- Dashboard Tab -->
					<h2 class="text-2xl font-bold mb-4">Dashboard Utente</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<!-- Card: Ordini Recenti -->
						<div class="card bg-base-100 shadow-md p-6 flex flex-col justify-between">
							<div class="flex items-center gap-3 mb-2">
								<ShoppingBag size={24} class="text-primary" />
								<span class="font-semibold text-lg">Ultimo Ordine</span>
							</div>
							{#if orderData.length > 0}
								<div class="mb-2">
									<div class="text-base-content/80 text-sm">Data: {formatDate(orderData[0].createdAt)}</div>
									<div class="text-base-content/80 text-sm">Totale: <span class="font-bold">€ {orderData[0].totalValue.toFixed(2)}</span></div>
									<div class="text-base-content/80 text-sm">Tipo: <span class="capitalize">{orderData[0].type}</span></div>
								</div>
								<button type="button" class="btn btn-sm btn-primary mt-2" onclick={() => (activeTab = 'orders')}> Vedi ordini </button>
							{:else}
								<div class="text-base-content/60">Nessun ordine recente.</div>
							{/if}
						</div>

						<!-- Card: Stato Tessera -->
						<div class="card bg-base-100 shadow-md p-6 flex flex-col justify-between">
							<div class="flex items-center gap-3 mb-2">
								<IdCard size={24} class="text-primary" />
								<span class="font-semibold text-lg">Stato Tessera</span>
								{#if userData.membership.membershipStatus}
									<span class="badge badge-success">Attiva</span>
								{:else}
									<span class="badge badge-error">Scaduta</span>
								{/if}
							</div>
							<div class="mb-2">
								<div class="flex items-center gap-2">
									<span class="text-base-content/80 text-sm">Tipo: <span class="font-bold">{membershipLevel || 'Base'}</span></span>
								</div>
								{#if membershipExpiry}
									<div class="text-base-content/80 text-sm mt-1">
										Scadenza: {formatDate(typeof membershipExpiry === 'string' ? membershipExpiry : membershipExpiry.toISOString())}
									</div>
								{/if}
							</div>
							{#if userData.membership.membershipStatus === true}
								<button type="button" class="btn btn-sm btn-primary mt-2" onclick={() => createPDFmembership(userData)}> Stampa Tessera </button>
							{:else}
								<button type="button" class="btn btn-sm btn-primary mt-2" disabled>Tessera scaduta</button>
							{/if}
						</div>

						<!-- Card: Punti e Attività -->
						<div class="card bg-base-100 shadow-md p-6 flex flex-col justify-between">
							<div class="flex items-center gap-3 mb-2">
								<HandCoins size={24} class="text-primary" />
								<span class="font-semibold text-lg">Saldo Punti</span>
							</div>
							<div class="mb-2">
								<span class="text-3xl font-bold text-primary">{userData.pointsBalance || 0}</span>
								<div class="text-base-content/80 text-sm mt-1">Punti disponibili</div>
							</div>
							<button
									type="button"
									class="btn btn-sm btn-primary mt-2"
									onclick={() => onClickModal('points', null)}>Storico Punti</button
								>
						</div>

						<!-- Card: Prossima Formazione -->
						<div class="card bg-base-100 shadow-md p-6 flex flex-col justify-between">
							<div class="flex items-center gap-3 mb-2">
								<NotebookPen size={24} class="text-primary" />
								<span class="font-semibold text-lg">Formazione</span>
							</div>
							{#if userData?.trainingHistory.length > 0}
								<div class="mb-2">
									<div class="text-base-content/80 text-sm">
										Ultima formazione: <span class="font-bold">{userData?.trainingHistory[userData?.trainingHistory.length - 1].description}</span>
									</div>
									<div class="text-base-content/80 text-sm">
										Data: {formatDate(userData?.trainingHistory[userData?.trainingHistory.length - 1]?.date)}
									</div>
								</div>
								<button
									type="button"
									class="btn btn-sm btn-primary mt-2"
									onclick={() => {
										activeTab = 'training';
										postAction = `?/setTraining`;
									}}>Gestisci formazione</button
								>
							{:else}
								<div class="text-base-content/60">Nessuna formazione registrata.</div>
							{/if}
						</div>
						<!-- Card: Mappatura Punti Online -->
						<div class="card bg-base-100 shadow-md p-6 flex flex-col justify-between">
							<div class="flex items-center gap-3 mb-2">
								<MapPinned size={24} class="text-primary" />
								<span class="font-semibold text-lg">Mappatura Punti Online</span>
							</div>
							<div class="text-base-content/60">Genera la mappa dei punti direttamente online</div>
							{#if userData.membership.membershipStatus === true}
								<a type="button" class="btn btn-sm btn-primary mt-2" href="https://riflessologiadienchan.it/scheda/scheda.php"
									><ExternalLink /> Vai al programma</a
								>
							{:else}
								<button type="button" class="btn btn-sm btn-primary mt-2" disabled>Tessera scaduta</button>
							{/if}
						</div>
						<!-- Card: Auto Dien Chan -->
						<div class="card bg-base-100 shadow-md p-6 flex flex-col justify-between">
							<div class="flex items-center gap-3 mb-2">
								<CirclePlay size={24} class="text-primary" />
								<span class="font-semibold text-lg">Auto Dien Chan</span>
							</div>
							<div class="text-base-content/60">Programma interattivo di auto-trattamento Dien Chan</div>
							{#if userData.membership.membershipStatus === true}
								<a type="button" class="btn btn-sm btn-primary mt-2" href="https://riflessologiadienchan.it/auto-dien-chan/"
									><ExternalLink /> Vai al programma</a
								>
							{:else}
								<button type="button" class="btn btn-sm btn-primary mt-2" disabled>Tessera scaduta</button>
							{/if}
						</div>
					</div>
					<!-- Quick Actions -->
					<!-- <div class="mt-8">
						<h3 class="text-lg font-semibold mb-4">Azioni rapide</h3>
						<div class="flex flex-wrap gap-4">
							<button class="btn btn-outline btn-primary flex items-center gap-2" onclick={() => (activeTab = 'profile')}
								><User size={18} /> Modifica Profilo</button
							>
							<button class="btn btn-outline btn-primary flex items-center gap-2" onclick={() => (activeTab = 'orders')}
								><ShoppingBag size={18} /> Storico Ordini</button
							>
							<button class="btn btn-outline btn-primary flex items-center gap-2" onclick={() => (activeTab = 'membership')}
								><IdCard size={18} /> Tessera</button
							>
							<button class="btn btn-outline btn-primary flex items-center gap-2" onclick={() => (activeTab = 'training')}
								><NotebookPen size={18} /> Formazione</button
							>
						</div>
					</div> -->
				{:else if activeTab === 'profile'}
					<!-- Profile Tab -->
					<div class="bg-base-100 rounded-xl shadow-md overflow-hidden">
						<div class="bg-gradient-to-br from-teal-300 to-emerald-100 border-b border-base-200 p-6 flex justify-between items-center">
							<h2 class="text-xl font-bold text-base-content">Informazioni Personali</h2>

							{#if closedInput}
								<button class="btn btn-sm" onclick={openInput}>
									<SquarePen size={16} />
									Modifica
								</button>
							{:else}
								<div class="flex gap-2">
									<button class="btn btn-error btn-sm" onclick={closeInput} type="button">
										<X size={16} />
										Annulla
									</button>
									<button class="btn btn-success btn-sm" form="profile-form" type="submit">
										<Check size={16} />
										Salva
									</button>
								</div>
							{/if}
						</div>

						<div class="p-6">
							<form id="profile-form" action="?/modify" method="POST" use:enhance={formSubmit} class="space-y-6">
								<input type="hidden" name="userId" value={userData.userId} />

								<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
									<!-- Nome -->
									<div class="form-control">
										<label class="label">
											<div class="flex w-full justify-between items-center">
												<span class="font-semibold">Nome</span>
												<div class="form-control">
													<label class="label cursor-pointer gap-2" for="check-name">
														{#if closedInput}
															<input type="hidden" name="namePublic" checked={namePublic} />
														{:else}
															<input
																type="checkbox"
																class="hidden"
																id="check-name"
																name="namePublic"
																checked={namePublic}
																onclick={() => onSwitchPublicProfile('namePublic', namePublic)}
															/>
														{/if}

														<span class="ml-2">
															{#if closedInput && namePublic}
																<ToggleRight />
															{:else if !closedInput && namePublic}
																<ToggleRight color="darkgreen" />
															{:else if closedInput && !namePublic}
																<ToggleLeft />
															{:else}
																<ToggleLeft color="darkred" />
															{/if}</span
														>
														<span class="label-text {namePublic ? 'text-success' : 'text-error'}"> {namePublic ? 'Visibile' : 'Privato'}</span>
													</label>
												</div>
											</div>
										</label>
										<input
											id="name"
											name="name"
											type="text"
											class="input input-bordered w-full"
											placeholder="Inserisci il tuo nome"
											required
											readonly={closedInput}
											bind:value={name}
										/>
									</div>

									<!-- Cognome -->
									<div class="form-control">
										<label class="label">
											<div class="flex w-full justify-between items-center">
												<span class="font-semibold">Cognome</span>
												<div class="form-control">
													<label class="label cursor-pointer gap-2" for="check-surnamePublic">
														{#if closedInput}
															<input type="hidden" name="surnamePublic" checked={surnamePublic} />
														{:else}
															<input
																type="checkbox"
																class="hidden"
																id="check-surnamePublic"
																name="surnamePublic"
																checked={surnamePublic}
																onclick={() => onSwitchPublicProfile('surnamePublic', surnamePublic)}
															/>
														{/if}

														<span class="ml-2">
															{#if closedInput && surnamePublic}
																<ToggleRight />
															{:else if !closedInput && surnamePublic}
																<ToggleRight color="darkgreen" />
															{:else if closedInput && !surnamePublic}
																<ToggleLeft />
															{:else}
																<ToggleLeft color="darkred" />
															{/if}</span
														>
														<span class="label-text {surnamePublic ? 'text-success' : 'text-error'}"> {surnamePublic ? 'Visibile' : 'Privato'}</span>
													</label>
												</div>
											</div>
										</label>
										<input
											id="surname"
											name="surname"
											type="text"
											class="input input-bordered w-full"
											placeholder="Inserisci il tuo cognome"
											required
											readonly={closedInput}
											bind:value={surname}
										/>
									</div>

									<!-- Email -->
									<div class="form-control md:col-span-2">
										<label class="label">
											<div class="flex w-full justify-between items-center">
												<span class="font-semibold">Email</span>
												<div class="form-control">
													<label class="label cursor-pointer gap-2" for="check-emailPublic">
														{#if closedInput}
															<input type="hidden" name="emailPublic" checked={emailPublic} />
														{:else}
															<input
																type="checkbox"
																class="hidden"
																id="check-emailPublic"
																name="emailPublic"
																checked={emailPublic}
																onclick={() => onSwitchPublicProfile('emailPublic', emailPublic)}
															/>
														{/if}

														<span class="ml-2">
															{#if closedInput && emailPublic}
																<ToggleRight />
															{:else if !closedInput && emailPublic}
																<ToggleRight color="darkgreen" />
															{:else if closedInput && !emailPublic}
																<ToggleLeft />
															{:else}
																<ToggleLeft color="darkred" />
															{/if}</span
														>
														<span class="label-text {emailPublic ? 'text-success' : 'text-error'}"> {emailPublic ? 'Visibile' : 'Privato'}</span>
													</label>
												</div>
											</div>
										</label>
										<div class="input input-bordered flex items-center gap-2">
											<Mail size={18} class="text-base-content/50 ml-2" />
											<input
												id="email"
												name="email"
												type="email"
												class="flex-1 outline-none bg-transparent"
												placeholder="esempio@email.com"
												required
												readonly={closedInput}
												bind:value={email}
											/>
										</div>
									</div>
								</div>

								<div class="divider">Indirizzo</div>

								<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
									<!-- Indirizzo -->
									<div class="form-control md:col-span-2">
										<label class="label">
											<div class="flex w-full justify-between items-center">
												<span class="font-semibold">Indirizzo</span>
												<div class="form-control">
													<label class="label cursor-pointer gap-2" for="check-addressPublic">
														{#if closedInput}
															<input type="hidden" name="addressPublic" checked={addressPublic} />
														{:else}
															<input
																type="checkbox"
																class="hidden"
																id="check-addressPublic"
																name="addressPublic"
																checked={addressPublic}
																onclick={() => onSwitchPublicProfile('addressPublic', addressPublic)}
															/>
														{/if}

														<span class="ml-2">
															{#if closedInput && addressPublic}
																<ToggleRight />
															{:else if !closedInput && addressPublic}
																<ToggleRight color="darkgreen" />
															{:else if closedInput && !addressPublic}
																<ToggleLeft />
															{:else}
																<ToggleLeft color="darkred" />
															{/if}</span
														>
														<span class="label-text {addressPublic ? 'text-success' : 'text-error'}"> {addressPublic ? 'Visibile' : 'Privato'}</span>
													</label>
												</div>
											</div>
										</label>
										<div class="input input-bordered flex items-center gap-2">
											<House size={18} class="text-base-content/50 ml-2" />
											<input
												id="address"
												name="address"
												type="text"
												class="flex-1 outline-none bg-transparent"
												placeholder="Via/Piazza, numero civico"
												required
												readonly={closedInput}
												bind:value={address}
											/>
										</div>
									</div>

									<!-- Città -->
									<div class="form-control">
										<label class="label">
											<div class="flex w-full justify-between items-center">
												<span class="font-semibold">Città</span>
												<div class="form-control">
													<label class="label cursor-pointer gap-2" for="check-cityPublic">
														{#if closedInput}
															<input type="hidden" name="cityPublic" checked={cityPublic} />
														{:else}
															<input
																type="checkbox"
																class="hidden"
																id="check-cityPublic"
																name="cityPublic"
																checked={cityPublic}
																onclick={() => onSwitchPublicProfile('cityPublic', cityPublic)}
															/>
														{/if}

														<span class="ml-2">
															{#if closedInput && cityPublic}
																<ToggleRight />
															{:else if !closedInput && cityPublic}
																<ToggleRight color="darkgreen" />
															{:else if closedInput && !cityPublic}
																<ToggleLeft />
															{:else}
																<ToggleLeft color="darkred" />
															{/if}</span
														>
														<span class="label-text {cityPublic ? 'text-success' : 'text-error'}"> {cityPublic ? 'Visibile' : 'Privato'}</span>
													</label>
												</div>
											</div>
										</label>
										<input
											id="city"
											name="city"
											type="text"
											class="input input-bordered w-full"
											placeholder="Inserisci la città"
											required
											readonly={closedInput}
											bind:value={city}
										/>
									</div>

									<!-- CAP -->
									<div class="form-control">
										<label class="label">
											<div class="flex w-full justify-between items-center">
												<span class="font-semibold">CAP</span>
												<div class="form-control">
													<label class="label cursor-pointer gap-2" for="check-postalCodePublic">
														{#if closedInput}
															<input type="hidden" name="postalCodePublic" checked={postalCodePublic} />
														{:else}
															<input
																type="checkbox"
																class="hidden"
																id="check-postalCodePublic"
																name="postalCodePublic"
																checked={postalCodePublic}
																onclick={() => onSwitchPublicProfile('postalCodePublic', postalCodePublic)}
															/>
														{/if}

														<span class="ml-2">
															{#if closedInput && postalCodePublic}
																<ToggleRight />
															{:else if !closedInput && postalCodePublic}
																<ToggleRight color="darkgreen" />
															{:else if closedInput && !postalCodePublic}
																<ToggleLeft />
															{:else}
																<ToggleLeft color="darkred" />
															{/if}</span
														>
														<span class="label-text {postalCodePublic ? 'text-success' : 'text-error'}">
															{postalCodePublic ? 'Visibile' : 'Privato'}</span
														>
													</label>
												</div>
											</div>
										</label>
										<input
											id="postalCode"
											name="postalCode"
											type="text"
											class="input input-bordered w-full"
											placeholder="12345"
											required
											readonly={closedInput}
											bind:value={postalCode}
										/>
									</div>

									<!-- Provincia -->
									<div class="form-control">
										<label class="label">
											<div class="flex w-full justify-between items-center">
												<span class="font-semibold">Provincia</span>
												<div class="form-control">
													<label class="label cursor-pointer gap-2" for="check-countyPublic">
														{#if closedInput}
															<input type="hidden" name="countyPublic" checked={countyPublic} />
														{:else}
															<input
																type="checkbox"
																class="hidden"
																id="check-countyPublic"
																name="countyPublic"
																checked={countyPublic}
																onclick={() => onSwitchPublicProfile('countyPublic', countyPublic)}
															/>
														{/if}

														<span class="ml-2">
															{#if closedInput && countyPublic}
																<ToggleRight />
															{:else if !closedInput && countyPublic}
																<ToggleRight color="darkgreen" />
															{:else if closedInput && !countyPublic}
																<ToggleLeft />
															{:else}
																<ToggleLeft color="darkred" />
															{/if}</span
														>
														<span class="label-text {countyPublic ? 'text-success' : 'text-error'}"> {countyPublic ? 'Visibile' : 'Privato'}</span>
													</label>
												</div>
											</div>
										</label>
										<!-- <Building2 /> -->
										<div class="join join-horizontal rounded-md w-full mb-2">
											<!-- <button type="button" class="join-item bg-gray-300 px-3">AA</button> -->
											<input type="hidden" name="countyArray" bind:value={countyArray} />
											<select
												class="select select-bordered w-full rounded-md mt-2"
												id="county"
												name="county"
												disabled={closedInput}
												bind:value={county}
												onchange={() => addItem(county, 'county')}
											>
												<option disabled value="">Scegli provincia</option>
												{#each $province as provincia}
													<option value={provincia.title}>
														{provincia.title} ({provincia.region})
													</option>
												{/each}
											</select>

											<!-- <button type="button" class="join-item btn btn-primary" onclick={() => addItem(county, 'province')}> Aggiungi </button> -->
										</div>
										{#if countyArray.length > 0}
											{#each countyArray as county, i}
												<div class="btn btn-primary btn-sm m-1 rounded-md">
													{county}
													{#if !closedInput}
														<button type="button" class="badge badge-error ml-2" onclick={() => removeItem(i, 'county')}> X </button>
													{/if}
												</div>
											{/each}
										{/if}
										<!-- <select id="county" class="select select-bordered w-full" name="county" required disabled={closedInput} bind:value={county}>
											<option value="" disabled>Seleziona provincia</option>
											{#each provinceFilterate as provincia}
												<option value={provincia.title}>
													{provincia.title} ({provincia.region})
												</option>
											{/each}
										</select> -->
									</div>

									<!-- Nazione -->
									<div class="form-control">
										<label class="label">
											<div class="flex w-full justify-between items-center">
												<span class="font-semibold">Nazione</span>
												<div class="form-control">
													<label class="label cursor-pointer gap-2" for="check-countryPublic">
														{#if closedInput}
															<input type="hidden" name="countryPublic" checked={countryPublic} />
														{:else}
															<input
																type="checkbox"
																class="hidden"
																id="check-countryPublic"
																name="countryPublic"
																checked={countryPublic}
																onclick={() => onSwitchPublicProfile('countryPublic', countryPublic)}
															/>
														{/if}

														<span class="ml-2">
															{#if closedInput && countryPublic}
																<ToggleRight />
															{:else if !closedInput && countryPublic}
																<ToggleRight color="darkgreen" />
															{:else if closedInput && !countryPublic}
																<ToggleLeft />
															{:else}
																<ToggleLeft color="darkred" />
															{/if}</span
														>
														<span class="label-text {countryPublic ? 'text-success' : 'text-error'}"> {countryPublic ? 'Visibile' : 'Privato'}</span>
													</label>
												</div>
											</div>
										</label>
										<select id="country" class="select select-bordered w-full" name="country" required disabled={closedInput} bind:value={country}>
											<option value="" disabled>Seleziona nazione</option>
											{#each $country_list as countryItem}
												<option value={countryItem}>
													{countryItem}
												</option>
											{/each}
										</select>
									</div>

									<!-- Telefono -->
									<div class="form-control">
										<label class="label">
											<div class="flex w-full justify-between items-center">
												<span class="font-semibold">Telefono</span>
												<div class="form-control">
													<label class="label cursor-pointer gap-2" for="check-phonePublic">
														{#if closedInput}
															<input type="hidden" name="phonePublic" checked={phonePublic} />
														{:else}
															<input
																type="checkbox"
																class="hidden"
																id="check-phonePublic"
																name="phonePublic"
																checked={phonePublic}
																onclick={() => onSwitchPublicProfile('phonePublic', phonePublic)}
															/>
														{/if}

														<span class="ml-2">
															{#if closedInput && phonePublic}
																<ToggleRight />
															{:else if !closedInput && phonePublic}
																<ToggleRight color="darkgreen" />
															{:else if closedInput && !phonePublic}
																<ToggleLeft />
															{:else}
																<ToggleLeft color="darkred" />
															{/if}</span
														>
														<span class="label-text {phonePublic ? 'text-success' : 'text-error'}"> {phonePublic ? 'Visibile' : 'Privato'}</span>
													</label>
												</div>
											</div>
										</label>
										<div class="input input-bordered flex items-center gap-2">
											<Phone size={18} class="text-base-content/50 ml-2" />
											<input
												id="telefono"
												name="phone"
												type="tel"
												class="flex-1 outline-none bg-transparent"
												placeholder="+39 01234567"
												readonly={closedInput}
												bind:value={phone}
											/>
										</div>
									</div>

									<!-- Cellulare -->
									<div class="form-control">
										<label class="label">
											<div class="flex w-full justify-between items-center">
												<span class="font-semibold">Cellulare</span>
												<div class="form-control">
													<label class="label cursor-pointer gap-2" for="check-mobilePhonePublic">
														{#if closedInput}
															<input type="hidden" name="mobilePhonePublic" checked={mobilePhonePublic} />
														{:else}
															<input
																type="checkbox"
																class="hidden"
																id="check-mobilePhonePublic"
																name="mobilePhonePublic"
																checked={mobilePhonePublic}
																onclick={() => onSwitchPublicProfile('mobilePhonePublic', mobilePhonePublic)}
															/>
														{/if}

														<span class="ml-2">
															{#if closedInput && mobilePhonePublic}
																<ToggleRight />
															{:else if !closedInput && mobilePhonePublic}
																<ToggleRight color="darkgreen" />
															{:else if closedInput && !mobilePhonePublic}
																<ToggleLeft />
															{:else}
																<ToggleLeft color="darkred" />
															{/if}</span
														>
														<span class="label-text {mobilePhonePublic ? 'text-success' : 'text-error'}">
															{mobilePhonePublic ? 'Visibile' : 'Privato'}
														</span>
													</label>
												</div>
											</div>
										</label>
										<div class="input input-bordered flex items-center gap-2">
											<Phone size={18} class="text-base-content/50 ml-2" />
											<input
												id="cellulare"
												name="mobilePhone"
												type="tel"
												class="flex-1 outline-none bg-transparent"
												placeholder="+39 3331234567"
												required
												readonly={closedInput}
												bind:value={mobilePhone}
											/>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				{:else if activeTab === 'orders'}
					<!-- Orders Tab -->
					<div class="bg-base-100 rounded-xl shadow-md overflow-hidden">
						<div class="bg-primary/10 border-b border-base-200 p-6">
							<h2 class="text-xl font-bold text-base-content">Storico Ordini</h2>
						</div>

						<div class="p-6">
							{#if orderData.length === 0}
								<div class="text-center py-12">
									<div class="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
										<ShoppingBag size={32} class="text-base-content/50" />
									</div>
									<h3 class="text-xl font-bold mb-2">Nessun ordine</h3>
									<p class="text-base-content/70 mb-6">Non hai ancora effettuato ordini</p>
									<a href="/" class="btn btn-primary"> Inizia lo shopping </a>
								</div>
							{:else}
								<div class="space-y-6">
									{#each orderData as order, index}
										<div class="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
											<div class="bg-base-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
												<div>
													<div class="flex items-center gap-2">
														<Clock size={16} class="text-primary" />
														<span class="font-medium">Ordine del {formatDate(order.createdAt)} </span>
													</div>

													<div class="text-sm text-base-content/70 mt-1">
														ID: {order.orderId}
													</div>
												</div>

												<div class="">
													<div class="font-medium">Totale ordine</div>
													<div class="font-bold text-lg text-primary">
														€ {order.totalValue.toFixed(2)}
													</div>
												</div>
												
												<div
													class="badge"
													class:badge-accent={order.type === 'membership'}
													class:badge-info={order.type === 'product'}
													class:badge-primary={order.type === 'course'}
												>
													<span class="capitalize font-semibold">{order.type}</span>
												</div>
												{#if order.totalValue > 0}
													<div
														class="badge"
														class:badge-warning={order.payment.statusPayment === 'pending'}
														class:badge-success={order.payment.statusPayment === 'done'}
														class:badge-error={order.payment.statusPayment === 'canceled'}
													>
														{order.payment.method}
													</div>
												{:else}
													<div>
														<span class="badge badge-success">Punti / Sconti</span>
													</div>
												{/if}

												<div class="flex items-center gap-3">
													<div class="badge badge-primary">
														{order.cart.length}
														{order.cart.length === 1 ? 'prodotto' : 'prodotti'}
													</div>
													<button class="btn btn-sm btn-primary" onclick={() => createPDFReceipt(order)} title="Scarica Ricevuta PDF">
														<FileDown size={18} />
													</button>
													<button class="btn btn-sm btn-ghost" onclick={() => toggleOrderDetails(order.orderId)}>
														{#if expandedOrderId === order.orderId}
															<ChevronUp size={18} />
														{:else}
															<ChevronDown size={18} />
														{/if}
													</button>
												</div>
											</div>

											{#if expandedOrderId === order.orderId}
												<div class="p-4 border-t border-base-200">
													<div class="space-y-4">
														{#each order.cart as item}
															<div class="flex gap-4 p-3 bg-base-200/30 rounded-lg">
																<div class="w-20 h-20 bg-base-200 rounded-lg overflow-hidden flex-shrink-0">
																	{#if item.type === 'course' || item.type === 'event'}
																		<Image
																			layout="constrained"
																			aspectRatio={1}
																			src={item.layoutView?.urlPic || '/images/placeholder.jpg'}
																			alt={item.title}
																			class="w-full h-full object-cover"
																		/>
																	{:else}
																		<Image
																			layout="constrained"
																			aspectRatio={1}
																			src={imgCheck.single(item.uploadfiles, 'product-primary')}
																			alt={item.title}
																			class="w-full h-full object-cover"
																		/>
																	{/if}
																</div>

																<div class="flex-1">
																	<h4 class="font-bold text-base-content">{item.title}</h4>

																	{#if item.type === 'course' || item.type === 'event'}
																		<div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-base-content/70">
																			<div class="flex items-center gap-1">
																				<Calendar size={14} />
																				<span>{formatDate(item.eventStartDate)}</span>
																			</div>
																			<div class="flex items-center gap-1">
																				<MapPin size={14} />
																				<span>{item.county}</span>
																			</div>
																			<div class="flex items-center gap-1">
																				<User size={14} />
																				<span>{item.name} {item.surname}</span>
																			</div>
																		</div>
																	{:else}
																		<div class="flex items-center gap-2 mt-1 text-sm text-base-content/70">
																			<Package size={14} />
																			<span>Quantità: {item.orderQuantity || 1}</span>
																		</div>
																	{/if}
																</div>

																{#if order.type === 'course'}
																	<div class="text-right flex-shrink-0">
																		<div class="font-bold text-primary">
																			<!-- € {item.type === 'course' ? item.layoutView.price : item.price} -->
																			{#if item.type === 'course' || item.type === 'event'}
																				{`€ ${item.layoutView.price.toFixed(2)}`}
																			{:else if item.type === 'membership'}
																				{`€ ${item.price.toFixed(2)}`}
																			{/if}
																		</div>
																	</div>
																{:else}
																	<div class="text-right flex-shrink-0">
																		<div class="font-bold text-primary">
																			<!-- € {item.type === 'course' ? item.layoutView.price : item.price} -->
																			€ {item.price.toFixed(2)}
																		</div>
																	</div>
																{/if}
															</div>
														{/each}

														{#if order.type === 'product'}
															<div class="flex justify-between items-center pt-3 border-t border-base-200">
																<div class="font-medium">Spedizione</div>
																<div class="font-bold text-lg text-info">
																	<p>
																		{order.totalValue === 0 ? 'gratuita' : order.totalValue < 100 ? '€ 9' : 'gratuita'}
																	</p>
																</div>
															</div>
														{/if}

														<div class="flex justify-between items-center pt-3 border-t border-base-200">
															<div class="font-medium">Totale ordine</div>
															<div class="font-bold text-lg text-primary">
																€ {order.totalValue.toFixed(2)}
															</div>
														</div>
														<div class="flex justify-end pt-3">
													<button class="btn btn-sm btn-primary" onclick={() => createPDFReceipt(order)}>
														<FileDown size={16} />
														Scarica Ricevuta
													</button>
												</div>
														{#if order.totalDiscount > 0}
															<div class="flex justify-between items-center pt-3 border-t border-base-200">
																<div class="font-medium">Totale sconti</div>
																<div class="font-bold text-lg text-error">
																	<p>- € {order.totalDiscount.toFixed(2)}</p>
																</div>
															</div>
														{/if}
													</div>
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{:else if activeTab === 'membership'}
					<!-- Membership Tab -->
					<p>spazio tessera</p>
				{:else if activeTab === 'training'}
					<div class="card bg-base-200 shadow-xl mb-6 p-6">
						<h2 class="text-2xl font-bold mb-4"><NotebookPen size={24} class="text-primary" /> Gestione Formazione</h2>
						<div class="mb-4 text-lg">
							<p class="font-semibold">
								<CalendarPlus size={24} class="text-primary" /> Eventi approvati:
								<span class="font-normal">
									{userData?.trainingHistory?.filter((entry) => entry.approved === true).length || 0}
								</span>
							</p>

							<p class="font-semibold">
								<CalendarClock size={24} class="text-primary" /> Ore totali approvate:
								<span class="font-normal">
									{userData?.trainingHistory?.filter((entry) => entry.approved === true).reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0}
								</span>
							</p>
						</div>
						<h3 class="text-xl font-bold mb-4">Aggiungi Nuova Voce di Formazione</h3>
						<form
							method="POST"
							action={postAction}
							enctype="multipart/form-data"
							use:enhance={formSubmit}
							class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
						>
							<div class="form-control">
								<label for="trainingDate" class="label">
									<span class="label-text flex items-center gap-2">
										<Calendar size={16} />Data
									</span>
								</label>
								<input type="date" id="trainingDate" name="trainingDate" class="input input-bordered w-full" bind:value={trainingDate} required />
							</div>

							<div class="form-control">
								<label for="trainingDescription" class="label">
									<span class="label-text flex items-center gap-2">
										<FileText size={16} />Descrizione
									</span>
								</label>
								<input
									type="text"
									id="trainingDescription"
									name="trainingDescription"
									placeholder="Descrizione della formazione"
									class="input input-bordered w-full"
									bind:value={trainingDescription}
									required
								/>
							</div>

							<div class="form-control">
								<label for="trainingHours" class="label">
									<span class="label-text flex items-center gap-2">
										<Clock size={16} />Ore
									</span>
								</label>
								<input
									type="number"
									id="trainingHours"
									name="trainingHours"
									placeholder="Ore di formazione"
									class="input input-bordered w-full"
									min="0"
									bind:value={trainingHours}
									required
								/>
							</div>

							<div class="form-control col-span-full">
								<label for="trainingFile" class="label">
									<span class="label-text flex items-center gap-2">
										<Upload size={16} />Carica File (Certificato, Attestato, ecc.)
									</span>
								</label>
								<input
									type="file"
									id="trainingFile"
									name="fileUpload"
									class="file-input file-input-bordered w-full"
									onchange={(e) => {
										const target = e.target as HTMLInputElement;
										setTrainingFile = target.files ? target.files[0] : null;
									}}
								/>
								{#if setTrainingFile}
									<p class="text-sm text-gray-500 mt-2">File selezionato: {setTrainingFile.name}</p>
								{/if}
							</div>

							<input type="hidden" name="userId" value={userData.userId} />

							<div class="col-span-full flex justify-end">
								{#if loading}
									<Loader />
								{:else}
									<button type="submit" class="btn btn-primary flex items-center gap-2">
										<Plus size={20} /> Aggiungi Formazione
									</button>
								{/if}
							</div>
						</form>
					</div>
					<div class="card bg-base-200/75 shadow-xl p-6">
						<!-- <h3 class="text-xl font-bold mb-4">Le Tue Voci di Formazione</h3> -->
						{#if userData?.trainingHistory.length > 0}
							<div class="overflow-x-auto">
								<table class="table w-full table-zebra">
									<thead>
										<tr>
											<th>Data</th>
											<th>Descrizione</th>
											<th>Ore</th>
											<th>File</th>
											<th>Status approvazione</th>
											<th class="text-center">Azioni</th>
										</tr>
									</thead>
									<tbody>
										<!-- {#each userData?.trainingHistory as entry (entry.date)} -->
										{#each [...(userData?.trainingHistory || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as entry (entry.date)}
											<tr class="hover" in:receive={{ key: entry.date }} out:send={{ key: entry.date }} animate:flip={{ duration: 300 }}>
												<td>{formatDate(entry.date)}</td>
												<!-- <td>{new Date(entry.date).toLocaleDateString()}</td> -->
												<td>{entry.description}</td>
												<td>{entry.hours}</td>
												<td>
													{#if entry.fileName !== 'N/A'}
														<a href={entry.fileUrl} target="_blank" class="link link-primary flex items-center gap-1"
															><FileText size={16} /> {entry.fileName}</a
														>
													{:else}
														N/A
													{/if}
												</td>
												<td>
													{#if entry.approved === true}
														<span class="badge badge-success flex items-center gap-1">
															<CheckCircle size={16} /> Approvato
														</span>
													{:else if entry.approved === false}
														<span class="badge badge-warning flex items-center gap-1">
															<Clock size={16} /> In attesa
														</span>
													{:else}
														<span class="badge badge-warning flex items-center gap-1">
															<Clock size={16} /> In attesa
														</span>
													{/if}
												</td>
												<td class="text-center">
													<form method="POST" action={`?/delTraining`} use:enhance={formSubmit}>
														<input type="hidden" name="userId" value={userData.userId} />
														<input type="hidden" name="fileName" value={entry.fileName} />
														<button class="btn btn-ghost btn-circle text-error btn-sm" type="submit" aria-label="Delete training entry">
															<Trash2 size="18" />
														</button>
													</form>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<p>Nessuna voce di formazione aggiunta.</p>
						{/if}
					</div>
				{:else if activeTab === 'certificates'}
					<div class="card bg-base-200 shadow-xl p-6">
						<h2 class="text-2xl font-bold mb-4">I Miei Certificati</h2>
						{#if courseData.length > 0}
							<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
								{#each courseData as certificate (certificate.prodId)}
									<div class="card card-compact bg-base-200 shadow-xl image-full">
										<figure>
											<Image
												src={certificate.layoutView.urlPic || '/images/placeholder.jpg'}
												alt={certificate.layoutView.title}
												class="w-full h-48 object-cover"
												width={250}
												height={250}
											/>
										</figure>
										<div class="card-body justify-end">
											<h3 class="card-title text-white">{certificate.layoutView.title}</h3>
											<p class="text-gray-200 text-sm">
												Rilasciato il: {new Date(certificate.listSubscribers[0].certificationDate).toLocaleDateString()}
											</p>
											<div class="card-actions justify-end">
												<button
													type="button"
													class="btn btn-primary btn-sm flex items-center gap-1"
													onclick={() => createPDFcert(certificate, certificate.listSubscribers[0])}
												>
													<FileText size={16} /> Scarica
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p>Nessun certificato disponibile.</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if currentModal == 'upload-photo'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		<div class="p-6 bg-base-100/95 backdrop-blur-xl border border-base-content/10 relative">
			{#if loading}
				<Loader />
			{:else}
				<form
					action="?/setProfilePic"
					method="POST"
					enctype="multipart/form-data"
					use:enhance={formSubmit}
					class="grid grid-cols-2 bg-base-100 grid-rows-[min-content]"
				>
					<input type="hidden" name="userId" value={userData.userId} />
					<div class="col-span-2">
						<DragDrop />
					</div>
					<div class="modal-action col-span-2">
						<button class="btn btn-outline" onclick={onCloseModal}>Annulla</button>
						<button class="btn btn-primary" type="submit">Carica</button>
					</div>
				</form>
			{/if}
		</div>
	</Modal>
{/if}

{#if currentModal == 'reset-password'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		<div class="p-6 bg-base-100/95 backdrop-blur-xl border border-base-content/10 relative">
			{#if loading}
				<Loader />
			{:else}
				<!-- <h3 class="font-bold text-xl mb-4">Cambio password</h3> -->
				<!-- <p class="text-base-content/70 mb-6">Cambia la password</p> -->
				<form method="POST" action={postAction} use:enhance={formSubmit} class="grid grid-cols-2 bg-base-100 grid-rows-[min-content]">
					<section class="col-span-2">
						<label for="passwordOld" class="form-label">
							<p class="font-bold mb-2 label">Password Corrente</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button type="button" class="join-item bg-primary/20 px-3">
								<Shield class="text-emerald-500" />
							</button>
							<input name="passwordOld" type="text" placeholder="inserisci password" class="input input-bordered w-full" required />
						</div>
					</section>
					<section class="col-span-2">
						<label for="passwordNew" class="form-label">
							<p class="font-bold mb-2 label">Nuova Password</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button type="button" class="join-item bg-primary/20 px-3"><Shield class="text-emerald-500" /></button>
							<input name="passwordNew" type="text" placeholder="inserisci password" class="input input-bordered w-full" required />
						</div>
					</section>
					<div class="modal-action mt-6 col-span-2">
						{#if loading}
							<Loader />
						{:else}
							<button type="button" class="btn flex-1" onclick={onCloseModal}>Annulla</button>
							<button type="submit" class="btn btn-primary flex-1">Cambia Password </button>
						{/if}
					</div>
				</form>
			{/if}
		</div>
	</Modal>
{/if}

{#if showMissingFieldsModal}
	<Modal isOpen={showMissingFieldsModal} header="Completa il tuo profilo">
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseMissingFieldsModal}>✕</button>
		<div class="p-6 bg-base-100/95 backdrop-blur-xl border border-base-content/10 relative">
			<div class="alert alert-warning mb-4">
				<div class="flex items-start gap-3">
					<User size={24} class="flex-shrink-0 mt-1" />
					<div>
						<h3 class="font-bold text-lg mb-2">Attenzione: Profilo Incompleto</h3>
						<p class="text-base-content/80">Per utilizzare al meglio la piattaforma è necessario completare i seguenti campi obbligatori:</p>
					</div>
				</div>
			</div>

			<div class="bg-base-200 rounded-lg p-4 mb-6">
				<h4 class="font-semibold mb-3 flex items-center gap-2">Campi Mancanti:</h4>
				<ul class="space-y-2">
					{#each missingFields as field}
						<li class="flex items-center gap-2">
							<span class="badge badge-error badge-sm">!</span>
							<span class="font-medium">{field}</span>
						</li>
					{/each}
				</ul>
			</div>

			<div class="modal-action">
				<button type="button" class="btn btn-ghost" onclick={() => (showMissingFieldsModal = false)}> Chiudi </button>
				<button type="button" class="btn btn-primary" onclick={onCloseMissingFieldsModal}>
					<SquarePen size={18} />
					Completa Profilo
				</button>
			</div>
		</div>
	</Modal>
{/if}


{#if currentModal == 'points'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		

		<div class="grid grid-cols-4 bg-base-100 grid-col gap-y-3 p-4 lg:gap-x-4 lg:p-4">
			{#each userData?.pointsHistory || [] as item}
			<!-- {#each [...(pointsHistory || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as item} -->
				<div
					class="col-span-4
                           p-3
                           rounded-box
                           shadow-md
                           bg-base-200
                           flex flex-wrap
                           gap-x-1 gap-y-1
                           items-center
                           justify-between
                           "
				>
					<span class="font-bold text-lg text-primary"> punti: {item.points}</span>
					<span class="text-sm text-base-content">{item.note}</span>
					<div class="w-full"><span class="text-sm text-base-content">{new Date(item.date).toLocaleString()}</span></div>
				</div>
			{/each}
		</div>
	</Modal>
{/if}