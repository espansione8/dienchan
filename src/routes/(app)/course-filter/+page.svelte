<script lang="ts">
	// @ts-nocheck
	import { onMount } from 'svelte';
	import moment from 'moment';
	import {
		ChevronDown,
		ShieldAlert,
		Check,
		CalendarSearch,
		UserSearch,
		TextSearch,
		MapPinned,
		ShoppingCart,
		Trash2
	} from 'lucide-svelte';
	import Notification from '$lib/components/Notification.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	//import { cart } from '$lib/stores/cart';
	import { cartProducts, addToCart, removeFromCart } from '$lib/stores/cart';
	import { province, coursesInfo } from '$lib/stores/arrays.js';
	// import 'moment/locale/it';
	import 'moment/min/locales.js';
	// moment.locale('it');

	let { data } = $props();
	let { getTable, getTableNames, getLayout, auth } = $derived(data);
	let coursesList = $state(getTable);

	// console.log('coursesList', coursesList);

	const checkCart = (id) => {
		const check = $cartProducts.some((item) => item.prodId == id);
		return check;
	};
	// inizializzo ordinando visualizzanco prima quelli con giorno di svolgimento più recente
	coursesList.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

	function siglaToProvincia(provinciaSigla: any) {
		console.log('provinciaSigla', provinciaSigla);
		const findProvincia = $province.find((prov) => prov.sigla == provinciaSigla);
		return findProvincia?.nome || '';
	}

	// cycle to count the number of courses in each province
	const numCoursesInProvince = {};
	coursesList.forEach((item) => {
		const countryState = item.countryState;
		numCoursesInProvince[countryState] = (numCoursesInProvince[countryState] || 0) + 1;
		// key : value ---> es: numCoursesInProvince = {"Bologna": "1", "Firenze": "2", "Roma": "3"}
	});

	const sortAZconOnlineInCima = (a, b) => {
		if ('Online' in a) {
			return -1; // Metti sempre "Online" in cima
		} else if ('Online' in b) {
			return 1;
		} else {
			// Ordina le chiavi in ordine crescente A-Z
			const chiaveA = Object.keys(a)[0];
			const chiaveB = Object.keys(b)[0];
			return chiaveA.localeCompare(chiaveB);
		}
	};

	const nomiMesi = [
		'Gennaio',
		'Febbraio',
		'Marzo',
		'Aprile',
		'Maggio',
		'Giugno',
		'Luglio',
		'Agosto',
		'Settembre',
		'Ottobre',
		'Novembre',
		'Dicembre'
	];

	const capitalizzaPrimaLettera = (stringa) => {
		return stringa.replace(/\b\w/g, (l) => l.toUpperCase());
	};

	// Creare un oggetto per tenere traccia del conteggio per ogni mese
	let conteggioMesi = $state({});

	// Inizializza il conteggio per ogni mese a 0
	nomiMesi.forEach((mese) => (conteggioMesi[mese] = 0));

	// Contare le occorrenze per ogni mese
	getTable.forEach((item) => {
		const meseTesto = new Date(item.eventStartDate).toLocaleString('it-IT', { month: 'long' });
		const mese = capitalizzaPrimaLettera(meseTesto);
		conteggioMesi[mese]++;
	});

	// Creare un array con le informazioni per ogni mese
	const informazioniMesi = Object.entries(conteggioMesi).map(([mese, conteggio]) => {
		return {
			mese,
			conteggio
		};
	});

	let resetActive = $state(false);

	let filtriAttivi = $state({
		mese: '',
		provincia: '',
		evento: '',
		riflessologo: ''
	});

	const onFilterReset = () => {
		// invalidateAll();
		coursesList = getTable || '';
		coursesList.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

		filtriAttivi = {
			mese: '',
			provincia: '',
			evento: '',
			riflessologo: '',
			userId: ''
		};

		// chiude gli accordion
		const accordionList = ['accordion1', 'accordion2', 'accordion3', 'accordion4'];
		accordionList.forEach((item) => (document.getElementById(item).checked = false));
		// document.getElementById('accordion1').checked = false;

		resetActive = false;
	};

	const updateFilter = () => {
		coursesList = getTable;
		// provincia
		if (filtriAttivi.provincia) {
			coursesList = coursesList.filter((item) => item.countryState == filtriAttivi.provincia);
		}
		// riflessologo
		if (filtriAttivi.riflessologo) {
			coursesList = coursesList.filter((item) => item.userId == filtriAttivi.userId);
		}
		// mese
		if (filtriAttivi.mese) {
			const monthNumber = nomiMesi.indexOf(filtriAttivi.mese) + 1;
			coursesList = coursesList.filter((item) => {
				const eventMonth = new Date(item.eventStartDate).getMonth() + 1;
				return eventMonth == monthNumber;
			});
		}
		// Evento
		if (filtriAttivi.evento) {
			coursesList = coursesList.filter((item) => item.title == filtriAttivi.evento);
		}
	};

	const onClickFilterProvincia = async (provinciaSelected) => {
		resetActive = true;
		filtriAttivi.provincia = provinciaSelected;
		updateFilter();
	};

	const onClickFilterEvent = async (eventSelected) => {
		resetActive = true;
		// console.log('eventSelected', eventSelected);
		filtriAttivi.evento = eventSelected;
		// console.log('filtriAttivi.evento', filtriAttivi.evento);
		updateFilter();
	};

	const onClickFilterRiflessologo = async (id, name, surname) => {
		resetActive = true;
		filtriAttivi.userId = id;
		filtriAttivi.riflessologo = name + ' ' + surname;
		updateFilter();
	};

	const onClickFilterMonth = async (monthSelected) => {
		resetActive = true;
		filtriAttivi.mese = monthSelected;
		updateFilter();
	};

	// notification
	let toastClosed = $state(true);
	let notificationContent = $state('');
	let notificationError = $state(false);
	let startTimeout;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 5000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer

	let sortOption = $state('recent'); // Stato per l'opzione di ordinamento

	// Funzione per ordinare i corsi in base all'opzione selezionata
	let currentSort = $state('dal più recente');
	const sortCourses = (option) => {
		switch (option) {
			case 'expensive':
				currentSort = 'dal più costoso';
				return coursesList.sort((a, b) => b.price - a.price);
			case 'cheap':
				currentSort = 'dal più economico';
				return coursesList.sort((a, b) => a.price - b.price);
			case 'recent':
				currentSort = 'dal più recente';
				return coursesList.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));
			case 'oldest':
				currentSort = 'dal meno recente';
				return coursesList.sort((a, b) => new Date(a.eventStartDate) - new Date(b.eventStartDate));

			default:
				return coursesList;
		}
	};

	const onClickInfo = (idCourse: any) => {
		//  console.log('idCourse', idCourse);
		goto(`/course-detail/${idCourse}`);
	};
</script>

<svelte:head>
	<title>Lista corsi</title>
</svelte:head>

<div class="bg-base-200 grid grid-cols-12 grid-rows-[min-content] gap-y-12 p-4 lg:gap-x-8 lg:p-8">
	<!-- colonna accordion -->
	<section class="col-span-12 xl:col-span-3 bg-base-100 rounded-lg">
		<div class="flex flex-col space-y-4 w-auto p-3">
			<span>Filtri:</span>
			<div class="collapse collapse-arrow">
				<input id="accordion1" type="checkbox" class="peer" />
				<div
					class="collapse-title bg-base-200 text-base-content peer-checked:bg-blue-300 peer-checked:font-bold"
				>
					<span class="inline-flex items-center">
						<b><TextSearch class="-mt-1" /> Evento</b>
						{#if filtriAttivi?.evento.length > 0}
							<Check class="ml-1" color="green" />
						{/if}
					</span>
				</div>
				<div class="collapse-content bg-blue-50 text-base-content peer-checked:bg-base-100">
					<ul class="list-none -mx-4">
						{#each getLayout as option}
							<li
								class="p-2 border-b cursor-pointer transition-colors duration-300
							{filtriAttivi.evento == option.title
									? 'bg-orange-200 text-red-900 font-bold'
									: 'hover:bg-blue-200 hover:text-blue-900'}"
								onclick={() => onClickFilterEvent(option.title)}
							>
								{'>'}
								{option.title}
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div class="collapse collapse-arrow">
				<input id="accordion2" type="checkbox" class="peer" />
				<div
					class="collapse-title bg-base-200 text-base-content peer-checked:bg-blue-300 peer-checked:font-bold"
				>
					<span class="inline-flex items-center">
						<b><CalendarSearch class="-mt-1" /> Mese</b>
						{#if filtriAttivi.mese.length > 0}
							<Check class="ml-1" color="green" />
						{/if}
					</span>
				</div>
				<div class="collapse-content bg-base-100 text-base-content peer-checked:bg-base-100">
					<ul class="list-none -mx-4">
						{#each informazioniMesi as { mese, conteggio }}
							<li
								class="p-2 border-b cursor-pointer transition-colors duration-300
								{filtriAttivi.mese == mese
									? 'bg-orange-200 text-red-900 font-bold'
									: 'hover:bg-blue-200 hover:text-blue-900'}
									{conteggio == 0 ? 'text-gray-400 pointer-events-none' : ''}"
								onclick={() => onClickFilterMonth(mese)}
							>
								{'>'}
								{mese} ({conteggio})
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div class="collapse collapse-arrow">
				<input id="accordion3" type="checkbox" class="peer" />
				<div
					class="collapse-title bg-base-200 text-base-content peer-checked:bg-blue-300 peer-checked:font-bold"
				>
					<span class="inline-flex items-center">
						<b
							><MapPinned class="-mt-1 mr-1" />
							Provincia</b
						>
						{#if filtriAttivi.provincia.length > 0}
							<Check class="ml-1" color="green" />
						{/if}
					</span>
				</div>
				<div class="collapse-content bg-base-100 text-base-content peer-checked:bg-base-100">
					<ul class="list-none -mx-4">
						{#each Object.entries(numCoursesInProvince) as [chiave, valore]}
							<li
								class="p-2 border-b cursor-pointer transition-colors duration-300
								{filtriAttivi.provincia == chiave
									? 'bg-orange-200 text-red-900 font-bold'
									: 'hover:bg-blue-200 hover:text-blue-900'}"
								onclick={() => onClickFilterProvincia(chiave)}
							>
								{'>'}
								{chiave}: ({valore})
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div class="collapse collapse-arrow">
				<input id="accordion4" type="checkbox" class="peer" />
				<div
					class="collapse-title bg-base-200 text-base-content peer-checked:bg-blue-300 peer-checked:font-bold"
				>
					<span class="inline-flex items-center">
						<b><UserSearch class="-mt-1 mr-1" />Riflessologo</b>
						{#if filtriAttivi.riflessologo.length > 0}
							<Check class="ml-1" color="green" />
						{/if}
					</span>
				</div>
				<div class="collapse-content bg-base-100 text-base-content peer-checked:bg-base-100">
					<ul class="list-none p-0 -mx-4">
						{#each getTableNames as item}
							<li
								class="p-2 border-b cursor-pointer transition-colors duration-300
							{filtriAttivi.riflessologo == `${item.name} ${item.surname}`
									? 'bg-orange-200 text-red-900 font-bold'
									: 'hover:bg-blue-200 hover:text-blue-900'}"
								onclick={() => onClickFilterRiflessologo(item.userId, item.name, item.surname)}
							>
								{'>'}
								{item.name}
								{item.surname}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</section>
	<!-- colonna ordina, filtri e card -->
	<section class="col-span-12 xl:col-span-9 bg-base-100 rounded-lg">
		<!-- ORDINA BUTTON -->
		<div class="flex items-center justify-between p-4">
			<!-- Visualizzazione corsi disponibili -->
			<div
				class="btn btn-sm rounded-md cursor-default {coursesList.length > 0
					? 'bg-green-300 hover:bg-green-300'
					: 'bg-red-300 hover:bg-red-300'}"
			>
				Corsi disponibili:
				<div class="badge rounded-md flex justify-center">
					<strong class="">{coursesList.length}</strong>
				</div>
			</div>
			<!-- bottone ordina -->
			<div class="dropdown dropdown-end flex relative">
				<button
					id="dropdownSortButton"
					class="btn btn-sm bg-blue-200 border-blue-500 text-blue-500 rounded-md hover:border-blue-100 hover:text-blue-200"
					aria-expanded="false"
					onclick={() => document.getElementById('dropdownSortContent').classList.remove('hidden')}
				>
					<span class="flex items-center justify-center space-x-1"
						><strong>Ordina: {currentSort}</strong>
						<ChevronDown class="" /></span
					>
				</button>
				<ul
					id="dropdownSortContent"
					class="dropdown-content menu z-[1] bg-gray-100 p-2 rounded-lg shadow w-max gap-2 absolute"
					style="left: 50%; transform: translateX(-50%); top: 100%;"
				>
					<li>
						<a
							class="dropdown-item"
							href="#1"
							onclick={() => {
								sortCourses('recent');
								document.getElementById('dropdownSortContent').classList.add('hidden');
							}}
						>
							dal più recente</a
						>
					</li>
					<li>
						<a
							class="dropdown-item cursor-pointer"
							href="#1"
							onclick={() => {
								sortCourses('oldest');
								document.getElementById('dropdownSortContent').classList.add('hidden');
							}}
						>
							dal meno recente</a
						>
					</li>
					<li>
						<a
							class="dropdown-item"
							href="#1"
							onclick={() => {
								sortCourses('expensive');
								document.getElementById('dropdownSortContent').classList.add('hidden');
							}}>dal più costoso</a
						>
					</li>
					<li>
						<a
							class="dropdown-item"
							href="#1"
							onclick={() => {
								sortCourses('cheap');
								document.getElementById('dropdownSortContent').classList.add('hidden');
							}}>dal meno costoso</a
						>
					</li>
				</ul>
			</div>
		</div>
		<!-- Visualizzazione filtri attivi e RESET -->
		{#if resetActive}
			<div class="flex items-center space-x-4 pb-3 px-4">
				<!-- Pulsante Reset Filter -->
				<button
					class="btn btn-sm bg-red-200 border-red-500 text-red-500 px-3 py-2 rounded-md hover:border-red-100 hover:bg-red-400 hover:text-red-200"
					onclick={onFilterReset}
				>
					Reset filtri
				</button>
				<!-- Visualizzazione Filtri Attivi -->
				<div class="text-gray-700">
					<span class="">Filtri attivi</span>

					{#if filtriAttivi.evento.length > 0}
						<div class="badge badge-accent rounded-md">
							Evento: <strong class="pl-1">{filtriAttivi.evento}</strong>
						</div>
					{/if}
					{#if filtriAttivi.mese.length > 0}
						<div class="badge badge-accent rounded-md">
							Mese: <strong class="pl-1">{filtriAttivi.mese}</strong>
						</div>
					{/if}
					{#if filtriAttivi.provincia.length > 0}
						<div class="badge badge-accent rounded-md">
							Provincia: <strong class="pl-1">{filtriAttivi.provincia}</strong>
						</div>
					{/if}
					{#if filtriAttivi.riflessologo.length > 0}
						<div class="badge badge-accent rounded-md">
							Riflessologo: <strong class="pl-1">{filtriAttivi.riflessologo}</strong>
						</div>
					{/if}
				</div>
			</div>
		{/if}
		<!-- end ORDINA BUTTON -->
		<!-- CARD -->
		<div class="flex flex-wrap justify-center gap-3 pl-3 pb-4">
			{#if coursesList.length == 0}
				<div
					class="alert alert-warning shadow-lg text-center rounded-md mt-6 mx-auto w-full max-w-md"
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
			{#each coursesList as courseData, i}
				<div
					class="card card-compact overflow-hidden bg-base-100 max-w-xs rounded-xl shadow-md border"
				>
					<figure class="px-8 pt-8">
						<img
							src={courseData.layoutView.urlPic}
							alt="tipo corso"
							class="h-full w-full object-cover border-2 rounded-lg"
						/>
					</figure>
					<div class="card-body items-center text-center">
						<!-- data giorno -->
						<h2 class="card-title text-2xl">
							{courseData.eventStartDate}
						</h2>
						<!-- luogo -->
						<p class="card-text text-xl">
							<b>{courseData.countryState}</b>
						</p>
						<!-- title -->
						<h5
							class="card-text text-xl bg-base-200 border rounded-md shadow-sm font-semibold p-2
						 {courseData.layoutView.bgColor}"
						>
							{courseData.layoutView.title}
						</h5>
						<!-- riflessologo -->
						<p class="card-text">
							Riflessologo: <b>{courseData.name} {courseData.surname}</b>
						</p>
						<!-- dalle x alle y -->
						<h5 class="card-text">
							Dalle <b>{courseData.timeStartDate}</b>
							<!-- alle <b>{moment(courseData.eventEndDate).format(' HH:mm')}</b> -->
						</h5>
						<!-- price -->
						<p class="card-text">
							{#if auth}
								loggato
							{/if}

							Prezzo: <b>{auth ? courseData.layoutView.price : courseData.layoutView.price + 25}</b>
						</p>
						<div class="card-actions">
							<span class="flex justify-between gap-10 my-3">
								<button
									class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:text-gray-300"
									onclick={() => onClickInfo(courseData.prodId)}>Info</button
								>
								{#if checkCart(courseData.prodId)}
									<!-- in carello -->
									<button
										class="btn btn-sm bg-red-200 w-48 border border-red-400 rounded-md text-red-700 hover:text-red-700 hover:bg-red-400 inline-flex items-center justify-center space-x-2"
										onclick={() => removeFromCart($cartProducts, courseData)}
										><Trash2 />Rimuovi dal Carrello</button
									>
								{:else}
									<!-- non in carello -->
									<button
										class="btn btn-sm bg-green-200 w-48 btn-success rounded-md text-green-700 hover:text-green-300 inline-flex items-center justify-center space-x-2"
										onclick={() => addToCart($cartProducts, courseData, false)}
										><ShoppingCart /> Aggiungi al Carrello</button
									>
								{/if}
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<!-- end CARD -->
	</section>
</div>
<Notification {toastClosed} {notificationContent} {notificationError} />

<style>
</style>
