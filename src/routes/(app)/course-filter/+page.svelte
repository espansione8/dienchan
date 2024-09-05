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
		MapPinned
	} from 'lucide-svelte';
	import Notification from '$lib/components/Notification.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { coursesTypes } from '$lib/stores/arrays';
	import { cart } from '$lib/stores/cart';
	import { province } from '$lib/stores/arrays.js';

	import { coursesInfo } from '$lib/stores/arrays.js';

	// console.log('cart', cart);

	// import 'moment/locale/it';
	import 'moment/min/locales.js';
	// moment.locale('it');

	let { data } = $props();
	let { getTableCourses, getTableNames } = $derived(data);
	let coursesList = $state(getTableCourses);
	const listaProvince = $province;
	// inizializzo ordinando visualizzanco prima quelli con giorno di svolgimento più recente
	coursesList.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

	// console.log('getTableNames', getTableNames);

	const categoryColors = {
		'Corso base': 'bg-green-500',
		'Corso avanzato': 'bg-orange-400',
		'Workshop - Bellezza viso': 'bg-purple-400',
		'Workshop - Difese immunitarie': 'bg-blue-400',
		'Workshop - Pronto soccorso': 'bg-blue-400',
		'Workshop - Occhi & Vista': 'bg-blue-400',
		Accademia: 'bg-red-600'
	};

	function siglaToProvincia(provinciaSigla) {
		const findProvincia = listaProvince.find((prov) => prov.sigla === provinciaSigla);
		//**** listaProvince.place 'Online' is ignored */
		if (findProvincia) {
			return findProvincia.nome;
		} else if (provinciaSigla === 'Online') {
			return 'Online';
		}
	}

	function findNameRiflessologo(userIdCode) {
		const findRiflessologo = getTableNames.find((user) => user.userId === userIdCode);
		return `${findRiflessologo.name} ${findRiflessologo.surname}`;
	}

	// function risultatoConteggioProvince() {
	const conteggioProvince = {};

	// Iteriamo sull'array e contiamo le occorrenze delle province
	coursesList.forEach((item) => {
		const provincia = item.place;
		conteggioProvince[provincia] = (conteggioProvince[provincia] || 0) + 1;
	});

	// Creiamo un nuovo array con gli oggetti richiesti
	const risultato = Object.entries(conteggioProvince).map(([provincia, conteggio]) => {
		const risultatoParziale = {};
		risultatoParziale[provincia] = conteggio;
		return risultatoParziale;
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

	risultato.sort(sortAZconOnlineInCima);
	// }
	// Usiamo un oggetto per tenere traccia del conteggio delle province

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
	getTableCourses.forEach((item) => {
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
		riflessologo: '',
		nomeRiflessologo: '',
		cognomeRiflessologo: ''
	});

	const onFilterReset = () => {
		// invalidateAll();
		coursesList = getTableCourses || '';
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
		coursesList = getTableCourses;
		// provincia
		if (filtriAttivi.provincia) {
			coursesList = coursesList.filter((item) => item.place === filtriAttivi.provincia);
		}
		// riflessologo
		if (filtriAttivi.riflessologo) {
			coursesList = coursesList.filter((item) => item.userId === filtriAttivi.userId);
		}
		// mese
		if (filtriAttivi.mese) {
			const monthNumber = nomiMesi.indexOf(filtriAttivi.mese) + 1;
			coursesList = coursesList.filter((item) => {
				const eventMonth = new Date(item.eventStartDate).getMonth() + 1;
				return eventMonth === monthNumber;
			});
		}

		// console.log('coursesList_ before', coursesList);
		// Evento
		if (filtriAttivi.evento) {
			coursesList = coursesList.filter((item) => item.category == filtriAttivi.evento);
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

	// TODO per chiudere il drodown
	// AGG provato ma mi dice che serve tag details
	// let openDropdown= $state(false);

	// function handleClickItem() {
	// 	// close it
	// 	openDropdown = false;
	// }

	const onClickInfo = (idCourse: any) => {
		//  console.log('idCourse', idCourse);
		goto(`/course-detail/${idCourse}`);
	};

	// cart store
	const addToCart = (course) => {
		cart.update((n) => {
			// console.log('n', n);
			n.push(course);
			return n;
		});
	};

	const removeFromCart = (courseId) => {
		cart.update((n) => {
			// Filtra il carrello per rimuovere il corso con l'ID specificato
			return n.filter((item) => item.prodCorsoId !== courseId.prodCorsoId);
		});
	};

	// console.log('getTableCourses.category',getTableCourses)
	const course = $coursesInfo.filter((item: any) => item.id == coursesList.category);

	const imgSrc = (value: string) => {
		const src = $coursesInfo.filter((item: any) => item.id == value);
		return src[0].urlPic;
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
						{#if filtriAttivi.evento.length > 0}
							<Check class="ml-1" color="green" />
						{/if}
					</span>
				</div>
				<div class="collapse-content bg-blue-50 text-base-content peer-checked:bg-base-100">
					<ul class="list-none -mx-4">
						{#each $coursesInfo as option}
							<li
								class="p-2 border-b cursor-pointer transition-colors duration-300
							{filtriAttivi.evento === option.id
									? 'bg-orange-200 text-red-900 font-bold'
									: 'hover:bg-blue-200 hover:text-blue-900'}"
								onclick={() => onClickFilterEvent(option.id)}
							>
								{'>'}
								{option.id}
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
								{filtriAttivi.mese === mese
									? 'bg-orange-200 text-red-900 font-bold'
									: 'hover:bg-blue-200 hover:text-blue-900'}
									{conteggio === 0 ? 'text-gray-400 pointer-events-none' : ''}"
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
						{#each risultato as elemento (elemento)}
							{#each Object.entries(elemento) as [chiave, valore] (chiave)}
								<li
									class="p-2 border-b cursor-pointer transition-colors duration-300
								{filtriAttivi.provincia === chiave
										? 'bg-orange-200 text-red-900 font-bold'
										: 'hover:bg-blue-200 hover:text-blue-900'}"
									onclick={() => onClickFilterProvincia(chiave)}
								>
									{'>'}
									{siglaToProvincia(chiave)}: ({valore})
								</li>
							{/each}
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
							{filtriAttivi.riflessologo === `${item.name} ${item.surname}`
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
							Provincia: <strong class="pl-1">{siglaToProvincia(filtriAttivi.provincia)}</strong>
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
			{#if coursesList.length === 0}
				<div
					class="alert alert-warning shadow-lg text-center rounded-md mt-6 mx-auto w-full max-w-md"
				>
					<div>
						<ShieldAlert />
						<br />
						<span class="mt-2 text-semibold"
							>Nessun corso trovato per il mese selezionato. Prova a selezionare un altro mese o
							resetta il filtro.</span
						>
					</div>
				</div>
			{/if}
			{#each coursesList as corsoData, i}
				<div
					class="card card-compact overflow-hidden bg-base-100 max-w-xs rounded-xl shadow-md border"
				>
					<figure class="px-8 pt-8">
						<img
							src={imgSrc(corsoData.category[0])}
							alt="tipo corso"
							class="h-full w-full object-cover border-2 rounded-lg"
						/>
					</figure>
					<div class="card-body items-center text-center">
						<!-- data giorno -->
						<h2 class="card-title text-2xl">
							{moment(corsoData.eventStartDate).format('DD/MM/YYYY')}
						</h2>
						<!-- luogo -->
						{#if corsoData.place !== 'Online'}
							<p class="card-text text-xl">
								<b>{siglaToProvincia(corsoData.place)}</b>
							</p>
						{:else if corsoData.place === 'Online'}
							<p class="card-text text-xl">
								<b>{corsoData.place}</b>
							</p>
						{/if}
						<!-- title -->
						<h5
							class="card-text text-xl bg-base-200 border rounded-md shadow-sm font-semibold p-2
						{categoryColors[corsoData.category]}"
						>
							{corsoData.title}
						</h5>
						<!-- riflessologo -->
						<p class="card-text">
							Riflessologo: <b>{findNameRiflessologo(corsoData.userId)}</b>
						</p>
						<!-- dalle x alle y -->
						<h5 class="card-text">
							Dalle <b>{moment(corsoData.eventStartDate).format('HH:mm')}</b>
							alle <b>{moment(corsoData.eventEndDate).format(' HH:mm')}</b>
						</h5>
						<!-- price -->
						<p class="card-text">
							Prezzo: <b>{corsoData.price}</b>
						</p>

						<div class="card-actions">
							<span class="flex justify-between gap-10 my-3">
								<button
									class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:text-gray-300"
									onclick={() => onClickInfo(corsoData.prodCorsoId)}>Info</button
								>

								{#if $cart.some((item) => item.prodCorsoId == corsoData.prodCorsoId)}
									<!-- in carello -->
									<button
										class="btn btn-sm bg-red-200 w-40 border border-red-400 rounded-md text-red-700 hover:text-red-700 hover:bg-red-400"
										onclick={() => removeFromCart(corsoData)}>Rimuovi dal Carrello</button
									>
								{:else}
									<!-- non in carello -->
									<button
										class="btn btn-sm bg-green-200 w-40 btn-success rounded-md text-green-700 hover:text-green-300"
										onclick={() => addToCart(corsoData)}>Aggiungi a Carrello</button
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
