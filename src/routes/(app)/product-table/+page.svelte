<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/stores'; // $page.data.user $page.data.auth
	import Notification from '$lib/components/Notification.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import {
		CopyPlus,
		RefreshCcw,
		XCircle,
		Filter,
		FileDown,
		Settings,
		FileSearch2,
		Trash2,
		EyeOff,
		Eye
	} from 'lucide-svelte';

	let { data, form } = $props();
	let auth = $state($page.data.auth);
	let userData = $state($page.data.user);
	let { getTable } = $derived(data);
	let tableList = $state(getTable);

	let resetActive = $state(false);
	let isModal = $state(false);
	let currentDialog = $state('');
	let postAction = $state('?/');
	let modalTitle = $state('');
	let deleteId = $state('');

	const onFilterReset = () => {
		invalidateAll();
		tableList = getTable;
		resetActive = false;
	};

	const onRefresh = () => {
		invalidateAll();
		tableList = getTable;
	};

	const onCloseModal = () => {
		isModal = false;
		onRefresh();
	};

	const onClickDialog = (type: string, item: any) => {
		currentDialog = type;
		isModal = true;
		if (type == 'modify') {
			postAction = `?/productModify`;
			modalTitle = 'Modifica prodotto';
		}
		if (type == 'new') {
			postAction = `?/productNew`;
			modalTitle = 'Nuovo prodotto';
		}
		if (type == 'delete') {
			postAction = `?/productDelete`;
			modalTitle = 'Elimina prodotto';
			deleteId = item.productId;
		}
		if (type == 'filter') {
			postAction = `?/productFilter`;
			modalTitle = 'Filtro prodotto';
		}
	};

	$effect(() => {
		if (form != null) {
			async () => await invalidateAll(); // MUST be async/await or tableList = getTable will trigger infinite loop
			const { action, success, message } = form;
			if (success) {
				//fieldReset();
				isModal = false;
				tableList = getTable;
			} else {
				notificationError = true;
			}
			closeNotification();
			toastClosed = false;
			notificationContent = message;
		}
	}); // end effect

	// notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 3000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer
</script>

<svelte:head>
	<title>Lista Prodotti</title>
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
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista prodotti</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={onRefresh}>
				<RefreshCcw />
			</button>
			{#if resetActive}
				<button class="btn btn-error rounded-md text-white" onclick={onFilterReset}>
					<XCircle class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button
					class="btn btn-info rounded-md text-white"
					onclick={() => onClickDialog('filter', null)}
				>
					<Filter class="mt-1" /> Filtra
				</button>
			{/if}
			<button class="btn btn-info rounded-md text-white" onclick={() => onClickDialog('new', null)}>
				<CopyPlus /> Nuovo
			</button>
			<button class="btn btn-info text-white w-full sm:w-auto">
				<FileDown />CSV
			</button>
		</div>
	</div>

	<table class="table mt-5 border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr>
				<th>ID</th>
				<th></th>
				<th>Status</th>
				<th>Titolo</th>
				<th>Categoria</th>
				<th>Prezzo</th>
				<th>Quantità</th>
				<th>Bundle</th>
				<th>Azione</th>
			</tr>
		</thead>

		<tbody class="">
			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<td>{row.prodId}</td>
					<td>
						<img class="max-h-20" src={row.urlPic || '/images/picture.png'} alt={row.title} />
					</td>
					<td class="">
						<form method="POST" action={`?/disableProduct`} use:enhance>
							<input type="hidden" name="userId" value={row.productId} />
							<input type="hidden" name="status" value={row.status} />
							<span class="flex items-center">
								{#if row.status == 'enabled'}
									<button type="submit" class="btn btn-success btn-sm font-semibold"><Eye /></button
									>
								{:else}
									<button type="submit" class="btn btn-error btn-sm font-semibold"
										><EyeOff /></button
									>
								{/if}
							</span>
						</form>
					</td>
					<td>{row.title}</td>
					<td>{row.category}</td>
					<td>{row.cost}</td>
					<td>{row.stockQty}</td>
					<td><div class="badge badge-primary badge-md">0</div></td>
					<td class="flex items-center justify-center space-x-4">
						<!-- Action -->
						<button
							onclick={() => onClickDialog('modify', row)}
							class="btn btn-sm bg-gray-200 btn-neutral text-gray-700"
							><Settings />
						</button>
						<button
							onclick={() => goto(`/product-detail/${row.productId}`)}
							class="btn btn-sm bg-green-200 btn-green-400 text-green-800"
							><FileSearch2 />
						</button>
						<button
							class="btn btn-error btn-sm"
							onclick={() => onClickDialog('delete', row.productId)}><Trash2 /></button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

<!-- Modal confirm delete -->
<Modal isOpen={isModal} header={modalTitle} cssClass="max-w-4xl">
	<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
		>✕</button
	>
	{#if currentDialog == 'modify'}
		FORM CONTENT
	{/if}
	{#if currentDialog == 'new'}
		FORM CONTENT
	{/if}
	{#if currentDialog == 'delete'}
		<form action="?/deleteUser" method="POST" use:enhance>
			<input type="hidden" name="userId" value={deleteId} />
			<div class="flex justify-center space-x-10 mt-4">
				<button class="btn btn-error btn-md" type="button" onclick={onCloseModal}>Annulla</button>
				<button class="btn btn-success btn-md text-white" type="submit"><Trash2 />Conferma</button>
			</div>
		</form>
	{/if}
	{#if currentDialog == 'filter'}
		FORM CONTENT
	{/if}
</Modal>
