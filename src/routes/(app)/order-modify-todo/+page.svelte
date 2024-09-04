<script lang="ts">
	let { data } = $props();
	let { getTableUser, checkUpdates } = $derived(data);
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
				<th>Data partecipazione</th>
				<th>Riflessologo</th>
				<th>Provincia</th>
				<th>Periodo</th>
				<th>Azione</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row -->
			{#if getTableUser.length == 0}
				<tr class="hover:bg-gray-100">
					<td>no data</td>
				</tr>
			{/if}

			{#each getTableUser as row, i}
				<tr class="hover:bg-gray-100">
					<!-- Data partecipazione -->
					<td>{row.createdAt}</td>
					<!-- Riflessologo -->
					<td>{row.email}</td>
					<!-- Provincia -->
					<td>
						{row.email}
					</td>
					<!-- Periodo -->
					<td>{row.name} {row.surname}</td>
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
