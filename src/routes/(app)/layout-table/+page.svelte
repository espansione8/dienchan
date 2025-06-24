<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Image } from '@unpic/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Papa from 'papaparse';
	import Loader from '$lib/components/Loader.svelte';
	import { notification } from '$lib/stores/notifications';
	import DragDrop from '$lib/components/DragDrop.svelte';
	import {
		CopyPlus,
		Settings,
		Trash2,
		FileDown,
		Pen,
		StretchHorizontal,
		ToggleLeft,
		ToggleRight,
		FileBox,
		Calculator,
		RefreshCcw,
		XCircle,
		Funnel
	} from 'lucide-svelte';

	const { data } = $props();
	const { getTable, getProducts } = $derived(data);
	let tableList = $state(getTable);

	let layoutId = $state('');
	let status = $state('');
	let title = $state('');
	let descr = $state('');
	let price = $state(0);
	let bundleProducts = $state([]);
	let singleProduct = $state('');
	let resetActive = $state(false);
	let currentModal = $state('');
	let openModal = $state(false);
	let postAction = $state('');
	let modalTitle = $state('');
	let deleteId = $state('');
	let loading = $state(false);

	const getFileNameFromPath = (filePath: string): string => filePath.split('/').pop() || '';

	const addItem = (item: any, type: string) => {
		if (type === 'bundleKit') {
			console.log('singleProduct.prodId', singleProduct.prodId);

			if (singleProduct != '') {
				const exists = bundleProducts.some((item) => item.prodId === singleProduct.prodId);
				console.log('exists', exists);

				// if (!bundleProducts.includes(item)) {
				if (!exists) {
					bundleProducts.push(item);
					singleProduct = '';
				} else {
					notification.error('Prodotto già inserito');
				}
			} else {
				notification.error('Prodotto NON valido');
			}
		}
		singleProduct = '';
	};

	const removeItem = (index: number, type: string) => {
		if (index !== -1) {
			if (type == 'bundleKit') bundleProducts.splice(index, 1);
		}
	};

	const resetFields = () => {
		title = '';
		descr = '';
		status = '';
		price = 0;
		bundleProducts = [];
	};

	const refresh = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getTable;
		notification.info('Pagina ricaricata');
	};

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
			// birthdate: obj.birthdate?.substring(0, 10)
		}));

		newList.forEach((obj: any) => {
			delete obj.__v;
			delete obj.updatedAt;
		});
		//console.log('newList user', newList);

		//CSV UNPARSE
		csv = Papa.unparse(newList, {
			quotes: false,
			quoteChar: '"',
			escapeChar: '"',
			delimiter: ';',
			header: true,
			skipEmptyLines: false
		});

		//DOWNLOAD file
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `TableExport_Layouts.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};

	const onClickModal = (type: string, item: any) => {
		resetFields();
		currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo';
		}
		if (type == 'modify') {
			postAction = `?/modify`;
			modalTitle = 'Modifica';
			layoutId = item.layoutId;
			title = item.title;
			descr = item.descr;
			layoutId = item.layoutId;
			price = item.price;
			bundleProducts = item.bundleProducts || [];
			//console.log('bundleProducts', bundleProducts);
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			deleteId = item.layoutId;
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtra';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
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

{#if !getTable}
	<Loader />
{:else}
	<div class="overflow-x-auto mt-5 px-4 mb-5">
		<div class="flex flex-col gap-4 mb-4">
			<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista modelli</h1>
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
				<button
					class="btn btn-info rounded-md text-white"
					onclick={() => onClickModal('new', null)}
				>
					<CopyPlus /> Nuovo
				</button>
				<button class="btn btn-info text-white w-full sm:w-auto" onclick={() => csvCreate()}>
					<FileDown />CSV
				</button>
			</div>
		</div>

		<table class="table mt-5 border-2">
			<!-- head -->
			<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
				<tr>
					<th>Status</th>
					<th>Foto</th>
					<th>Titolo</th>
					<th>Descrizione</th>
					<!-- <th>Colore tema</th> -->
					<th>Prezzo</th>
					<th>Azione</th>
				</tr>
			</thead>
			<!-- body -->
			<tbody class="">
				<!-- row 1 -->
				{#each tableList as row}
					<tr class="hover:bg-gray-100">
						<!-- status -->
						<td class="">
							<form method="POST" action="?/changeStatus" use:enhance={formSubmit}>
								<div>
									<input type="hidden" name="layoutId" value={row.layoutId} />
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
								</div>
							</form>
						</td>
						<!-- picture -->
						<td>
							{#if row.urlPic}
								<!-- <Image
	layout="constrained"
	aspectRatio={1} class="w-3xs" src={row.urlPic} alt={row.urlPic} /> -->
								<div class="card-body p-4">
									<div class="flex items-center">
										<figure class="flex-shrink-0">
											<Image
												layout="constrained"
												aspectRatio={1}
												src={row.urlPic}
												alt={row.urlPic}
												class="object-cover rounded-md max-w-36 max-h-36 h-auto"
											/>
										</figure>
										<form
											method="POST"
											action={`?/delProdPic`}
											use:enhance={formSubmit}
											class="ml-4 flex-shrink-0"
										>
											<input type="hidden" name="layoutId" value={row.layoutId} />
											<input
												type="hidden"
												name="fileName"
												value={getFileNameFromPath(row.urlPic)}
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
								<!-- <Image
	layout="constrained"
	aspectRatio={1} class="w-3xs" src="/images/no_img.jpg" alt="no pic" /> -->
								<form
									action={`?/setProdPic`}
									method="POST"
									enctype="multipart/form-data"
									use:enhance={formSubmit}
									class="card-body max-w-48"
								>
									<input type="hidden" name="layoutId" value={row.layoutId} />
									<DragDrop />
									<button class="btn btn-sm btn-info rounded-lg border-2" type="submit">
										Aggiungi foto
									</button>
								</form>
							{/if}
						</td>

						<!-- title -->
						<td>{row.title}</td>
						<!-- descr -->
						<td>{row.descr}</td>
						<!-- Color -->
						<!-- <td>{row.bgColor}</td> -->
						<!-- Prezzo -->
						<td>{row.price}</td>
						<!-- Azione -->
						<td class="flex items-center space-x-4">
							<button
								onclick={() => onClickModal('modify', row)}
								class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800"
								><Settings />
							</button>
							<button class="btn btn-error btn-sm" onclick={() => onClickModal('delete', row)}
								><Trash2 /></button
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

{#if currentModal == 'new' || currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-4xl">
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
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
					>
					</textarea>
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
					>
					</textarea>
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

			<!-- <section class="col-span-4">
					<label for="bundleProducts" class="form-label">
						<p class="font-bold mb-2">Correlati</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="correlati"
							name="bundleProducts"
							placeholder="Correlati"
							bind:value={bundleProducts}
						/>
					</div>
				</section> -->

			<section class="col-span-4 md:col-span-2">
				<label for="bundle" class="form-label">
					<p class="font-bold mb-2">Prodotti Kit corso</p>
				</label>
				<div class="join join-horizontal rounded-md w-full mb-2">
					<button class="join-item bg-gray-300 px-3"><FileBox /></button>
					<!-- <input type="hidden" bind:value={bundleProducts} /> -->
					<input type="hidden" name="bundleProducts" value={JSON.stringify(bundleProducts)} />
					<select
						class="select select-bordered w-full rounded-md rounded-l-none"
						id="bundle"
						name="bundle"
						bind:value={singleProduct}
					>
						<option disabled value="">Scegli</option>
						{#each getProducts as prod}
							<option value={prod}>
								{prod.title}
							</option>
						{/each}
					</select>
					<button
						type="button"
						class="join-item btn btn-primary"
						onclick={() => addItem(singleProduct, 'bundleKit')}
					>
						Aggiungi
					</button>
				</div>

				{#if bundleProducts.length > 0}
					{#each bundleProducts as prod, i}
						<div class="btn btn-primary btn-sm m-1 rounded-md">
							{prod.title}
							<button
								type="button"
								class="badge badge-error ml-2"
								onclick={() => removeItem(i, 'bundleKit')}
							>
								X
							</button>
						</div>
					{/each}
				{/if}
			</section>
			<!-- Action -->
			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}>
						Annulla
					</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">
						{#if currentModal == 'new'}
							Registra
						{:else if currentModal == 'modify'}
							Modifica
						{/if}
					</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-2xl">
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		{#if loading}
			<Loader />
		{/if}
		<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
			<p class="text-red-500 font-bold">Attenzione: questa azione non può essere annullata!</p>
			<p class="font-semibold">Tutti i corsi associati saranno disattivati.</p>
			<p class="font-semibold">Disattivando il modello invece manterrà i corsi attivi.</p>
			<input type="hidden" name="layoutId" value={deleteId} />
			<div class="flex justify-center space-x-10 my-4">
				<button type="button" class="btn btn-error btn-md" onclick={onCloseModal}>Annulla</button>
				<button type="submit" class="btn btn-success btn-md text-white"><Trash2 />Rimuovi</button>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		{#if loading}
			<Loader />
		{/if}
		<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
					<select
						id="status"
						name="status"
						bind:value={status}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="enabled">attivo</option>
						<option value="disabled">inattivo</option>
					</select>
				</div>

				<!-- <div>
					<label for="layoutId" class="block text-sm font-medium text-gray-700 mb-1"
						>Tipo Corso</label
					>
					<select
						id="layoutId"
						name="layoutId"
						bind:value={layoutId}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli un corso</option>
						{#each getTable as option}
							<option value={option.layoutId}>{option.title}</option>
						{/each}
					</select>
				</div> -->

				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
					<input
						type="text"
						id="title"
						name="title"
						bind:value={title}
						placeholder="titolo"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div>
					<label for="descr" class="block text-sm font-medium text-gray-700 mb-1">Descrizione</label
					>
					<input
						type="text"
						id="descr"
						name="descr"
						bind:value={descr}
						placeholder="Descrizione"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<!-- <div>
					<label for="price" class="block text-sm font-medium text-gray-700 mb-1">Prezzo</label>
					<input
						type="number"
						id="price"
						name="price"
						bind:value={price}
						placeholder="Prezzo"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div> -->
			</div>

			<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
				<button type="button" class="btn btn-error btn-sm hover:bg-red-300" onclick={onCloseModal}>
					Annulla
				</button>
				<button type="submit" class="btn btn-success btn-sm hover:bg-green-400"> Filtra </button>
			</div>
		</form>
	</Modal>
{/if}
