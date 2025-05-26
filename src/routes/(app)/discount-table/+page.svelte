<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { notification } from '$lib/stores/notifications.js';
	import Papa from 'papaparse';
	import Modal from '$lib/components/Modal.svelte';
	import {
		CopyPlus,
		Trash2,
		StretchHorizontal,
		Funnel,
		Pen,
		Settings,
		Calculator,
		FileDown,
		ToggleLeft,
		ToggleRight,
		RefreshCcw,
		XCircle
	} from 'lucide-svelte';
	import type { ActionResult } from '@sveltejs/kit';

	const { data } = $props();
	const { getDiscount, getLayout, getProduct } = $derived(data);
	let tableList = $state(getDiscount);

	// filter
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
	let deleteId = $state('');
	let isModal = $state(false);
	let resetActive = $state(false);

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

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

	const resetFields = () => {
		code = '';
		typeDiscount = '';
		value = 0;
		userId = '';
		prodId = '';
		layoutId = '';
		membershipLevel = '';
		notes = '';
		selectedApplicability = 'userId';
	};

	const refresh = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getDiscount;
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
			discountId = item.discountId;
			code = item.code;
			typeDiscount = item.type;
			value = item.value;
			selectedApplicability = item.selectedApplicability;
			selectedId = item[selectedApplicability];
			notes = item.notes;
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			discountId = item.discountId;
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
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { action, message, payload } = result.data; // { action, success, message, payload }
				if (action == 'filter') {
					resetActive = true;
					tableList = payload;
				} else {
					resetActive = false;
					tableList = getDiscount;
				}
				notification.success(message);
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
		};
	};
</script>

<svelte:head>
	<title>Tabella codici sconto</title>
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
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={csvCreate}>
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
						<form method="POST" action={`?/changeStatus`} use:enhance={formSubmit}>
							<input type="hidden" name="discountId" value={row.discountId} />
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

{#if currentModal == 'new'}
	<Modal isOpen={isModal} header={modalTitle} cssClass="max-w-4xl">
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance={formSubmit}
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
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
					<p class="font-bold mb-2"><Funnel /> Uso</p>
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
						<!-- <input
						type="text"
						name="selectId"
						class="input input-bordered w-full"
						placeholder="Inserisci il valore corrispondente"
						bind:value={selectedId}
					/> -->
						<select
							id="selectId"
							name="selectId"
							bind:value={selectedId}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli prodotto</option>
							{#each getProduct as option}
								<option value={option.prodId}>{option.title}</option>
							{/each}
						</select>
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
					<button class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>

					<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Registra </button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'modify'}
	<Modal isOpen={isModal} header={modalTitle} cssClass="max-w-4xl">
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance={formSubmit}
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
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
					<p class="font-bold mb-2"><Funnel /> Uso</p>
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
						<!-- <input
						type="text"
						name="selectId"
						class="input input-bordered w-full"
						placeholder="Inserisci il valore corrispondente"
						bind:value={selectedId}
					/> -->
						<select
							id="selectId"
							name="selectId"
							bind:value={selectedId}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli prodotto</option>
							{#each getProduct as option}
								<option value={option.prodId}>{option.title}</option>
							{/each}
						</select>
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
					<button class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>

					<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Modifica </button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-2xl">
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form method="POST" action={postAction} use:enhance={formSubmit}>
			<input type="hidden" name="discountId" value={discountId} />
			<div class="flex justify-center space-x-10 mt-4">
				<button class="btn btn-error btn-md" type="button" onclick={onCloseModal}>Annulla</button>
				<button class="btn btn-success btn-md text-white" type="submit"><Trash2 />Conferma</button>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
			<div class="space-y-4">
				<!-- Codice sconto -->
				<div>
					<label for="code" class="block text-sm font-medium text-gray-700 mb-1"
						>Codice sconto</label
					>
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
				<button class="btn btn-error btn-sm hover:bg-red-300" onclick={onCloseModal} type="button">
					Annulla
				</button>
				<button class="btn btn-success btn-sm hover:bg-green-400" type="submit">
					Applica Filtri
				</button>
			</div>
		</form>
	</Modal>
{/if}
