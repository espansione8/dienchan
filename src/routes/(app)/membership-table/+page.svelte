<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import Papa from 'papaparse';
	import { membershipKeysToDelete } from '$lib/stores/arrays';
	import {
		ListPlus,
		XCircle,
		Settings,
		Funnel,
		Pen,
		Calendar,
		Calculator,
		FileDown,
		RefreshCcw,
		Trash2,
		ShieldAlert,
		Eye,
		EyeOff
	} from 'lucide-svelte';

	let { data, form } = $props(); // pull data from server
	const { getTable } = $derived(data); // deconstruct data from server
	let tableList = $state(getTable);

	let prodId = $state(null);
	let status = $state('');
	let title = $state('');
	let descrShort = $state('');
	let price: number | null = $state(0);
	let renewalLength: number = $state(365);
	let resetActive = $state(false);

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

	// FRONTEND LEGACY FETCH
	// const onChangeStatus = async (prodId: string, status: string) => {
	// 	const data = {
	// 		prodId,
	// 		status
	// 	};
	// 	try {
	// 		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/products/setStatus`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json'
	// 			},
	// 			body: JSON.stringify(data)
	// 		});
	// 		const response = await res.json();
	// 		if (response.status == 200) {
	// 			invalidateAll();
	// 			clearTimeout(startTimeout);
	// 			openModal = false;
	// 			toastClosed = false;
	// 			notificationContent = 'status cambiato';
	// 			resetFields();
	// 			closeNotification();
	// 		} else {
	// 			toastClosed = false;
	// 			notificationContent = 'errore status';
	// 			notificationError = true;
	// 			closeNotification();
	// 		}
	// 	} catch (err) {
	// 		console.log('Error:', err);
	// 	}
	// };

	// CSV download
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
			birthdate: obj.birthdate?.substring(0, 10)
		}));
		newList.forEach((obj: any) => {
			$membershipKeysToDelete.forEach((key: string) => delete (obj as any)[key]);
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
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `Export_Membership_${new Date().toLocaleDateString()}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};

	const resetFields = () => {
		openModal = false;
		prodId = null;
		status = '';
		title = '';
		descrShort = '';
		price = null;
		renewalLength = 365;
		modalTitle = '';
		postAction = '?/';
		form = null;
	};

	const refresh = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getTable;
	};

	// MANUAL TRIGGER FORM SUBMIT
	// const changeStatus = (event: any) => {
	// 	if (event.target.form) {
	// 		event.preventDefault();
	// 		event.target.form.requestSubmit();
	// 	}
	// };

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
			price = item.price;
			renewalLength = item.renewalLength;
			descrShort = item.descrShort;
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			prodId = item.prodId;
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
			notificationContent = '';
			notificationError = false;
		}, 3000); // 1000 milliseconds = 1 second
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
	<title>Lista Membership</title>
</svelte:head>

<noscript>
	<h1 style="font-weight:700; text-align: center;">Please enable Javascript to continue.</h1>
	<style type="text/css">
		#main-content {
			display: none;
		}
	</style>
</noscript>

<div class="overflow-x-auto table-zebra mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista Membership</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={refresh}>
				<RefreshCcw />
			</button>
			{#if resetActive}
				<button class="btn btn-error text-white w-full sm:w-auto" onclick={refresh}>
					<XCircle /> Reset Filtro
				</button>
			{:else}
				<button
					class="btn btn-info text-white w-full sm:w-auto"
					onclick={() => onClickModal('filter', null)}
				>
					<Funnel /> Filtra
				</button>
			{/if}
			<button
				class="btn btn-info text-white w-full sm:w-auto"
				onclick={() => onClickModal('new', null)}
			>
				<ListPlus />Nuovo
			</button>
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={() => csvCreate()}>
				<FileDown />CSV
			</button>
		</div>
	</div>

	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr class="">
				<th>Status</th>
				<th>Titolo</th>
				<th>Prezzo</th>
				<th>Rinnovo</th>
				<th>Descrizione</th>
				<th>Azioni</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row -->
			{#if tableList.length == 0}
				<tr class="hover:bg-gray-300"><td> no data</td></tr>
			{/if}
			{#each tableList as row}
				<tr class="hover:bg-gray-300">
					<td class="">
						<form method="POST" action="?/changeStatus" use:enhance>
							<div>
								<input type="hidden" name="prodId" value={row.prodId} />
								<input type="hidden" name="status" value={row.status} />
								<span class="flex items-center">
									{#if row.status == 'enabled'}
										<button type="submit" class="btn btn-success btn-sm font-semibold"
											><Eye /></button
										>
									{:else}
										<button type="submit" class="btn btn-error btn-sm font-semibold"
											><EyeOff /></button
										>
									{/if}
								</span>
								<!-- <input
									type="checkbox"
									id="setting"
									checked={row.status == 'enabled'}
									onchange={changeStatus}
									class="toggle toggle-success"
								/> -->
							</div>
						</form>
					</td>
					<td>{row.title}</td>
					<td>{row.price} €</td>
					<td>{row.renewalLength} giorni</td>
					<td>{row.descrShort}</td>
					<td class="flex items-center space-x-4">
						<button onclick={() => onClickModal('modify', row)} class="btn btn-sm">
							<Settings />
						</button>
						<button onclick={() => onClickModal('delete', row)} class="btn btn-error btn-sm">
							<Trash2 />
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

{#if currentModal == 'new'}
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
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Nuovo membership
			</header>

			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Nome</p>
				</label>
				<div class="join join-horizontal w-full">
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
						placeholder="€"
						aria-label="price"
						aria-describedby="basic-price"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">Durata giorni</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calendar /></button>
					<input
						class="input input-bordered join-item w-full"
						id="renewalLength"
						type="number"
						name="renewalLength"
						aria-label="renewalLength"
						aria-describedby="renewalLength"
						min="1"
						max="36500"
						bind:value={renewalLength}
						required
					/>
				</div>
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">(max 36500 = 100 anni)</p>
				</label>
			</section>

			<section class="col-span-4">
				<div class="mt-6">
					<label for="descrShortN" class="form-label">
						<p class="font-bold mb-2">Descrizione (opzionale)</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShortN"
							name="descrShort"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={descrShort}
						></textarea>
					</div>
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}
						>Annulla</button
					>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Registra</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="prodId" value={prodId} />
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Modifica membership
			</header>

			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Nome</p>
				</label>
				<div class="join join-horizontal w-full">
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
						placeholder="€"
						aria-label="price"
						aria-describedby="basic-price"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">Durata giorni</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calendar /></button>
					<input
						class="input input-bordered join-item w-full"
						id="renewalLength"
						type="number"
						name="renewalLength"
						aria-label="renewalLength"
						aria-describedby="renewalLength"
						min="1"
						max="36500"
						bind:value={renewalLength}
						required
					/>
				</div>
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">(max 36500 = 100 anni)</p>
				</label>
			</section>

			<section class="col-span-4">
				<div class="mt-6">
					<label for="descrShort" class="form-label">
						<p class="font-bold mb-2">Descrizione (opzionale)</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShort"
							name="descrShort"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={descrShort}
						></textarea>
					</div>
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}>
						Annulla
					</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Modifica</button>
				</div>
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
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">
			<!-- <input type="hidden" name="prodId" value={prodId} /> -->
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
