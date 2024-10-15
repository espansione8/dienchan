<script lang="ts">
	import { goto } from '$app/navigation';
	import { CopyPlus, RefreshCcw, XCircle, Filter, FileDown } from 'lucide-svelte';

	let { data } = $props();
	let { getTable } = $derived(data);
	let tableList = $state(getTable);
	
	let resetActive = $state(false);

	const onClickModify = (id: number) => {
		goto(`/product-modify/${id}`);
	};

	const onClickDetail = (id: number) => {
		goto(`/product-detail/${id}`);
	};

	const onGotoNewProduct = () => {
		goto(`/product-new`);
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

	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">
			Lista prodotti
		</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" >
				<RefreshCcw />
			</button>
			{#if resetActive == true}
				<button class="btn btn-error rounded-md text-white">
					<XCircle class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button class="btn btn-info rounded-md text-white" >
					<Filter class="mt-1" /> Filtra
				</button>
			{/if}
			<button class="btn btn-info rounded-md text-white" onclick={() => onGotoNewProduct()}>
				<CopyPlus /> Nuovo
			</button>
			<button class="btn btn-info text-white w-full sm:w-auto">
				<FileDown />CSV
			</button>
		</div>
	</div>



	<table class="table mt-5 border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr>
				<th>ID</th>
				<th>Categoria</th>
				<th>Descrizione breve</th>
				<th>Prezzo</th>
				<th>Quantità</th>
				<th>Status</th>
				<th>Data inserimento</th>
				<th>Azione</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody class="">
			<!-- row 1 -->
			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<!-- ID -->
					<td>{row.prodId}</td>
					<!-- Categoria -->
					<td>{row.category}</td>
					<!-- Descrizione breve -->
					<td>{row.title}</td>
					<!-- Prezzo -->
					<td>{row.cost}</td>
					<!-- Quantità -->
					<td>{row.stockQty}</td>
					<!-- Status -->
					<td>{row.status}</td>
					<!-- Data inserimento -->
					<td>{row.createdAt}</td>
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
