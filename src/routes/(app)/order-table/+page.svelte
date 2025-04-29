<script lang="ts">
	import { coursesInfo, orderKeysToDelete } from '$lib/stores/arrays';
	import { goto, invalidateAll } from '$app/navigation';
	import Papa from 'papaparse';
	import Notification from '$lib/components/Notification.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms';
	import {
		Settings,
		Funnel,
		XCircle,
		ShieldAlert,
		RefreshCcw,
		FileDown,
		Trash2,
		FileSearch
	} from 'lucide-svelte';
	import type { Order, TableNames } from '$lib/types';

	let { data, form } = $props();
	let { getTable, getTableNames, auth } = $derived(data);
	let tableList = $state<Order[]>(getTable || []);
	let tableNames = $state<TableNames[]>(getTableNames || []);

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

	let isModalFilter = $state(false);
	let resetActive = $state(false);
	let quickSearch = $state('data'); // radio button
	//filter
	let orderId = $state('');
	let userId = $state('');
	let paymentMethod = $state('');
	let status = $state('');
	//modal detail
	let orderDetail = $state(tableList[0]);

	// const onCloseFilterSearch = () => {
	// 	isModalFilter = false;
	// 	onFilterReset();
	// };

	// const onOpenFilter = () => {
	// 	isModalFilter = true;
	// 	postAction = `?/filter`;
	// 	quickSearch = 'location';
	// };

	const onFilterReset = () => {
		resetActive = false;
		tableList = getTable;
		invalidateAll();
	};

	const imgSrc = (value: string) => {
		const src = $coursesInfo.filter((item: any) => item.id == value);
		return src[0]?.urlPic || '/images/picture.png';
	};

	//CSV file
	const csvCreate = () => {
		let csv = $state('');
		let newList: any = $state<any>([]);

		const flattenObject = (obj: any, prefix = '') => {
			return Object.keys(obj).reduce((acc, k) => {
				const pre = prefix.length ? prefix + '_' : '';
				if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
					Object.assign(acc, flattenObject(obj[k], pre + k));
				} else {
					acc[pre + k] = obj[k];
				}
				return acc;
			}, {});
		};

		const flattenedArray = tableList.map((obj: any) => {
			return flattenObject(obj);
		});

		newList = flattenedArray.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt?.substring(0, 10),
			birthdate: obj.birthdate?.substring(0, 10)
		}));
		//console.log('flattenedArray', flattenedArray);
		//console.log('newList', newList);

		newList.forEach((obj: any) => {
			$orderKeysToDelete.forEach((key: string) => delete (obj as any)[key]);
		});

		//CSV UNPARSE
		csv = Papa.unparse(newList, {
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
		link.download = `Export_Orders_${new Date().toLocaleDateString()}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};

	const resetFields = () => {
		openModal = false;
		// prodId = null;
		// status = '';
		// title = '';
		// descrShort = '';
		// price = null;
		// renewalLength = 365;
		modalTitle = '';
		postAction = '?/';
	};

	const resetData = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getTable;
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
			modalTitle = 'Modifica';
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
			quickSearch = 'location';
		}
		if (type == 'detail') {
			orderDetail = item;
			modalTitle = `Ordine (ID: ${orderDetail.orderId})`;
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		currentModal = '';
		//invalidateAll();
	};

	//notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 5000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer

	$effect(() => {
		//console.log('form', form);
		if (form != null) {
			//console.log('form triggered');
			async () => await invalidateAll(); // MUST be async/await or tableList = getTable will trigger infinite loop
			const { action, success, message, filterTableList } = form;
			if (success) {
				//console.log('filterTableList effect', filterTableList);
				currentModal = '';
				if (action == 'filter') {
					resetActive = true;
					tableList = filterTableList;
				} else {
					resetActive = false;
					tableList = getTable;
				}
			} else {
				notificationError = true;
			}
			resetFields();
			clearTimeout(startTimeout);
			closeNotification();
			toastClosed = false;
			notificationContent = message;
			form = null; // reset form
		}
	}); // end effect
</script>

<svelte:head>
	<title>Ordini</title>
</svelte:head>

<div class="overflow-x-auto mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Ordini</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={resetData}>
				<RefreshCcw />
			</button>
			{#if resetActive == true}
				<button class="btn btn-error rounded-md text-white" onclick={resetData}>
					<XCircle class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button
					class="btn btn-info rounded-md text-white"
					onclick={() => onClickModal('filter', null)}
				>
					<Funnel class="mt-1" /> Filtra
				</button>
			{/if}
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={() => csvCreate()}>
				<FileDown />CSV
			</button>
		</div>
	</div>
	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-info text-accent">
			<tr class="">
				<th>Data</th>
				<th>ID ordine</th>
				<th>Email</th>
				<th>Associato</th>
				<th>Ordine</th>
				<th>Totale</th>
				<th>Tipo pagamento</th>
				<th>Stato</th>
				<th>Azione</th>
				<th>Elimina</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row -->
			{#if tableList.length == 0}
				<tr class="hover:bg-gray-100">
					<td>no record</td>
				</tr>
			{/if}

			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<!-- Data -->
					<td>{row.orderDate}</td>
					<!-- ID ordine-->
					<td>{row.orderId}</td>
					<!-- Email-->
					<td>{row.userView?.email}</td>
					<!-- Nome-->
					<td>{row.userView?.name} {row.userView?.surname}</td>
					<!-- Ordine -->
					<td>
						<div class="flex flex-col space-y-1">
							{#each row.cart as item}
								<span> {item.title}</span>
							{/each}
						</div>
					</td>
					<!-- Totale -->
					<td>€ {row.totalCart}</td>
					<!-- Tipo pagamento -->
					<td>
						{row.payment.method}
					</td>
					<!-- Status -->
					<td>
						{row.status}
					</td>
					<!-- Azione -->
					<td class="flex items-center space-x-4">
						<button onclick={() => onClickModal('modify', row)} class="btn btn-sm">
							<Settings />
						</button>
						<button onclick={() => onClickModal('delete', row)} class="btn btn-error btn-sm">
							<Trash2 />
						</button>
						<button onclick={() => onClickModal('detail', row)} class="btn btn-success btn-sm">
							<FileSearch />
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	{#if tableList.length == 0}
		<div
			class="alert alert-warning shadow-lg flex item-center text-center justify-center rounded-md mt-3 mx-auto w-full max-w-lg"
		>
			<div>
				<ShieldAlert />
				<br />
				<span class="mt-2 text-semibold">
					Nessun record trovato. Cambia parametri o resetta il filtro.
				</span>
			</div>
		</div>
	{/if}
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

{#if currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
				</div>
			</div>
			<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
				<button
					class="btn btn-error btn-sm rounded-md hover:bg-red-300"
					type="button"
					onclick={onCloseModal}
				>
					Annulla
				</button>
				<button class="btn btn-success btn-sm rounded-md hover:bg-green-400" type="submit">
					Modifica
				</button>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="orderId" value={orderId} />
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Conferma rimozione
			</header>
			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}>Annulla</button>
					<button type="submit" class="btn btn-error btn-sm mx-2 text-white">Elimina</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="orderId" class="block text-sm font-medium text-gray-700 mb-1">ID ordine</label
					>
					<input
						type="text"
						id="orderId"
						name="orderId"
						bind:value={orderId}
						placeholder="Inserisci l'ID dell'ordine"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div>
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
				</div>
				<div>
					<label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1"
						>Metodo di pagamento</label
					>
					<select
						id="paymentMethod"
						name="paymentMethod"
						bind:value={paymentMethod}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli un metodo</option>
						<option value="bonifico">Bonifico</option>
						<option value="paypal">Paypal</option>
						<option value="contanti">Contanti</option>
					</select>
				</div>
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
				</div>
			</div>
			<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
				<button
					class="btn btn-error btn-sm rounded-md hover:bg-red-300"
					type="button"
					onclick={onCloseModal}
				>
					Annulla
				</button>
				<button class="btn btn-success btn-sm rounded-md hover:bg-green-400" type="submit">
					Applica Filtri
				</button>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'detail'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<div class="col-span-2 grid grid-cols-2 gap-2 mt-4 mb-4">
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Nome/Cognome</p>
				<p class="font-bold text-center mt-1">
					{orderDetail.userView?.name}
					{orderDetail.userView?.surname}
				</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Email</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.email}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Città</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.city}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Indirizzo</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.address}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Codice Postale - Provincia</p>
				<p class="font-bold text-center mt-1">
					{orderDetail.userView?.postalCode} - {orderDetail.userView?.countryState}
				</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Paese</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.country}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Telefono</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.phone}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Cellulare</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.mobile}</p>
			</div>
		</div>
		<div class="col-span-2 flex flex-col items-center w-full gap-3 my-4">
			{#each orderDetail?.cart as item}
				<div
					class="flex items-center w-full max-w-96 bg-indigo-100 rounded-lg shadow-md overflow-hidden"
				>
					<div class="w-1/3 p-3">
						<img
							src={imgSrc(item.category[0])}
							alt="Immagine corso"
							class="w-full h-full object-cover"
						/>
					</div>
					<div class="w-2/3 p-4 flex items-center justify-center">
						<h2 class="text-center text-md font-semibold">
							{item.title} <br /><br />
							{item.price}€
						</h2>
					</div>
				</div>
			{/each}
		</div>
		<div class="col-span-2 text-center mt-3">
			<h2 class="text-lg font-bold">Totale Carrello:</h2>
			<p class="text-xl font-semibold text-black-800">{orderDetail.totalValue} €</p>
			{#if auth}
				<p class="text-gray-800 font-semibold">-25 € sconto tesserati</p>
			{/if}
		</div>
		<div class="col-span-2 text-center mt-5">
			<div class="flex justify-center space-x-8">
				<div>
					<h2 class="text-md font-bold">Metodo pagamento:</h2>
					<p class="text-md font-semibold text-black-800">{orderDetail.payment.method}</p>
				</div>
				<div>
					<h2 class="text-md font-bold">Status pagamento:</h2>
					<p class="text-md font-semibold text-black-800">{orderDetail.payment.statusPayment}</p>
				</div>
			</div>
		</div>

		<div class="modal-action col-span-2">
			<button
				class="btn btn-sm btn-error w-24 hover:bg-white hover:text-error rounded-lg mr-4"
				onclick={onCloseModal}>Chiudi</button
			>
		</div>
	</Modal>
{/if}
