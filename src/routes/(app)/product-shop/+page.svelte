<script lang="ts">
	//import { goto, invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import CartFloat from '$lib/components/CartFloat.svelte';
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

	let { data } = $props();
	let { getTable, auth } = $derived(data);
	let prodList = $state(getTable);

	let resetActive = $state(false);
	let currentSort = $state('dal più recente');
	let quantity = $state(1);

	let activeFilter = $state({
		mese: '',
		provincia: '',
		evento: '',
		category: ''
	});

	const setQty = (type: string) => {
		if (type == 'plus') {
			quantity += 1;
		}
		if (type == 'minus') {
			if (quantity > 1) quantity -= 1;
		}
	};

	const checkCart = (id: any) => {
		const check = $cartProducts.some((item) => item.prodId == id);
		return check;
	};

	const onFilterReset = () => {
		// invalidateAll();
		resetActive = false;
		prodList = getTable || [];
		prodList.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));

		activeFilter = {
			mese: '',
			provincia: '',
			evento: '',
			category: ''
		};
		quantity = 1;

		// chiude gli accordion
		const accordionList = ['accordion1', 'accordion2', 'accordion3', 'accordion4'];
		accordionList.forEach((item) => (document.getElementById(item).checked = false));
		// document.getElementById('accordion1').checked = false;
		sortItems('recent');
	};

	const updateFilter = () => {
		prodList = getTable;
		// category
		if (activeFilter.category) {
			// prodList = prodList.filter((item) => item.county == activeFilter.provincia);
			prodList = prodList.filter((item) =>
				item.category.some((category) => category === activeFilter.category)
			);
		}
	};

	const onClickFilterCategory = async (categorySelected) => {
		resetActive = true;
		activeFilter.category = categorySelected;
		updateFilter();
		sortItems('recent');
	};

	// sort
	const sortItems = (option) => {
		switch (option) {
			case 'expensive':
				currentSort = 'dal più costoso';
				return prodList.sort((a, b) => b.price - a.price);
			case 'cheap':
				currentSort = 'dal più economico';
				return prodList.sort((a, b) => a.price - b.price);
			case 'recent':
				currentSort = 'dal più recente';
				return prodList.sort((a, b) => new Date(b.eventStartDate) - new Date(a.eventStartDate));
			case 'oldest':
				currentSort = 'dal meno recente';
				return prodList.sort((a, b) => new Date(a.eventStartDate) - new Date(b.eventStartDate));

			default:
				return prodList;
		}
	};

	let categoriesInProduct: any = {};
	prodList.forEach((item) => {
		item.category.forEach((cat) => {
			categoriesInProduct[cat] = (categoriesInProduct[cat] || 0) + 1;
		});
	});

	// notification
	let toastClosed = $state(true);
	let notificationContent = $state('');
	let notificationError = $state(false);
	let startTimeout;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 3000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer
</script>

<svelte:head>
	<title>Lista corsi</title>
</svelte:head>

<div class="bg-base-200 grid grid-cols-12 grid-rows-[min-content] gap-y-12 p-4 lg:gap-x-8 lg:p-8">
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

						<div
							class="grid grid-cols-1 gap-1 mt-2 max-h-[300px] overflow-y-auto pr-1 filter-scrollbar"
						>
							{#each Object.entries(categoriesInProduct) as [chiave, valore]}
								<button
									type="button"
									class="group relative flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-300 overflow-hidden
                {activeFilter.category === chiave
										? 'bg-primary text-primary-content font-medium'
										: 'hover:bg-base-200'}"
									onclick={() => onClickFilterCategory(chiave)}
								>
									<!-- Background animation on hover -->
									<div
										class="absolute inset-0 bg-primary/10 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out {activeFilter.category ===
										chiave
											? 'scale-x-100'
											: ''}"
									></div>

									<span class="relative z-10">{chiave}</span>
									<span
										class="badge {activeFilter.category === chiave
											? 'bg-primary-content/20 text-primary-content'
											: 'bg-base-200'} relative z-10">{valore}</span
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
	<section class="col-span-12 xl:col-span-10 bg-base-100 rounded-lg">
		<div class="flex items-center p-4">
			<div
				class="btn btn-sm rounded-md cursor-default {prodList.length > 0
					? 'bg-green-300 hover:bg-green-300'
					: 'bg-red-300 hover:bg-red-300'}"
			>
				Prodotti disponibili:
				<div class="badge rounded-md flex justify-center">
					<strong class="">{prodList.length}</strong>
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
							Nessun corso trovato. Cambia parametri o resetta il filtro.
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
											<span class="text-2xl font-bold">€ {productData.price}</span>
										</div>
									</div>
									<div
										class="absolute top-0 right-0 w-0 h-0 border-t-8 border-t-primary/80 border-r-8 border-r-transparent transform translate-x-full"
									></div>
								</div>
							</div>
							<div class="h-48 w-full flex items-center justify-center">
								<img
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
	</section>
</div>
<Notification {toastClosed} {notificationContent} {notificationError} />
{#if $cartProducts.length > 0}
	<CartFloat />
{/if}

<style>
</style>
