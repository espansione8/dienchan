<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import Papa from 'papaparse';
	import Notification from '$lib/components/Notification.svelte';
	import {
		CopyPlus,
		Settings,
		Trash2,
		FileDown,
		Pen,
		StretchHorizontal,
		ImagePlus,
		Calculator,
		RefreshCcw,
		XCircle,
		Funnel
	} from 'lucide-svelte';

	let { data, form } = $props();
	let { getTable } = $derived(data);
	let tableList = $state(getTable);

	let layoutId = $state('');
	let status = $state('');
	let title = $state('');
	let descr = $state('');
	let urlPic = $state('');
	let price = $state(0);
	let bundleProduct = $state([]);
	let resetActive = $state(false);
	let currentModal = $state('');
	let openModal = $state(false);
	let postAction = $state('');
	let modalTitle = $state('');
	let deleteId = $state('');

	const changeStatus = (event: any) => {
		if (event.target.form) {
			event.preventDefault();
			event.target.form.requestSubmit();
		}
	};

	const onFilterReset = () => {
		invalidateAll();
		resetActive = false;
		title = '';
		descr = '';
		urlPic = '';
		price = 0;
		tableList = getTable;
		tableList = getTable;
		form = null;
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
			urlPic = item.urlPic;
			layoutId = item.layoutId;
			price = item.price;
			bundleProduct = item.bundleProduct;
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
		onFilterReset();
		currentModal = '';
		//invalidateAll();
	};

	$effect(() => {
		// console.log({ form });

		if (form != null) {
			async () => await invalidateAll();
			const { action, success, message, filterTableList } = form;
			if (success) {
				onFilterReset();
				currentModal = '';
				openModal = false;
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
			clearTimeout(startTimeout);
			closeNotification();
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
						<form method="POST" action="?/changeStatus" use:enhance>
							<div>
								<input type="hidden" name="layoutId" value={row.layoutId} />
								<input type="hidden" name="status" value={row.status} />
								<input
									type="checkbox"
									id="changeStatus"
									checked={row.status == 'enabled'}
									onchange={changeStatus}
									class="toggle toggle-success"
								/>
							</div>
						</form>
					</td>
					<!-- picture -->
					{#if row.urlPic}
						<td>
							<img class="w-3xs" src={row.urlPic} alt={row.urlPic} />
						</td>
					{:else}
						<td>
							<img class="w-3xs" src="/images/no_img.jpg" alt="no pic" />
						</td>
					{/if}

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

<Notification {toastClosed} {notificationContent} {notificationError} />

{#if currentModal == 'new' || currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-4xl">
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
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
			<!-- <section class="col-span-2 md:col-span-2">
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
		</section> -->
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
		<form method="POST" action={postAction} use:enhance class="">
			<input type="hidden" name="layoutId" value={deleteId} />
			<div class="flex justify-center space-x-10 mt-4">
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
