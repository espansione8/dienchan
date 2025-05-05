<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import Papa from 'papaparse';
	import Modal from '$lib/components/Modal.svelte';
	import {
		CopyPlus,
		Trash2,
		StretchHorizontal,
		Filter,
		Pen,
		Settings,
		Calculator,
		FileDown,
		EyeOff,
		Eye,
		RefreshCcw,
		XCircle
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let { getTable, getLayout } = $derived(data);
	let tableList = $state(getTable);

	let code = $state('');
	let typeDiscount = $state('');
	let value = $state(0);
	let userId = $state('');
	let prodId = $state('');
	let layoutId = $state('');
	let membershipLevel = $state('');
	let notes = $state('');
	let discountId = $state('');
	let selectedApplicability = $state('userId');
	let status = $state('');
	let selectedId = $state('');
	let isModalConfirmDelete = $state(false);
	let isModalFilter = $state(false);
	let deleteId = $state('');
	let currentDialog = $state('');
	let isModal = $state(false);
	let postAction = $state('');
	let resetActive = $state(false);
	let modalTitle = $state('');

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
		link.download = `TableExport_Discounts.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};

	const onOpenFilter = () => {
		status = '';
		selectedApplicability = '';
		code = '';
		postAction = `?/filterDiscount`;
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
		code = '';
		typeDiscount = '';
		value = 0;
		userId = '';
		prodId = '';
		layoutId = '';
		membershipLevel = '';
		notes = '';
		selectedApplicability = 'userId';
		tableList = getTable;
		form = null;
	};

	const onCloseConfirmDelete = () => {
		isModalConfirmDelete = false;
		resetFields();
	};

	const onClickDialog = (type: string, item: any) => {
		currentDialog = type;
		isModal = true;
		if (type == 'new') {
			code = '';
			value = 0;
			notes = '';
			typeDiscount = '';
			selectedId = '';
			selectedApplicability = 'userId';
			postAction = `?/newDiscount`;
			modalTitle = 'Nuovo Codice Sconto';
		}
		if (type == 'modify') {
			modalTitle = 'Modifica Codice Sconto';
			discountId = item.discountId;
			code = item.code;
			typeDiscount = item.type;
			value = item.value;
			selectedApplicability = item.selectedApplicability;
			selectedId = item[selectedApplicability];
			notes = item.notes;
			postAction = `?/modifyDiscount`;
		}
	};

	$effect(() => {
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
				if (action == 'filterDiscount') {
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
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista codici sconto</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={onFilterReset}>
				<RefreshCcw />
			</button>
			{#if resetActive}
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
				<th>Status</th>
				<th>Data inserimento</th>
				<th>ID Sconto</th>
				<th>Codice</th>
				<th>Tipologia</th>
				<th>Valore</th>
				<th>Tipo sconto</th>
				<th>ID tipo</th>
				<th>Azione</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row 1 -->
			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<td>
						<form method="POST" action={`?/disableDiscount`} use:enhance>
							<input type="hidden" name="discountId" value={row.discountId} />
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
					<td>{row.createdAt}</td>
					<td>{row.discountId}</td>
					<td>{row.code}</td>
					<td>{row.type}</td>
					<td>{row.value}</td>
					<td> {row.selectedApplicability}</td>
					<!-- <td> {row[selectedApplicability]}</td> -->
					<td> {row[row.selectedApplicability]}</td>
					<!-- Azione -->
					<td class="flex items-center space-x-4">
						<button
							onclick={() => onClickDialog('modify', row)}
							class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800"
							><Settings />
						</button>
						<button class="btn btn-error btn-sm" onclick={() => onOpenConfirmDelete(row.discountId)}
							><Trash2 /></button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

<!--Modal New and Modify  -->
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
						id="discountId"
						name="discountId"
						type="text"
						placeholder="discountId"
						aria-label="discountId"
						aria-describedby="basic-discountId"
						bind:value={discountId}
						readonly
					/>
				</div>
			</section>
		{/if}

		<section class="col-span-4">
			<label for="code" class="form-label">
				<p class="font-bold mb-2">Codice sconto</p>
			</label>

			<div class="join join-horizontal w-full">
				<button class="join-item bg-gray-300 px-3"><Pen /></button>
				<input
					class="input input-bordered join-item w-full"
					id="titolo"
					name="code"
					type="text"
					placeholder="Codice"
					aria-label="Titolo"
					aria-describedby="basic-titolo"
					bind:value={code}
					required
				/>
			</div>
		</section>

		<section class="col-span-2 md:col-span-2">
			<label for="type" class="form-label">
				<p class="font-bold mb-2">Tipologia</p>
			</label>
			<div class="join join-horizontal w-full">
				<button class="join-item bg-gray-300 px-3"><StretchHorizontal /></button>
				<select
					class="select select-bordered w-full rounded-md mt-2 rounded-l-none"
					id="categoria"
					name="type"
					aria-label="Categoria"
					aria-describedby="basic-categoria"
					bind:value={typeDiscount}
					required
				>
					<option disabled value="">Scegli</option>
					<option value="percent">Percentuale %</option>
					<option value="amount">Valore fisso €</option>
				</select>
			</div>
		</section>
		<!-- Value -->
		<section class="col-span-2 md:col-span-2">
			<label for="value" class="form-label">
				<p class="font-bold mb-2">Valore</p>
			</label>
			<div class="join join-horizontal w-full">
				<button class="join-item bg-gray-300 px-3"><Calculator /></button>
				<input
					class="input input-bordered join-item w-full"
					id="renewalLength"
					type="number"
					name="value"
					aria-label="value"
					aria-describedby="value"
					bind:value
					required
				/>
			</div>
		</section>

		<!-- Radio buttons and input text -->
		<section class="col-span-4">
			<label class="form-label">
				<p class="font-bold mb-2"><Filter /> Uso</p>
			</label>
			<div class="flex flex-wrap gap-4">
				<label class="flex items-center">
					<input
						type="radio"
						name="applicability"
						value="userId"
						class="radio radio-primary mr-2"
						bind:group={selectedApplicability}
					/>
					<span>User ID</span>
				</label>
				<label class="flex items-center">
					<input
						type="radio"
						name="applicability"
						value="membershipLevel"
						class="radio radio-primary mr-2"
						bind:group={selectedApplicability}
					/>
					<span>Membership level</span>
				</label>
				<label class="flex items-center">
					<input
						type="radio"
						name="applicability"
						value="prodId"
						class="radio radio-primary mr-2"
						bind:group={selectedApplicability}
					/>
					<span>Prodotto</span>
				</label>
				<label class="flex items-center">
					<input
						type="radio"
						name="applicability"
						value="layoutId"
						class="radio radio-primary mr-2"
						bind:group={selectedApplicability}
					/>
					<span>Tipo Corso</span>
				</label>
			</div>
			<div class="mt-4">
				{#if selectedApplicability == 'userId'}
					<input
						type="text"
						name="selectId"
						class="input input-bordered w-full"
						placeholder="Inserisci il valore corrispondente"
						bind:value={selectedId}
					/>
				{:else if selectedApplicability == 'membershipLevel'}
					<select
						name="selectId"
						bind:value={selectedId}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Seleziona il livello associato</option>
						<option value="Socio inattivo">Socio inattivo</option>
						<option value="Socio ordinario">Socio ordinario</option>
						<option value="Socio sostenitore">Socio sostenitore</option>
						<option value="Socio vitalizio">Socio vitalizio</option>
						<option value="Socio contributore">Socio contributore</option>
						<option value="Master Dien Chan">Master Dien Chan</option>
					</select>
				{:else if selectedApplicability == 'prodId'}
					<input
						type="text"
						name="selectId"
						class="input input-bordered w-full"
						placeholder="Inserisci il valore corrispondente"
						bind:value={selectedId}
					/>
				{:else if selectedApplicability == 'layoutId'}
					<select
						id="selectId"
						name="selectId"
						bind:value={selectedId}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli un tipo</option>
						{#each getLayout as option}
							<option value={option.layoutId}>{option.title}</option>
						{/each}
					</select>
				{/if}
			</div>
		</section>

		<!-- Note -->
		<section class="col-span-4">
			<label for="descrizione" class="form-label">
				<p class="font-bold mb-2">Note</p>
			</label>

			<div class="join join-horizontal rounded-md w-full">
				<button class="join-item bg-gray-300 px-3"><Pen /></button>
				<textarea
					class="textarea textarea-bordered h-24 join-item w-full"
					id="descrizione"
					name="notes"
					placeholder="Descrizione"
					aria-label="descrizione"
					aria-describedby="basic-descrizione"
					bind:value={notes}
				></textarea>
			</div>
		</section>
		<!-- button -->
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
</Modal>

<!-- Modal confirm delete -->
<Modal isOpen={isModalConfirmDelete} header="Conferma l'eliminazione?" cssClass="max-w-2xl">
	<form action="?/deleteDiscount" method="POST" use:enhance>
		<input type="hidden" name="discountId" value={deleteId} />
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
			<!-- Codice sconto -->
			<div>
				<label for="code" class="block text-sm font-medium text-gray-700 mb-1">Codice sconto</label>
				<input
					type="text"
					id="code"
					name="code"
					placeholder="Scrivi il codice"
					bind:value={code}
					class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
				/>
			</div>
			<!-- Tipo Sconto -->
			<div>
				<label for="selectedApplicability" class="block text-sm font-medium text-gray-700 mb-1"
					>Tipo Sconto</label
				>
				<select
					id="selectedApplicability"
					name="selectedApplicability"
					bind:value={selectedApplicability}
					class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
				>
					<option value="" disabled>Seleziona il tipo di sconto</option>
					<option value="userId">Utente</option>
					<option value="prodId">Prodotto</option>
					<option value="layoutId">Corso</option>
					<option value="membershipLevel">Associato</option>
				</select>
			</div>
			<!-- Status -->
			<div>
				<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
				<select
					id="status"
					name="status"
					bind:value={status}
					class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
				>
					<option value="" disabled>Seleziona lo status</option>
					<option value="enabled">Attivo</option>
					<option value="disabled">Inattivo</option>
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
