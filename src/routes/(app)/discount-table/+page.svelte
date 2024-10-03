<script lang="ts">
	import { goto } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import {
		CopyPlus,
		StretchHorizontal,
		Filter,
		Pen,
		Calendar,
		Calculator,
		FileDown,
		RefreshCcw
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let { getTable } = $derived(data);
	let tableList = $state(getTable);

	let code = $state('');
	let type = $state('');
	let value = $state('');
	let userId = $state('');
	let productId = $state('');
	let layoutId = $state('');
	let membershipLevel = $state('');
	let notes = $state('');
	let status = $state('');
	let selectedApplicability = $state('userId');

	const onClickModify = (id: number) => {
		goto(`/discount-modify/${id}`);
	};

	let isModalNew = $state(false);
	const onOpenNew = () => {
		isModalNew = true;
	};
	const onClosenew = () => {
		isModalNew = false;
	};

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

	$effect(() => {
		if (form != null) {
			const { action, success, message } = form;
			if (success) {
				closeNotification();
				//resetFieldsModalFilter();
				// tableList = getTable; //DO NOT USE!!  THIS TRIGGER INFINITE LOOP
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
	<span class="flex justify-between">
		<button class="btn btn-info text-white w-full sm:w-auto" onclick={() => onOpenNew()}
			><CopyPlus /> Nuovo</button
		>
		<header class="text-center text-2xl font-bold text-gray-700">Lista Codici Sconto</header>
		<button class="btn btn-info text-white w-full sm:w-auto"><FileDown /> Scarica CSV</button>
	</span>
	<table class="table mt-5 border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr>
				<th>Data inserimento</th>
				<th>ID</th>
				<th>Codice</th>
				<th>Tipologia</th>
				<th>Valore</th>
				<th>Utente</th>
				<th>Prodotto</th>
				<th>Categoria</th>
				<th>Livello socio</th>
				<th>Azione</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody class="">
			<!-- row 1 -->
			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<!-- Data inserimento -->
					<td>{row.createdAt}</td>
					<!-- ID -->
					<td>{row.discountId}</td>
					<!-- Codice -->
					<td>{row.code}</td>
					<!-- Tipologia -->
					<td>{row.type}</td>
					<!-- Valore -->
					<td>{row.value}</td>
					<!-- Utente -->
					<td>{row.userId}</td>
					<!-- Prodotto -->
					<td>{row.productId}</td>
					<!-- Categoria -->
					<td>{row.layoutId}</td>
					<!-- Socio -->
					<td>{row.membershipLevel}</td>
					<!-- Azione -->
					<td class="flex items-center space-x-4">
						<button
							onclick={() => onClickModify(row.discountId)}
							class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800"
							>Modifica</button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

<!-- modal New  -->
<dialog id="modal_filter" class="modal" class:modal-open={isModalNew}>
	<div class="modal-box bg-white p-0 rounded-lg shadow-xl max-w-2xl">
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-t-lg glass">
			<h2 class="text-2xl font-bold text-white mb-1">Nuovo codice sconto</h2>
		</div>

		<form
			method="POST"
			action={`?/newDiscount`}
			use:enhance
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<!-- <header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Nuovo Codice Sconto
			</header> -->
			<section class="col-span-4">
				<label for="code" class="form-label">
					<p class="font-bold mb-2">Codice</p>
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
						bind:value={type}
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
							value="product"
							class="radio radio-primary mr-2"
							bind:group={selectedApplicability}
						/>
						<span>Prodotto</span>
					</label>
					<label class="flex items-center">
						<input
							type="radio"
							name="applicability"
							value="course"
							class="radio radio-primary mr-2"
							bind:group={selectedApplicability}
						/>
						<span>Corso</span>
					</label>
				</div>
				<div class="mt-4">
					{#if selectedApplicability === 'userId'}
						<input
							type="text"
							name="userId"
							class="input input-bordered w-full"
							placeholder="Inserisci il valore corrispondente"
							bind:value={userId}
						/>
					{:else if selectedApplicability === 'membershipLevel'}
						<input
							type="text"
							name="membershipLevel"
							class="input input-bordered w-full"
							placeholder="Inserisci il valore corrispondente"
							bind:value={membershipLevel}
						/>
					{:else if selectedApplicability === 'product'}
						<input
							type="text"
							name="productId"
							class="input input-bordered w-full"
							placeholder="Inserisci il valore corrispondente"
							bind:value={productId}
						/>
					{:else if selectedApplicability === 'course'}
						<input
							type="text"
							name="layoutId"
							class="input input-bordered w-full"
							placeholder="Inserisci il valore corrispondente"
							bind:value={layoutId}
						/>
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
						required
					/>
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
