<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import type { Product } from '$lib/types.ts';
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Papa from 'papaparse';
	import { courseKeysToDelete } from '$lib/stores/arrays';
	import { notification } from '$lib/stores/notifications';
	import DragDrop from '$lib/components/DragDrop.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { imgCheck } from '$lib/tools/tools.js';
	import Loader from '$lib/components/Loader.svelte';
	import {
		CopyPlus,
		RefreshCcw,
		XCircle,
		Funnel,
		FileDown,
		FileUp,
		Settings,
		FileSearch2,
		Trash2,
		ToggleRight,
		ToggleLeft,
		Calculator,
		List,
		Users,
		Pen
	} from 'lucide-svelte';

	const { data } = $props();
	const { getTable, itemCount } = $derived(data);
	let tableList: Product[] = $state(getTable || []);
	let count = $state(itemCount);

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');
	let resetActive = $state(false);
	let loading = $state(false);

	//filter
	let title = $state('');
	let descrShort = $state('');
	let descrLong = $state('');
	let stockQty = $state(0);
	let category = $state('');
	let price = $state(0);
	let prodId = $state('');
	let weight = $state(0);
	let status = $state('');

	// Pagination
	let currentPage = $state(1);
	const itemsPerPage = 20;
	const pageNumbers = $derived(() => {
		const pageCount = Math.ceil(count / itemsPerPage);
		const numbers = [];
		for (let i = 1; i <= pageCount; i++) {
			numbers.push(i);
		}
		return numbers;
	});

	const goToPage = (newPage?: number) => {
		currentPage = newPage;

		// Pagination
		const skipItems = (currentPage - 1) * itemsPerPage;
		tableList = getTable.slice(skipItems, skipItems + itemsPerPage);
	};
	goToPage(currentPage);

	const csvCreate = () => {
		let csv = $state('');
		let newList: any = $state();

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
			createdAt: obj.createdAt?.substring(0, 10)
		}));

		newList.forEach((obj: any) => {
			$courseKeysToDelete.forEach((key: string) => delete (obj as any)[key]);
		});
		//console.log('newList check', newList);

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
		const link = document.createElement('a'); //
		link.href = URL.createObjectURL(blob);
		link.download = `Export_products_${new Date().toLocaleDateString()}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};

	const resetFields = () => {
		title = '';
		descrShort = '';
		descrLong = '';
		stockQty = 0;
		category = '';
		price = 0;
	};

	const refresh = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getTable;
		notification.info('Pagina aggiornata');
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
			prodId = item.prodId;
			title = item.title;
			descrShort = item.descrShort;
			descrLong = item.descrLong;
			stockQty = item.stockQty;
			price = item.price;
			weight = item.weight;
			category = item.category[0];
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			prodId = item.prodId;
			//console.log('deleteId', deleteId);
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtra';
			status = 'enabled';
		}
		if (type == 'uploadCsv') {
			postAction = `?/uploadCsv`;
			modalTitle = 'Carica CSV';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
	};

	const onCloseModify = () => {
		openModal = false;
		refresh();
	};

	const formSubmit = () => {
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			loading = true;
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { action, success, message, payload } = result.data; // { action, success, message, payload }
				if (action == 'filter') {
					resetActive = true;
					tableList = payload;
				} else {
					resetActive = false;
					tableList = getTable;
				}

				if (success) {
					notification.info(message);
				} else {
					notification.error(message);
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
			goToPage(currentPage);
			loading = false;
		};
	};

	$effect(() => {
		if (tableList) {
			tick().then(() => {
				const element = document.getElementById('top');
				if (element) {
					element.scrollIntoView({ behavior: 'instant' }); // smooth / instant
				}
			});
		}
	});
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

<div id="top" class="overflow-x-auto mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista prodotti</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={refresh}>
				<RefreshCcw />
			</button>
			{#if resetActive}
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
			<button class="btn btn-info rounded-md text-white" onclick={() => onClickModal('new', null)}>
				<CopyPlus /> Nuovo
			</button>
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={() => csvCreate()}>
				<FileDown />CSV
			</button>
			<button
				aria-label="uploadCSV image"
				class="btn btn-info text-white w-full sm:w-auto"
				onclick={() => onClickModal('uploadCsv', null)}
			>
				<FileUp />CSV
			</button>
		</div>
	</div>

	<table class="table mt-5">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600 sticky top-0">
			<tr>
				<th>ID</th>
				<th>Immagine</th>
				<th>Status</th>
				<th>Titolo</th>
				<th>Categoria</th>
				<th>Prezzo</th>
				<th>Quantità</th>
				<!-- <th>Bundle</th> -->
				<th>Azione</th>
			</tr>
		</thead>

		<tbody class="">
			{#if tableList.length == 0}
				<tr class="hover:bg-gray-300"><td> no data</td></tr>
			{/if}
			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<td>{row.prodId} <br /> {row.createdAt?.substring(0, 10) || ''}</td>
					<td>
						<!-- img start -->
						{#if imgCheck.single(row.uploadfiles, 'product-primary') !== '/images/placeholder.jpg'}
							<div class="card-body p-4">
								<div class="flex items-center">
									<figure class="flex-shrink-0">
										<img
											src={imgCheck.single(row.uploadfiles, 'product-primary')}
											alt="product-primary"
											class="object-cover rounded-md max-w-28 max-h-28 h-auto"
											loading="lazy"
										/>
									</figure>
									<form
										method="POST"
										action={`?/delProdPic`}
										use:enhance={formSubmit}
										class="ml-4 flex-shrink-0"
									>
										<input type="hidden" name="prodId" value={row.prodId} />
										<input
											type="hidden"
											name="fileName"
											value={imgCheck.fileName(row.uploadfiles, 'product-primary')}
										/>
										<button
											class="btn btn-sm btn-error rounded-lg border-2"
											type="submit"
											aria-label="Delete image"
										>
											<Trash2 size="24" />
										</button>
									</form>
								</div>
							</div>
						{:else}
							<form
								action={`?/setProdPic`}
								method="POST"
								enctype="multipart/form-data"
								use:enhance={formSubmit}
								class="card-body max-w-48"
							>
								<input type="hidden" name="prodId" value={row.prodId} />
								<DragDrop />
								<button class="btn btn-sm btn-info rounded-lg border-2" type="submit">
									Aggiungi foto
								</button>
							</form>
						{/if}
						<!-- img end -->
					</td>
					<td class="">
						<form method="POST" action={`?/changeStatus`} use:enhance={formSubmit}>
							<input type="hidden" name="prodId" value={row.prodId} />
							<input type="hidden" name="status" value={row.status} />
							<span class="flex items-center">
								{#if row.status == 'enabled'}
									<button type="submit" class="btn btn-ghost btn-sm font-semibold"
										><ToggleRight color="darkgreen" />
									</button>
								{:else}
									<button type="submit" class="btn btn-ghost btn-sm font-semibold"
										><ToggleLeft color="darkred" /></button
									>
								{/if}
							</span>
						</form>
					</td>
					<td>{row.title}</td>
					<td>{row.category[0]}</td>
					<td>{row.price}</td>
					<td>{row.stockQty}</td>
					<!-- <td><div class="badge badge-primary badge-md">0</div></td> -->
					<td>
						<!-- Action -->
						<button onclick={() => onClickModal('modify', row)} class="btn btn-sm"
							><Settings />
						</button>
						<a href="/product-detail/{row.prodId}" class="btn btn-sm btn-success"><FileSearch2 /></a
						>
						<button class="btn btn-error btn-sm" onclick={() => onClickModal('delete', row)}
							><Trash2 /></button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="join flex justify-center">
		{#each pageNumbers() as page (page)}
			<button
				type="submit"
				class="join-item btn"
				class:btn-active={page === currentPage}
				onclick={() => goToPage(page)}
			>
				{page}
			</button>
		{/each}
	</div>
</div>

{#if currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		{#if loading}
			<Loader />
		{:else}
			<form
				action={postAction}
				method="POST"
				class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
				use:enhance={formSubmit}
			>
				<!-- <header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Nuovo Prodotto
			</header> -->
				<section class="col-span-4">
					<label for="titolo" class="form-label">
						<p class="font-bold mb-2">Titolo</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<input
							class="input input-bordered join-item w-full"
							id="titolo"
							name="title"
							type="text"
							placeholder="Titolo"
							aria-label="Titolo"
							aria-describedby="basic-titolo"
							bind:value={title}
							required
						/>
					</div>
				</section>
				<section class="col-span-4">
					<label for="descrShort" class="form-label">
						<p class="font-bold mb-2">Descrizione Breve</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShort"
							name="descrShort"
							placeholder="Testo Descrizione Breve"
							aria-label="descrShort"
							aria-describedby="basic-descrShort"
							bind:value={descrShort}
							required
						></textarea>
					</div>
				</section>
				<section class="col-span-4">
					<label for="descrLong" class="form-label">
						<p class="font-bold mb-2">Descrizione Completa</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrLong"
							name="descrLong"
							placeholder="Testo Descrizione Completa"
							aria-label="descrizione"
							aria-describedby="basic-descrLong"
							bind:value={descrLong}
							required
						></textarea>
					</div>
				</section>
				<section class="col-span-1 md:col-span-2">
					<label for="quantitaProdotto" class="form-label">
						<p class="font-bold mb-2">Quantità magazzino</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Users /></button>
						<input
							class="input input-bordered join-item w-full"
							id="quantitaProdotto"
							name="stockQty"
							type="number"
							placeholder="N."
							aria-label="quantitaProdotto"
							aria-describedby="basic-quantitaProdotto"
							step="1"
							min="0"
							bind:value={stockQty}
							required
						/>
					</div>
				</section>
				<section class="col-span-4 md:col-span-2">
					<label for="cost" class="form-label">
						<p class="font-bold mb-2">Prezzo</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Calculator /></button>
						<input
							class="input input-bordered join-item w-full"
							id="cost"
							name="price"
							type="number"
							placeholder="N."
							aria-label="cost"
							aria-describedby="basic-cost"
							bind:value={price}
							min="0"
							step="0.01"
							required
						/>
					</div>
				</section>
				<section class="col-span-4 md:col-span-2">
					<label for="weight" class="form-label">
						<p class="font-bold mb-2">Peso KG</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Calculator /></button>
						<input
							class="input input-bordered join-item w-full"
							id="weight"
							name="weight"
							type="number"
							placeholder="KG"
							aria-label="weight"
							aria-describedby="shipping-weight"
							bind:value={weight}
							min="0"
							step="0.01"
							required
						/>
					</div>
				</section>
				<section class="col-span-4 md:col-span-2">
					<label for="category" class="form-label">
						<p class="font-bold mb-2">Categoria prodotto</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><List /></button>
						<select
							class="select select-bordered w-full rounded-md rounded-l-none"
							id="category"
							name="category"
							aria-label="category"
							aria-describedby="basic-category"
							bind:value={category}
							required
						>
							<option disabled value="">Scegli</option>
							<option value="Alimentazione & Benessere">Alimentazione & Benessere</option>
							<option value="Altri attrezzi e Accessori">Altri attrezzi e Accessori</option>
							<option value="Cercapunti">Cercapunti</option>
							<option value="Creme & Co.">Creme & Co.</option>
							<option value="Martelli">Martelli</option>
							<option value="Materiale didattico">Materiale didattico</option>
							<option value="Pettini">Pettini</option>
							<option value="Rulli">Rulli</option>
							<option value="Vietmassage">Vietmassage</option>
							<option value="Senza Categoria">Senza Categoria</option>
						</select>
					</div>
				</section>
				<section class="lg:col-span-4 mt-2">
					<div class="col-span-4 mt-10 flex justify-center">
						<button class="btn btn-error mx-1" type="button" onclick={onCloseModal}>Annulla</button>
						<button class="btn btn-success mx-1" type="submit">
							<span class="flex items-center justify-center"> REGISTRA PRODOTTO </span>
						</button>
					</div>
				</section>
			</form>
		{/if}
	</Modal>
{/if}

{#if currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModify}
			>✕</button
		>
		{#if loading}
			<Loader />
		{:else}
			<form
				action={postAction}
				method="POST"
				class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
				use:enhance={formSubmit}
			>
				<input type="hidden" name="prodId" value={prodId} />
				<!-- <header class="col-span-4 text-center text-2xl font-bold text-green-800">
			Modifica Prodotto
		</header> -->
				<section class="col-span-4">
					<label for="titolo" class="form-label">
						<p class="font-bold mb-2">Titolo</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<input
							class="input input-bordered join-item w-full"
							id="titolo"
							name="title"
							type="text"
							placeholder="Titolo"
							aria-label="Titolo"
							aria-describedby="basic-titolo"
							bind:value={title}
							required
						/>
					</div>
				</section>
				<section class="col-span-4">
					<label for="descrShort" class="form-label">
						<p class="font-bold mb-2">Descrizione Breve</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShort"
							name="descrShort"
							placeholder="Descrizione Breve"
							aria-label="descrShort"
							aria-describedby="basic-descrShort"
							bind:value={descrShort}
							required
						></textarea>
					</div>
				</section>
				<section class="col-span-4">
					<label for="descrLong" class="form-label">
						<p class="font-bold mb-2">Descrizione Completa</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrLong"
							name="descrLong"
							placeholder="Descrizione Completa"
							aria-label="descrLong"
							aria-describedby="basic-descrLong"
							bind:value={descrLong}
							required
						></textarea>
					</div>
				</section>
				<section class="col-span-1 md:col-span-2">
					<label for="quantitaProdotto" class="form-label">
						<p class="font-bold mb-2">Quantità magazzino</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Users /></button>
						<input
							class="input input-bordered join-item w-full"
							id="quantitaProdotto"
							name="stockQty"
							type="number"
							placeholder="N."
							aria-label="quantitaProdotto"
							aria-describedby="basic-quantitaProdotto"
							step="1"
							min="0"
							bind:value={stockQty}
							required
						/>
					</div>
				</section>
				<section class="col-span-4 md:col-span-2">
					<label for="cost" class="form-label">
						<p class="font-bold mb-2">Prezzo</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Calculator /></button>
						<input
							class="input input-bordered join-item w-full"
							id="cost"
							name="price"
							type="number"
							placeholder="N."
							aria-label="cost"
							aria-describedby="basic-cost"
							bind:value={price}
							min="0"
							step="0.01"
							required
						/>
					</div>
				</section>
				<section class="col-span-4 md:col-span-2">
					<label for="weight" class="form-label">
						<p class="font-bold mb-2">Peso KG</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Calculator /></button>
						<input
							class="input input-bordered join-item w-full"
							id="weight"
							name="weight"
							type="number"
							placeholder="KG"
							aria-label="weight"
							aria-describedby="shipping-weight"
							bind:value={weight}
							min="0"
							step="0.01"
							required
						/>
					</div>
				</section>
				<section class="col-span-4 md:col-span-2">
					<label for="category" class="form-label">
						<p class="font-bold mb-2">Categoria prodotto</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><List /></button>
						<select
							class="select select-bordered w-full rounded-md rounded-l-none"
							id="category"
							name="category"
							aria-label="category"
							aria-describedby="basic-category"
							bind:value={category}
							required
						>
							<option disabled value="">Scegli</option>
							<option value="Alimentazione & Benessere">Alimentazione & Benessere</option>
							<option value="Altri attrezzi e Accessori">Altri attrezzi e Accessori</option>
							<option value="Cercapunti">Cercapunti</option>
							<option value="Creme & Co.">Creme & Co.</option>
							<option value="Martelli">Martelli</option>
							<option value="Materiale didattico">Materiale didattico</option>
							<option value="Pettini">Pettini</option>
							<option value="Rulli">Rulli</option>
							<option value="Vietmassage">Vietmassage</option>
							<option value="Senza Categoria">Senza Categoria</option>
						</select>
					</div>
				</section>

				<section class="lg:col-span-4 mt-2">
					<div class="col-span-4 mt-10 flex justify-center">
						<button class="btn btn-error mx-1" type="button" onclick={onCloseModify}>Annulla</button
						>
						<button class="btn btn-success mx-1" type="submit">
							<span class="flex items-center justify-center">CONFERMA MODIFICA</span>
						</button>
					</div>
				</section>
			</form>
		{/if}
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		{#if loading}
			<Loader />
		{:else}
			<form
				method="POST"
				action={postAction}
				use:enhance={formSubmit}
				class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			>
				<input type="hidden" name="prodId" value={prodId} />
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
		{/if}
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		{#if loading}
			<Loader />
		{:else}
			<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
				<fieldset class="fieldset space-y-4">
					<!-- <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Titolo</label> -->
					<legend class="fieldset-legend">ID</legend>
					<input
						class="input input-bordered w-full"
						id="prodId"
						name="prodId"
						type="text"
						placeholder="ID"
						bind:value={prodId}
					/>
					<legend class="fieldset-legend">Titolo</legend>
					<input
						class="input input-bordered w-full"
						id="title"
						name="title"
						type="text"
						placeholder="Titolo"
						bind:value={title}
					/>

					<legend class="fieldset-legend">Categoria</legend>
					<select class="select w-full" id="category" name="category" bind:value={category}>
						<option disabled value="">Scegli</option>
						<option value="Alimentazione & Benessere">Alimentazione & Benessere</option>
						<option value="Altri attrezzi e Accessori">Altri attrezzi e Accessori</option>
						<option value="Cercapunti">Cercapunti</option>
						<option value="Creme & Co.">Creme & Co.</option>
						<option value="Martelli">Martelli</option>
						<option value="Materiale didattico">Materiale didattico</option>
						<option value="Pettini">Pettini</option>
						<option value="Rulli">Rulli</option>
						<option value="Vietmassage">Vietmassage</option>
						<option value="Senza Categoria">Senza Categoria</option>
					</select>

					<legend class="fieldset-legend">Status</legend>
					<select class="select w-full" id="status" name="status" bind:value={status}>
						<option value="enabled">Attivo</option>
						<option value="disabled">Inattivo</option>
					</select>
				</fieldset>

				<section class="lg:col-span-4 mt-2">
					<div class="col-span-4 mt-10 flex justify-center">
						<button class="btn btn-error mx-1" type="button" onclick={onCloseModal}>Annulla</button>
						<button class="btn btn-success mx-1" type="submit">
							<span class="flex items-center justify-center">Applica Filtri</span>
						</button>
					</div>
				</section>
			</form>
		{/if}
	</Modal>
{/if}

{#if currentModal == 'uploadCsv'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		{#if loading}
			<Loader />
		{:else}
			<form
				method="POST"
				action={postAction}
				enctype="multipart/form-data"
				use:enhance={formSubmit}
				class="grid grid-cols-2 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			>
				<section class="col-span-2">
					<label for="price" class="form-label">
						<p class="font-bold mb-2 label">Solo file CSV</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<input
							type="file"
							id="fileUpload"
							name="fileUpload"
							accept=".csv, text/csv"
							class="file-input"
						/>
					</div>
				</section>

				<div class="col-span-4 mt-5 flex justify-center">
					<div class="bg-gray-50 flex justify-center">
						<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}>Annulla</button>
						<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Carica</button>
					</div>
				</div>
			</form>
		{/if}
	</Modal>
{/if}
