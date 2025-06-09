<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import Papa from 'papaparse';
	import { orderKeysToDelete, province } from '$lib/stores/arrays';
	import { notification } from '$lib/stores/notifications';
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms';
	import Loader from '$lib/components/Loader.svelte';
	import {
		Funnel,
		XCircle,
		ShieldAlert,
		RefreshCcw,
		FileDown,
		Trash2,
		FileCog
	} from 'lucide-svelte';
	import type { Order, TableNames, Product } from '$lib/types';

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
	let surname = $state('');
	let email = $state('');

	let loading = $state(false);
	//modal detail
	let orderDetail = $state(tableList[0]);

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
		modalTitle = '';
		postAction = '?/';
		orderId = '';
		userId = '';
		paymentMethod = '';
		status = '';
		statusPayment = '';
		surname = '';
		email = '';
	};

	const refresh = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
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
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			loading = true;
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { action, message, payload } = result.data; // { action, success, message, payload }
				if (action == 'filter') {
					resetActive = true;
					tableList = payload;
				} else {
					resetActive = false;
					tableList = getTable;
				}
				notification.info(message);
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

<div class="overflow-x-auto mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Ordini</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={refresh}>
				<RefreshCcw />
			</button>
			{#if resetActive == true}
				<button class="btn btn-error rounded-md text-white" onclick={refresh}>
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
				<th>Carrello</th>
				<th>Totale</th>
				<th>Tipo pagamento</th>
				<th>Stato Ordine</th>
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
					<td>{row.shipping?.email}</td>
					<!-- Nome-->
					<td>{row.shipping?.name} {row.shipping?.surname}</td>
					<!-- Ordine -->
					<td>
						<div class="flex flex-col space-y-1">
							{#each row.cart as item}
								{#if item.type == 'course'}
									<span>{item.layoutView.title}</span>
								{:else if item.type == 'membership'}
									<span>{item.title}</span>
								{:else}
									<span>{item.title}: {item.orderQuantity || 1}</span>
								{/if}
							{/each}
						</div>
					</td>
					<!-- Totale -->
					<td>€ {row.totalValue.toFixed(2)}</td>
					<!-- Tipo pagamento -->
					<td>
						{row.payment.method} /
						{#if row.payment.statusPayment === 'pending'}
							<span class="badge badge-warning">{row.payment.statusPayment}</span>
						{:else if row.payment.statusPayment === 'done'}
							<span class="badge badge-success">{row.payment.statusPayment}</span>
						{:else}
							<span class="badge badge-error">{row.payment.statusPayment}</span>
						{/if}
					</td>
					<!-- Status -->
					<td>
						{#if row.status === 'requested'}
							<span class="badge badge-warning">{row.status}</span>
						{:else if row.status === 'confirmed'}
							<span class="badge badge-success">{row.status}</span>
						{:else}
							<span class="badge badge-error">{row.status}</span>
						{/if}
					</td>
					<!-- Azione -->
					<td class="flex items-center space-x-4">
						<button onclick={() => onClickModal('modify', row)} class="btn btn-sm">
							<FileCog />
						</button>
						<button onclick={() => onClickModal('delete', row)} class="btn btn-error btn-sm">
							<Trash2 />
						</button>
						<!-- <button onclick={() => onClickModal('detail', row)} class="btn btn-success btn-sm">
							<FileCog />
						</button> -->
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

{#if currentModal == 'modify'}
	{#if loading}
		<Loader />
	{:else}
		<Modal isOpen={openModal} header={modalTitle}>
			<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
				>✕</button
			>
			<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
				<div class="flex flex-wrap -mx-2">
					<div class="w-full md:w-full px-2 mb-4 font-bold">Dati utente</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="orderId" class="block text-sm font-medium text-gray-700 mb-1"
							>ID ordine</label
						>
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
						<label for="surname" class="block text-sm font-medium text-gray-700 mb-1">Cognome</label
						>
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
						<label for="address" class="block text-sm font-medium text-gray-700 mb-1"
							>Indirizzo</label
						>
						<input
							type="text"
							id="address"
							name="address"
							value={orderDetail.shipping?.address}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1"
							>Codice Postale</label
						>
						<input
							type="text"
							id="postalCode"
							name="postalCode"
							value={orderDetail.shipping?.postalCode}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="county" class="block text-sm font-medium text-gray-700 mb-1"
							>Provincia</label
						>
						<select
							id="county"
							name="county"
							value={orderDetail.shipping?.county}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli una Provincia {orderDetail.shipping.county}</option>
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
						<label for="mobile" class="block text-sm font-medium text-gray-700 mb-1"
							>Cellulare</label
						>
						<input
							type="text"
							id="mobile"
							name="mobile"
							value={orderDetail.shipping?.mobile}
							class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						/>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1"
							>Metodo di pagamento</label
						>
						<select
							id="paymentMethod"
							name="paymentMethod"
							value={orderDetail.payment.method}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli un metodo</option>
							<option value="Bonifico bancario">Bonifico</option>
							<option value="Carta di credito">Carta di credito</option>
							<option value="Contanti">Contanti</option>
						</select>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="status" class="block text-sm font-medium text-gray-700 mb-1"
							>Stato ordine</label
						>
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
							<!-- <option value="exported">Esportato</option> -->
						</select>
					</div>
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="statusPayment" class="block text-sm font-medium text-gray-700 mb-1"
							>Stato pagamento</label
						>
						<select
							id="statusPayment"
							name="statusPayment"
							value={orderDetail.payment.statusPayment}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli uno status</option>
							<option value="pending">Pending</option>
							<option value="done">Confermato</option>
							<option value="canceled">Cancellato</option>
						</select>
					</div>
				</div>

				<div class="col-span-2 flex flex-wrap justify-center w-full gap-3 my-4">
					{#each orderDetail?.cart as item}
						<div
							class="flex items-center w-full max-w-96 bg-indigo-100 rounded-lg shadow-md overflow-hidden"
						>
							<div class="w-1/3 p-3">
								<!-- <img
									src={item.layoutView.urlPic || '/images/placeholder.jpg'}
									alt="Immagine corso"
									class="w-full h-full object-cover"
								/> -->
							</div>
							<div class="w-2/3 p-4">
								<p class="text-center text-sm font-semibold">
									<!-- {item.layoutView.title} -->
								</p>
								<p class="text-center text-sm font-semibold">
									<!-- {item.layoutView.price}€ -->
								</p>
								<p class="text-center text-sm font-semibold">
									<!-- quantita': {item.orderQuantity} -->
								</p>
							</div>
						</div>
					{/each}
				</div>
				<div class="col-span-2 text-center mt-3">
					<h2 class="text-lg font-bold">Totale Carrello:</h2>
					<p class="text-xl font-semibold text-black-800">{orderDetail.totalValue} €</p>
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
{/if}

{#if currentModal == 'delete'}
	{#if loading}
		<Loader />
	{:else}
		<Modal isOpen={openModal} header={modalTitle}>
			<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
				>✕</button
			>
			<form
				method="POST"
				action={postAction}
				use:enhance={formSubmit}
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
{/if}

{#if currentModal == 'filter'}
	{#if loading}
		<Loader />
	{:else}
		<Modal isOpen={openModal} header={modalTitle}>
			<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
				>✕</button
			>
			<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
				<div class="flex flex-wrap -mx-2">
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="orderId" class="block text-sm font-medium text-gray-700 mb-1"
							>ID ordine</label
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
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="userId" class="block text-sm font-medium text-gray-700 mb-1"
							>Associato</label
						>
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
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="status" class="block text-sm font-medium text-gray-700 mb-1"
							>Stato ordine</label
						>
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
					<div class="w-full md:w-1/2 px-2 mb-4">
						<label for="statusPayment" class="block text-sm font-medium text-gray-700 mb-1"
							>Stato pagamento</label
						>
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
{/if}

<!-- {#if currentModal == 'detail'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form class="p-6 space-y-6">
			<div class="flex flex-wrap -mx-2">
				<div class="w-full md:w-1/2 px-2 mb-4">
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome Cognome</label
					>
					<input
						type="text"
						id="name"
						name="name"
						value={`${orderDetail.userView?.name} ${orderDetail.userView?.surname}`}
						readonly
						class="input input-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div class="w-full md:w-1/2 px-2 mb-4">
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						value={orderDetail.userView?.email}
						readonly
						class="input input-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div class="w-full md:w-1/2 px-2 mb-4">
					<label for="city" class="block text-sm font-medium text-gray-700 mb-1">Città</label>
					<input
						type="text"
						id="city"
						name="city"
						value={orderDetail.userView?.city}
						readonly
						class="input input-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div class="w-full md:w-1/2 px-2 mb-4">
					<label for="address" class="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label
					>
					<input
						type="text"
						id="address"
						name="address"
						value={orderDetail.userView?.address}
						readonly
						class="input input-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div class="w-full md:w-1/2 px-2 mb-4">
					<label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1"
						>Codice Postale - Provincia</label
					>
					<input
						type="text"
						id="postalCode"
						name="postalCode"
						value={`${orderDetail.userView?.postalCode} - ${orderDetail.userView?.county}`}
						readonly
						class="input input-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div class="w-full md:w-1/2 px-2 mb-4">
					<label for="country" class="block text-sm font-medium text-gray-700 mb-1">Paese</label>
					<input
						type="text"
						id="country"
						name="country"
						value={orderDetail.userView?.country}
						readonly
						class="input input-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div class="w-full md:w-1/2 px-2 mb-4">
					<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
					<input
						type="text"
						id="phone"
						name="phone"
						value={orderDetail.userView?.phone}
						readonly
						class="input input-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div class="w-full md:w-1/2 px-2 mb-4">
					<label for="mobile" class="block text-sm font-medium text-gray-700 mb-1">Cellulare</label>
					<input
						type="text"
						id="mobile"
						name="mobile"
						value={orderDetail.userView?.mobile}
						readonly
						class="input input-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
			</div>
		</form>
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
{/if} -->
