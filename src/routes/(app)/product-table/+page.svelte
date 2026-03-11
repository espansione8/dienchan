<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import type { Product } from '$lib/types.ts';
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Image } from '@unpic/svelte';
	import Papa from 'papaparse';
	import { productKeysToDelete } from '$lib/stores/arrays';
	import { notification } from '$lib/stores/notifications';
	import DragDrop from '$lib/components/DragDrop.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { imgCheck } from '$lib/tools/tools.js';
	import Loader from '$lib/components/Loader.svelte';
	import {
		CopyPlus,
		RefreshCcw,
		CircleX,
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
		Pen,
		House,
		ShieldAlert
	} from 'lucide-svelte';

	const { data } = $props();
	const { getTable, itemCount } = $derived(data);
	// let tableList: Product[] = $state(getTable || []);
	let tableList = $state(getTable);
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
	let sku = $state('');
	let stockQty = $state(0);
	let category = $state('');
	let price = $state(0);
	let prodId = $state('');
	let uploadfiles = $state('');
	let weight = $state(0);
	let status = $state('');
	let promoPrice = $state(0);
	let promoEndDate = $state('');
	let promoStatus = $state('disabled');

	// Pagination
	let currentPage = $state(1);
	const itemsPerPage = 50;

	// const pageNumbers = $derived(() => {
	// 	const pageCount = Math.ceil(count / itemsPerPage);
	// 	const numbers = [];
	// 	for (let i = 1; i <= pageCount; i++) {
	// 		numbers.push(i);
	// 	}
	// 	return numbers;
	// });

	// const goToPage = (newPage?: number) => {
	// 	currentPage = newPage;

	// 	// Pagination
	// 	const skipItems = (currentPage - 1) * itemsPerPage;
	// 	tableList = tableList.slice(skipItems, skipItems + itemsPerPage);
	// };

	// goToPage(currentPage);

	// const paginatedList = $derived(() => {
	// 	const skipItems = (currentPage - 1) * itemsPerPage;
	// 	return tableList.slice(skipItems, skipItems + itemsPerPage);
	// });

	const csvCreate = (content) => {
		const flattenObject = (obj: any, prefix = '') => {
			return Object.keys(obj).reduce((acc, k) => {
				const pre = prefix.length ? prefix + '_' : '';
				if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
					Object.assign(acc, flattenObject(obj[k], pre + k));
				} else {
					// Only include non-array, non-object values in the final flat object
					// if (!Array.isArray(obj[k])) {
					// 	acc[pre + k] = obj[k];
					// }
					acc[pre + k] = obj[k];
				}
				return acc;
			}, {});
		};

		const dataToExport = content.map((order) => {
			const flatOrder: any = flattenObject(order);

			if (flatOrder.createdAt) flatOrder.createdAt = (flatOrder.createdAt as string).substring(0, 10);
			// if (flatOrder.birthdate) flatOrder.birthdate = (flatOrder.birthdate as string).substring(0, 10);

			$productKeysToDelete.forEach((key: string) => delete (flatOrder as any)[key]);
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
		link.download = `Export_products_${new Date().toLocaleDateString()}.csv`;

		document.body.appendChild(link);
		link.click();

		// Release the URL object
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	};

	const createProductSalesByMonthCSV = (data: any[]) => {
		const currentYear = new Date().getFullYear();
		const monthNames = [
			'Gennaio',
			'Febbraio',
			'Marzo',
			'Aprile',
			'Maggio',
			'Giugno',
			'Luglio',
			'Agosto',
			'Settembre',
			'Ottobre',
			'Novembre',
			'Dicembre'
		];

		const dataToExport = data.map((item) => {
			const row: any = {
				prodId: item.prodId,
				Titolo: item.title,
				Prezzo: item.price
			};

			monthNames.forEach((monthName, index) => {
				row[monthName] = item.months[index];
			});

			return row;
		});

		// CSV UNPARSE
		const csv = Papa.unparse(dataToExport, {
			quotes: false,
			quoteChar: '"',
			escapeChar: '"',
			delimiter: ';',
			header: true,
			skipEmptyLines: false
		});

		// DOWNLOAD file
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `Vendite_Prodotti_${currentYear}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	};

	const resetFields = () => {
		title = '';
		descrShort = '';
		descrLong = '';
		sku = '';
		stockQty = 0;
		// category = '';
		price = 0;
		prodId = '';
		status = '';
		promoPrice = 0;
		promoEndDate = '';
		promoStatus = '';
		// currentPage = 1;
	};

	const refresh = () => {
		category = '';
		invalidateAll();
		resetFields();
		resetActive = false;
		currentPage = 1;
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
			sku = item.sku;
			stockQty = item.stockQty;
			price = item.price;
			weight = item.weight;
			category = item.category[0];
			promoPrice = item.promoPrice || 0;
			promoEndDate = item.promoEndDate ? item.promoEndDate.substring(0, 10) : '';
			promoStatus = item.promoStatus || 'disabled';
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			prodId = item.prodId;
			//console.log('deleteId', deleteId);
		}
		if (type == 'deletePic') {
			postAction = `?/delProdPic`;
			modalTitle = 'Elimina';
			prodId = item.prodId;
			uploadfiles = item.uploadfiles;
			title = item.title;

			// console.log('item', item);
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtra';
			category = '';
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
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {

			await invalidateAll();

			try {
				if (result.type === 'success' && result.data) {
					const { action, success, message, payload } = result.data; // { action, success, message, payload }
					if (action == 'filter') {
						resetActive = true;
						currentPage = 1;
						tableList = payload;
						notification.info(message);
					} else if (action == 'downloadCsv') {
						csvCreate(payload);
						notification.success(message);
					} else if (action == 'changePage') {
						if (payload.result.length > 0) {
							tableList = payload.result;
						} else {
							tableList = getTable;
						}
						currentPage = payload.currentPage;
					} else if (action == 'productSalesByMonth') {
						createProductSalesByMonthCSV(payload);
					} else {
						tableList = getTable;
						resetActive = false;
						notification.info(message);
					}

					// if (success) {
					// 	notification.info(message);
					// } else {
					// 	notification.error(message);
					// }
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
			} finally {
				resetFields();
				loading = false;
			}
		};
	};

	// $effect(() => {
	// 	if (currentPage) {
	// 		tick().then(() => {
	// 			const element = document.getElementById('top');
	// 			if (element) {
	// 				element.scrollIntoView({ behavior: 'instant' }); // smooth / instant
	// 			}
	// 		});
	// 	}
	// });

	$effect(() => {
		if (currentPage && Array.isArray(tableList)) {
			tick().then(() => {
				const element = document.getElementById('top');
				if (element) {
					element.scrollIntoView({ behavior: 'instant' }); // smooth , instant
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

{#if loading}
	<Loader />
{/if}
<div class="overflow-x-auto mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista prodotti</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={refresh}>
				<RefreshCcw />
			</button>
			{#if resetActive}
				<button class="btn btn-error rounded-md text-white" onclick={refresh}>
					<CircleX class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button class="btn btn-info rounded-md text-white" onclick={() => onClickModal('filter', null)}>
					<Funnel class="mt-1" /> Filtra
				</button>
			{/if}
			<button class="btn btn-info rounded-md text-white" onclick={() => onClickModal('new', null)}>
				<CopyPlus /> Nuovo
			</button>
			<form method="POST" action={`?/downloadCsv`} use:enhance={formSubmit}>
				<button type="submit" class="btn btn-info text-white w-full sm:w-auto">
					<FileDown />CSV Report
					{#if loading}
						<Loader />
					{/if}
				</button>
			</form>
			<button aria-label="uploadCSV" class="btn btn-info text-white w-full sm:w-auto" onclick={() => onClickModal('uploadCsv', null)}>
				<FileUp />CSV Update
			</button>
			<form method="POST" action="?/productSalesByMonth" use:enhance={formSubmit}>
				<button type="submit" class="btn btn-info text-white w-full sm:w-auto">
					<FileDown />Report Vendite {new Date().getFullYear()}
				</button>
			</form>
		</div>
	</div>

	<table class="table mt-5">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600 sticky top-0">
			<tr>
				<th>ID</th>
				<th>SKU</th>
				<th>Immagine</th>
				<th>Status</th>
				<th>Titolo</th>
				<th>Categoria</th>
				<th>Prezzo</th>
				<th>Promo</th>
				<th>Quantità</th>
				<!-- <th>Bundle</th> -->
				<th>Azione</th>
			</tr>
		</thead>

		<tbody class="">
			{#if tableList.length == 0}
				<tr class="hover:bg-gray-300"><td> no data</td></tr>
			{/if}
			{#each tableList as row (row.prodId)}
				<tr class="hover:bg-gray-100">
					<td>{row.prodId} <br /> {row.createdAt ? new Date(row.createdAt).toLocaleDateString('it-IT') : ''}</td>
					<td>{row.sku || ''}</td>
					<td>
						<!-- img start -->
						{#if imgCheck?.single(row?.uploadfiles, 'product-primary') !== '/images/placeholder.jpg'}
							<div class="card-body p-4">
								<div class="flex items-center gap-5">
									<figure class="flex-shrink-0">
										<Image
											layout="constrained"
											aspectRatio={1}
											src={imgCheck?.single(row?.uploadfiles, 'product-primary')}
											alt="product-primary"
											class="object-cover rounded-md max-w-28 max-h-28 h-auto"
										/>
									</figure>
									<!-- <form method="POST" action={`?/delProdPic`} use:enhance={formSubmit} class="ml-4 flex-shrink-0"> -->
									<!-- <input type="hidden" name="prodId" value={row.prodId} />
										<input type="hidden" name="fileName" value={imgCheck.fileName(row.uploadfiles, 'product-primary')} /> -->
									<!-- <button class="btn btn-sm btn-error rounded-lg border-2" type="submit" aria-label="Delete image">
											<Trash2 size="24" />
										</button> -->
									<button class="btn btn-error btn-sm" onclick={() => onClickModal('deletePic', row)}><Trash2 /></button>
									<!-- </form> -->
								</div>
							</div>
						{:else}
							<form action={`?/setProdPic`} method="POST" enctype="multipart/form-data" use:enhance={formSubmit} class="card-body max-w-48">
								<input type="hidden" name="prodId" value={row.prodId} />
								<DragDrop />
								<button class="btn btn-sm btn-info rounded-lg border-2" type="submit"> Aggiungi foto </button>
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
									<button type="submit" class="btn btn-ghost btn-sm font-semibold"><ToggleRight color="darkgreen" /> </button>
								{:else}
									<button type="submit" class="btn btn-ghost btn-sm font-semibold"><ToggleLeft color="darkred" /></button>
								{/if}
							</span>
						</form>
					</td>
					<td>{row.title}</td>
					<td>{row.category[0]}</td>
					<td>{row.price}</td>
					<td>
						<div class="flex flex-col gap-1">
							{#if row.promoPrice > 0}
								<form method="POST" action="?/changePromoStatus" use:enhance={formSubmit}>
									<input type="hidden" name="prodId" value={row.prodId} />
									<input type="hidden" name="promoStatus" value={row.promoStatus || 'disabled'} />
									<span class="flex items-center gap-1">
										{#if row.promoStatus === 'enabled'}
											<button type="submit" class="btn btn-ghost btn-xs">
												<ToggleRight color="darkgreen" />
											</button>
											<span class="text-success font-bold text-sm">€ {row.promoPrice}</span>
										{:else}
											<button type="submit" class="btn btn-ghost btn-xs">
												<ToggleLeft color="gray" />
											</button>
											<span class="text-gray-400 text-sm">€ {row.promoPrice}</span>
										{/if}
									</span>
								</form>
								{#if row.promoEndDate}
									<span class="text-xs text-gray-500">
										Scade: {new Date(row.promoEndDate).toLocaleDateString('it-IT')}
									</span>
								{/if}
							{:else}
								<span class="text-gray-400">—</span>
							{/if}
						</div>
					</td>
					<td>{row.stockQty}</td>
					<!-- <td><div class="badge badge-primary badge-md">0</div></td> -->
					<td>
						<!-- Action -->
						<button onclick={() => onClickModal('modify', row)} class="btn btn-sm"><Settings /> </button>
						<a href="/product-detail/{row.prodId}" class="btn btn-sm btn-success"><FileSearch2 /></a>
						<button class="btn btn-error btn-sm" onclick={() => onClickModal('delete', row)}><Trash2 /></button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<!-- <div class="join flex justify-center">
		{#each pageNumbers() as page (page)}
			<button type="submit" class="join-item btn" class:btn-active={page === currentPage} onclick={() => goToPage(page)}>
				{page}
			</button>
		{/each}
	</div> -->
	{#if tableList.length == 0}
		<div class="alert alert-warning shadow-lg flex item-center text-center justify-center mt-3 mx-auto w-full max-w-lg">
			<div>
				<ShieldAlert />
				<br />
				<span class="mt-2 text-semibold"> Nessun Prodotto trovato. Cambia parametri o resetta il filtro. </span>
			</div>
		</div>
	{/if}
	<div class="join flex justify-center mt-5">
		<form method="POST" action="?/changePage" use:enhance={formSubmit}>
			{#if currentPage > 1}
				<button type="submit" id="reset" class="join-item btn" name="navigation" value="reset">
					<House />
				</button>
			{/if}

			<button type="submit" id="prev" class="join-item btn" name="navigation" value="prev" disabled={currentPage <= 1}> « </button>
			<button type="button" class="join-item btn cursor-default">Pagina {currentPage}</button>
			<button type="submit" id="next" class="join-item btn" name="navigation" value="next" disabled={tableList.length < itemsPerPage}>» </button>

			<input type="hidden" name="itemsPerPage" value={itemsPerPage} />
			<input type="hidden" name="currentPage" value={currentPage} />

			<input type="hidden" name="category" value={category} />
		</form>
	</div>
</div>

{#if currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
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
			<section class="col-span-4">
				<label for="sku" class="form-label">
					<p class="font-bold mb-2">SKU</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<input
						class="input input-bordered join-item w-full"
						id="sku"
						name="sku"
						type="text"
						placeholder="SKU"
						aria-label="Sku"
						aria-describedby="basic-titolo"
						bind:value={sku}
						required
					/>
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
						<option value="Libri">Libri</option>
						<option value="Martelli">Martelli</option>
						<option value="Materiale didattico">Materiale didattico</option>
						<option value="Materiale formatori">Materiale formatori</option>
						<option value="Materiale riflessologi">Materiale riflessologi</option>
						<option value="Pettini">Pettini</option>
						<option value="Rulli">Rulli</option>
						<option value="Vietmassage">Vietmassage</option>
						<option value="Servizi">Servizi</option>
						<option value="Senza Categoria">Senza Categoria</option>
					</select>
				</div>
			</section>
			<!-- Sezione Prezzo Promo -->
			<section class="col-span-4 md:col-span-2">
				<label for="promoPrice" class="form-label">
					<p class="font-bold mb-2">Prezzo Promo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-amber-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="promoPrice"
						name="promoPrice"
						type="number"
						placeholder="Prezzo promo €"
						aria-label="promoPrice"
						bind:value={promoPrice}
						min="0"
						step="0.01"
					/>
				</div>
			</section>
			<section class="col-span-4 md:col-span-2">
				<label for="promoEndDate" class="form-label">
					<p class="font-bold mb-2">Scadenza Promo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-amber-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="promoEndDate"
						name="promoEndDate"
						type="date"
						aria-label="promoEndDate"
						bind:value={promoEndDate}
					/>
				</div>
			</section>
			<section class="col-span-4 md:col-span-2">
				<label for="promoStatus" class="form-label">
					<p class="font-bold mb-2">Stato Promo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-amber-300 px-3"><Calculator /></button>
					<select class="select select-bordered w-full rounded-md rounded-l-none" id="promoStatus" name="promoStatus" bind:value={promoStatus}>
						<option value="disabled">Disattivata</option>
						<option value="enabled">Attiva</option>
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
	</Modal>
{/if}

{#if currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModify}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<form
			action={postAction}
			method="POST"
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			use:enhance={formSubmit}
		>
			<input type="hidden" name="prodId" value={prodId} />

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
			<section class="col-span-4">
				<label for="sku" class="form-label">
					<p class="font-bold mb-2">SKU</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<input
						class="input input-bordered join-item w-full"
						id="sku"
						name="sku"
						type="text"
						placeholder="SKU"
						aria-label="Sku"
						aria-describedby="basic-titolo"
						bind:value={sku}
						required
					/>
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
						<option value="Libri">Libri</option>
						<option value="Martelli">Martelli</option>
						<option value="Materiale didattico">Materiale didattico</option>
						<option value="Materiale formatori">Materiale formatori</option>
						<option value="Materiale riflessologi">Materiale riflessologi</option>
						<option value="Pettini">Pettini</option>
						<option value="Rulli">Rulli</option>
						<option value="Vietmassage">Vietmassage</option>
						<option value="Servizi">Servizi</option>
						<option value="Senza Categoria">Senza Categoria</option>
					</select>
				</div>
			</section>

			<!-- Sezione Prezzo Promo -->
			<section class="col-span-4 md:col-span-2">
				<label for="promoPrice" class="form-label">
					<p class="font-bold mb-2">Prezzo Promo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-amber-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="promoPrice"
						name="promoPrice"
						type="number"
						placeholder="Prezzo promo €"
						aria-label="promoPrice"
						bind:value={promoPrice}
						min="0"
						step="0.01"
					/>
				</div>
			</section>
			<section class="col-span-4 md:col-span-2">
				<label for="promoEndDate" class="form-label">
					<p class="font-bold mb-2">Scadenza Promo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-amber-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="promoEndDate"
						name="promoEndDate"
						type="date"
						aria-label="promoEndDate"
						bind:value={promoEndDate}
					/>
				</div>
			</section>
			<section class="col-span-4 md:col-span-2">
				<label for="promoStatus" class="form-label">
					<p class="font-bold mb-2">Stato Promo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-amber-300 px-3"><Calculator /></button>
					<select class="select select-bordered w-full rounded-md rounded-l-none" id="promoStatus" name="promoStatus" bind:value={promoStatus}>
						<option value="disabled">Disattivata</option>
						<option value="enabled">Attiva</option>
					</select>
				</div>
			</section>

			<section class="lg:col-span-4 mt-2">
				<div class="col-span-4 mt-10 flex justify-center">
					<button class="btn btn-error mx-1" type="button" onclick={onCloseModify}>Annulla</button>
					<button class="btn btn-success mx-1" type="submit">
						<span class="flex items-center justify-center">CONFERMA MODIFICA</span>
					</button>
				</div>
			</section>
		</form>
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
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
				<header class="col-span-4 text-center text-2xl font-bold text-green-800">Conferma rimozione</header>
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

{#if currentModal == 'deletePic'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
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
				<input type="hidden" name="fileName" value={imgCheck.fileName(uploadfiles, 'product-primary')} />
				<header class="col-span-4 text-center text-2xl font-bold text-green-800">Conferma rimozione immagine del prodotto: {title}?</header>
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
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
			<fieldset class="fieldset space-y-4">
				<!-- <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Titolo</label> -->
				<legend class="fieldset-legend">ID</legend>
				<input class="input input-bordered w-full" id="prodId" name="prodId" type="text" placeholder="ID" bind:value={prodId} />
				<legend class="fieldset-legend">Titolo</legend>
				<input class="input input-bordered w-full" id="title" name="title" type="text" placeholder="Titolo" bind:value={title} />
				<legend class="fieldset-legend">SKU</legend>
				<input class="input input-bordered w-full" id="sku" name="sku" type="text" placeholder="SKU" bind:value={sku} />

				<legend class="fieldset-legend">Categoria</legend>
				<select class="select w-full" id="category" name="category" bind:value={category}>
					<option disabled value="">Scegli</option>
					<option value="Alimentazione & Benessere">Alimentazione & Benessere</option>
					<option value="Altri attrezzi e Accessori">Altri attrezzi e Accessori</option>
					<option value="Cercapunti">Cercapunti</option>
					<option value="Creme & Co.">Creme & Co.</option>
					<option value="Libri">Libri</option>
					<option value="Martelli">Martelli</option>
					<option value="Materiale didattico">Materiale didattico</option>
					<option value="Materiale formatori">Materiale formatori</option>
					<option value="Materiale riflessologi">Materiale riflessologi</option>
					<option value="Pettini">Pettini</option>
					<option value="Rulli">Rulli</option>
					<option value="Vietmassage">Vietmassage</option>
					<option value="Servizi">Servizi</option>
					<option value="Senza Categoria">Senza Categoria</option>
				</select>

				<legend class="fieldset-legend">Status</legend>
				<select class="select w-full" id="status" name="status" bind:value={status}>
					<option value="enabled">Attivo</option>
					<option value="disabled">Inattivo</option>
				</select>

				<legend class="fieldset-legend">Promozione</legend>
				<select class="select w-full" id="promoStatus" name="promoStatus" bind:value={promoStatus}>
					<option value="">Tutte</option>
					<option value="enabled">Promo</option>
					<option value="disabled">Senza promo</option>
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
	</Modal>
{/if}

{#if currentModal == 'uploadCsv'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
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
					<input type="file" id="fileUpload" name="fileUpload" accept=".csv, text/csv" class="file-input" />
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}>Annulla</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Carica</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}
