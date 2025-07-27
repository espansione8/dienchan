<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Papa from 'papaparse';
	import { notification } from '$lib/stores/notifications';
	import Modal from '$lib/components/Modal.svelte';
	import Loader from '$lib/components/Loader.svelte';
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
		XCircle,
		Tags
	} from 'lucide-svelte';

	const { data } = $props();
	const { getDiscount, getLayout, getProduct } = $derived(data);
	let tableList = $state(getDiscount);

	// filter
	let code = $state('');
	let typeDiscount = $state('percent');
	let value = $state(0);
	let user = $state('');
	// let prodId = $state('');
	// let layoutId = $state('');
	// let membershipLevel = $state('');
	let notes = $state('');
	let discountId = $state('');
	let selectedApplicability = $state('email');
	//let discountType = $state('normal');
	let refDiscount = $state(0);
	let refPoints = $state(0);
	let selectedId = $state('');
	let resetActive = $state(false);

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');
	let loading = $state(false);

	const csvCreate = () => {
		//let csv = $state('');
		//let newList: any = $state();

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

		const newList = flattenedArray.map((obj: any) => ({
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
		const csv = Papa.unparse(newList, {
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
		typeDiscount = 'percent';
		value = 0;
		refDiscount = 0;
		refPoints = 0;
		user = '';
		selectedId = '';
		// prodId = '';
		// layoutId = '';
		// membershipLevel = '';
		notes = '';
		selectedApplicability = 'email';
	};

	const refresh = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getDiscount;
		notification.info('Pagina ricaricata');
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
			value = item.value || 0;
			refDiscount = item.refDiscount || 0;
			refPoints = item.refPoints || 0;
			user = item.user;
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
			loading = true;
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

{#if !getDiscount}
	<Loader />
{:else}
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
					<button class="btn btn-info rounded-md text-white" onclick={() => onClickModal('filter', null)}>
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
					<th>ID</th>
					<th>Codice</th>
					<th>Tipologia</th>
					<th>Valore</th>
					<th>Categoria</th>
					<th>Destinatario</th>
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
										<button type="submit" class="btn btn-ghost btn-sm font-semibold"><ToggleRight color="darkgreen" /> </button>
									{:else}
										<button type="submit" class="btn btn-ghost btn-sm font-semibold"><ToggleLeft color="darkred" /></button>
									{/if}
								</span>
							</form>
						</td>
						<td>{row.createdAt}</td>
						<td>{row.discountId}</td>
						<td>{row.code}</td>
						<td>{row.type}</td>
						<td>{row.type == 'referral' ? `${row.refDiscount}/${row.refPoints}` : row.value}</td>
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
							<button class="btn btn-error btn-sm" onclick={() => onClickModal('delete', row)}><Trash2 /></button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

{#if currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-2xl">
		<!-- <Modal isOpen={openModal} header={modalTitle} cssClass="max-w-4xl"> -->
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		<div class="p-6 bg-base-100/95 backdrop-blur-xl border border-base-content/10 relative">
			{#if loading}
				<Loader />
			{/if}
			{#if typeDiscount === 'percent' || typeDiscount === 'amount'}
				<form method="POST" action={postAction} use:enhance={formSubmit} class="grid grid-cols-2 bg-base-100 grid-rows-[min-content] gap-x-4 gap-y-4">
					<!-- 
				class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			 -->
					<section class="col-span-4">
						<label for="type" class="form-label">
							<p class="font-bold mb-2 label">Tipo di Sconto "{typeDiscount}"</p>
						</label>
						<div class="flex flex-wrap gap-4">
							<label class="flex items-center cursor-pointer">
								<input type="radio" name="type" value="percent" class="radio radio-primary mr-2" bind:group={typeDiscount} checked />
								<span>Sconto in Percentuale</span>
							</label>
							<label class="flex items-center cursor-pointer">
								<input type="radio" name="type" value="amount" class="radio radio-primary mr-2" bind:group={typeDiscount} checked />
								<span>Sconto valore fisso</span>
							</label>
							<label class="flex items-center cursor-pointer">
								<input type="radio" name="type" value="referral" class="radio radio-primary mr-2" bind:group={typeDiscount} />
								<span>Sconto + Punti</span>
							</label>
						</div>
					</section>
					<section class="col-span-4">
						<label for="titolo" class="form-label">
							<p class="font-bold mb-2 label">Codice sconto</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button type="button" class="join-item bg-primary/20 px-3">
								<Pen class="text-emerald-500" />
							</button>
							<input
								class="input input-bordered w-full"
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

					<section class="col-span-4 md:col-span-2">
						<label for="categoria" class="form-label">
							<p class="font-bold mb-2 label">Tipologia</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button type="button" class="join-item bg-primary/20 px-3">
								<StretchHorizontal class="text-emerald-500" />
							</button>
							<select
								class="select join-item w-full"
								id="categoria"
								name="type"
								aria-label="Categoria"
								aria-describedby="basic-categoria"
								bind:value={typeDiscount}
								required
							>
								<option disabled selected>Scegli</option>
								<option value="percent">Percentuale %</option>
								<option value="amount">Valore fisso €</option>
							</select>
						</div>
					</section>

					<section class="col-span-4 md:col-span-2">
						<label for="categoria" class="form-label">
							<p class="font-bold mb-2 label">Valore</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button type="button" class="join-item bg-primary/20 px-3"><Calculator class="text-emerald-500" /></button>
							<input class="input join-item w-full" id="value" type="number" name="value" aria-label="value" aria-describedby="value" required />
						</div>
					</section>

					<section class="col-span-4">
						<label for="categoria" class="form-label">
							<p class="font-bold mb-2 label">Categoria</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button type="button" class="join-item bg-primary/20 px-3">
								<Tags class="text-emerald-500" />
							</button>
							<select
								name="applicability"
								class="select select-bordered w-full max-w-xs"
								bind:value={selectedApplicability}
								onchange={() => (selectedId = '')}
							>
								<option value="" disabled selected>Seleziona una categoria</option>
								<option value="email">Sconto Esclusivo Personale</option>
								<!-- <option value="cart">Sconto totale Carrello</option> -->
								<option value="membershipLevel">Sconto per Membership</option>
								<option value="prodId"> Sconto Prodotto specifico</option>
								<option value="layoutId">Sconto per Tipo Corso</option>
							</select>
						</div>
						<div class="mt-2">
							{#if selectedApplicability === 'email'}
								<input type="text" name="selectId" class="input w-full input-bordered" placeholder="Inserisci EMAIL utente" bind:value={selectedId} />
								<!-- {:else if selectedApplicability === 'cart'}
								<input type="text" name="selectId" class="input w-full input-bordered" placeholder="Inserisci EMAIL utente" bind:value={selectedId} /> -->
							{:else if selectedApplicability === 'membershipLevel'}
								<select name="selectId" bind:value={selectedId} class="select w-full select-bordered">
									<option disabled value="">Seleziona il livello associato</option>
									<option value="Socio inattivo">Socio inattivo</option>
									<option value="Socio ordinario">Socio ordinario</option>
									<option value="Socio formatore">Socio formatore</option>
									<option value="Socio vitalizio">Socio vitalizio</option>
									<option value="Socio vitalizio formatore">Socio vitalizio formatore</option>
									<!-- <option value="Socio sostenitore">Socio sostenitore</option> -->
									<!-- <option value="Socio contributore">Socio contributore</option> -->
								</select>
							{:else if selectedApplicability === 'prodId'}
								<select id="selectId" name="selectId" bind:value={selectedId} class="select w-full select-bordered">
									<option value="">Scegli prodotto</option>
									{#each getProduct as option}
										<option value={option.prodId}>{option.title}</option>
									{/each}
								</select>
							{:else if selectedApplicability === 'layoutId'}
								<select id="selectId" name="selectId" bind:value={selectedId} class="select w-full select-bordered">
									<option value="">Scegli un tipo</option>
									{#each getLayout as option}
										<option value={option.layoutId}>{option.title}</option>
									{/each}
								</select>
							{/if}
						</div>
					</section>

					<section class="col-span-4">
						<label for="categoria" class="form-label">
							<p class="font-bold mb-2 label">Note</p>
						</label>
						<div class="join w-full">
							<div class="join-item btn pointer-events-none h-24">
								<Pen class="text-emerald-500" />
							</div>
							<textarea
								class="textarea join-item w-full"
								id="descrizione"
								name="notes"
								placeholder="Descrizione"
								aria-label="descrizione"
								aria-describedby="basic-descrizione"
								bind:value={notes}
							></textarea>
						</div>
					</section>

					<div class="col-span-4 mt-5 flex justify-center">
						<div class="bg-gray-50 flex justify-center">
							<button class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>

							<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Registra </button>
						</div>
					</div>
				</form>
			{:else if typeDiscount === 'referral'}
				<form method="POST" action={postAction} use:enhance={formSubmit} class="grid grid-cols-2 bg-base-100 grid-rows-[min-content] gap-x-4 gap-y-4">
					<!-- 
				class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			 -->
					<section class="col-span-4">
						<label for="type" class="form-label">
							<p class="font-bold mb-2 label">Tipo di Sconto "{typeDiscount}"</p>
						</label>
						<div class="flex flex-wrap gap-4">
							<label class="flex items-center cursor-pointer">
								<input type="radio" name="type" value="percent" class="radio radio-primary mr-2" bind:group={typeDiscount} checked />
								<span>Sconto Normale</span>
							</label>
							<label class="flex items-center cursor-pointer">
								<input type="radio" name="type" value="referral" class="radio radio-primary mr-2" bind:group={typeDiscount} />
								<span>Sconto + Punti</span>
							</label>
						</div>
					</section>
					<section class="col-span-4">
						<label for="titolo" class="form-label">
							<p class="font-bold mb-2 label">Codice sconto</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button type="button" class="join-item bg-primary/20 px-3">
								<Pen class="text-emerald-500" />
							</button>
							<input
								class="input input-bordered w-full"
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

					<section class="col-span-4 md:col-span-2">
						<label for="refDiscount" class="form-label">
							<p class="font-bold mb-2 label">Percentuale % sconto</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button type="button" class="join-item bg-primary/20 px-3"><Calculator class="text-emerald-500" /></button>
							<input
								class="input join-item w-full"
								id="refDiscount"
								type="number"
								name="refDiscount"
								aria-label="refDiscount"
								aria-describedby="refDiscount"
								required
							/>
						</div>
					</section>

					<section class="col-span-4 md:col-span-2">
						<label for="refPoints" class="form-label">
							<p class="font-bold mb-2 label">Percentuale % punti</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button type="button" class="join-item bg-primary/20 px-3"><Calculator class="text-emerald-500" /></button>
							<input
								class="input join-item w-full"
								id="refPoints"
								type="number"
								name="refPoints"
								aria-label="refPoints"
								aria-describedby="refPoints"
								required
							/>
						</div>
					</section>

					<section class="col-span-4">
						<label for="categoria" class="form-label">
							<p class="font-bold mb-2 label">Email utente</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button type="button" class="join-item bg-primary/20 px-3">
								<Tags class="text-emerald-500" />
							</button>
							<input
								type="text"
								name="selectId"
								class="input w-full input-bordered"
								placeholder="Inserisci EMAIL utente"
								bind:value={selectedId}
								required
							/>
						</div>
					</section>

					<section class="col-span-4">
						<label for="categoria" class="form-label">
							<p class="font-bold mb-2 label">Note</p>
						</label>
						<div class="join w-full">
							<div class="join-item btn pointer-events-none h-24">
								<Pen class="text-emerald-500" />
							</div>
							<textarea
								class="textarea join-item w-full"
								id="descrizione"
								name="notes"
								placeholder="Descrizione"
								aria-label="descrizione"
								aria-describedby="basic-descrizione"
								bind:value={notes}
							></textarea>
						</div>
					</section>
					<input type="hidden" name="applicability" value="referral" />

					<div class="col-span-4 mt-5 flex justify-center">
						<div class="bg-gray-50 flex justify-center">
							<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>

							<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Registra </button>
						</div>
					</div>
				</form>
			{/if}
		</div>
	</Modal>
{/if}

{#if currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-4xl">
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		{#if typeDiscount === 'percent' || typeDiscount === 'amount'}
			<form
				method="POST"
				action={postAction}
				use:enhance={formSubmit}
				class=" grid grid-cols-4 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
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

				<fieldset class="fieldset col-span-4">
					<legend class="fieldset-legend">Codice sconto</legend>
					<!-- <span class="label">Optional</span> -->
					<div class="join w-full">
						<div class="join-item btn pointer-events-none"><Pen /></div>
						<input
							class="input join-item flex-1"
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
				</fieldset>

				<fieldset class="fieldset col-span-4 md:col-span-2">
					<legend class="fieldset-legend">Tipologia</legend>
					<!-- <span class="label">Optional</span> -->
					<div class="join w-full">
						<div class="join-item btn pointer-events-none"><StretchHorizontal /></div>
						<select
							class="select join-item flex-1"
							id="categoria"
							name="type"
							aria-label="Categoria"
							aria-describedby="basic-categoria"
							bind:value={typeDiscount}
							required
						>
							<option disabled selected>Scegli</option>
							<option value="percent">Percentuale %</option>
							<option value="amount">Valore fisso €</option>
						</select>
					</div>
				</fieldset>

				<fieldset class="fieldset col-span-4 md:col-span-2">
					<legend class="fieldset-legend">Valore</legend>
					<!-- <span class="label">Optional</span> -->
					<div class="join w-full">
						<div class="join-item btn pointer-events-none"><Calculator /></div>
						<input
							class="input join-item flex-1"
							id="value"
							type="number"
							name="value"
							aria-label="value"
							aria-describedby="value"
							bind:value
							required
						/>
					</div>
				</fieldset>

				<fieldset class="fieldset col-span-4">
					<!-- <div class="flex flex-col sm:flex-row sm:flex-wrap gap-4">
						<label class="form-label">
							<p class="font-bold mb-2"><Funnel /> Categoria</p>
						</label>
						<label class="flex items-center">
							<input type="radio" name="applicability" value="email" class="radio radio-primary mr-2" bind:group={selectedApplicability} />
							<span>Email utente</span>
						</label>
						<label class="flex items-center">
							<input type="radio" name="applicability" value="membershipLevel" class="radio radio-primary mr-2" bind:group={selectedApplicability} />
							<span>Membership</span>
						</label>
						<label class="flex items-center">
							<input type="radio" name="applicability" value="prodId" class="radio radio-primary mr-2" bind:group={selectedApplicability} />
							<span>Prodotto</span>
						</label>
						<label class="flex items-center">
							<input type="radio" name="applicability" value="layoutId" class="radio radio-primary mr-2" bind:group={selectedApplicability} />
							<span>Tipo Corso</span>
						</label>
					</div> -->
					<label for="categoria" class="form-label">
						<p class="font-bold mb-2 label">Categoria</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button type="button" class="join-item bg-primary/20 px-3">
							<Tags class="text-emerald-500" />
						</button>
						<select
							name="applicability"
							class="select select-bordered w-full max-w-xs"
							bind:value={selectedApplicability}
							onchange={() => (selectedId = '')}
						>
							<option value="" disabled selected>Seleziona una categoria</option>
							<option value="email">Sconto Esclusivo Personale</option>
							<!-- <option value="cart">Sconto totale Carrello</option> -->
							<option value="membershipLevel">Sconto per Membership</option>
							<option value="prodId"> Sconto Prodotto specifico</option>
							<option value="layoutId">Sconto per Tipo Corso</option>
						</select>
					</div>
					<div class="mt-2">
						{#if selectedApplicability == 'email'}
							<input type="text" name="email" class="input w-full" placeholder="Inserisci EMAIL utente" bind:value={selectedId} />
							<!-- <input
								type="text"
								name="selectId"
								class="input input-bordered w-full"
								placeholder="Inserisci il valore corrispondente"
								bind:value={selectedId}
							/> -->
						{:else if selectedApplicability == 'membershipLevel'}
							<select name="selectId" bind:value={selectedId} class="select w-full">
								<option disabled value="">Seleziona il livello associato</option>
								<option value="Socio inattivo">Socio inattivo</option>
								<option value="Socio ordinario">Socio ordinario</option>
								<option value="Socio formatore">Socio formatore</option>
								<option value="Socio vitalizio">Socio vitalizio</option>
								<option value="Socio vitalizio formatore">Socio vitalizio formatore</option>
							</select>
						{:else if selectedApplicability == 'prodId'}
							<select id="selectId" name="selectId" bind:value={selectedId} class="select w-full">
								<option value="">Scegli prodotto</option>
								{#each getProduct as option}
									<option value={option.prodId}>{option.title}</option>
								{/each}
							</select>
						{:else if selectedApplicability == 'layoutId'}
							<select id="selectId" name="selectId" bind:value={selectedId} class="select w-full">
								<option value="">Scegli un tipo</option>
								{#each getLayout as option}
									<option value={option.layoutId}>{option.title}</option>
								{/each}
							</select>
						{/if}
					</div>
				</fieldset>

				<fieldset class="col-span-4">
					<legend class="fieldset-legend">note</legend>
					<!-- <label for="descrizione" class="form-label">
						<p class="font-bold mb-2">Note</p>
					</label> -->
					<div class="join w-full">
						<div class="join-item btn pointer-events-none h-24"><Pen /></div>
						<textarea
							class="textarea join-item w-full"
							id="descrizione"
							name="notes"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={notes}
						></textarea>
					</div>
				</fieldset>

				<div class="col-span-4 mt-5 flex justify-center">
					<div class="bg-gray-50 flex justify-center">
						<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>

						<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Modifica </button>
					</div>
				</div>
			</form>
		{:else if typeDiscount === 'referral'}
			<form method="POST" action={postAction} use:enhance={formSubmit} class="grid grid-cols-4 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8">
				<!-- 
				class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			 -->
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
					<label for="type" class="form-label">
						<p class="font-bold mb-2">Tipo di Sconto: {typeDiscount}</p>
					</label>
				</section>
				<section class="col-span-4">
					<label for="titolo" class="form-label">
						<p class="font-bold mb-2 label">Codice sconto</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button type="button" class="join-item bg-primary/20 px-3">
							<Pen class="text-emerald-500" />
						</button>
						<input
							class="input input-bordered w-full"
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

				<section class="col-span-4 md:col-span-2">
					<label for="categoria" class="form-label">
						<p class="font-bold mb-2 label">Percentuale % sconto</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button type="button" class="join-item bg-primary/20 px-3"><Calculator class="text-emerald-500" /></button>
						<input
							class="input join-item w-full"
							id="refDiscount"
							type="number"
							name="refDiscount"
							aria-label="refDiscount"
							aria-describedby="refDiscount"
							bind:value={refDiscount}
							required
						/>
					</div>
				</section>

				<section class="col-span-4 md:col-span-2">
					<label for="categoria" class="form-label">
						<p class="font-bold mb-2 label">Percentuale % punti</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button type="button" class="join-item bg-primary/20 px-3"><Calculator class="text-emerald-500" /></button>
						<input
							class="input join-item w-full"
							id="refPoints"
							type="number"
							name="refPoints"
							aria-label="refPoints"
							aria-describedby="refPoints"
							bind:value={refPoints}
							required
						/>
					</div>
				</section>

				<section class="col-span-4">
					<label for="categoria" class="form-label">
						<p class="font-bold mb-2 label">Email riflessologo</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button type="button" class="join-item bg-primary/20 px-3">
							<Tags class="text-emerald-500" />
						</button>
						<input
							type="text"
							name="selectId"
							class="input w-full input-bordered"
							placeholder="Inserisci EMAIL utente"
							bind:value={selectedId}
							required
						/>
					</div>
				</section>

				<section class="col-span-4">
					<label for="categoria" class="form-label">
						<p class="font-bold mb-2 label">Note</p>
					</label>
					<div class="join w-full">
						<div class="join-item btn pointer-events-none h-24">
							<Pen class="text-emerald-500" />
						</div>
						<textarea
							class="textarea join-item w-full"
							id="descrizione"
							name="notes"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={notes}
						></textarea>
					</div>
				</section>
				<input type="hidden" name="applicability" value={selectedApplicability} />
				<input type="hidden" name="type" value={typeDiscount} />

				<div class="col-span-4 mt-5 flex justify-center">
					<div class="bg-gray-50 flex justify-center">
						<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>

						<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Registra </button>
					</div>
				</div>
			</form>
		{/if}
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-2xl">
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<form method="POST" action={postAction} use:enhance={formSubmit}>
			<input type="hidden" name="discountId" value={discountId} />
			<div class="flex justify-center space-x-10 my-4">
				<button class="btn btn-error btn-md" type="button" onclick={onCloseModal}>Annulla</button>
				<button class="btn btn-success btn-md text-white" type="submit"><Trash2 />Conferma</button>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<form method="POST" action={postAction} use:enhance={formSubmit} class="grid grid-cols-1 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8">
			<fieldset class="fieldset col-span-1">
				<legend class="fieldset-legend">Codice sconto</legend>
				<!-- <span class="label">Optional</span> -->
				<div class="join w-full">
					<div class="join-item btn pointer-events-none"><Pen /></div>
					<input class="input join-item flex-1" name="code" type="text" placeholder="Codice" aria-label="Titolo" aria-describedby="basic-titolo" />
				</div>
			</fieldset>

			<fieldset class="fieldset col-span-1">
				<legend class="fieldset-legend">Tipo Sconto</legend>
				<!-- <span class="label">Optional</span> -->
				<div class="join w-full">
					<div class="join-item btn pointer-events-none"><StretchHorizontal /></div>
					<select name="selectedApplicability" value="" class="select join-item flex-1">
						<option value="" disabled>Seleziona il tipo di sconto</option>
						<option value="email">Utente</option>
						<option value="prodId">Prodotto</option>
						<option value="layoutId">Corso</option>
						<option value="membershipLevel">Associato</option>
					</select>
				</div>
			</fieldset>

			<fieldset class="fieldset col-span-1">
				<legend class="fieldset-legend">Status</legend>
				<!-- <span class="label">Optional</span> -->
				<div class="join w-full">
					<div class="join-item btn pointer-events-none"><ToggleLeft /></div>
					<select name="status" value="" class="select join-item flex-1">
						<option value="" disabled>Seleziona lo status</option>
						<option value="enabled">Attivo</option>
						<option value="disabled">Inattivo</option>
					</select>
				</div>
			</fieldset>

			<div class="px-6 py-4 rounded-b-lg flex justify-end space-x-2">
				<button class="btn btn-error btn-sm" onclick={onCloseModal} type="button"> Annulla </button>
				<button class="btn btn-success btn-sm" type="submit"> Applica Filtri </button>
			</div>
		</form>
	</Modal>
{/if}
