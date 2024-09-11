<script lang="ts">
	import { goto } from '$app/navigation';
	// import { cart } from '$lib/stores/cart';
	import {
		ListPlus,
		Filter,
		ArrowUp,
		ArrowDown,
		FilterX,
		MapPin,
		XCircle,
		Search
	} from 'lucide-svelte';
	import moment from 'moment';
	import { province } from '$lib/stores/arrays.js';

	let { data } = $props();
	let { getTableCourses } = $derived(data);
	let coursesList = $state(getTableCourses);

	const onClickModify = (idCourse: any) => {
		console.log('idCourse', idCourse);
		goto(`/course-modify/${idCourse}`);
	};

	function siglaToProvincia(provinciaSigla: any) {
		const findProvincia = $province.find((prov) => prov.sigla === provinciaSigla);
		return findProvincia.nome;
	}

	const onClickNewCourse = () => {
		goto(`/course-new`);
	};

	// filter Data
	let sortDirection = $state('asc');
	let sortColumn = $state('createdAt');
	
	const sortTable = (column: string) => {
		if (sortColumn === column) {
			// Se la colonna è già selezionata, invertiamo la direzione
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// Altrimenti, impostiamo la nuova colonna e resettiamo la direzione
			sortColumn = column;
			sortDirection = 'asc';
		}

		coursesList = coursesList.sort((a, b) => {
			let valueA = column === 'eventStartDate' ? new Date(a[column]) : a[column];
			let valueB = column === 'eventStartDate' ? new Date(b[column]) : b[column];

			if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
			if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	};

	// let filterProvince = $state('');
	// let isModalFilterCourse = $state(false);
	// let isModalDelete = $state(false);
	// let resetActive = $state(false);
	// let errorFilterModal = $state('');
	// let quickSearch = $state('data');
	// let quickSearchInput = $state('');

	// const onCloseFilterSearch = (type: string) => {
	// 	if (type == 'riflessologo') {
	// 		isModalFilterCourse = false;
	// 		onFilterReset();
	// 	}
	// 	if (type == 'data') {
	// 		isModalFilterBusiness = false;
	// 		onFilterReset();
	// 	}
	// 	if (type == 'province') {
	// 		isModalFilterJob = false;
	// 		onFilterReset();
	// 	}
	// };

	// filter
	let selectedLocation = $state('');
	let isModalProvincie = $state(false);
	let filteredCoursesList = $state(coursesList);

	const toggleLocationFilter = () => {
		isModalProvincie = !isModalProvincie;
	};

	const filterByLocation = () => {
		if (selectedLocation === '') {
			filteredCoursesList = coursesList;
		} else {
			filteredCoursesList = coursesList.filter(
				(course) => siglaToProvincia(course.place) === selectedLocation
			);
		}
		isModalProvincie = false;
	};

	$effect(() => {
		filterByLocation();
	});

	const resetLocationFilter = () => {
		selectedLocation = '';
		filteredCoursesList = coursesList;
	};
</script>

<svelte:head>
	<title>Lista corsi</title>
</svelte:head>

<div class="overflow-x-auto table-zebra mt-5 px-4 mb-5">
	<div class="flex justify-between items-center w-full">
		<div class="flex space-x-4">
			<button
				class="btn bg-orange-500 rounded-md text-white border-orange-500 hover:bg-orange-200 hover:text-orange-600 hover:border-orange-400"
				
			>
				<Filter class="mt-1" /> Filtra
			</button>
			<button
				class="btn btn-success rounded-md text-white border-green-500 hover:bg-gray-200 hover:text-success hover:border-success"
				onclick={onClickNewCourse}
			>
				<ListPlus /> Nuovo corso
			</button>
		</div>

		<header class="text-2xl font-bold text-gray-700 absolute left-1/2 transform -translate-x-1/2">
			Lista corsi
		</header>

		<button
			class="btn btn-success rounded-md text-white border-green-500 hover:bg-gray-200 hover:text-success hover:border-success"
		>
			<ListPlus /> Scarica CSV
		</button>
	</div>

	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr class="">
				<th onclick={() => sortTable('createdAt')} class="cursor-pointer">
					Data inserimento
					{#if sortColumn === 'createdAt'}
						{#if sortDirection === 'asc'}
							<ArrowUp
								class="inline text-orange-700 border-2 border-orange-500 rounded-md hover:text-gray-600 hover:border-gray-600 "
							/>
						{:else}
							<ArrowDown
								class="inline text-orange-700 border-2 border-orange-500 rounded-md hover:text-gray-600 hover:border-gray-600"
							/>
						{/if}
					{:else}
						<FilterX
							class="inline text-gray-700 border-2 border-gray-500 rounded-md hover:text-gray-200 hover:border-gray-200 "
						/>
					{/if}
				</th>
				<th>Riflessologo</th>
				<th>Email</th>
				<th>Titolo</th>
				<th onclick={() => sortTable('eventStartDate')} class="cursor-pointer">
					Data
					{#if sortColumn === 'eventStartDate'}
						{#if sortDirection === 'asc'}
							<ArrowUp
								class="inline text-orange-700 border-2 border-orange-500 rounded-md hover:text-gray-600 hover:border-gray-600 "
							/>
						{:else}
							<ArrowDown
								class="inline text-orange-700 border-2 border-orange-500 rounded-md hover:text-gray-600 hover:border-gray-600"
							/>
						{/if}
					{:else}
						<FilterX
							class="inline text-gray-700 border-2 border-gray-500 rounded-md hover:text-gray-200 hover:border-gray-200 "
						/>
					{/if}
				</th>
				<th>Ora</th>
				<th onclick={toggleLocationFilter} class="cursor-pointer"
					>Luogo
					{#if selectedLocation !== ''}
						<XCircle
							onclick={resetLocationFilter}
							class="inline text-red-700 rounded-md hover:text-yellow-600  hover:text-yellow-400 hover:bg-red-400 "
						/>
					{:else}
						<Search
							class="inline text-gray-700 border-2 border-gray-500 rounded-md hover:text-gray-200 hover:border-gray-200 "
						/>
					{/if}
				</th>
				<th>Prezzo</th>
				<th>Azioni</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row -->
			{#if filteredCoursesList.length == 0}
				<tr class="hover:bg-gray-300"><td> no data</td></tr>
			{/if}
			{#each filteredCoursesList as row}
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
						<!-- {#if row.place !== 'Online'}
							<p class="card-text">
								{siglaToProvincia(row.place)}
							</p>
						{:else if row.place === 'Online'}
							<p class="card-text">
								{row.place}
							</p>
						{/if} -->
						<p class="card-text">
							{siglaToProvincia(row.place)}
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

<!-- modal CONFIRM RENEW -->
<dialog id="my_modal_2" class="modal" class:modal-open={isModalProvincie}>
	<div class="modal-box flex flex-col text-center rounded-lg">
		<h3 class="font-bold text-xl">Seleziona il luogo</h3>
		<div class="mt-4 flex justify-center">
			<select
				bind:value={selectedLocation}
				onchange={filterByLocation}
				class="select select-bordered w-full max-w-xs"
			>
				<option value="">Tutti i luoghi</option>
				{#each $province as item}
					<option value={item.nome}>{item.nome}</option>
				{/each}
			</select>
		</div>
		<button
			class="mt-5 btn btn-sm w-24 bg-red-500 text-white rounded-md hover:bg-red-600"
			onclick={() => (isModalProvincie = false)}
		>
			Annulla
		</button>
	</div>
</dialog>
<!-- modal END CONFIRM RENEW -->

<!-- modal filter jobs -->
<!-- <dialog id="modal_filter" class="modal" class:modal-open={isModalFilterCourse}>
	<div class="modal-box">
		<section class="card col-span-12 md:col-span-3 bg-base-100">
			<div class="alert bg-accent font-bold flex items-center">
				<span>Filtri</span>
				<div class="flex items-center">
					<input
						type="radio"
						id="id-radio"
						name="quickSearch6"
						class="radio radio-sm mr-2"
						bind:group={quickSearch}
						value={'riflessologo'}
					/>
					<label for="id-radio">Riflessologo</label>
				</div>
				<div class="flex items-center">
					<input
						type="radio"
						id="data-radio"
						name="quickSearch7"
						class="radio radio-sm mr-2"
						bind:group={quickSearch}
						value={'data'}
					/>
					<label for="data-radio">Data</label>
				</div>
			</div>
			{#if quickSearch == 'province'}
				<form class="card-body">
					<div class="form-control">
						<label class="form-control">
							<div class="label">
								<span class="label-text">Luogo</span>
							</div>

							<select bind:value={filterProvince} class="select select-bordered">
								<option value="United Kingdom">United Kingdom</option>
								{#each $province as option}
									<option>
										{option.nome}
									</option>
								{/each}
							</select>
						</label>
					</div>
					<div class="modal-action">
						<button class="btn btn-error" onclick={() => onCloseFilterSearch('jobs')}>Cancel</button
						>
						<button class="btn btn-success" onclick={onClickFilterSearchJob}>Search</button>
					</div>
				</form>
			{:else if quickSearch == 'id'}
				<form
					class="card-body"
					method="POST"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type == 'success') {
								currentList = result.data?.response;
								isModalFilterCourse = false;
								resetActive = true;
								onFilterReset();
							} else {
								errorFilterModal = `error: ${result.status}`;
							}
						};
					}}
				>
					<input
						class="input input-bordered"
						placeholder="ID number"
						name="id"
						type="text"
						bind:value={quickSearchInput}
						required
					/>
					<div class="modal-action">
						<button class="btn btn-error" onclick={() => onCloseFilterSearch('jobs')}>Cancel</button
						>
						<button class="btn btn-success" type="submit" formaction="?/searchByIdjobs"
							>Search</button
						>
					</div>
				</form>
				{#if errorFilterModal != ''}
					<p class="text-error">{errorFilterModal}</p>
				{/if}
				{#if form?.errorMessage}
					<div role="alert" class="alert bg-error flex flex-col items-center mt-6">
						<CircleAlert size="12" /><span class="font-bold"> {form.errorMessage}</span>
					</div>
				{/if}
			{/if}
		</section>
	</div>
</dialog> -->
<!-- /modal filter jobs -->
