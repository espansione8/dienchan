<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import {
		ListPlus,
		Filter,
		ArrowUp,
		ArrowDown,
		FilterX,
		MapPin,
		XCircle,
		CircleAlert,
		Search
	} from 'lucide-svelte';
	import moment from 'moment';
	import { coursesInfo, province } from '$lib/stores/arrays';

	let { data } = $props();
	let { getTable, getTableNames } = $derived(data);
	let tableList = $state(getTable);

	const onClickModify = (idCourse: any) => {
		//console.log('idCourse', idCourse);
		goto(`/course-modify/${idCourse}`);
	};

	function siglaToProvincia(provinciaSigla: any) {
		const findProvincia = $province.find((prov) => prov.sigla === provinciaSigla) || '';
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

		tableList = tableList.sort((a: any, b: any) => {
			let valueA = column === 'eventStartDate' ? new Date(a[column]) : a[column];
			let valueB = column === 'eventStartDate' ? new Date(b[column]) : b[column];

			if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
			if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	};

	let filterProvince = $state('');
	let isModalFilterCourse = $state(false);
	let isModalDelete = $state(false);
	let resetActive = $state(false);
	let errorFilterModal = $state('');
	let quickSearch = $state('data'); // radio button
	let quickSearchInput = $state('');
	//filter
	let selectedLocation = $state('');
	let selectedTitle = $state('');
	let selectedUserId = $state('');

	const onCloseFilterSearch = () => {
		isModalFilterCourse = false;
		onFilterReset();
	};

	const onSubmitFilterSearch = async () => {
		resetActive = true;
		let location = '';
		let title = '';
		let userId = '';
		if (selectedLocation) location = selectedLocation;
		if (selectedTitle) title = selectedTitle;
		if (selectedUserId) userId = selectedUserId;
		const arrayField = ['location', 'title', 'userId', 'type'];
		const arrayValue = [location, title, userId, 'course'];
		const response = await fetch(`/api/finds/0/0`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'product',
				arrayField,
				arrayValue
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const res = await response.json();
		if (response.status == 200) {
			//console.log('res table', res);
			tableList = res;
			clearTimeout(startTimeout);
			isModalFilterCourse = false;
			toastClosed = false;
			notificationContent = 'corsi filtrati';
			closeNotification();
		}
		if (response.status != 200) {
			console.log('KO', response);
			toastClosed = false;
			notificationContent = 'errore filtro';
			notificationError = true;
			closeNotification();
		}
	};

	const onOpenFilter = () => {
		isModalFilterCourse = true;
		quickSearch = 'location';
	};

	const onFilterReset = () => {
		resetActive = false;
		tableList = getTable;
		invalidateAll();
		quickSearchInput = '';
	};

	// filter
	// let isModalProvincie = $state(false);
	// let filteredCoursesList = $state(tableList);

	// const toggleLocationFilter = () => {
	// 	isModalProvincie = !isModalProvincie;
	// };

	// const filterByLocation = () => {
	// 	if (selectedLocation === '') {
	// 		filteredCoursesList = tableList;
	// 	} else {
	// 		filteredCoursesList = tableList.filter(
	// 			(course) => siglaToProvincia(course.location) === selectedLocation
	// 		);
	// 	}
	// 	isModalProvincie = false;
	// };

	// $effect(() => {
	// 	filterByLocation();
	// });

	// const resetLocationFilter = () => {
	// 	selectedLocation = '';
	// 	filteredCoursesList = tableList;
	// };

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
</script>

<svelte:head>
	<title>Lista corsi</title>
</svelte:head>

<div class="overflow-x-auto table-zebra mt-5 px-4 mb-5">
	<div class="flex justify-between items-center w-full">
		<div class="flex space-x-4">
			{#if resetActive == true}
				<button
					class="btn btn-error rounded-md text-white border-orange-500 hover:bg-red-200 hover:text-red-600 hover:border-red-400"
					onclick={onFilterReset}
				>
					<XCircle class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button
					class="btn bg-orange-500 rounded-md text-white border-orange-500 hover:bg-orange-200 hover:text-orange-600 hover:border-orange-400"
					onclick={onOpenFilter}
				>
					<Filter class="mt-1" /> Filtra
				</button>
			{/if}

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
				<!-- <th onclick={() => sortTable('createdAt')} class="cursor-pointer">
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
				</th> -->
				<th>Data inserimento</th>
				<th>Riflessologo</th>
				<th>Email</th>
				<th>Titolo</th>
				<th>Data</th>
				<!-- <th onclick={() => sortTable('eventStartDate')} class="cursor-pointer">
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
				</th> -->
				<th>Ora</th>
				<th>Luogo</th>
				<!-- <th onclick={toggleLocationFilter} class="cursor-pointer"
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
				</th> -->
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
					<td>{row.eventStartDate}</td>
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
<Notification {toastClosed} {notificationContent} {notificationError} />
<!-- modal filter Province -->
<!-- <dialog id="my_modal_2" class="modal" class:modal-open={isModalProvincie}>
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
</dialog> -->
<!-- modal filter Province -->

<!-- modal filter jobs -->
<dialog id="modal_filter" class="modal" class:modal-open={isModalFilterCourse}>
	<div class="modal-box">
		<section class="card col-span-12 md:col-span-3 bg-base-100">
			<div class="alert bg-accent font-bold flex items-center">
				<span>Filtri</span>
				<!-- Location -->
				<div class="flex items-center">
					<input
						type="radio"
						id="location-radio"
						name="quickSearch6"
						class="radio radio-sm mr-2"
						bind:group={quickSearch}
						value={'location'}
					/>
					<label for="location-radio" class="cursor-pointer">Luogo</label>
				</div>
				<!-- category -->
				<div class="flex items-center">
					<input
						type="radio"
						id="category-radio"
						name="quickSearch7"
						class="radio radio-sm mr-2"
						bind:group={quickSearch}
						value={'category'}
					/>
					<label for="category-radio" class="cursor-pointer">Categoria</label>
				</div>
				<!-- riflessologo -->
				<div class="flex items-center">
					<input
						type="radio"
						id="reflexologist-radio"
						name="quickSearch7"
						class="radio radio-sm mr-2"
						bind:group={quickSearch}
						value={'reflexologist'}
					/>
					<label for="reflexologist-radio" class="cursor-pointer">Riflessologo</label>
				</div>
			</div>
			{#if quickSearch == 'location'}
				<!-- Location -->
				<h3 class="font-bold text-center text-xl mt-4">Seleziona il luogo</h3>
				<div class="mt-4 flex justify-center">
					<select bind:value={selectedLocation} class="select select-bordered w-full max-w-xs">
						<option value="">Tutti i luoghi</option>
						{#each $province as item}
							<option value={item.sigla}>{item.nome}</option>
						{/each}
					</select>
				</div>
				<div class="modal-action">
					<button class="btn btn-error" onclick={() => onCloseFilterSearch()}>Annulla</button>
					<button class="btn btn-success" onclick={onSubmitFilterSearch}>Cerca</button>
				</div>
			{:else if quickSearch == 'category'}
				<!-- category -->
				<h3 class="font-bold text-center text-xl mt-4">Seleziona la categoria</h3>
				<div class="mt-4 flex justify-center">
					<select bind:value={selectedTitle} class="select select-bordered w-full max-w-xs">
						<option disabled value="">Scegli</option>
						{#each $coursesInfo as option}
							<option value={option.title}>{option.id}</option>
						{/each}
					</select>
				</div>
				<div class="modal-action">
					<button class="btn btn-error" onclick={() => onCloseFilterSearch()}>Annulla</button>
					<button class="btn btn-success" onclick={onSubmitFilterSearch}>Cerca</button>
				</div>
			{:else if quickSearch == 'reflexologist'}
				<!-- reflexologist -->
				<h3 class="font-bold text-center text-xl mt-4">Seleziona il riflessologo</h3>
				<div class="mt-4 flex justify-center">
					<select bind:value={selectedUserId} class="select select-bordered w-full max-w-xs">
						<option disabled value="">Scegli</option>
						{#each getTableNames as item}
							<option value={item.userId}>{item.surname} {item.name}</option>
						{/each}
					</select>
				</div>
				<div class="modal-action">
					<button class="btn btn-error" onclick={() => onCloseFilterSearch()}>Annulla</button>
					<button class="btn btn-success" onclick={onSubmitFilterSearch}>Cerca</button>
				</div>
			{/if}
		</section>
	</div>
</dialog>
<!-- /modal filter jobs -->
