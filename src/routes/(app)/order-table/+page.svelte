<script lang="ts">
	let { data } = $props();
	let { getOrders } = $derived(data);
</script>

<svelte:head>
	<title>Ordini</title>
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
	<header class="text-center text-2xl font-bold text-gray-700">Ordini</header>

	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr class="">
				<th>Data</th>
				<th>ID ordine</th>
				<th>Email</th>
				<th>Associato</th>
				<th>Ordine</th>
				<th>Totale</th>
				<th>Tipo pagamento</th>
				<th>Stato</th>
				<th>Azione</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row -->
			{#if getOrders.length == 0}
				<tr class="hover:bg-gray-100">
					<td>no data</td>
				</tr>
			{/if}

			{#each getOrders as row}
				<tr class="hover:bg-gray-100">
					<!-- Data -->
					<td>{row.orderDate}</td>
					<!-- ID ordine-->
					<td>{row.orderId}</td>
					<!-- Email-->
					<td>{row.userView.email}</td>
					<!-- Nome-->
					<td>{row.userView.name} {row.userView.surname}</td>
					<!-- Ordine -->
					<td>
						<div class="flex flex-col space-y-1">
							{#each row.cart as item}
							<span > {item.title}</span>
							{/each}
						</div>
					</td>
					<!-- Totale -->
					<td>€{row.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(0)}</td>
					<!-- Tipo pagamento -->
					<td>
						{row.payment.method}
					</td>
					<!-- Status -->
					<td>
						{row.payment.statusPayment}
					</td>
					<!-- Azione -->
					<td class=" space-4">
						<button
							class="btn btn-sm bg-green-200 btn-success rounded-md text-green-700 hover:bg-green-300 hover:text-green-800"
							>Dettagli</button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
