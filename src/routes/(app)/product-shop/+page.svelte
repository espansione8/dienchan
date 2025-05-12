<script lang="ts">
	//import { goto, invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import CartFloat from '$lib/components/CartFloat.svelte';
	import { cartProducts, addToCart, removeFromCart } from '$lib/stores/cart';
	import { imgCheck } from '$lib/tools/imgCheck';
	import {
		ChevronDown,
		ShieldAlert,
		MapPinned,
		ShoppingCart,
		Tags,
		Boxes,
		CircleX
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
	<section class="col-span-12 xl:col-span-3">
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
	<!-- colonna ordina, filtri e card -->
	<section class="col-span-12 xl:col-span-9 bg-base-100 rounded-lg">
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
				<!-- Active filter -->
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
		<!-- end ORDINA BUTTON -->
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
					class="card card-compact overflow-hidden bg-base-100 max-w-xs rounded-xl shadow-md border"
				>
					<a href="/product-detail/{productData.prodId}">
						<figure class="px-8 pt-8">
							<img
								src={imgCheck(productData.uploadfiles, 'product-primary').length > 0
									? `/files/product/${productData.prodId}/${imgCheck(productData.uploadfiles, 'product-primary')[0]}`
									: '/images/placeholder.jpg'}
								alt="product-primary"
								class="h-64 w-full border-2 rounded-lg object-contain"
							/>
						</figure>
					</a>
					<div class="card-body items-center text-center">
						<a href="/product-detail/{productData.prodId}">
							<h2 class="card-title text-2xl">
								{productData.title}
							</h2>
						</a>
						<p class="card-text text-xl">
							<b>€ {productData.price}</b>
						</p>
						<!-- <h5
							class="card-text text-xl border rounded-md shadow-sm font-semibold p-2 bg-neutral-200"
						>
							{productData.descrShort}
						</h5> -->
						<p class="card-text">
							<Tags /> <b>{productData.category[0]}</b>
						</p>
						<p class="card-text">
							<Boxes />
							<b>
								{#if productData.stockQty < 1}
									out of stock
								{:else}
									{productData.stockQty} max
								{/if}
							</b>
						</p>
						<div class="card-actions">
							<div class="flex justify-between gap-1 my-3">
								<!-- <a
									class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:text-gray-300"
									href="/product-detail/{productData.prodId}">Info</a
								> -->
								<!-- <div class="join">
									<button class="btn btn-sm join-item text-lg" onclick={() => setQty('minus')}
										>-</button
									>
									<input
										type="text"
										value={quantity}
										class="input input-sm join-item w-12 text-center"
										readonly
									/>
									<button class="btn btn-sm join-item text-lg" onclick={() => setQty('plus')}
										>+</button
									>
								</div> -->
								{#if auth}
									{#if productData.stockQty > 0}
										{#if checkCart(productData.prodId)}
											<!-- <button
											class="btn btn-sm bg-red-200 border border-red-400 rounded-md text-red-700 hover:text-red-700 hover:bg-red-400 inline-flex items-center justify-center space-x-2"
											onclick={() => removeFromCart($cartProducts, productData)}
											><ShoppingCart /> Rimuovi</button
										> -->
											<div class="join join-vertical">
												{#if $cartProducts.find((item) => item.prodId === productData.prodId)?.orderQuantity < productData.stockQty}
													<button
														class="btn btn-primary join-item"
														onclick={() => addToCart($cartProducts, productData, false)}
														>+ <ShoppingCart /> aggiungi</button
													>
												{:else}
													<button class="btn join-item"><CircleX />Quantità limite</button>
												{/if}
												<!-- <button
												class="btn btn-primary join-item"
												onclick={() => addToCart($cartProducts, productData, false)}
												>+ <ShoppingCart /> aggiungi</button
											> -->
												<input
													type="text"
													value={$cartProducts.find((item) => item.prodId === productData.prodId)
														?.orderQuantity}
													class="input join-item text-center w-full"
													readonly
												/>

												<button
													class="btn join-item"
													onclick={() => removeFromCart($cartProducts, productData)}
													>- <ShoppingCart /> rimuovi</button
												>
											</div>
										{:else}
											<button
												class="btn btn-primary rounded-md inline-flex items-center justify-center space-x-2"
												onclick={() => addToCart($cartProducts, productData, false)}
												><ShoppingCart /> Aggiungi</button
											>
										{/if}
									{:else}
										<button
											class="btn btn-sm rounded-md inline-flex items-center justify-center space-x-2"
											disabled>+ <ShoppingCart /> aggiungi</button
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
