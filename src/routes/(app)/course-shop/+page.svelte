<script lang="ts">
	//import { goto, invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import CartFloat from '$lib/components/CartFloat.svelte';
	import { cartProducts } from '$lib/stores/cart';
	import {
		ChevronDown,
		ShieldAlert,
		Check,
		CalendarSearch,
		UserSearch,
		TextSearch,
		MapPinned,
		SlidersHorizontal,
		CircleX,
		Tags,
		BookOpen,
		Clock,
		MapPin,
		UserCircle,
		AlertCircle,
		Info,
		Calendar
	} from 'lucide-svelte';
	//import { province } from '$lib/stores/arrays.js';

	const { data } = $props();
	const { getTable, getTableNames, getLayout, auth } = data;
	let coursesList = $state(getTable);

	let resetActive = $state(false);
	let currentSort = $state('dal più recente');

	let filtriAttivi = $state({
		mese: '',
		provincia: '',
		evento: '',
		riflessologo: ''
	});

	// inizializzo ordinando visualizzanco prima quelli con giorno di svolgimento più recente
	coursesList.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

	// cycle to count the number of courses in each province
	let numCoursesInProvince: any = $state({});
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
		coursesList = getTable || [];
		coursesList.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

		filtriAttivi = {
			mese: '',
			provincia: '',
			evento: '',
			riflessologo: ''
			//userId: ''
		};

		// chiude gli accordion
		const accordionList = ['accordion1', 'accordion2', 'accordion3', 'accordion4'];
		accordionList.forEach((item) => (document.getElementById(item).checked = false));
		// document.getElementById('accordion1').checked = false;
	};

	const updateFilter = () => {
		coursesList = getTable;
		// Evento
		if (filtriAttivi.evento) {
			coursesList = coursesList.filter((item) => item.layoutView.title == filtriAttivi.evento);
		}
		// mese
		if (filtriAttivi.mese) {
			const monthNumber = nomiMesi.indexOf(filtriAttivi.mese) + 1;
			coursesList = coursesList.filter((item) => {
				const eventMonth = new Date(item.eventStartDate).getMonth() + 1;
				return eventMonth == monthNumber;
			});
		}
		// provincia
		if (filtriAttivi.provincia) {
			// coursesList = coursesList.filter((item) => item.county == filtriAttivi.provincia);
			coursesList = coursesList.filter((item) =>
				item.county.some((county) => county === filtriAttivi.provincia)
			);
		}
		// riflessologo
		if (filtriAttivi.riflessologo) {
			coursesList = coursesList.filter((item) => item.userId == filtriAttivi.riflessologo);
		}
	};

	const onClickFilterEvent = async (eventSelected) => {
		resetActive = true;
		filtriAttivi.evento = eventSelected;
		// console.log('filtriAttivi.evento', filtriAttivi.evento);
		updateFilter();
	};
	const onClickFilterMonth = async (monthSelected) => {
		resetActive = true;
		filtriAttivi.mese = monthSelected;
		updateFilter();
	};
	const onClickFilterProvincia = async (provinciaSelected) => {
		resetActive = true;
		filtriAttivi.provincia = provinciaSelected;
		updateFilter();
	};
	const onClickFilterRiflessologo = async (id, name, surname) => {
		resetActive = true;
		filtriAttivi.riflessologo = id;
		//filtriAttivi.riflessologo = name + ' ' + surname;
		updateFilter();
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
		class="col-span-12 xl:col-span-2 bg-base-100 rounded-lg shadow-md border border-base-200 overflow-hidden"
	>
		<div class="flex flex-col w-auto">
			<!-- Filter Header -->
			<div class="bg-primary text-primary-content p-4 relative overflow-hidden">
				<div class="absolute inset-0 opacity-20">
					<SlidersHorizontal class="w-32 h-32 -rotate-12 absolute -right-8 -bottom-8" />
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
	<!-- Product column -->
	<section class="col-span-12 xl:col-span-10 bg-base-100 rounded-lg">
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
		<div class="flex flex-wrap justify-center gap-6 pl-3 pb-4">
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
					class="card overflow-hidden bg-base-100 rounded-xl shadow-lg border
	border-base-200 hover:shadow-xl transition-shadow duration-300 flex flex-col w-full sm:w-81"
					class:h-114={auth}
					class:h-128={!auth}
				>
					<div class="relative px-6 pt-6 pb-2 bg-base-200/30 space-y-0">
						<a href="/course-detail/{courseData.prodId}">
							<div class="absolute -top-1 -right-1 z-10 opacity-85">
								<div class="relative">
									<div
										class="bg-gradient-to-r from-primary to-primary/80 text-primary-content px-4 py-2 rounded-bl-lg rounded-tr-lg shadow-md"
									>
										<span class="text-xs font-semibold">PREZZO</span>
										<div class="flex items-baseline">
											<span class="text-2xl font-bold">€ {courseData.layoutView.price}</span>
										</div>
									</div>
									<div
										class="absolute top-0 right-0 w-0 h-0 border-t-8 border-t-primary/80 border-r-8 border-r-transparent transform translate-x-full"
									></div>
								</div>
							</div>
							<div class="h-48 w-full flex items-center justify-center">
								<img
									src={courseData.layoutView.urlPic || '/images/placeholder.jpg'}
									alt={courseData.layoutView.title}
									class="h-full max-h-48 w-auto object-contain rounded-lg hover:scale-110 transition-transform duration-500"
								/>
							</div>
						</a>
					</div>

					<div class="card-body px-5 py-2 flex-grow">
						<a href="/course-detail/{courseData.prodId}">
							<h3 class="card-title text-lg font-bold text-primary flex items-start gap-2 mb-2">
								<BookOpen size={18} class="flex-shrink-0 mt-1" />
								<span>{courseData.layoutView.title}</span>
							</h3>
						</a>
						<div class="flex items-center gap-2 mb-2 text-sm">
							<Calendar size={16} class="text-primary flex-shrink-0" />
							<span class="font-medium">{courseData.eventStartDate}</span>
							<Clock size={16} class="text-primary flex-shrink-0 ml-2" />
							<span>Dalle <b>{courseData.timeStartDate}</b></span>
						</div>

						<div class="flex items-center gap-2 mb-2 text-sm">
							<MapPin size={16} class="text-primary flex-shrink-0" />
							<span class="font-medium">{courseData.county}</span>
						</div>

						<div class="flex items-center gap-2 mb-1 text-sm">
							<UserCircle size={16} class="text-primary flex-shrink-0" />
							<span>Riflessologo: <b>{courseData.name} {courseData.surname}</b></span>
						</div>
						{#if !auth}
							<div class="bg-amber-100 text-amber-800 p-2 rounded-md flex items-center gap-2 mb-3">
								<AlertCircle size={16} class="flex-shrink-0" />
								<p class="text-xs font-medium">+25€ di tesseramento solo al primo corso</p>
							</div>
						{/if}
					</div>

					<div class="px-5 pb-4 pt-0">
						<div class="divider my-1"></div>
						<div class="card-actions flex justify-between items-center w-full gap-2">
							<a
								class="btn btn-primary flex-1 rounded-md flex items-center gap-1"
								href="/course-detail/{courseData.prodId}"
							>
								<Info size={20} />
								Visualizza
							</a>
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
