<script lang="ts">
	import { goto } from '$app/navigation';
	// import { cart } from '$lib/stores/cart';
	import { ListPlus } from 'lucide-svelte';
	import moment from 'moment';
	import { province } from '$lib/stores/arrays.js';

	let { data } = $props();
	let { getTable } = $derived(data);
	let tableList = $state(getTable);

	const onClickModify = (idCourse: any) => {
		console.log('idCourse', idCourse);
		goto(`/course-modify/${idCourse}`);
	};

	function siglaToProvincia(provinciaSigla: any) {
		const findProvincia = $province.find((prov) => prov.sigla === provinciaSigla);
		return findProvincia.nome;
	}

	const onGotoNewProduct = () => {
		goto(`/course-new`);
	};
</script>

tableList
<svelte:head>
	<title>Lista corsi</title>
</svelte:head>

<div class="overflow-x-auto table-zebra mt-5 px-4 mb-5">
	<span class="flex justify-between">
		<button
			class="btn btn-success rounded-md text-white border-green-500 hover:bg-gray-200 hover:text-success hover:border-success"
			onclick={() => onGotoNewProduct()}><ListPlus /> Nuovo corso</button
		>
		<header class="text-center text-2xl font-bold text-gray-700">Lista corsi</header>
		<button class="btn btn-success invisible"><ListPlus /> Scarica CSV</button>
	</span>

	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr class="">
				<th>Data inserimento</th>
				<th>Riflessologo</th>
				<th>Email</th>
				<th>Titolo</th>
				<th>Data</th>
				<th>Ora</th>
				<th>Luogo</th>
				<th>Prezzo</th>
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
					<!-- Data inserimento -->
					<td>{row.createdAt}</td>
					<!-- Nome Cognome Riflessologo -->
					<td>{row.name} {row.surname}</td>
					<!-- Email Riflessologo -->
					<td>{row.notificationEmail[0]}</td>
					<!-- Titolo -->
					<td>{row.title}</td>
					<!-- Data -->
					<td>{moment(row.eventStartDate).format('DD/MM/YYYY')}</td>
					<!-- Ora -->
					<td
						>Da {moment(row.eventStartDate).format('HH:mm')}
						a {moment(row.eventEndDate).format(' HH:mm')}
					</td>
					<!-- Luogo -->
					<td>
						<!-- {#if row.location !== 'Online'}
							<p class="card-text">
								{siglaToProvincia(row.location)}
							</p>
						{:else if row.location === 'Online'}
							<p class="card-text">
								{row.location}
							</p>
						{/if} -->
						<p class="card-text">
							{siglaToProvincia(row.location)}
						</p>
					</td>
					<!-- Prezzo -->
					<td>{row.price} €</td>
					<!-- Azione -->
					<td class="space-4">
						<button
							onclick={() => onClickModify(row.prodId)}
							class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800 hover:bg-gray-400 mt-2"
						>
							Modifica
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
