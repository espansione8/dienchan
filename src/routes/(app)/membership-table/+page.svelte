<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import Papa from 'papaparse';
	import {
		ListPlus,
		XCircle,
		Check,
		Filter,
		Pen,
		Calendar,
		Calculator,
		FileDown,
		RefreshCcw,
		Trash2,
		X
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
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

	let isChecked = $state(false);

	// OLD FETCH
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
	// 			resetFieldsModalFilter();
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

	const resetFieldsModalFilter = () => {
		openModal = false;
		prodId = null;
		status = '';
		title = '';
		descrShort = '';
		price = null;
		renewalLength = 365;
		modalTitle = '';
		postAction = '?/';
	};

	const onFilterReset = () => {
		invalidateAll();
		resetActive = false;
		tableList = getTable;
	};

	const onCloseModal = () => {
		openModal = false;
		resetFieldsModalFilter();
		currentModal = '';
		//invalidateAll();
	};

	const onClickModal = (type: string, item: any) => {
		currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo tipo Membership';
			//prodId = item.prodId;
			// title = '';
			// price = 0;
			// renewalLength = 365;
			// descrShort = '';
		}
		if (type == 'modify') {
			postAction = `?/modify`;
			modalTitle = 'Modifica Membership';
			prodId = item.prodId;
			title = item.title;
			price = item.price;
			renewalLength = item.renewalLength;
			descrShort = item.descrShort;
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina Membership';
			prodId = item.prodId;
			//console.log('deleteId', prodId);
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtri di Ricerca';
			// title = '';
			// status = '';
		}
	};

	const changeStatus = (event: any) => {
		if (event.target.form) {
			event.preventDefault();
			event.target.form.requestSubmit();
		}
	};

	$effect(() => {
		//console.log('form', form);
		if (form != null) {
			//console.log('form triggered');
			async () => await invalidateAll(); // MUST be async/await or tableList = getTable will trigger infinite loop
			const { action, success, message, filterTableList } = form;
			if (success) {
				//console.log('filterTableList effect', filterTableList);
				currentModal = '';
				if (filterTableList) {
					tableList = filterTableList;
				} else {
					tableList = getTable;
				}
			} else {
				notificationError = true;
			}
			resetFieldsModalFilter();
			clearTimeout(startTimeout);
			closeNotification();
			toastClosed = false;
			notificationContent = message;
			form = null; // reset form TESTING
		}
	}); // end effect

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
</script>

<svelte:head>
	<title>Lista Membership</title>
</svelte:head>

<div class="overflow-x-auto table-zebra mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista Membership</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={onFilterReset}>
				<RefreshCcw />
			</button>
			{#if resetActive}
				<button class="btn btn-error text-white w-full sm:w-auto" onclick={onFilterReset}>
					<XCircle /> Reset Filtro
				</button>
			{:else}
				<button
					class="btn btn-info text-white w-full sm:w-auto"
					onclick={() => onClickModal('filter', null)}
				>
					<Filter /> Filtra
				</button>
			{/if}
			<button
				class="btn btn-info text-white w-full sm:w-auto"
				onclick={() => onClickModal('new', null)}
			>
				<ListPlus />Nuovo
			</button>
			<button class="btn btn-info text-white w-full sm:w-auto">
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
								<input
									type="checkbox"
									id="setting"
									checked={row.status == 'enabled'}
									onchange={changeStatus}
									class="toggle toggle-success"
								/>
							</div>
						</form>
						<!-- <input
							type="checkbox"
							checked={row.status == 'enabled'}
							onclick={() => toggleVisibility(row.status, row.prodId)}
							class="toggle toggle-success"
						/> -->
					</td>
					<td>{row.title}</td>
					<td>{row.price} €</td>
					<td>{row.renewalLength} giorni</td>
					<td>{row.descrShort}</td>
					<td class="space-4">
						<button onclick={() => onClickModal('modify', row)} class="btn btn-sm">
							Modifica
						</button>
						<button onclick={() => onClickModal('delete', row)} class="btn btn-error btn-sm">
							<Trash2 />
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

{#if currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
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
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}>
						Annulla
					</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Registra </button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
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
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Modifica </button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
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
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
					<button type="submit" class="btn btn-error btn-sm mx-2 text-white"> Elimina </button>
				</div>
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
					<label for="membershipLevel" class="block text-sm font-medium text-gray-700 mb-1"
						>Nome</label
					>
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
				<button type="submit" class="btn btn-success btn-sm hover:bg-green-400">
					Applica Filtri
				</button>
			</div>
		</form>
	</Modal>
{/if}

<!-- <Modal isOpen={currentModal} header={modalTitle}>
	<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
		>✕</button
	>
	{#if currentModal == 'new'}
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
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}>
						Annulla
					</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Registra </button>
				</div>
			</div>
		</form>
	{/if}

	{#if currentModal == 'modify'}
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
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Modifica </button>
				</div>
			</div>
		</form>
	{/if}

	{#if currentModal == 'delete'}
		<form
			method="POST"
			action={postAction}
			use:enhance
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="prodId" value={prodId} />
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Conferma eliminazione
			</header>
			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
					<button type="submit" class="btn btn-error btn-sm mx-2 text-white"> Elimina </button>
				</div>
			</div>
		</form>
	{/if}

	{#if currentModal == 'filter'}
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

				<div>
					<label for="membershipLevel" class="block text-sm font-medium text-gray-700 mb-1"
						>Nome</label
					>
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
					<label for="price" class="block text-sm font-medium text-gray-700 mb-1">Prezzo</label>
					<input
						type="number"
						id="price"
						name="price"
						bind:value={price}
						placeholder="€"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div>
					<label for="renewalLengthF" class="block text-sm font-medium text-gray-700 mb-1"
						>Rinnovo</label
					>
					<input
						type="number"
						id="renewalLengthF"
						bind:value={renewalLength}
						placeholder="Giorni"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div> 
			</div>

			<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
				<button type="button" class="btn btn-error btn-sm hover:bg-red-300" onclick={onCloseModal}>
					Annulla
				</button>
				<button type="submit" class="btn btn-success btn-sm hover:bg-green-400">
					Applica Filtri
				</button>
			</div>
		</form>
	{/if}
</Modal> -->
