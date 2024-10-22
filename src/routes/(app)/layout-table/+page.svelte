<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { invalidateAll } from '$app/navigation';
	import {
		CopyPlus,
		Settings,
		Trash2,
		FileDown,
		Pen,
		StretchHorizontal,
		ImagePlus,
		Calculator,
		Palette,
		RefreshCcw,
		XCircle,
		Filter
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import Papa from 'papaparse';
	import Notification from '$lib/components/Notification.svelte';

	let { data, form } = $props();
	let { getTable, getLayout } = $derived(data);
	let tableList = $state(getTable);

	let layoutId = $state('');
	let title = $state('');
	let descr = $state('');
	let urlPic = $state('');
	let bgColor = $state('');
	let price = $state(0);
	let bundleProduct = $state([]);
	let isModalFilter = $state(false);
	let resetActive = $state(false);
	let currentDialog = $state('');
	let isModal = $state(false);
	let postAction = $state('');
	let modalTitle = $state('');
	let isModalConfirmDelete = $state(false);
	let deleteId = $state('');

	const onOpenFilter = () => {
		layoutId = '';
		postAction = `?/filterLayout`;
		isModalFilter = true;
	};

	const onCloseFilterSearch = () => {
		isModalFilter = false;
		onFilterReset();
	};

	const onFilterReset = () => {
		resetActive = false;
		tableList = getTable;
		invalidateAll();
	};

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
			createdAt: obj.createdAt?.substring(0, 10),
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

	const onClickDialog = (type: string, item: any) => {
		currentDialog = type;
		isModal = true;
		if (type == 'new') {
			postAction = `?/newLayout`;
			modalTitle = 'Nuovo Layout';
		}
		if (type == 'modify') {
			modalTitle = 'Modifica Layout';
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
			const { action, success, message, filterTableList } = form;
			if (success) {
				closeNotification();
				//resetFieldsModalFilter();
				isModal = false;
				isModalConfirmDelete = false;
				isModalFilter = false;
				tableList = getTable;
				if (action == 'filterLayout') {
					resetActive = true;
					tableList = filterTableList;
				} else {
					resetActive = false;
				}
			} else {
				notificationError = true;
			}
			toastClosed = false;
			notificationContent = message;
			form = null;
		}
	}); // end effect

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
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista modelli</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={onFilterReset}>
				<RefreshCcw />
			</button>
			{#if resetActive == true}
				<button class="btn btn-error rounded-md text-white" onclick={onFilterReset}>
					<XCircle class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button class="btn btn-info rounded-md text-white" onclick={onOpenFilter}>
					<Filter class="mt-1" /> Filtra
				</button>
			{/if}
			<button class="btn btn-info rounded-md text-white" onclick={() => onClickDialog('new', null)}>
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
				<th>Data inserimento</th>
				<th>Foto</th>
				<th>Titolo</th>
				<th>Descrizione</th>
				<th>Colore tema</th>
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
					<!-- picture -->
					<td>
						<img class="w-96" src={row.urlPic} alt={row.urlPic} />
					</td>
					<!-- title -->
					<td>{row.title}</td>
					<!-- descr -->
					<td>{row.descr}</td>
					<!-- Color -->
					<td>{row.bgColor}</td>
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
<Modal isOpen={isModal} header={modalTitle} cssClass="max-w-4xl">
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
		<!-- registra corso button -->
		<div class="col-span-4 mt-5 flex justify-center">
			<div class="bg-gray-50 flex justify-center">
				<button
					class="btn btn-error btn-sm mx-2"
					type="button"
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
</Modal>

<!-- Modal confirm delete -->
<Modal isOpen={isModalConfirmDelete} header="Conferma l'eliminazione?" cssClass="max-w-2xl">
	<form action="?/deleteLayout" method="POST" use:enhance>
		<input type="hidden" name="layoutId" value={deleteId} />
		<div class="flex justify-center space-x-10 mt-4">
			<button class="btn btn-error btn-md" type="button" onclick={onCloseConfirmDelete}
				>Annulla</button
			>
			<button class="btn btn-success btn-md text-white" type="submit"><Trash2 />Conferma</button>
		</div>
	</form>
</Modal>

<!-- Modal filter  -->
<Modal isOpen={isModalFilter} header="Filtri di Ricerca">
	<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">
		<div class="space-y-4">
			<!-- Tipo sconto -->
			<div>
				<label for="layoutId" class="block text-sm font-medium text-gray-700 mb-1">Tipo Corso</label>
				<select
					id="layoutId"
					name="layoutId"
					bind:value={layoutId}
					class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
				>
					<option value="">Scegli un corso</option>
					{#each getLayout as option}
						<option value={option.layoutId}>{option.title}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
			<button
				class="btn btn-error btn-sm hover:bg-red-300"
				onclick={onCloseFilterSearch}
				type="button"
			>
				Annulla
			</button>
			<button class="btn btn-success btn-sm hover:bg-green-400" type="submit">
				Applica Filtri
			</button>
		</div>
	</form>
</Modal>
