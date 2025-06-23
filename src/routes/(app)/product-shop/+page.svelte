<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import { Image } from '@unpic/svelte';
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { notification } from '$lib/stores/notifications';
	import CartFloat from '$lib/components/CartFloat.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import { cartProducts, addToCart, removeFromCart } from '$lib/stores/cart';
	import { imgCheck } from '$lib/tools/tools.js';
	import {
		ChevronDown,
		ShieldAlert,
		MapPinned,
		ShoppingCart,
		Tags,
		Boxes,
		CircleX,
		Tag,
		Package,
		BookOpen,
		Clock,
		MapPin,
		UserCircle,
		AlertCircle,
		Info,
		Calendar,
		Trash2
	} from 'lucide-svelte';

	const { data } = $props();
	const { getTable, getCategories, itemCount, auth } = $derived(data);
	let prodList = $state(getTable);
	let count = $state(itemCount);

	let loading = $state(false);
	let resetActive = $state(false);
	let currentSort = $state('recent');
	//let quantity = $state(1);

	let activeFilter = $state({
		category: ''
	});

	// Pagination
	let currentPage = $state(1);
	const itemsPerPage = 20;
	const pageNumbers = $derived(() => {
		const pageCount = Math.ceil(count / itemsPerPage);
		const numbers = [];
		for (let i = 1; i <= pageCount; i++) {
			numbers.push(i);
		}
		return numbers;
	});

	// const goToPage = (page: number) => {
	// 	currentPage = page;
	// 	const skipItems = (currentPage - 1) * itemsPerPage;
	// 	prodList = prodList.slice(skipItems, skipItems + itemsPerPage);
	// };
	// goToPage(currentPage);

	// const setQty = (type: string) => {
	// 	if (type == 'plus') {
	// 		quantity += 1;
	// 	}
	// 	if (type == 'minus') {
	// 		if (quantity > 1) quantity -= 1;
	// 	}
	// };

	const checkCart = (id: any) => {
		const check = $cartProducts.some((item) => item.prodId == id);
		return check;
	};

	const onFilterReset = () => {
		invalidateAll();
		resetActive = false;
		//prodList = getTable || [];
		//prodList.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));
		prodList = prodList
			.slice()
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		activeFilter = {
			category: ''
		};
		//quantity = 1;

		// chiude gli accordion
		// const accordionList = ['accordion1', 'accordion2', 'accordion3', 'accordion4'];
		// accordionList.forEach((item) => (document.getElementById(item).checked = false));
		// document.getElementById('accordion1').checked = false;
		sortItems('recent');
		count = itemCount;
		currentPage = 1;
	};

	const onClickFilterCategory = async (categorySelected) => {
		currentPage = 1;
		resetActive = true;
		activeFilter.category = categorySelected;
		//prodList = getTable;
		//console.log('cat', categorySelected);

		// category
		if (activeFilter.category) {
			// prodList = prodList.filter((item) => item.county == activeFilter.provincia);
			//prodList = prodList.filter((item) =>
			prodList = getTable.filter((item) =>
				item.category.some((category) => category === activeFilter.category)
			);
			//console.log('prodList cat', prodList.length);
			count = prodList.length;
		}
		//sortItems('recent');
		goToPage(currentPage);
	};

	const sortItems = (option) => {
		//console.log('prodList sort', prodList.length);

		switch (option) {
			case 'expensive':
				currentSort = 'expensive';
				prodList = prodList.slice().sort((a, b) => b.price - a.price);
				break;
			//return prodList.sort((a, b) => b.price - a.price);
			case 'cheap':
				currentSort = 'cheap';
				prodList = prodList.slice().sort((a, b) => a.price - b.price);
				break;
			//return prodList.sort((a, b) => a.price - b.price);
			case 'recent':
				currentSort = 'recent';
				prodList = prodList
					.slice()
					.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
				break;
			//return prodList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			case 'oldest':
				currentSort = 'oldest';
				prodList = prodList
					.slice()
					.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
				break;
			//return prodList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

			default:
				return prodList;
		}
	};

	const applyFiltersAndSort = () => {
		let filtered = [...getTable];

		if (activeFilter.category) {
			filtered = filtered.filter(
				(item) =>
					item.category &&
					Array.isArray(item.category) &&
					item.category.some((cat) => cat === activeFilter.category)
			);
		}

		count = filtered.length;
		sortItems(currentSort);
		return filtered;
	};

	const goToPage = (newPage: number) => {
		currentPage = newPage;
		const filtered = applyFiltersAndSort();
		const maxPageAfterFilter = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
		if (currentPage > maxPageAfterFilter) {
			currentPage = maxPageAfterFilter;
		}

		// Pagination
		const skipItems = (currentPage - 1) * itemsPerPage;
		prodList = filtered.slice(skipItems, skipItems + itemsPerPage);
	};

	////////////
	// const goToPage = (newPage?: number) => {
	// 	currentPage = newPage;
	// 	//let tempProducts = [...getTable];
	// 	//prodList = getTable;

	// 	if (activeFilter.category) {
	// 		//tempProducts = tempProducts.filter(
	// 		prodList = getTable.filter(
	// 			(item) =>
	// 				item.category &&
	// 				Array.isArray(item.category) &&
	// 				item.category.some((cat) => cat === activeFilter.category)
	// 		);
	// 	}
	// 	sortItems(currentSort);

	// 	//count = tempProducts.length;
	// 	count = prodList.length;

	// 	// ???? Assicurati che currentPage non superi il numero massimo di pagine dopo il filtro
	// 	const maxPageAfterFilter = Math.max(1, Math.ceil(count / itemsPerPage));
	// 	if (currentPage > maxPageAfterFilter) {
	// 		currentPage = maxPageAfterFilter;
	// 	}

	// 	// Pagination
	// 	const skipItems = (currentPage - 1) * itemsPerPage;
	// 	// nota CHECK DEBUG!!! prodList.slice -> usare temp prod filtrato
	// 	prodList = prodList.slice(skipItems, skipItems + itemsPerPage);
	// };
	goToPage(currentPage);

	// deprecated, categories from server
	// const categoriesInProduct: any = {};
	// prodList.forEach((item) => {
	// 	item.category.forEach((cat) => {
	// 		categoriesInProduct[cat] = (categoriesInProduct[cat] || 0) + 1;
	// 	});
	// });

	// const formSubmit = () => {
	// 	loading = true;
	// 	return async ({ result }: { result: ActionResult }) => {
	// 		//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
	// 		await invalidateAll();
	// 		if (result.type === 'success' && result.data) {
	// 			const { action, message, payload } = result.data; // { action, success, message, payload }
	// 			if (action == 'changePage') {
	// 				resetActive = true;
	// 				prodList = payload;
	// 			}
	// 		}
	// 		if (result.type === 'failure') {
	// 			notification.error(result.data.message);
	// 		}
	// 		if (result.type === 'error') {
	// 			notification.error(result.error.message);
	// 		}
	// 		// 'update()' is called by default by use:enhance
	// 		// call 'await update()' if you need to ensure it completes before further client logic.
	// 		//resetFields();
	// 		loading = false;
	// 	};
	// };

	let hasInitialized = false;
	$effect(() => {
		// if (prodList && prodList.length > 0 && !hasInitialized) {
		// 	goToPage(currentPage);
		// 	hasInitialized = true; // Stop Effect
		// }

		if (prodList) {
			tick().then(() => {
				const element = document.getElementById('top');
				if (element) {
					element.scrollIntoView({ behavior: 'smooth' }); // smooth , instant
				}
			});
		}
	});
</script>

<svelte:head>
	<title>Lista Prodotti</title>
</svelte:head>

<div
	id="top"
	class="bg-base-200 grid grid-cols-12 grid-rows-[min-content] gap-y-12 p-4 lg:gap-x-8 lg:p-8"
>
	<!-- Filter column -->
	<section class="col-span-12 xl:col-span-2">
		<div class="sticky top-4">
			<div class="bg-base-100 rounded-xl shadow-lg overflow-hidden border border-base-200">
				<!-- Filter Header -->
				<div class="bg-primary text-primary-content p-4 relative overflow-hidden">
					<div class="absolute inset-0 opacity-20">
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
					<h2 class="text-xl font-bold flex items-center gap-2 relative z-10">Filtri</h2>
					<p class="text-sm opacity-90 mt-1 relative z-10">Affina la tua ricerca</p>
				</div>

				<!-- Filter Body -->
				<div class="p-4">
					<!-- Category Filter -->
					<div class="mb-6">
						<div class="flex items-center justify-between mb-3">
							<h3 class="font-medium flex items-center gap-2">
								<MapPinned size={18} class="text-primary" />
								Categoria
							</h3>
							{#if activeFilter.category}
								<span class="badge badge-primary badge-sm">{activeFilter.category}</span>
							{/if}
						</div>

						<div class="grid grid-cols-1 gap-1 mt-2 pr-1 filter-scrollbar overflow-y-auto">
							{#each Object.entries(getCategories) as [key, value]}
								<button
									type="button"
									class="group relative flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-300 overflow-hidden
                {activeFilter.category === key
										? 'bg-primary text-primary-content font-medium'
										: 'hover:bg-base-200'}"
									onclick={() => onClickFilterCategory(key)}
								>
									<!-- Background animation on hover -->
									<div
										class="absolute inset-0 bg-primary/10 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out {activeFilter.category ===
										key
											? 'scale-x-100'
											: ''}"
									></div>

									<span class="relative z-10">{key}</span>
									<span
										class="badge {activeFilter.category === key
											? 'bg-primary-content/20 text-primary-content'
											: 'bg-base-200'} relative z-10">{value}</span
									>
								</button>
							{/each}
						</div>
					</div>

					<!-- Reset Button -->
					{#if resetActive}
						<div class="pt-3 border-t border-base-200">
							<button
								class="btn btn-error btn-outline w-full gap-2 group relative overflow-hidden"
								onclick={onFilterReset}
							>
								<span
									class="absolute inset-0 bg-error/10 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
								></span>
								<CircleX size={16} class="relative z-10" />
								<span class="relative z-10">Reset filtri</span>
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>
	<!-- Product column -->
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
					Prodotti disponibili: {activeFilter.category}
					<div class="badge rounded-md flex justify-center">
						<!-- {#if activeFilter.category}
							<strong class="">{count}</strong>
						{:else}
							<strong class="">{count}</strong>
						{/if} -->
						<strong class="">{count}</strong>
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
					<div class="text-gray-700">
						<span><Tags /></span>
						{#if activeFilter.category.length > 0}
							<div class="badge badge-accent rounded-md">
								Categoria: <strong class="pl-1">{activeFilter.category}</strong>
							</div>
						{/if}
					</div>
				</div>
			{/if}
			<!-- CARD -->
			<div class="flex flex-wrap justify-center gap-3 pl-3 pb-4">
				{#if prodList.length == 0}
					<div
						class="alert alert-warning shadow-lg text-center rounded-md mt-6 mx-auto w-full max-w-md"
					>
						<div>
							<ShieldAlert />
							<br />
							<span class="mt-2 text-semibold">
								Nessun prodotto trovato. Cambia parametri o resetta il filtro.
							</span>
						</div>
					</div>
				{/if}
				{#each prodList as productData, i}
					<div
						class="card overflow-hidden bg-base-100 rounded-xl shadow-lg border
	border-base-200 hover:shadow-xl transition-shadow duration-300 flex flex-col w-full sm:w-80"
						class:h-128={auth}
						class:h-115={!auth}
					>
						<div class="relative px-6 pt-6 pb-2 bg-base-200/30 space-y-0">
							<a href="/product-detail/{productData.prodId}">
								<div class="absolute -top-1 -right-1 z-10 opacity-70">
									<div class="relative">
										<div
											class="bg-gradient-to-r from-primary to-primary/80 text-primary-content px-4 py-2 rounded-bl-lg rounded-tr-lg shadow-md"
										>
											<span class="text-xs font-semibold">PREZZO</span>
											<div class="flex items-baseline">
												<span class="text-2xl font-bold">€ {productData.price.toFixed(2)}</span>
											</div>
										</div>
										<div
											class="absolute top-0 right-0 w-0 h-0 border-t-8 border-t-primary/80 border-r-8 border-r-transparent transform translate-x-full"
										></div>
									</div>
								</div>
								<div class="h-48 w-full flex items-center justify-center">
									<Image
										layout="constrained"
										aspectRatio={1}
										src={imgCheck.single(productData.uploadfiles, 'product-primary')}
										alt="product-primary"
										class="h-full max-h-48 w-auto object-contain rounded-lg hover:scale-110 transition-transform duration-500"
									/>
								</div>
							</a>
						</div>

						<div class="card-body px-5 py-2 flex-grow">
							<a href="/product-detail/{productData.prodId}">
								<h3 class="card-title text-lg font-bold text-primary flex items-start gap-2 mb-2">
									<BookOpen size={18} class="flex-shrink-0 mt-1" />
									<span>{productData.title}</span>
								</h3>
							</a>
							<div class="flex items-center gap-2 mb-2 text-sm">
								<Tags size={16} class="text-primary flex-shrink-0" />
								<span class="font-medium">{productData.category[0]}</span>
							</div>
							<div class="flex items-center gap-1 text-sm">
								<span class={productData.stockQty < 1 ? 'font-medium text-error' : 'font-medium'}>
									{#if productData.stockQty < 1}
										<Boxes size={16} color="red" /> Out of stock
									{:else}
										<Boxes size={16} color="green" /><span class="text-success">
											&nbsp;{productData.stockQty} in magazzino</span
										>
									{/if}
								</span>
							</div>
							<!-- memo for 2 inline items  -->
							<!-- <div class="flex items-center gap-2 mb-2 text-sm">
							<Calendar size={16} class="text-primary flex-shrink-0" />
							<span class="font-medium">{productData.eventStartDate}</span>
							<Clock size={16} class="text-primary flex-shrink-0 ml-2" />
							<span>Dalle <b>{productData.timeStartDate}</b></span>
						</div> -->
						</div>

						<div class="px-5 pb-4 pt-0">
							<div class="divider my-1"></div>
							<div class="card-actions flex justify-between items-center w-full gap-2">
								<a
									class="btn btn-outline rounded-md flex items-center gap-1"
									href="/product-detail/{productData.prodId}"
								>
									<Info size={16} />
									Dettagli
								</a>
								{#if auth}
									{#if productData.stockQty > 0}
										{#if checkCart(productData.prodId)}
											<div class="join join-vertical flex-1">
												<button
													class="btn join-item"
													onclick={() => removeFromCart($cartProducts, productData)}
													><b>-</b> <ShoppingCart /> rimuovi</button
												>

												<input
													type="text"
													value={$cartProducts.find((item) => item.prodId === productData.prodId)
														?.orderQuantity}
													class="input join-item text-center w-full"
													readonly
												/>
												{#if $cartProducts.find((item) => item.prodId === productData.prodId)?.orderQuantity < productData.stockQty}
													<button
														class="btn btn-primary join-item"
														onclick={() => addToCart($cartProducts, productData, false)}
														><b>+</b> <ShoppingCart /> aggiungi</button
													>
												{:else}
													<button class="btn join-item"><CircleX />Quantità limite</button>
												{/if}
											</div>
										{:else}
											<button
												class="btn btn-primary rounded-md flex-1 rounded-md flex items-center gap-1"
												onclick={() => addToCart($cartProducts, productData, false)}
												><ShoppingCart /> Aggiungi</button
											>
										{/if}
									{:else}
										<button
											class="btn btn-sm rounded-md inline-flex items-center justify-center space-x-2"
											disabled>Out of Stock</button
										>
									{/if}
								{:else}
									<button
										class="btn btn-sm btn-error rounded-md inline-flex items-center justify-center space-x-2"
										>Riservato agli associati</button
									>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
			<!-- end CARD -->
			<div class="join flex justify-center">
				{#each pageNumbers() as page (page)}
					<button
						type="submit"
						class="join-item btn"
						class:btn-active={page === currentPage}
						onclick={() => goToPage(page)}
					>
						{page}
					</button>
				{/each}
			</div>
		</section>
	{/if}
</div>
{#if $cartProducts.length > 0}
	<CartFloat />
{/if}

<style>
</style>
