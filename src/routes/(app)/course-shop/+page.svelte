<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import CartFloat from '$lib/components/CartFloat.svelte';
	import { cartProducts, addToCart, removeFromCart } from '$lib/stores/cart';
	import {
		ChevronDown,
		ShieldAlert,
		Check,
		CalendarSearch,
		UserSearch,
		TextSearch,
		MapPinned,
		ShoppingCart,
		Trash2,
		CircleX,
		Tags
	} from 'lucide-svelte';
	//import { province } from '$lib/stores/arrays.js';

	let { data } = $props();
	let { getTable, getTableNames, getLayout, auth } = $derived(data);
	let coursesList = $state(getTable);

	let resetActive = $state(false);
	let currentSort = $state('dal più recente');

	let filtriAttivi = $state({
		mese: '',
		provincia: '',
		evento: '',
		riflessologo: ''
	});

	const checkCart = (id: any) => {
		const check = $cartProducts.some((item) => item.prodId == id);
		return check;
	};
	// inizializzo ordinando visualizzanco prima quelli con giorno di svolgimento più recente
	coursesList.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

	// cycle to count the number of courses in each province
	let numCoursesInProvince: any = {};
	coursesList.forEach((item) => {
		item.county.forEach((province) => {
			numCoursesInProvince[province] = (numCoursesInProvince[province] || 0) + 1;
		});
	});

	// Ordina le chiavi dell'oggetto in ordine alfabetico
	const sortedNumCoursesInProvince: Record<string, number> = Object.keys(numCoursesInProvince)
		.sort((a, b) => {
			// Se "Online" è presente, mettiamolo in cima
			if (a === 'Online') return -1;
			if (b === 'Online') return 1;

			// Altrimenti ordina alfabeticamente
			return a.localeCompare(b);
		})
		.reduce(
			(acc, key) => {
				acc[key] = numCoursesInProvince[key];
				return acc;
			},
			{} as Record<string, number>
		);

	numCoursesInProvince = sortedNumCoursesInProvince;

	// vecchio non c'era l'array di stringhe -> county
	// coursesList.forEach((item) => {
	// 	const countryState = item.county;
	// 	numCoursesInProvince[countryState] = (numCoursesInProvince[countryState] || 0) + 1;
	// 	// key : value ---> es: numCoursesInProvince = {"Bologna": "1", "Firenze": "2", "Roma": "3"}
	// });

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

	const onFilterReset = () => {
		// invalidateAll();
		resetActive = false;
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
	};

	const updateFilter = () => {
		coursesList = getTable;
		// provincia
		if (filtriAttivi.provincia) {
			// coursesList = coursesList.filter((item) => item.county == filtriAttivi.provincia);
			coursesList = coursesList.filter((item) =>
				item.county.some((county) => county === filtriAttivi.provincia)
			);
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

	const onClickInfo = (idCourse: any) => {
		//  console.log('idCourse', idCourse);
		goto(`/course-detail/${idCourse}`);
	};

	// sort
	const sortItems = (option) => {
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
</script>

<svelte:head>
	<title>Lista corsi</title>
</svelte:head>

<div class="bg-base-200 grid grid-cols-12 grid-rows-[min-content] gap-y-12 p-4 lg:gap-x-8 lg:p-8">
	<!-- Filter column -->
	<section
		class="col-span-12 xl:col-span-3 bg-base-100 rounded-lg shadow-md border border-base-200 overflow-hidden"
	>
		<div class="flex flex-col w-auto">
			<!-- Filter Header -->
			<div class="bg-primary text-primary-content p-4 relative overflow-hidden">
				<div class="absolute inset-0 opacity-20">
					<!-- Using SVG pattern instead of imported icons -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="w-32 h-32 -rotate-12 absolute -right-8 -bottom-8"
					>
						<path
							d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
						/>
					</svg>
				</div>
				<h2 class="text-xl font-bold relative z-10">Filtri</h2>
				<p class="text-sm opacity-90 mt-1 relative z-10">Affina la tua ricerca</p>
			</div>

			<!-- Filter Body -->
			<div class="p-4 space-y-4">
				<!-- Event Filter -->
				<div
					class="collapse collapse-arrow bg-base-100 border border-base-200 rounded-lg hover:border-primary/30 transition-colors duration-200"
				>
					<input id="accordion1" type="checkbox" class="peer" />
					<div
						class="collapse-title bg-base-200 text-base-content peer-checked:bg-blue-300 peer-checked:font-bold"
					>
						<span class="inline-flex items-center">
							<b><TextSearch class="-mt-1 mr-2" /> Evento</b>
							{#if filtriAttivi?.evento.length > 0}
								<Check class="ml-1" color="green" />
							{/if}
						</span>
					</div>
					<div
						class="collapse-content bg-blue-50 text-base-content peer-checked:bg-base-100 max-h-[250px] overflow-y-auto"
					>
						<ul class="list-none -mx-4 divide-y divide-base-200/70">
							{#each getLayout as option}
								<li
									class="p-3 cursor-pointer transition-all duration-300 flex items-center
                {filtriAttivi.evento == option.title
										? 'bg-orange-200 text-red-900 font-bold'
										: 'hover:bg-blue-200 hover:text-blue-900'}
"
									onclick={() => onClickFilterEvent(option.title)}
								>
									<span class="flex-1">{option.title} </span>
									{#if filtriAttivi.evento == option.title}
										<Check size={18} class="flex-shrink-0 text-green-600" />
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<!-- Month Filter -->
				<div
					class="collapse collapse-arrow bg-base-100 border border-base-200 rounded-lg hover:border-primary/30 transition-colors duration-200"
				>
					<input id="accordion2" type="checkbox" class="peer" />
					<div
						class="collapse-title bg-base-200 text-base-content peer-checked:bg-blue-300 peer-checked:font-bold"
					>
						<span class="inline-flex items-center">
							<b><CalendarSearch class="-mt-1 mr-2" /> Mese</b>
							{#if filtriAttivi.mese.length > 0}
								<Check class="ml-1" color="green" />
							{/if}
						</span>
					</div>
					<div
						class="collapse-content bg-base-100 text-base-content peer-checked:bg-base-100 max-h-[250px] overflow-y-auto"
					>
						<ul class="list-none -mx-4 divide-y divide-base-200/70">
							{#each informazioniMesi as { mese, conteggio }}
								<li
									class="p-3 cursor-pointer transition-all duration-300 flex items-center justify-between
                {filtriAttivi.mese == mese
										? 'bg-orange-200 text-red-900 font-bold'
										: 'hover:bg-blue-200 hover:text-blue-900'}
                  {conteggio == 0 ? 'text-gray-400 pointer-events-none opacity-50' : ''}"
									onclick={() => onClickFilterMonth(mese)}
								>
									<span>{mese}</span>
									<div class="flex items-center gap-2">
										<span class="badge badge-sm badge-ghost">{conteggio}</span>
										{#if filtriAttivi.mese == mese}
											<Check size={18} class="flex-shrink-0 text-green-600" />
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<!-- Province Filter -->
				<div
					class="collapse collapse-arrow bg-base-100 border border-base-200 rounded-lg hover:border-primary/30 transition-colors duration-200"
				>
					<input id="accordion3" type="checkbox" class="peer" />
					<div
						class="collapse-title bg-base-200 text-base-content peer-checked:bg-blue-300 peer-checked:font-bold"
					>
						<span class="inline-flex items-center">
							<b><MapPinned class="-mt-1 mr-2" /> Provincia</b>
							{#if filtriAttivi.provincia.length > 0}
								<Check class="ml-1" color="green" />
							{/if}
						</span>
					</div>
					<div
						class="collapse-content bg-base-100 text-base-content peer-checked:bg-base-100 max-h-[250px] overflow-y-auto"
					>
						<ul class="list-none -mx-4 divide-y divide-base-200/70">
							{#each Object.entries(numCoursesInProvince) as [chiave, valore]}
								<li
									class="p-3 cursor-pointer transition-all duration-300 flex items-center justify-between
                {filtriAttivi.provincia == chiave
										? 'bg-orange-200 text-red-900 font-bold'
										: 'hover:bg-blue-200 hover:text-blue-900'}"
									onclick={() => onClickFilterProvincia(chiave)}
								>
									<span>{chiave}</span>
									<div class="flex items-center gap-2">
										<span class="badge badge-sm badge-ghost">{valore}</span>
										{#if filtriAttivi.provincia == chiave}
											<Check size={18} class="flex-shrink-0 text-green-600" />
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<!-- Riflessologo Filter -->
				<div
					class="collapse collapse-arrow bg-base-100 border border-base-200 rounded-lg hover:border-primary/30 transition-colors duration-200"
				>
					<input id="accordion4" type="checkbox" class="peer" />
					<div
						class="collapse-title bg-base-200 text-base-content peer-checked:bg-blue-300 peer-checked:font-bold"
					>
						<span class="inline-flex items-center">
							<b><UserSearch class="-mt-1 mr-2" /> Riflessologo</b>
							{#if filtriAttivi.riflessologo.length > 0}
								<Check class="ml-1" color="green" />
							{/if}
						</span>
					</div>
					<div
						class="collapse-content bg-base-100 text-base-content peer-checked:bg-base-100 max-h-[250px] overflow-y-auto"
					>
						<ul class="list-none -mx-4 divide-y divide-base-200/70">
							{#each getTableNames as item}
								<li
									class="p-3 cursor-pointer transition-all duration-300 flex items-center justify-between
                {filtriAttivi.riflessologo == `${item.name} ${item.surname}`
										? 'bg-orange-200 text-red-900 font-bold'
										: 'hover:bg-blue-200 hover:text-blue-900'}"
									onclick={() => onClickFilterRiflessologo(item.userId, item.name, item.surname)}
								>
									<span>{item.name} {item.surname}</span>
									{#if filtriAttivi.riflessologo == `${item.name} ${item.surname}`}
										<Check size={18} class="flex-shrink-0 text-green-600" />
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<!-- Reset Button -->
				{#if resetActive}
					<div class="pt-3 mt-2 border-t border-base-200">
						<button
							class="btn btn-sm w-full bg-red-200 border border-red-500 text-red-500 px-3 py-2 rounded-md hover:border-red-100 hover:bg-red-400 hover:text-red-200 flex items-center justify-center gap-2"
							onclick={onFilterReset}
						>
							<CircleX size={16} />
							Reset filtri
						</button>
					</div>
				{/if}
			</div>
		</div>
	</section>
	<!-- colonna ordina, filtri e card -->
	<section class="col-span-12 xl:col-span-9 bg-base-100 rounded-lg">
		<div class="flex items-center p-4">
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
			<!-- Reset button -->
			{#if resetActive}
				<button
					class="btn btn-sm px-3 py-2 ml-4 rounded-md bg-red-200 border-red-500 text-red-500 hover:border-red-100 hover:bg-red-400 hover:text-red-200"
					onclick={onFilterReset}
				>
					<CircleX size={16} />
					Reset filtri
				</button>
			{/if}
			<!-- Sort button -->
			<div class="dropdown dropdown-end ml-auto">
				<button
					id="dropdownSortButton"
					class="btn btn-sm btn-primary btn-outline gap-2 rounded-md"
					tabindex="0"
				>
					<span class="flex items-center justify-center gap-2">
						Ordina: <span class="font-bold">{currentSort}</span>
						<ChevronDown />
					</span>
				</button>
				<ul class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-lg w-52 mt-1">
					<li>
						<button
							class="flex items-center {currentSort === 'dal più recente'
								? 'bg-primary/10 text-primary font-medium'
								: ''}"
							onclick={() => sortItems('recent')}
						>
							dal più recente
						</button>
					</li>
					<li>
						<button
							class="flex items-center {currentSort === 'dal meno recente'
								? 'bg-primary/10 text-primary font-medium'
								: ''}"
							onclick={() => sortItems('oldest')}
						>
							dal meno recente
						</button>
					</li>
					<li>
						<button
							class="flex items-center {currentSort === 'dal più costoso'
								? 'bg-primary/10 text-primary font-medium'
								: ''}"
							onclick={() => sortItems('expensive')}
						>
							dal più costoso
						</button>
					</li>
					<li>
						<button
							class="flex items-center {currentSort === 'dal meno costoso'
								? 'bg-primary/10 text-primary font-medium'
								: ''}"
							onclick={() => sortItems('cheap')}
						>
							dal meno costoso
						</button>
					</li>
				</ul>
			</div>
		</div>
		<!-- Visualizzazione filtri attivi e RESET -->
		{#if resetActive}
			<div class="flex items-center space-x-4 pb-3 px-4">
				<!-- Active filter -->
				<div class="text-gray-700">
					<span><Tags /></span>
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
							class="h-full w-full object-contain border-2 rounded-lg"
						/>
					</figure>
					<div class="card-body items-center text-center">
						<!-- data giorno -->
						<h2 class="card-title text-2xl">
							{courseData.eventStartDate}
						</h2>
						<!-- luogo -->
						<p class="card-text text-xl">
							<b>{courseData.county}</b>
						</p>
						<!-- title -->
						<h5
							class="card-text text-xl border rounded-md shadow-sm font-semibold p-2 bg-neutral-200"
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
						</h5>
						<!-- price -->
						<p class="card-text">
							Prezzo: <b>{courseData.layoutView.price}</b>
						</p>
						{#if !auth}
							<p class="card-text text-xs rounded-md weight font-bold bg-neutral-200">
								+25€ di tesseramento solo al primo corso
							</p>
						{/if}
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
										class="btn btn-sm w-48 btn-success rounded-md inline-flex items-center justify-center space-x-2"
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
{#if $cartProducts.length > 0}
	<CartFloat />
{/if}

<style>
</style>
