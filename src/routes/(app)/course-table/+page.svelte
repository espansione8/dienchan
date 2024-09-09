<script lang="ts">
	import { goto } from '$app/navigation';
	import { cart } from '$lib/stores/cart';
	import { ListPlus } from 'lucide-svelte';
	import moment from 'moment';
	import { province } from '$lib/stores/arrays.js';

	let { data } = $props();
	let { getTableCourses } = $derived(data);
	let coursesList = $state(getTableCourses);

	// cart store
	const addToCart = (course: any) => {
		cart.update((n) => {
			// console.log('n', n);
			n.push(course);
			return n;
		});
	};

	const removeFromCart = (courseId: any) => {
		cart.update((n) => {
			// Filtra il carrello per rimuovere il corso con l'ID specificato
			return n.filter((item) => item.corso.courseId !== courseId.corso.courseId);
		});
	};

	const onClickModify = (idCourse: any) => {
		console.log('idCourse', idCourse);
		goto(`/course-modify/${idCourse}`);
	};

	function siglaToProvincia(provinciaSigla) {
		const findProvincia = $province.find((prov) => prov.sigla === provinciaSigla);
		//**** listaProvince.place 'Online' is ignored */
		if (findProvincia) {
			return findProvincia.nome;
		} else if (provinciaSigla === 'Online') {
			return 'Online';
		}
	}

	const onGotoNewProduct = () => {
		goto(`/course-new`);
	};
</script>

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
			{#if coursesList.length == 0}
				<tr class="hover:bg-gray-300"><td> no data</td></tr>
			{/if}
			{#each coursesList as row}
				<tr class="hover:bg-gray-300">
					<!-- Data inserimento -->
					<td>{row.createdAt}</td>
					<!-- Nome Cognome Riflessologo -->
					<td>{row.reflexologistName} {row.surname}</td>
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
						{#if row.place !== 'Online'}
							<p class="card-text">
								{siglaToProvincia(row.place)}
							</p>
						{:else if row.place === 'Online'}
							<p class="card-text">
								{row.place}
							</p>
						{/if}
					</td>
					<!-- Prezzo -->
					<td>{row.price} €</td>
					<!-- Azione -->
					<td class="space-4">
						<button
							onclick={() => onClickModify(row.courseId)}
							class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800 hover:bg-gray-400 mt-2"
						>
							Modifica
						</button>
						<!-- {#if $cart.some((item) => item.corso.courseId == row.courseId)}
							
							<button
								class="btn btn-sm bg-red-200 w-40 border border-red-400 rounded-md text-red-700 hover:text-red-700 hover:bg-red-400"
								onclick={() => removeFromCart({ corso: row })}>Rimuovi dal Carrello</button
							>
						{:else}
							
							<button
								class="btn btn-sm bg-green-200 w-40 btn-success rounded-md text-green-700 hover:text-green-300"
								onclick={() => addToCart({ corso: row })}>Aggiungi a Carrello</button
							>
						{/if} -->
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
