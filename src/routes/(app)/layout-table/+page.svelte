<script lang="ts">
	import { goto } from '$app/navigation';
	import { CopyPlus } from 'lucide-svelte';

	let { data } = $props();
	let { getTable } = $derived(data);
	let tableList = $state(getTable);

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
	<span class="flex justify-between">
		<button
			class="btn btn-success rounded-md text-white border-green-500 hover:bg-gray-200 hover:text-success hover:border-success"
			onclick={() => onGotoNewProduct()}><CopyPlus /> Nuovo prodotto</button
		>
		<header class="text-center text-2xl font-bold text-gray-700">Lista prodotti</header>
		<button class="btn btn-success invisible"><CopyPlus /> Scarica CSV</button>
	</span>
	<table class="table mt-5 border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr>
				<th>urlPic</th>
				<th>title</th>
				<th>descr</th>
				<th>bgColor</th>
				<th>Quantità</th>
				<th>price</th>
				<th>bundleProduct</th>
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
