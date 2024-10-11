<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import {
		CopyPlus,
		Settings,
		Trash2,
		FileDown,
		Pen,
		StretchHorizontal,
		ImagePlus,
		Calculator,
		Palette
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';

	let { data, form } = $props();
	let { getTable } = $derived(data);
	let tableList = $state(getTable);

	let layoutId = $state('');
	let title = $state('');
	let descr = $state('');
	let urlPic = $state('');
	let bgColor = $state('');
	let price = $state(0);
	let bundleProduct = $state([]);

	//	notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 5000); // 1000 milliseconds = 1 second
	};
	clearTimeout(startTimeout); // reset timer
	//	end notification

	let isModalConfirmDelete = $state(false);

	let deleteId = $state('');
	const onOpenConfirmDelete = (id: string) => {
		isModalConfirmDelete = true;
		deleteId = id;
	};

	const resetFields = () => {
		invalidateAll();
		title = '';
		descr = '';
		urlPic = '';
		bgColor = '';
		price = 0;
		tableList = getTable;
	};

	const onCloseConfirmDelete = () => {
		isModalConfirmDelete = false;
		resetFields();
	};

	let currentDialog = $state('');
	let isModal = $state(false);
	let postAction = $state('');
	const onClickDialog = (type: string, item: any) => {
		currentDialog = type;
		isModal = true;
		if (type == 'new') {
			postAction = `?/newLayout`;
		}
		if (type == 'modify') {
			layoutId = item.layoutId;
			title = item.title;
			descr = item.descr;
			urlPic = item.urlPic;
			bgColor = item.bgColor;
			layoutId = item.layoutId;
			price = item.price;
			bundleProduct = item.bundleProduct;
			postAction = `?/modifyLayout`;
		}
	};

	$effect(() => {
		// console.log({ form });

		if (form != null) {
			async () => await invalidateAll();
			const { action, success, message } = form;
			if (success) {
				closeNotification();
				//resetFieldsModalFilter();
				isModal = false;
				isModalConfirmDelete = false;
				tableList = getTable;
			} else {
				notificationError = true;
			}
			toastClosed = false;
			notificationContent = message;
			form = null;
		}
	}); // end effect
</script>

<svelte:head>
	<title>Lista Modello Corso</title>
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
	<span class="flex justify-between">
		<button
			class="btn btn-info text-white w-full sm:w-auto"
			onclick={() => onClickDialog('new', null)}><CopyPlus /> Nuovo</button
		>
		<header class="text-center text-2xl font-bold text-gray-700">Lista modelli</header>
		<button class="btn btn-info text-white w-full sm:w-auto"><FileDown /> Scarica CSV</button>
	</span>
	<table class="table mt-5 border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr>
				<th>Data inserimento</th>
				<th>Titolo</th>
				<th>Descrizione</th>
				<th>Colore tema</th>
				<th>Foto</th>
				<th>Prezzo</th>
				<th>Azione</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody class="">
			<!-- row 1 -->
			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<!-- Date created -->
					<td>{row.createdAt}</td>
					<!-- title -->
					<td>{row.title}</td>
					<!-- descr -->
					<td>{row.descr}</td>
					<!-- Color -->
					<td>{row.bgColor}</td>
					<!-- url foto -->
					<td>
						<img class="w-64" src={row.urlPic} alt={row.urlPic} />
					</td>
					<!-- Prezzo -->
					<td>{row.price}</td>
					<!-- Azione -->
					<td class="flex items-center space-x-4">
						<button
							onclick={() => onClickDialog('modify', row)}
							class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800"
							><Settings />
						</button>
						<button class="btn btn-error btn-sm" onclick={() => onOpenConfirmDelete(row.layoutId)}
							><Trash2 /></button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

<!-- modal New and Modify  -->
<dialog id="modal_new-modify" class="modal" class:modal-open={isModal}>
	<div class="modal-box bg-white p-0 rounded-lg shadow-xl max-w-2xl">
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-t-lg glass">
			<h2 class="text-2xl font-bold text-white mb-1">
				{#if currentDialog == 'new'}
					Nuovo modello
				{:else if currentDialog == 'modify'}
					Mpdifica modello
				{/if}
			</h2>
		</div>

		<form
			method="POST"
			action={postAction}
			use:enhance
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			{#if currentDialog == 'modify'}
				<section class="col-span-4">
					<label for="discountId" class="form-label">
						<p class="font-bold mb-2">ID codice</p>
					</label>

					<div class="join join-horizontal w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<input
							class="input input-bordered join-item w-full"
							id="layoutId"
							name="layoutId"
							type="text"
							placeholder="layoutId"
							bind:value={layoutId}
							readonly
						/>
					</div>
				</section>
			{/if}
			<section class="col-span-4">
				<label for="title" class="form-label">
					<p class="font-bold mb-2">Titolo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<textarea
						class="textarea textarea-bordered h-24 join-item w-full"
						id="title"
						name="title"
						placeholder="Titolo"
						bind:value={title}
					/>
				</div>
			</section>

			<section class="col-span-4 md:col-span-4">
				<label for="descr" class="form-label">
					<p class="font-bold mb-2">Descrizione</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><StretchHorizontal /></button>
					<textarea
						class="textarea textarea-bordered h-24 join-item w-full"
						id="descr"
						name="descr"
						placeholder="Descrizione"
						bind:value={descr}
					/>
				</div>
			</section>
			<!-- URL image -->
			<section class="col-span-4 md:col-span-4">
				<label for="urlPic" class="form-label">
					<p class="font-bold mb-2">URL immagine</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><ImagePlus /></button>
					<input
						type="text"
						class="input input-bordered w-full join-item"
						name="urlPic"
						placeholder="Inserisci il percorso dell'immagine"
						bind:value={urlPic}
					/>
				</div>
			</section>
			<!-- Color -->
			<section class="col-span-2 md:col-span-2">
				<label for="bgColor" class="form-label">
					<p class="font-bold mb-2">Colore</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Palette /></button>
					<input
						type="text"
						class="input input-bordered w-full join-item"
						name="bgColor"
						placeholder="Inserisci il percorso dell'immagine"
						bind:value={bgColor}
					/>
				</div>
			</section>
			<!-- Value -->
			<section class="col-span-2 md:col-span-2">
				<label for="price" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="price"
						type="number"
						name="price"
						bind:value={price}
					/>
				</div>
			</section>

			<!-- Bundle product -->
			<section class="col-span-4">
				<label for="bundleProduct" class="form-label">
					<p class="font-bold mb-2">Correlati</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<textarea
						class="textarea textarea-bordered h-24 join-item w-full"
						id="correlati"
						name="bundleProduct"
						placeholder="Correlati"
						bind:value={bundleProduct}
					/>
				</div>
			</section>

			<!-- ALtre informazione -->

			<!-- registra corso button -->
			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button
						class="btn btn-error btn-sm mx-2"
						onclick={() => {
							(isModal = false), resetFields();
						}}
					>
						Annulla
					</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">
						{#if currentDialog == 'new'}
							Registra
						{:else if currentDialog == 'modify'}
							Modifica
						{/if}
					</button>
				</div>
			</div>
		</form>
	</div>
</dialog>
<!-- /modal New and Modify -->

<!-- Modal confirm delete -->
<dialog id="modal_confirm_delete" class="modal" class:modal-open={isModalConfirmDelete}>
	<div
		class="modal-box bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-t-lg glass flex flex-row justify-between max-w-2xl"
	>
		<h2 class="text-2xl font-bold text-black flex items-center">Conferma l'eliminazione?</h2>
		<form action="?/deleteLayout" method="POST" use:enhance>
			<input type="hidden" name="layoutId" value={deleteId} />
			<div class="flex flex-row justify-between space-x-4">
				<button class="btn btn-error btn-md" type="button" onclick={onCloseConfirmDelete}
					>Annulla</button
				>
				<button class="btn btn-success btn-md text-white" type="submit"><Trash2 />Conferma</button>
			</div>
		</form>
	</div>
</dialog>
