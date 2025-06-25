<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import { notification } from '$lib/stores/notifications';
	import { Image } from '@unpic/svelte';
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import CartFloat from '$lib/components/CartFloat.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import { cartProducts } from '$lib/stores/cart';
	import { imgCheck } from '$lib/tools/tools.js';
	//import { province } from '$lib/stores/arrays.js';
	import {
		ChevronDown,
		Check,
		MapPinned,
		CircleX,
		UserSearch,
		Tags,
		MapPin,
		SlidersHorizontal,
		Phone,
		Mail,
		House,
		Calendar,
		Star
	} from 'lucide-svelte';

	const { data } = $props();
	const { getTable, itemCount, countyObj } = $derived(data);
	let tableList = $state(getTable || []);
	let count = $state(itemCount);
	let loading = $state(false);

	// Filter state
	let resetActive = $state(false);
	let currentSort = $state('alfabetico');
	let searchQuery = $state('');

	let activeFilter = $state({
		provincia: '',
		// citta: '',
		riflessologo: ''
	});

	// Pagination
	let currentPage = $state(1);
	const itemsPerPage = 40;
	// const pageNumbers = $derived(() => {
	// 	const pageCount = Math.ceil(count / itemsPerPage);
	// 	const numbers = [];
	// 	for (let i = 1; i <= pageCount; i++) {
	// 		numbers.push(i);
	// 	}
	// 	return numbers;
	// });

	// Count reflexologists by province
	let numReflexologistsInProvince = $state({});
	tableList.forEach((item) => {
		const provincia = item.county;
		numReflexologistsInProvince[provincia] = (numReflexologistsInProvince[provincia] || 0) + 1;
	});

	//Sort provinces alphabetically
	const sortedNumReflexologistsInProvince = Object.keys(numReflexologistsInProvince)
		.sort((a, b) => {
			const countyA = a || '';
			const countyB = b || '';
			return countyA.localeCompare(countyB);
		})
		.reduce((acc, key) => {
			acc[key] = numReflexologistsInProvince[key];
			return acc;
		}, {});

	numReflexologistsInProvince = sortedNumReflexologistsInProvince;

	// Reset filters
	const onFilterReset = () => {
		resetActive = false;
		tableList = getTable || [];

		// Sort alphabetically by default
		tableList.sort((a, b) => a.surname.localeCompare(b.surname));

		activeFilter = {
			provincia: '',
			riflessologo: ''
		};

		searchQuery = '';

		// Close accordions
		const accordionList = ['accordion1', 'accordion2', 'accordion3'];
		accordionList.forEach((item) => (document.getElementById(item).checked = false));
	};

	// Filter by province
	const onClickFilterProvincia = (provinciaSelected) => {
		//tableList = getTable;
		currentPage = 1;
		resetActive = true;
		activeFilter.provincia = provinciaSelected;
		//console.log('activeFilter.provincia', activeFilter.provincia);

		if (activeFilter.provincia) {
			//	tableList = tableList.filter((item) => item.county === activeFilter.provincia);
			tableList = getTable.filter((item) => item.county === activeFilter.provincia);
			count = tableList.length;
		}
		document.getElementById('top').scrollIntoView({ behavior: 'smooth' });
	};

	// Sort reflexologists
	const sortItems = (option) => {
		switch (option) {
			case 'alfabetico':
				currentSort = 'alfabetico';
				// Test refactor
				// tableList.sort((a, b) => {
				// 	const surnameA = a.surname || '';
				// 	const surnameB = b.surname || '';
				// 	return surnameA.localeCompare(surnameB);
				// });
				//break;
				return tableList.sort((a, b) => {
					const surnameA = a.surname || '';
					const surnameB = b.surname || '';
					return surnameA.localeCompare(surnameB);
				});
			default:
				return tableList;
		}
	};

	// Filter reflexologists by search query
	// $effect(() => {
	// 	if (searchQuery.trim() === '') {
	// 		if (!resetActive) {
	// 			tableList = reflexologists;
	// 			sortItems(currentSort);
	// 		}
	// 		return;
	// 	}

	// 	const query = searchQuery.toLowerCase();
	// 	tableList = reflexologists.filter(
	// 		(item) =>
	// 			item.name.toLowerCase().includes(query) || item.surname.toLowerCase().includes(query)
	// 	);
	// });

	// Pagination
	// const applyFiltersAndSort = () => {
	// 	let filtered = [...getTable];

	// 	if (activeFilter.provincia) {
	// 		filtered = getTable.filter((item) => item.county === activeFilter.provincia);
	// 	}

	// 	count = filtered.length;
	// 	sortItems(currentSort);
	// 	return filtered;
	// };

	// const goToPage = (newPage: number) => {
	// 	loading = true;
	// 	currentPage = newPage;
	// 	const filtered = applyFiltersAndSort();
	// 	const maxPageAfterFilter = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
	// 	if (currentPage > maxPageAfterFilter) {
	// 		currentPage = maxPageAfterFilter;
	// 	}

	// 	// Pagination
	// 	const skipItems = (currentPage - 1) * itemsPerPage;
	// 	tableList = filtered.slice(skipItems, skipItems + itemsPerPage);
	// 	loading = false;
	// };
	// goToPage(currentPage);

	const formSubmit = () => {
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { action, message, payload } = result.data; // { action, success, message, payload }
				if (action == 'changePage' || action == 'filter') {
					tableList = payload.result;
					currentPage = payload.currentPage;
				} else {
					tableList = getTable;
					resetActive = false;
					notification.info(message);
				}
			}
			if (result.type === 'failure') {
				notification.error(result.data.message);
			}
			if (result.type === 'error') {
				notification.error(result.error.message);
			}
			// 'update()' is called by default by use:enhance
			// call 'await update()' if you need to ensure it completes before further client logic.
			//resetFields();
			loading = false;
		};
	};

	//let hasInitialized = $state(false);
	$effect(() => {
		// if (tableList && tableList.length > 0 && !hasInitialized) {
		// 	alert('trigered');
		// 	goToPage(currentPage);
		// 	hasInitialized = true; // Stop Effect
		// }

		if (currentPage) {
			tick().then(() => {
				const element = document.getElementById('top');
				if (element) {
					element.scrollIntoView({ behavior: 'smooth' });
				}
			});
		}
	});
</script>

<svelte:head>
	<title>Riflessologi Diện Chẩn</title>
	<meta name="description" content="Trova un riflessologo Diện Chẩn nella tua zona" />
</svelte:head>

<div
	id="top"
	class="bg-base-200 grid grid-cols-12 grid-rows-[min-content] gap-y-12 p-4 lg:gap-x-8 lg:p-8"
>
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
				<p class="text-sm opacity-90 mt-1 relative z-10">Trova il tuo riflessologo</p>
			</div>

			<!-- Filter Body -->
			<div class="p-4 space-y-4">
				<!-- Province Filter -->
				<div
					class="collapse collapse-arrow bg-base-100 border border-base-200 rounded-lg hover:border-primary/30 transition-colors duration-200"
				>
					<input id="accordion1" type="checkbox" class="peer" />
					<div
						class="collapse-title bg-base-200 text-base-content peer-checked:bg-blue-300 peer-checked:font-bold"
					>
						<span class="inline-flex items-center">
							<b><MapPinned class="-mt-1 mr-2" /> Provincia</b>
							{#if activeFilter.provincia.length > 0}
								<Check class="ml-1" color="green" />
							{/if}
						</span>
					</div>
					<div
						class="collapse-content bg-base-100 text-base-content peer-checked:bg-base-100 max-h-[250px] overflow-y-auto"
					>
						<ul class="list-none -mx-4 divide-y divide-base-200/70">
							{#each Object.entries(countyObj) as [provincia, count]}
								<li
									class="p-3 cursor-pointer transition-all duration-300 flex items-center justify-between
                  {activeFilter.provincia === provincia
										? 'bg-orange-200 text-red-900 font-bold'
										: 'hover:bg-blue-200 hover:text-blue-900'}"
									onclick={() => onClickFilterProvincia(provincia)}
								>
									<span>{provincia}</span>
									<div class="flex items-center gap-2">
										<span class="badge badge-sm badge-ghost">{count}</span>
										{#if activeFilter.provincia === provincia}
											<Check size={18} class="flex-shrink-0 text-green-600" />
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<!-- Riflessologo Filter -->
				<!-- <div
					class="collapse collapse-arrow bg-base-100 border border-base-200 rounded-lg hover:border-primary/30 transition-colors duration-200"
				>
					<input id="accordion4" type="checkbox" class="peer" />
					<div
						class="collapse-title bg-base-200 text-base-content peer-checked:bg-blue-300 peer-checked:font-bold"
					>
						<span class="inline-flex items-center">
							<b><UserSearch class="-mt-1 mr-2" /> Riflessologo</b>
							{#if activeFilter.riflessologo.length > 0}
								<Check class="ml-1" color="green" />
							{/if}
						</span>
					</div>
					<div
						class="collapse-content bg-base-100 text-base-content peer-checked:bg-base-100 max-h-[250px] overflow-y-auto"
					>
						<ul class="list-none -mx-4 divide-y divide-base-200/70">
							{#each tableList as item}
								<li
									class="p-3 cursor-pointer transition-all duration-300 flex items-center justify-between
                {activeFilter.riflessologo == `${item.name} ${item.surname}`
										? 'bg-orange-200 text-red-900 font-bold'
										: 'hover:bg-blue-200 hover:text-blue-900'}"
									onclick={() => onClickFilterRiflessologo(item.userId, item.name, item.surname)}
								>
									<span>{item.name} {item.surname}</span>
									{#if activeFilter.riflessologo == `${item.name} ${item.surname}`}
										<Check size={18} class="flex-shrink-0 text-green-600" />
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				</div> -->

				<!-- Reset Button -->
				{#if resetActive || searchQuery.trim() !== ''}
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
	<!-- Reflexologists column -->
	{#if loading}
		<Loader />
	{:else}
		<section class="col-span-12 xl:col-span-10 bg-base-100 rounded-lg">
			<div class="flex items-center p-4">
				<div
					class="btn btn-sm rounded-md cursor-default {count > 0
						? 'bg-green-300 hover:bg-green-300'
						: 'bg-red-300 hover:bg-red-300'}"
				>
					Riflessologi trovati:
					<div class="badge rounded-md flex justify-center">
						<strong class="">{count}</strong>
					</div>
				</div>

				<!-- Reset button -->
				{#if resetActive || searchQuery.trim() !== ''}
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
								class="flex items-center {currentSort === 'alfabetico'
									? 'bg-primary/10 text-primary font-medium'
									: ''}"
								onclick={() => sortItems('alfabetico')}
							>
								alfabetico
							</button>
						</li>
					</ul>
				</div>
			</div>

			<!-- Active filters display -->
			{#if resetActive || searchQuery.trim() !== ''}
				<div class="flex items-center space-x-4 pb-3 px-4">
					<div class="text-gray-700">
						<span><Tags /></span>
						{#if activeFilter.provincia.length > 0}
							<div class="badge badge-accent rounded-md">
								Provincia: <strong class="pl-1">{activeFilter.provincia}</strong>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Reflexologist Cards -->
			<div class="flex flex-wrap justify-center gap-6 p-4">
				{#if tableList.length === 0}
					<div
						class="alert alert-warning shadow-lg text-center rounded-md mt-6 mx-auto w-full max-w-md"
					>
						<div>
							<UserSearch size={24} />
							<span class="mt-2 text-semibold">
								Nessun riflessologo trovato. Cambia parametri o resetta il filtro.
							</span>
						</div>
					</div>
				{:else}
					{#each tableList as reflexologist}
						<div
							class="card w-full sm:w-80 bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-base-200 rounded-xl"
						>
							<a href={`/profile-public/${reflexologist.userId}`}>
								<figure class="relative h-64 overflow-hidden flex items-center justify-center">
									<Image
										layout="constrained"
										aspectRatio={1}
										src={imgCheck.single(reflexologist.uploadfiles, 'profile') ||
											'/images/avatar.png'}
										alt={`${reflexologist.name} ${reflexologist.surname}`}
										class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
									/>
									<div
										class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-800/80 to-transparent p-4"
									>
										<h2 class="text-white text-xl font-bold">
											{reflexologist.namePublic ? reflexologist.name : ''}
											{reflexologist.surnamePublic ? reflexologist.surname : ''}
										</h2>
									</div>
								</figure>
							</a>

							<div class="card-body p-4 relative min-h-[220px] flex flex-col">
								<div class="space-y-2">
									<div class="flex items-center gap-2">
										<MapPin size={18} class="text-primary flex-shrink-0" />
										<span>
											<span class="font-medium">{reflexologist.city}</span>, {reflexologist.county}
										</span>
									</div>

									{#if reflexologist.phonePublic}
										<div class="flex items-center gap-2">
											<Phone size={18} class="text-primary flex-shrink-0" />
											<span>{reflexologist.phone || 'Non disponibile'}</span>
										</div>
									{/if}

									{#if reflexologist.emailPublic}
										<div class="flex items-center gap-2">
											<Mail size={18} class="text-primary flex-shrink-0" />
											<span class="truncate">{reflexologist.email || 'Non disponibile'}</span>
										</div>
									{/if}

									{#if reflexologist.mobilePhonePublic}
										<div class="flex items-center gap-2">
											<Phone size={18} class="text-primary flex-shrink-0" />
											<span>{reflexologist.mobilePhone || 'Non disponibile'}</span>
										</div>
									{/if}

									<!-- <div class="flex items-center gap-2">
									<Calendar size={18} class="text-primary flex-shrink-0" />
									<span>Esperienza: <b>{reflexologist.yearsOfExperience} anni</b></span>
								</div> -->
								</div>

								<div class="mt-4 flex flex-wrap gap-2">
									{#each reflexologist.specialties || [] as specialty}
										<span class="badge badge-primary badge-outline">{specialty}</span>
									{/each}
								</div>

								<!-- <div class="absolute bottom-4 right-4"> -->
								<div class="card-actions mt-auto justify-end">
									<a
										href={`/profile-public/${reflexologist.userId}`}
										class="btn btn-primary rounded-md"
									>
										Visualizza Profilo
									</a>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
			<div class="join flex justify-center mt-5">
				<form method="POST" action="?/changePage" use:enhance={formSubmit}>
					{#if currentPage > 1}
						<button type="submit" id="reset" class="join-item btn" name="navigation" value="reset">
							<House />
						</button>
					{/if}

					<button
						type="submit"
						id="prev"
						class="join-item btn"
						name="navigation"
						value="prev"
						disabled={currentPage <= 1}
					>
						«
					</button>
					<button type="button" class="join-item btn">Pagina {currentPage}</button>
					<button
						type="submit"
						id="next"
						class="join-item btn"
						name="navigation"
						value="next"
						disabled={currentPage >= Math.max(1, Math.ceil(itemCount / itemsPerPage))}>»</button
					>
					<input type="hidden" name="itemsPerPage" value={itemsPerPage} />
					<input type="hidden" name="currentPage" value={currentPage} />
				</form>
			</div>
		</section>
	{/if}
</div>

{#if $cartProducts.length > 0}
	<CartFloat />
{/if}

<style>
</style>
