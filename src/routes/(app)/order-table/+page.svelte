<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import { Image } from '@unpic/svelte';
	import Papa from 'papaparse';
	import { orderKeysToDelete, province } from '$lib/stores/arrays';
	import { notification } from '$lib/stores/notifications';
	import Modal from '$lib/components/Modal.svelte';
	import { imgCheck } from '$lib/tools/tools.js';
	import { enhance } from '$app/forms';
	import Loader from '$lib/components/Loader.svelte';
	import { tick } from 'svelte';
	import {
		Funnel,
		CircleX,
		ShieldAlert,
		RefreshCcw,
		FileDown,
		FileText,
		Trash2,
		FileCog,
		Handshake,
		BanknoteArrowUp,
		BanknoteX,
		House
	} from 'lucide-svelte';
	import type { Order, TableNames, Product } from '$lib/types';
	import * as pdfMake from 'pdfmake/build/pdfmake';

	let { data } = $props();
	let { getTable, getTableNames } = $derived(data);
	let tableList = $state<Order[]>(getTable || []);
	let tableNames = $state<TableNames[]>(getTableNames || []);

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');
	let resetActive = $state(false);
	//filter
	let orderId = $state('');
	let userId = $state('');
	let paymentMethod = $state('');
	let status = $state('');
	let statusPayment = $state('');
	let type = $state('');
	let surname = $state('');
	let email = $state('');
	let courseId = $state('');
	// Pagination
	let currentPage = $state(1);
	const itemsPerPage = 50;

	let loading = $state(false);
	//modal detail
	let orderDetail = $state(tableList[0]);

	const csvCreate = (content: Order[]) => {
		content.forEach((item) => {
			delete item.userView;
		});
		//console.log('content', content);

		const flattenObject = (obj, prefix = '') => {
			let result = {};
			const orderType = obj.type;

			for (const key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					const value = obj[key];
					const newPrefix = prefix ? `${prefix}.${key}` : key;

					// Special handling for the 'cart' array
					if (newPrefix === 'cart' && Array.isArray(value)) {
						const cartString = value
							.map((cartItem) => {
								if (orderType === 'product') {
									return `(${cartItem.title}: ${cartItem.orderQuantity})`;
								} else if (orderType === 'course') {
									if (cartItem.type === 'product') {
										return `(${cartItem.title}: 1)`;
									} else if (cartItem.type === 'course' || cartItem.type === 'event') {
										return `(${cartItem.layoutView.title}: 1)`;
									}
								} else if (orderType === 'membership') {
									return `(${cartItem.title}: 1)`;
								}

								return '';
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
			const orderNotes = flatOrder.orderNotes || '';
			const totalValue = flatOrder.totalValue || 0;
			$orderKeysToDelete.forEach((key: string) => delete (flatOrder as any)[key]);

			flatOrder.orderNotes = orderNotes;
			flatOrder.totalValue = totalValue;

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

		const link = document.createElement('a'); //
		link.href = URL.createObjectURL(blob);
		link.download = `Export_orders_${new Date().toLocaleDateString()}.csv`;
		document.body.appendChild(link);
		link.click();

		// Release the URL object
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	};

	const createPDFReceipt = (order: Order) => {
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

		// Prepara i dati del carrello per la tabella
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
					{ text: 'Associazione DIEN CHAN - BQC - ITALIA', style: 'companyName', alignment: 'center' },
					{ text: 'Via Ticino, 12F 25015', style: 'companyInfo', alignment: 'center' },
					{ text: 'Desenzano del Garda - Brescia', style: 'companyInfo', alignment: 'center' },
					{ text: 'C.F. 94016070172', style: 'companyInfo', alignment: 'center' },
					{ text: 'info@riflessologiadienchan.it', style: 'companyInfo', alignment: 'center' }
				]
			},

			content: [
				{
					text: "RICEVUTA D'ORDINE",
					style: 'mainHeader',
					alignment: 'center',
					margin: [0, 0, 0, 20]
				},

				// Informazioni ordine
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

				// Indirizzo di spedizione
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
				...(order.invoicing?.businessName || order.invoicing?.name
					? [
							{
								text: 'INDIRIZZO DI FATTURAZIONE',
								style: 'sectionHeader',
								margin: [0, 10, 0, 10]
							},
							{
								text: [
									...(order.invoicing.businessName
										? [
												{ text: `${order.invoicing.businessName}\n`, style: 'valueText', bold: true },
												...(order.invoicing.vatNumber ? [{ text: `P.IVA: ${order.invoicing.vatNumber}\n`, style: 'valueText' }] : [])
											]
										: []),
									...(order.invoicing.name || order.invoicing.surname
										? [{ text: `${order.invoicing.name || ''} ${order.invoicing.surname || ''}\n`, style: 'valueText' }]
										: []),
									{ text: `${order.invoicing?.address || 'N/A'}\n`, style: 'valueText' },
									{
										text: `${order.invoicing?.postalCode || ''} ${order.invoicing?.city || ''} ${order.invoicing?.county ? `(${order.invoicing.county})` : ''}\n`,
										style: 'valueText'
									},
									{ text: `${order.invoicing?.country || 'Italia'}`, style: 'valueText' }
								],
								margin: [0, 0, 0, 20]
							}
						]
					: []),

				// Tabella prodotti
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

				// Totali
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

				// Informazioni pagamento
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

				// Note
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

				// Footer
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

	const resetFields = () => {
		modalTitle = '';
		postAction = '?/';
		orderId = '';
		userId = '';
		// paymentMethod = '';
		// type = '';
		status = '';
		// statusPayment = '';
		surname = '';
		email = '';
		//  courseId = '';
	};

	const refresh = () => {
		paymentMethod = '';
		statusPayment = '';
		type = '';
		courseId = '';
		invalidateAll();
		resetFields();
		resetActive = false;
		currentPage = 1;
		tableList = getTable;
		notification.info('Pagina ricaricata');
	};

	const onClickModal = (type: string, item: any) => {
		currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo';
		}
		if (type == 'modify') {
			postAction = `?/modify`;
			modalTitle = `Ordine (ID: ${item.orderId})`;
			orderDetail = item;
			status = item.status;
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			orderId = item.orderId;
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtra';
		}
		// if (type == 'detail') {
		// 	orderDetail = item;
		// 	modalTitle = `Ordine (ID: ${item.orderId})`;
		// }
	};

	const onCloseModal = () => {
		resetFields();
		openModal = false;
		currentModal = '';
	};

	const formSubmit = () => {
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {

			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { action, message, payload } = result.data; // { action, success, message, payload }
				if (action == 'filter') {
					resetActive = true;
					currentPage = 1;
					tableList = payload;
					notification.info(message);
				} else if (action == 'changePage') {
					if (payload.result.length > 0) {
						tableList = payload.result;
					} else {
						tableList = getTable;
					}
					currentPage = payload.currentPage;
				} else if (action == 'modify') {
					notification.info(message);
					if (resetActive) {
						tableList = payload;
					} else {
						tableList = getTable;
					}
				} else if (action == 'downloadCsv') {
					csvCreate(payload);
					notification.success(message);
				} else {
					tableList = getTable;
					resetActive = false;
					notification.info(message);
				}

				onCloseModal();
			}
			if (result.type === 'failure') {
				notification.error(result.data.message);
			}
			if (result.type === 'error') {
				notification.error(result.error.message);
			}
			// 'update()' is called by default by use:enhance
			// call 'await update()' if you need to ensure it completes before further client logic.
			resetFields();
			loading = false;
		};
	};

	$effect(() => {
		if (currentPage && Array.isArray(tableList)) {
			tick().then(() => {
				const element = document.getElementById('top');
				if (element) {
					element.scrollIntoView({ behavior: 'instant' });
				}
			});
		}
	});
</script>

<svelte:head>
	<title>Ordini</title>
</svelte:head>

<noscript>
	<h1 style="font-weight:700; text-align: center;">Please enable Javascript to continue.</h1>
	<style type="text/css">
		#main-content {
			display: none;
		}
	</style>
</noscript>

{#if loading}
	<Loader />
{/if}

<div id="top" class="overflow-x-auto mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Ordini</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={refresh}>
				<RefreshCcw />
			</button>
			{#if resetActive == true}
				<button class="btn btn-error rounded-md text-white" onclick={refresh}>
					<CircleX class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button class="btn btn-info rounded-md text-white" onclick={() => onClickModal('filter', null)}>
					<Funnel class="mt-1" /> Filtra
				</button>
			{/if}
			<form method="POST" action={`?/downloadCsv`} use:enhance={formSubmit}>
				<button type="submit" class="btn btn-info text-white w-full sm:w-auto">
					<FileDown />CSV Report
					{#if loading}
						<Loader />
					{/if}
				</button>
			</form>
		</div>
	</div>
	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-info text-accent">
			<tr class="">
				<th>Data</th>
				<th>ID ordine</th>
				<th>Email</th>
				<th>Utente</th>
				<th>Carrello</th>
				<th>Note</th>
				<th>Totale</th>
				<th>Pagamento</th>
				<!-- <th>Stato Ordine</th> -->
				<th>Azione</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row -->
			{#if tableList?.length == 0}
				<tr class="hover:bg-gray-100">
					<td>no record</td>
				</tr>
			{/if}

			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<!-- Data -->
					<td>{row.orderDate ? new Date(row.orderDate).toLocaleDateString('it-IT') : '-'}</td>
					<!-- ID ordine-->
					<td>{row.orderId}</td>
					<!-- Email-->
					<td>{row.invoicing?.email}</td>
					<!-- Nome-->
					<td>{row.invoicing?.name} {row.invoicing?.surname}</td>
					<!-- cart -->
					<td>
						<div class="flex flex-col space-y-1">
							<div
								class="badge"
								class:badge-accent={row.type === 'membership'}
								class:badge-info={row.type === 'product'}
								class:badge-primary={row.type === 'course'}
							>
								{row.type}
							</div>
							{#each row.cart as item}
								{#if item.type == 'course' || item.type == 'event'}
									<span class="font-semibold">{item.layoutView.title}: {item.prodId}</span>
								{:else if item.type == 'membership'}
									<span>{item.title}</span>
								{:else}
									<span>{item.title}: {item.orderQuantity || 1}</span>
								{/if}
							{/each}
						</div>
					</td>
					<!-- Note-->
					<td>{row.orderNotes || '-'}</td>
					<!-- Totale -->
					<td>
						<div class="flex flex-col space-y-1">
							<div class="flex items-center justify-center space-x-4">
								<span class="font-bold">€ {row.totalValue.toFixed(2)}</span>
							</div>
							{#if row.payment.statusPayment === 'pending' && row.totalValue > 0}
								<!-- <div class="divider">pagamento</div> -->
								<div class="flex items-center space-x-4">
									<form method="POST" action={`?/modify`} use:enhance={formSubmit}>
										<input type="hidden" name="orderId" value={row.orderId} />
										<input type="hidden" name="statusPayment" value="done" />
										<input type="hidden" name="userId" value={row.userId} />
										<input type="hidden" name="type" value={row.type} />
										{#if row.promoterId && row.type === 'course'}
											<input type="hidden" name="promoterId" value={row.promoterId} />
											<input type="hidden" name="cart" value={JSON.stringify(row.cart)} class="hidden" />
										{/if}

										<input type="hidden" name="filterOrderId" value={orderId} />
										<input type="hidden" name="filterUserId" value={userId} />
										<input type="hidden" name="filterSurname" value={surname} />
										<input type="hidden" name="filterEmail" value={email} />
										<input type="hidden" name="filterPaymentMethod" value={paymentMethod} />
										<input type="hidden" name="filterStatus" value={status} />
										<input type="hidden" name="filterStatusPayment" value={statusPayment} />
										<input type="hidden" name="filterType" value={type} />
										<input type="hidden" name="filterCourseId" value={courseId} />

										<button type="submit" class="btn btn-success btn-sm">
											<BanknoteArrowUp />
										</button>
									</form>

									<form method="POST" action={`?/modify`} use:enhance={formSubmit}>
										<input type="hidden" name="orderId" value={row.orderId} />
										<input type="hidden" name="statusPayment" value="canceled" />
										{#if row.promoterId && row.type === 'course'}
											<input type="hidden" name="promoterId" value={row.promoterId} />
											<input type="hidden" name="type" value={row.type} />
											<input type="hidden" name="cart" value={JSON.stringify(row.cart)} class="hidden" />
										{/if}
										<input type="hidden" name="filterOrderId" value={orderId} />
										<input type="hidden" name="filterUserId" value={userId} />
										<input type="hidden" name="filterSurname" value={surname} />
										<input type="hidden" name="filterEmail" value={email} />
										<input type="hidden" name="filterPaymentMethod" value={paymentMethod} />
										<input type="hidden" name="filterStatus" value={status} />
										<input type="hidden" name="filterStatusPayment" value={statusPayment} />
										<input type="hidden" name="filterType" value={type} />
										<input type="hidden" name="filterCourseId" value={courseId} />
										<button type="submit" class="btn btn-error btn-sm">
											<BanknoteX />
										</button>
									</form>
								</div>
							{/if}
						</div>
					</td>
					<!-- Payment -->
					<td>
						<div class="flex flex-col space-y-1">
							{#if row.totalValue > 0}
								<div>
									{row.payment.method} /
									{#if row.payment.statusPayment === 'pending'}
										<span class="badge badge-warning">{row.payment.statusPayment}</span>
									{:else if row.payment.statusPayment === 'done'}
										<span class="badge badge-success">{row.payment.statusPayment}</span>
									{:else}
										<span class="badge badge-error">{row.payment.statusPayment}</span>
									{/if}
								</div>
							{:else}
								<div>
									<span class="badge badge-success">Punti / Sconti</span>
								</div>
							{/if}

							{#if row.promoterId}
								<div>
									<span class="badge badge-info text-sm"><Handshake size={16} />: {row.promoterId}</span>
								</div>
							{/if}
						</div>
					</td>
					<!-- Status -->
					<!-- <td>
						{#if row.status === 'requested'}
							<span class="badge badge-warning">{row.status}</span>
						{:else if row.status === 'confirmed'}
							<span class="badge badge-success">{row.status}</span>
						{:else}
							<span class="badge badge-error">{row.status}</span>
						{/if}
					</td> -->
					<!-- Action -->
					<td class="flex flex-col space-y-2 py-2 px-4">
						<div class="flex items-center space-x-4">
							<button onclick={() => onClickModal('modify', row)} class="btn btn-sm">
								<FileCog />
							</button>
							<button onclick={() => createPDFReceipt(row)} class="btn btn-info btn-sm" title="Scarica Ricevuta PDF">
								<FileDown />
							</button>
							<button onclick={() => onClickModal('delete', row)} class="btn btn-error btn-sm">
								<Trash2 />
							</button>
						</div>
						<!-- {#if row.payment.statusPayment === 'pending'}
							<div class="divider">pagamento</div>
							<div class="flex items-center space-x-4">
								<button onclick={() => onClickModal('modify', row)} class="btn btn-success btn-sm">
									<BanknoteArrowUp />
								</button>
								<button onclick={() => onClickModal('modify', row)} class="btn btn-error btn-sm">
									<BanknoteX />
								</button>
							</div>
						{/if} -->
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	{#if tableList?.length == 0}
		<div class="alert alert-warning shadow-lg flex item-center text-center justify-center rounded-md mt-3 mx-auto w-full max-w-lg">
			<div>
				<ShieldAlert />
				<br />
				<span class="mt-2 text-semibold"> Nessun record trovato. Cambia parametri o resetta il filtro. </span>
			</div>
		</div>
	{/if}

	<div class="join flex justify-center mt-5">
		<form method="POST" action="?/changePage" use:enhance={formSubmit}>
			{#if currentPage > 1}
				<button type="submit" id="reset" class="join-item btn" name="navigation" value="reset" disabled={loading} style="pointer-events: auto;">
					<House class="pointer-events-none" />
				</button>
			{/if}

			<button
				type="submit"
				id="prev"
				class="join-item btn"
				name="navigation"
				value="prev"
				disabled={currentPage <= 1 || loading}
				style="pointer-events: auto;"
			>
				<span class="pointer-events-none">«</span>
			</button>

			<button type="button" class="join-item btn cursor-default">
				Pagina {currentPage}
			</button>

			<button
				type="submit"
				id="next"
				class="join-item btn"
				name="navigation"
				value="next"
				disabled={tableList?.length < itemsPerPage || loading}
				style="pointer-events: auto;"
			>
				<span class="pointer-events-none">»</span>
			</button>

			<input type="hidden" name="itemsPerPage" value={itemsPerPage} />
			<input type="hidden" name="currentPage" value={currentPage} />

			<!-- USA le variabili dirette -->
			<input type="hidden" name="orderId" value={orderId} />
			<input type="hidden" name="userId" value={userId} />
			<input type="hidden" name="surname" value={surname} />
			<input type="hidden" name="email" value={email} />
			<input type="hidden" name="paymentMethod" value={paymentMethod} />
			<input type="hidden" name="status" value={status} />
			<input type="hidden" name="statusPayment" value={statusPayment} />
			<input type="hidden" name="courseId" value={courseId} />
			<!-- <input type="hidden" name="courseId" value={courseId} /> -->
		</form>
	</div>
</div>

{#if currentModal == 'modify'}
	{#if loading}
		<Loader />
	{:else}
		<Modal isOpen={openModal} header={modalTitle}>
			<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
			<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
				<div class="flex flex-wrap -mx-2">
					<div class="w-full md:w-full px-2 mb-4 font-bold">Dati utente</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="orderId" class="block text-sm font-medium text-gray-700 mb-1">ID ordine</label>
						<input
							type="text"
							id="orderId"
							name="orderId"
							value={orderDetail.orderId}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
							readonly
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							value={orderDetail.shipping?.email}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
						<input
							type="text"
							id="name"
							name="name"
							value={orderDetail.shipping?.name}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="surname" class="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
						<input
							type="text"
							id="surname"
							name="surname"
							value={orderDetail.shipping?.surname}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-full px-2 mb-4 font-bold">Dati di spedizione</div>

					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="city" class="block text-sm font-medium text-gray-700 mb-1">Città</label>
						<input
							type="text"
							id="city"
							name="city"
							value={orderDetail.shipping?.city}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="address" class="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
						<input
							type="text"
							id="address"
							name="address"
							value={orderDetail.shipping?.address}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1">Codice Postale</label>
						<input
							type="text"
							id="postalCode"
							name="postalCode"
							value={orderDetail.shipping?.postalCode}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="county" class="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
						<select
							id="county"
							name="county"
							value={orderDetail.shipping?.county}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option disabled value="">Scegli una Provincia {orderDetail.shipping.county}</option>
							{#each $province as provincia}
								<option value={provincia.title}>{provincia.title}</option>
							{/each}
						</select>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="country" class="block text-sm font-medium text-gray-700 mb-1">Paese</label>
						<input
							type="text"
							id="country"
							name="country"
							value={orderDetail.shipping?.country}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
						<input
							type="text"
							id="phone"
							name="phone"
							value={orderDetail.shipping?.phone}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="mobile" class="block text-sm font-medium text-gray-700 mb-1">Cellulare</label>
						<input
							type="text"
							id="mobile"
							name="mobile"
							value={orderDetail.shipping?.mobile}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1">Metodo di pagamento</label>
						<select
							id="paymentMethod"
							name="paymentMethod"
							value={orderDetail.payment.method}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option disabled value="">Scegli un metodo</option>
							<option value="Bonifico bancario">Bonifico</option>
							<option value="Carta di credito">Carta di credito</option>
							<option value="Contanti">Contanti</option>
						</select>
					</div>
					<!-- <div class="w-full md:w-1/2 px-2 mb-4">
						<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Stato ordine</label>
						<select
							id="status"
							name="status"
							value={orderDetail.status}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli uno status</option>
							<option value="requested">Richiesta in corso</option>
							<option value="confirmed">Confermato</option>
							<option value="cancelled">Cancellato</option>
							<option value="exported">Esportato</option>
						</select>
					</div> -->
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="statusPayment" class="block text-sm font-medium text-gray-700 mb-1">Stato pagamento</label>
						<select
							id="statusPayment"
							name="statusPayment"
							value={orderDetail.payment.statusPayment}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option disabled value="">Scegli uno status</option>
							<option value="pending">Pending</option>
							<option value="done">Confermato</option>
							<option value="canceled">Cancellato</option>
						</select>
					</div>
				</div>

				<div class="col-span-2 text-center mt-3">
					<h2 class="text-lg font-bold">Totale Carrello:</h2>
					<p class="text-xl font-semibold text-black-800">{orderDetail.totalValue} €</p>
				</div>

				<input type="hidden" name="cart" value={JSON.stringify(orderDetail.cart)} class="hidden" />
				<input type="hidden" name="type" value={orderDetail.type} class="hidden" />
				<input type="hidden" name="userId" value={orderDetail.userId} />

				{#if orderDetail.promoterId}
					<input type="hidden" name="promoterId" value={orderDetail.promoterId} />
				{/if}
				<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
					<button class="btn btn-error btn-sm rounded-md hover:bg-red-300" type="button" onclick={onCloseModal}> Annulla </button>
					<button class="btn btn-success btn-sm rounded-md hover:bg-green-400" type="submit"> Modifica </button>
				</div>
				<div class="col-span-2 flex flex-wrap justify-center w-full gap-3 my-4">
					{#each orderDetail?.cart as item}
						<div class="flex items-center w-full max-w-96 bg-indigo-100 rounded-lg shadow-md overflow-hidden">
							<div class="w-1/3 p-3">
								{#if item.type === 'course' || item.type === 'event'}
									<Image
										layout="constrained"
										aspectRatio={1}
										src={item.layoutView.urlPic || '/images/placeholder.jpg'}
										alt="Immagine corso"
										class="w-full h-full object-cover"
									/>
								{:else if item.type === 'product'}
									<Image
										layout="constrained"
										aspectRatio={1}
										src={imgCheck.single(item.uploadfiles, 'product-primary')}
										alt="Immagine corso"
										class="w-full h-full object-cover"
									/>
								{/if}
							</div>
							<div class="w-2/3 p-4">
								<p class="text-center text-sm font-semibold">
									{item.type === 'course' ? item.layoutView.title : item.title}
								</p>
								{#if orderDetail.type === 'product'}
									<p class="text-center text-sm font-semibold">
										{item.type === 'course' ? item.layoutView.price : item.price}€
									</p>

									<p class="text-center text-sm font-semibold">
										quantita': {item.orderQuantity}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</form>
		</Modal>
	{/if}
{/if}

{#if currentModal == 'delete'}
	{#if loading}
		<Loader />
	{:else}
		<Modal isOpen={openModal} header={modalTitle}>
			<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
			<form
				method="POST"
				action={postAction}
				use:enhance={formSubmit}
				class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			>
				<input type="hidden" name="orderId" value={orderId} />
				<header class="col-span-4 text-center text-2xl font-bold text-green-800">Conferma rimozione</header>
				<div class="col-span-4 mt-5 flex justify-center">
					<div class="bg-gray-50 flex justify-center">
						<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}>Annulla</button>
						<button type="submit" class="btn btn-error btn-sm mx-2 text-white">Elimina</button>
					</div>
				</div>
			</form>
		</Modal>
	{/if}
{/if}

{#if currentModal == 'filter'}
	{#if loading}
		<Loader />
	{:else}
		<Modal isOpen={openModal} header={modalTitle}>
			<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
			<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
				<div class="flex flex-wrap -mx-2">
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="orderId" class="block text-sm font-medium text-gray-700 mb-1">ID ordine</label>
						<input
							type="text"
							id="orderId"
							name="orderId"
							bind:value={orderId}
							placeholder="Inserisci l'ID dell'ordine"
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<!-- <div class="w-full md:w-1/2 px-2 mb-4">
						<label for="userId" class="block text-sm font-medium text-gray-700 mb-1">Associato</label>
						<select
							id="userId"
							name="userId"
							bind:value={userId}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli un associato</option>
							{#each tableNames as item}
								<option value={item.userId}>{item.surname} {item.name}</option>
							{/each}
						</select>
					</div> -->
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
						<input
							type="text"
							id="surname"
							name="surname"
							bind:value={surname}
							placeholder="Inserisci cognome"
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							bind:value={email}
							placeholder="Inserisci email"
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1">Metodo di pagamento</label>
						<select
							id="paymentMethod"
							name="paymentMethod"
							bind:value={paymentMethod}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option disabled value="">Scegli un metodo</option>
							<option value="Bonifico bancario">Bonifico</option>
							<option value="Carta di credito">Carta di credito</option>
							<option value="Contanti">Contanti</option>
						</select>
					</div>
					<!-- <div class="w-full md:w-1/2 px-2 mb-4">
						<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Stato ordine</label>
						<select
							id="status"
							name="status"
							bind:value={status}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli uno status</option>
							<option value="requested">Richiesta in corso</option>
							<option value="confirmed">Confermato</option>
							<option value="cancelled">Cancellato</option>
							<option value="exported">Processato</option>
						</select>
					</div> -->
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="statusPayment" class="block text-sm font-medium text-gray-700 mb-1">Stato pagamento</label>
						<select
							id="statusPayment"
							name="statusPayment"
							bind:value={statusPayment}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli uno status</option>
							<option value="pending">Pending</option>
							<option value="done">Confermato</option>
							<option value="canceled">Cancellato</option>
						</select>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="type" class="block text-sm font-medium text-gray-700 mb-1">Tipo ordine</label>
						<select
							id="type"
							name="type"
							bind:value={type}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli un tipo d'ordine</option>
							<option value="course">Corso</option>
							<option value="product">Prodotto</option>
							<option value="membership">Membership</option>
							<option value="insurance">Assicurazione</option>
						</select>
					</div>

					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="type" class="block text-sm font-medium text-gray-700 mb-1">ID Corso</label>
						<input
							type="text"
							name="courseId"
							placeholder="Inserisci l'ID del corso"
							bind:value={courseId}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
				</div>
				<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
					<button class="btn btn-error btn-sm rounded-md hover:bg-red-300" type="button" onclick={onCloseModal}> Annulla </button>
					<button class="btn btn-success btn-sm rounded-md hover:bg-green-400" type="submit"> Applica Filtri </button>
				</div>
			</form>
		</Modal>
	{/if}
{/if}
