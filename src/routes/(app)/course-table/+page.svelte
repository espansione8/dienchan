<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Papa from 'papaparse';
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
		Search,
		ShieldAlert
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

	//CSV file
	const csvCreate = () => {
		let csv = $state('');
		let newList: any = $state();

		const flattenObject = (obj: any, prefix = '') => {
			return Object.keys(obj).reduce((acc, k) => {
				const pre = prefix.length ? prefix + '_' : '';
				if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
					Object.assign(acc, flattenObject(obj[k], pre + k));
				} else {
					acc[pre + k] = obj[k];
				}
				return acc;
			}, {});
		};

		const flattenedArray = tableList.map((obj: any) => {
			return flattenObject(obj);
		});

		newList = flattenedArray.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt?.substring(0, 10),
			birthdate: obj.birthdate?.substring(0, 10)
		}));
		//console.log('flattenedArray', flattenedArray);
		newList = flattenedArray.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt?.substring(0, 10),
			birthdate: obj.birthdate?.substring(0, 10)
		}));
		newList.forEach((obj: any) => {
			delete obj.__v;
			delete obj.attribute1;
			delete obj.attribute2;
			delete obj.attribute3;
			delete obj.attribute4;
			delete obj.attribute5;
			delete obj.attribute6;
			delete obj.attribute7;
			delete obj.attribute8;
			delete obj.attribute9;
			delete obj.brand;
			delete obj.brandId;
			delete obj.bundleProduct;
			delete obj.categoryId;
			delete obj.cost;
			delete obj.dateAdd;
			delete obj.dateUpd;
			delete obj.depth;
			delete obj.attribute10;
			delete obj.condition;
			delete obj.feature;
			delete obj.filterPermissionToEdit;
			delete obj.height;
			delete obj.image1;
			delete obj.image2;
			delete obj.image3;
			delete obj.image4;
			delete obj.image5;
			delete obj.image6;
			delete obj.image7;
			delete obj.image8;
			delete obj.imgFull;
			delete obj.imgThumb;
			delete obj.listSubscribers;
			delete obj.manufacturer;
			delete obj.manufacturerCod;
			delete obj.msrp;
			delete obj.notes;
			delete obj.points;
			delete obj.priceSetByBundle;
			delete obj.promoEndDate;
			delete obj.promoStartDate;
			delete obj.promoterProCod;
			delete obj.rating;
			delete obj.rewardProgramDetails;
			delete obj.shippingCost;
			delete obj.sku;
			delete obj.state;
			delete obj.value1;
			delete obj.value2;
			delete obj.value3;
			delete obj.value4;
			delete obj.value5;
			delete obj.value6;
			delete obj.value7;
			delete obj.value8;
			delete obj.value9;
			delete obj.value10;
			delete obj.vatType;
			delete obj.vatValue;
			delete obj.weight;
			delete obj.video;
			delete obj.birthdate;
			delete obj.filterPermissionToSee;
			delete obj.manufacturerId;
			delete obj.orderQuantity;
			delete obj.width;
		});

		//CSV UNPARSE
		csv = Papa.unparse(newList, {
			quotes: false, //or array of booleans
			quoteChar: '"',
			escapeChar: '"',
			delimiter: ';',
			header: true,
			//newline: '\r\n',
			skipEmptyLines: false //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
		});
		//console.log('csv', csv);

		//DOWNLOAD file
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		// create a link element to download the zip archive
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `TableExport_Corsi.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};

	let isModalFilterCourse = $state(false);
	let resetActive = $state(false);
	//filter
	let selectedLocation = $state('');
	let selectedTitle = $state('');
	let selectedUserId = $state('');

	const onCloseFilterSearch = () => {
		isModalFilterCourse = false;
		resetFieldsModalFilter();
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
			// tableList = res.map((obj) => ({
			// 	...obj,
			// 	orderDate: obj.orderDate.substring(0, 10)
			// }));
			tableList = res;
			clearTimeout(startTimeout);
			isModalFilterCourse = false;
			toastClosed = false;
			notificationContent = 'Corsi filtrati';
			resetFieldsModalFilter();
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
	};

	const resetFieldsModalFilter = () => {
		selectedLocation = '';
		selectedTitle = '';
		selectedUserId = '';
	};

	const onFilterReset = () => {
		resetActive = false;
		tableList = getTable;

		invalidateAll();
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
			onclick={() => csvCreate()}
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
				<tr class="hover:bg-gray-300">
					<td> </td>
				</tr>
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
	{#if tableList.length == 0}
		<div
			class="alert alert-warning shadow-lg flex item-center text-center justify-center rounded-md mt-3 mx-auto w-full max-w-lg"
		>
			<div>
				<ShieldAlert />
				<br />
				<span class="mt-2 text-semibold">
					Nessun corso trovato. Cambia parametri o resetta il filtro.
				</span>
			</div>
		</div>
	{/if}
</div>
<Notification {toastClosed} {notificationContent} {notificationError} />

<!-- modal filter  -->
<dialog id="modal_filter" class="modal" class:modal-open={isModalFilterCourse}>
	<div class="modal-box bg-white p-0 rounded-lg shadow-xl max-w-2xl">
		<div class="bg-gradient-to-r from-orange-500 to-red-600 p-5 rounded-t-lg">
			<h2 class="text-2xl font-bold text-white mb-1">Filtri di Ricerca</h2>
			<p class="text-blue-100">Personalizza la tua ricerca selezionando i criteri desiderati</p>
		</div>

		<div class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="location" class="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
					<select
						id="location"
						bind:value={selectedLocation}
						class="select select-bordered w-full bg-orange-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli un luogo</option>
						{#each $province as item}
							<option value={item.sigla}>{item.nome}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="category" class="block text-sm font-medium text-gray-700 mb-1"
						>Categoria</label
					>
					<select
						id="category"
						bind:value={selectedTitle}
						class="select select-bordered w-full bg-orange-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli una categoria</option>
						{#each $coursesInfo as option}
							<option value={option.title}>{option.id}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="reflexologist" class="block text-sm font-medium text-gray-700 mb-1"
						>Riflessologo</label
					>
					<select
						id="reflexologist"
						bind:value={selectedUserId}
						class="select select-bordered w-full bg-orange-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli un riflessologo</option>
						{#each getTableNames as item}
							<option value={item.userId}>{item.surname} {item.name}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
			<button
				class="btn btn-error btn-sm rounded-md hover:bg-red-300"
				onclick={onCloseFilterSearch}
			>
				Annulla
			</button>
			<button
				class="btn btn-success btn-sm rounded-md hover:bg-green-400"
				onclick={onSubmitFilterSearch}
			>
				Applica Filtri
			</button>
		</div>
	</div>
</dialog>
<!-- /modal filter  -->
