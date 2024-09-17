<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	//import { page } from '$app/stores';
	//import type { ActionData } from './$types';
	import Notification from '$lib/components/Notification.svelte';
	import Papa from 'papaparse';
	import {
		ListPlus,
		XCircle,
		Filter,
		Pen,
		Calendar,
		Calculator,
		FileDown,
		RefreshCcw
	} from 'lucide-svelte';

	let { data, form } = $props();
	const { getTable } = $derived(data);
	let tableList = $state(getTable);

	//notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 5000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer

	let prodId = $state('');
	let status = $state('');
	let title = $state('');
	let descrShort = $state('');
	let price: number | boolean = $state(false);
	let renewalLength: number = $state(365);
	let isModalFilter = $state(false);
	let isModalNew = $state(false);
	let resetActive = $state(false);

	const onClickModify = (id: any) => {
		//console.log('idCourse', idCourse);
		goto(`/membership-modify/${id}`);
	};

	const onChangeStatus = async (prodId: string, status: string) => {
		const data = {
			prodId,
			status
		};
		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/products/setStatus`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			const response = await res.json();
			if (response.status == 200) {
				invalidateAll();
				clearTimeout(startTimeout);
				isModalFilter = false;
				toastClosed = false;
				notificationContent = 'status cambiato';
				resetFieldsModalFilter();
				closeNotification();
			} else {
				toastClosed = false;
				notificationContent = 'errore status';
				notificationError = true;
				closeNotification();
			}
		} catch (err) {
			console.log('Error:', err);
		}
	};

	const resetFieldsModalFilter = () => {
		prodId = '';
		status = '';
		title = '';
		descrShort = '';
		price = false;
		renewalLength = 365;
	};

	const onFilterReset = () => {
		invalidateAll();
		resetActive = false;
		tableList = getTable;
	};

	const onCloseFilterSearch = () => {
		isModalFilter = false;
		resetFieldsModalFilter();
		onFilterReset();
	};
	const onClosenew = () => {
		isModalNew = false;
		resetFieldsModalFilter();
		onFilterReset();
	};

	const onSubmitFilterSearch = async () => {
		resetActive = true;

		// NOTE: set Field to False/Null? less condition in API
		if (price != false) price = price;
		const arrayField = ['prodId', 'status', 'title', 'price'];
		const arrayValue = [prodId, status, title, price];
		const response = await fetch(`/api/finds/0/0`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'user',
				arrayField,
				arrayValue
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const res = await response.json();
		if (response.status == 200) {
			const newTableList = res.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10)
			}));
			tableList = newTableList;
			clearTimeout(startTimeout);
			isModalFilter = false;
			toastClosed = false;
			notificationContent = 'filtro attivo';
			resetFieldsModalFilter();
			closeNotification();
		}
		if (response.status != 200) {
			//console.log('KO', response);
			toastClosed = false;
			notificationContent = 'errore filtro';
			notificationError = true;
			closeNotification();
		}
	};

	const onOpenFilter = () => {
		isModalFilter = true;
	};
	const onOpenNew = () => {
		isModalNew = true;
	};

	$effect(() => {
		if (form != null) {
			const { action, success, message } = form;
			if (success) {
				closeNotification();
				resetFieldsModalFilter();
				// tableList = getTable; //MEMO THIS TRIGGER INFINITE LOOP
			} else {
				notificationError = true;
			}
			toastClosed = false;
			notificationContent = message;
			//invalidateAll(); TO REPORT doesn't refresh tableList
		}
	}); // end effect
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
				<button class="btn btn-info text-white w-full sm:w-auto" onclick={onOpenFilter}>
					<Filter /> Filtra
				</button>
			{/if}
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={onOpenNew}>
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
						<span class="flex items-center">
							<input
								type="checkbox"
								class=" mr-2 border-gray-500 bg-gray-500 hover:bg-black toggle toggle-md"
								checked={row.status == 'enabled'}
								onclick={() => {
									onChangeStatus(row.prodId, row.status);
								}}
							/>
							{#if row.status == 'enabled'}
								<span class="text-green-600 font-semibold">ATTIVO</span>
							{:else}
								<span class="text-red-600 font-semibold">INATTIVO</span>
							{/if}
						</span>
					</td>
					<td>{row.title}</td>
					<td>{row.price} €</td>
					<td>{row.renewalLength} giorni</td>
					<td>{row.descrShort}</td>
					<td class="space-4">
						<button
							onclick={() => onClickModify(row.prodId)}
							class="btn btn-sm bg-gray-200 btn-neutral text-gray-700 hover:bg-gray-300 hover:text-gray-800 hover:bg-gray-400 mt-2"
						>
							Modifica
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

<!-- modal filter  -->
<dialog id="modal_filter" class="modal" class:modal-open={isModalFilter}>
	<div class="modal-box bg-white p-0 rounded-lg shadow-xl max-w-2xl">
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-t-lg glass">
			<h2 class="text-2xl font-bold text-white mb-1">Filtri di Ricerca</h2>
			<p class="text-blue-100">Personalizza la tua ricerca selezionando i criteri desiderati</p>
		</div>

		<div class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="level" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
					<select
						id="level"
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
					<select
						id="membershipLevel"
						bind:value={title}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="Nome">Nome</option>
						<option value="Nome">Nome</option>
						<option value="Nome">Nome</option>
					</select>
				</div>

				<div>
					<label for="priceF" class="block text-sm font-medium text-gray-700 mb-1">Prezzo</label>
					<input
						type="number"
						id="priceF"
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
		</div>

		<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
			<button class="btn btn-error btn-sm hover:bg-red-300" onclick={onCloseFilterSearch}>
				Annulla
			</button>
			<button class="btn btn-success btn-sm hover:bg-green-400" onclick={onSubmitFilterSearch}>
				Applica Filtri
			</button>
		</div>
	</div>
</dialog>
<!-- /modal filter  -->

<!-- modal New  -->
<dialog id="modal_filter" class="modal" class:modal-open={isModalNew}>
	<div class="modal-box bg-white p-0 rounded-lg shadow-xl max-w-2xl">
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-t-lg glass">
			<h2 class="text-2xl font-bold text-white mb-1">Nuovo Membership</h2>
		</div>

		<form
			method="POST"
			action={`?/newMembership`}
			use:enhance
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
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
					<p class="font-bold mb-2">Durata giorni (max 36500 = 100 anni)</p>
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

			<!-- ALtre informazione -->

			<!-- registra corso button -->
			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button class="btn btn-error btn-sm mx-2" onclick={onClosenew}> Annulla </button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Registra </button>
				</div>
				<!-- <button
					class="btn btn-success rounded-lg hover:bg-accent hover:text-green-800hover:bg-accent hover:text-green-900"
					type="submit"
				>
					<span class="flex items-center justify-center">
						<FileDown class="mr-2" />
						Regista Membro
					</span>
				</button> -->
			</div>
		</form>
	</div>
</dialog>
<!-- /modal New  -->
