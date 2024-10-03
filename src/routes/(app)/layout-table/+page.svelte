<script lang="ts">
	import { goto } from '$app/navigation';
	import { CopyPlus, FileDown, Pen, StretchHorizontal, ImagePlus, Calculator } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let { getTable } = $derived(data);
	let tableList = $state(getTable);

	let layoutId = $state('');
	let title = $state('');
	let descr = $state('');
	let urlPic = $state('');
	let bgColor = $state('');
	let price = $state(0);
	let bundleProduct = $state([]);

	const onClickModify = (id: number) => {
		goto(`/product-modify/${id}`);
	};

	const onClickDetail = (id: number) => {
		goto(`/product-detail/${id}`);
	};


	let isModalNew = $state(false);
	const onOpenNew = () => {
		isModalNew = true;
	};
	const onClosenew = () => {
		isModalNew = false;
	};
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
		<header class="text-center text-2xl font-bold text-gray-700">Lista modelli</header>
		<button class="btn btn-info text-white w-full sm:w-auto"><FileDown /> Scarica CSV</button>
	</span>
	<table class="table mt-5 border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr>
				<th>Data inserimento</th>
				<th>Foto</th>
				<th>Titolo</th>
				<th>Descrizione</th>
				<th>Colore tema</th>
				<th>Quantità</th>
				<th>Prezzo</th>
				<th>BundleProdotti</th>
				<th>Azione</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody class="">
			<!-- row 1 -->
			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<!-- ID -->
					<td><img alt="layout" src={row.urlPic} class="w-16" /></td>
					<td>{row.title}</td>
					<!-- Categoria -->
					<td>{row.descr}</td>
					<!-- Descrizione breve -->
					<!-- Prezzo -->
					<td>{row.bgColor}</td>
					<!-- Quantità -->
					<td>{row.price}</td>
					<!-- Status -->
					<td>{row.status}</td>
					<!-- Data inserimento -->
					<td>{row.bundleProduct}</td>
					<!-- Azione -->
					<td class="flex items-center space-x-4">
						<button
							onclick={() => onClickModify(row._id)}
							class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800"
							>Modifica</button
						>
						<button
							onclick={() => onClickDetail(row.userId)}
							class="btn btn-sm bg-green-200 btn-success rounded-md text-green-700 hover:bg-green-300 hover:text-green-800"
							>Dettagli</button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- modal New  -->
<dialog id="modal_filter" class="modal" class:modal-open={isModalNew}>
	<div class="modal-box bg-white p-0 rounded-lg shadow-xl max-w-2xl">
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-t-lg glass">
			<h2 class="text-2xl font-bold text-white mb-1">Nuovo modello</h2>
		</div>

		<form
			method="POST"
			action={`?/newLayout`}
			use:enhance
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<section class="col-span-4">
				<label for="title" class="form-label">
					<p class="font-bold mb-2">Titolo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<textarea
						class="textarea textarea-bordered h-24 join-item w-full"
						id="title"
						placeholder="Titolo"
						bind:value={title}
						required
					/>
				</div>
			</section>

			<section class="col-span-4 md:col-span-4">
				<label for="description" class="form-label">
					<p class="font-bold mb-2">Descrizione</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><StretchHorizontal /></button>
					<textarea
						class="textarea textarea-bordered h-24 join-item w-full"
						id="titolo"
						placeholder="Descrizione"
						bind:value={descr}
						required
					/>
				</div>
			</section>
			<!-- URL image -->
			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">URL immagine</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><ImagePlus /></button>
					<input
						type="text"
						class="input input-bordered w-full join-item"
						placeholder="Inserisci il valore corrispondente"
						bind:value={urlPic}
					/>
				</div>
			</section>
			<!-- Value -->
			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="renewalLength"
						type="number"
						name="renewalLength"
						aria-label="renewalLength"
						aria-describedby="renewalLength"
						min="1"
						max="36500"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<!-- Bundle product -->
			<section class="col-span-4">
				<label for="correlati" class="form-label">
					<p class="font-bold mb-2">Correlati</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<textarea
						class="textarea textarea-bordered h-24 join-item w-full"
						id="correlati"
						placeholder="Correlati"
						bind:value={bundleProduct}
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
			</div>
		</form>
	</div>
</dialog>
<!-- /modal New  -->
