<script lang="ts">
	import Notification from '$lib/components/Notification.svelte';
	import CartFloat from '$lib/components/CartFloat.svelte';
	import { cartProducts, addToCart, removeFromCart } from '$lib/stores/cart';
	import { Boxes, Tags, CircleCheck, CircleX, ShoppingCart } from 'lucide-svelte';
	let { data } = $props();
	let { getProduct, auth } = $derived(data);
	import { imgCheck } from '$lib/tools/imgCheck';

	let selectedImage = $state(0);
	let activeTab = $state('description');

	const thisProd = $derived($cartProducts.find((item) => item.prodId === getProduct.prodId));

	// const checkCart = (id: any) => {
	// 	const check = $cartProducts.some((item) => item.prodId == id);
	// 	return check;
	// };

	const setActiveTab = (tab) => {
		activeTab = tab;
	};

	const setSelectedImage = (index) => {
		selectedImage = index;
	};

	// test data

	// const product1 = {
	// 	name: 'Harmony Essential Oil Blend V2',
	// 	tagline: 'Balance • Calm • Wellness',
	// 	price: 42.99,
	// 	salePrice: 36.99,
	// 	rating: 4.8,
	// 	reviewCount: 124,
	// 	stock: 'In Stock',
	// 	description:
	// 		'Our signature blend combines 7 therapeutic-grade essential oils to create a harmonious balance for mind and body. Expertly crafted to reduce stress, enhance focus, and promote overall wellbeing.',
	// 	benefits: [
	// 		'Reduces stress and anxiety',
	// 		'Enhances mental clarity and focus',
	// 		'Promotes restful sleep',
	// 		'Balances mood and emotions',
	// 		'Supports immune function'
	// 	],
	// 	info: 'Organic Lavender Oil, Wild-Crafted Frankincense, Bergamot Oil, Ylang Ylang Extract, Cedarwood Oil, Chamomile Oil, Vetiver Root Oil',
	// 	usage:
	// 		'Apply 2-3 drops to pulse points, add to diffuser, or mix with carrier oil for massage. Use morning and evening for optimal results.',
	// 	images: [
	// 		'/images/placeholder.jpg',
	// 		'/images/no_img.jpg',
	// 		'/images/placeholder.jpg',
	// 		'/images/no_img.jpg',
	// 		'/images/image_placeholder.png'
	// 	],
	// 	features: [
	// 		'100% Pure & Natural',
	// 		'Ethically Sourced',
	// 		'No Synthetic Additives',
	// 		'Cruelty-Free'
	// 	],
	// 	relatedProducts: [
	// 		{ name: 'Clarity Mind Mist', price: 28.99, image: '/images/image_placeholder.png' },
	// 		{
	// 			name: 'Tranquil Sleep Blend',
	// 			price: 38.99,
	// 			image: '/images/image_placeholder.png'
	// 		},
	// 		{
	// 			name: 'Vitality Wellness Drops',
	// 			price: 44.99,
	// 			image: '/images/image_placeholder.png'
	// 		}
	// 	]
	// };
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
	<title>Dettagli prodotto: {getProduct.title} - {getProduct.prodId}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	{#if getProduct}
		<!-- Product Section -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
			<!-- Product Images -->
			<div class="space-y-4">
				<div class="bg-base-100 rounded-lg overflow-hidden shadow-sm">
					<img
						src={imgCheck(getProduct.uploadfiles, 'product-primary').length > 0
							? `/files/product/${getProduct.prodId}/${imgCheck(getProduct.uploadfiles, 'product-primary')[0]}`
							: '/images/placeholder.jpg'}
						alt="product-primary"
						class="w-full h-auto object-contain aspect-square"
					/>
				</div>
				<!-- <div class="flex space-x-3">
				{#each getProduct.images as image, i}
					<button
						class="w-24 h-24 cursor-pointer rounded-md overflow-hidden border-2 transition-all {selectedImage ===
						i
							? 'border-primary scale-105'
							: 'border-transparent opacity-70'}"
						onclick={() => setSelectedImage(i)}
					>
						<img
							src={image || '/placeholder.svg'}
							alt="Product thumbnail"
							class="w-full h-full object-cover"
						/>
					</button>
				{/each}
			</div> -->
			</div>

			<!-- Product Info -->
			<div class="space-y-6">
				<div>
					<p class="mb-1">ID: {getProduct.prodId}</p>
					<h1 class="text-3xl font-bold">{getProduct.title}</h1>
					<div class="badge badge-primary mt-2"><Tags />{getProduct.category.join(' • ')}</div>
				</div>

				<div class="flex items-baseline">
					<span class="text-3xl font-bold text-primary">€ {getProduct.price}</span>
					<!-- {#if getProduct.salePrice < getProduct.price}
					<span class="text-xl line-through ml-3 text-base-content/60">{getProduct.price}</span>
					<span class="badge badge-secondary ml-3"
						>SAVE ${(getProduct.price - getProduct.salePrice).toFixed(2)}</span
					>
				{/if} -->
				</div>

				<div class="divider my-2"></div>

				<div class="prose max-w-none">
					<p>{getProduct.descrShort}</p>
				</div>

				<div class="flex flex-wrap gap-2 mt-4">
					{#each getProduct.tag as tag}
						<div class="badge badge-outline">{tag}</div>
					{/each}
				</div>

				<div class="flex items-center text-sm font-medium">
					{#if getProduct.stockQty > 0}
						<Boxes size="20" color="green" />
						<span class="text-success">&nbsp;{getProduct.stockQty} in stock</span>
					{:else}
						<Boxes size="20" color="red" />
						<span class="text-error">&nbsp;out of stock</span>
					{/if}
				</div>

				<div class="divider my-2"></div>

				<div class="flex flex-col">
					{#if auth}
						{#if !thisProd}
							<button
								class="btn btn-primary"
								onclick={() => addToCart($cartProducts, getProduct, false)}
								>+ <ShoppingCart /> aggiungi al carrello</button
							>
						{:else}
							<div class="join join-vertical">
								{#if $cartProducts.find((item) => item.prodId === getProduct.prodId)?.orderQuantity < thisProd.stockQty}
									<button
										class="btn btn-primary join-item"
										onclick={() => addToCart($cartProducts, getProduct, false)}
										>+ <ShoppingCart /> aggiungi al carrello</button
									>
								{:else}
									<button class="btn join-item"><CircleX />Quantità limite</button>
								{/if}
								<!-- <button
									class="btn btn-primary join-item"
									onclick={() => addToCart($cartProducts, getProduct, false)}
									>+ <ShoppingCart /> aggiungi al carrello</button
								> -->
								<input
									type="text"
									value={$cartProducts.find((item) => item.prodId === getProduct.prodId)
										?.orderQuantity}
									class="input join-item text-center w-full"
									readonly
								/>
								<button
									class="btn join-item"
									onclick={() => removeFromCart($cartProducts, getProduct)}
									>- <ShoppingCart /> rimuovi dal carrello</button
								>
							</div>
						{/if}
					{:else}
						<button class="btn btn-error flex-1 sm:flex-none sm:min-w-[200px]"
							><ShoppingCart />Riservato agli associati</button
						>
					{/if}
				</div>

				<div class="alert bg-primary/10 text-primary-focus border-none">
					<CircleCheck size="20" />
					<div>
						<h3 class="font-bold">Spedizioni gratuite per ordino superiori a € 150</h3>
						<div class="text-xs">Ordini saranno evasi ogni settimana il mercoledi</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Product Details Tabs -->
		<div class="mt-16">
			<div role="tablist" class="tabs tabs-box justify-center">
				<button
					role="tab"
					class="tab {activeTab === 'description' ? 'text-primary font-bold tab-active' : ''}"
					onclick={() => setActiveTab('description')}
				>
					Descrizione
				</button>
				<button
					role="tab"
					class="tab {activeTab === 'info' ? 'text-primary font-bold tab-active' : ''}"
					onclick={() => setActiveTab('info')}
				>
					Altre informazioni
				</button>
				<button
					role="tab"
					class="tab {activeTab === 'usage' ? 'text-primary font-bold tab-active' : ''}"
					onclick={() => setActiveTab('usage')}
				>
					Trasporto
				</button>
			</div>

			<div class="p-4 bg-base-100 rounded-lg shadow-sm mt-2">
				{#if activeTab === 'description'}
					<div class="space-y-6 max-w-3xl mx-auto">
						<div class="card bg-base-200">
							<div class="card-body items-center text-center">
								<p>{getProduct.descrShort}</p>
							</div>
						</div>
					</div>
				{:else if activeTab === 'info'}
					<div class="space-y-6 max-w-3xl mx-auto">
						<h3 class="text-xl font-semibold">Altre informazioni</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
							<div class="card bg-base-200">
								<div class="card-body">
									<h3 class="card-title text-primary">title</h3>
									<p>
										Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque in lacus nisi.
										Morbi ac finibus ante. Sed in magna et urna aliquet rhoncus. Interdum et
										malesuada fames ac ante ipsum primis in faucibus.
									</p>
								</div>
							</div>
							<div class="card bg-base-200">
								<div class="card-body">
									<h3 class="card-title text-primary">title</h3>
									<p>
										Integer ipsum augue, ullamcorper et tortor sit amet, fermentum dapibus est.
										Praesent laoreet neque sit amet felis tincidunt malesuada.
									</p>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'usage'}
					<div class="space-y-6 max-w-3xl mx-auto">
						<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
							<div class="card bg-base-200">
								<div class="card-body items-center text-center">
									<div
										class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content mb-2"
									>
										<Boxes />
									</div>
									<h3 class="font-medium">Title 1</h3>
									<p class="text-sm">
										Vestibulum pellentesque tortor finibus, aliquam velit vitae, feugiat lorem.
									</p>
								</div>
							</div>
							<div class="card bg-base-200">
								<div class="card-body items-center text-center">
									<div
										class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content mb-2"
									>
										<Boxes />
									</div>
									<h3 class="font-medium">Title 2</h3>
									<p class="text-sm">
										Nulla consectetur leo in ligula porttitor, id feugiat dolor vulputate.
									</p>
								</div>
							</div>
							<div class="card bg-base-200">
								<div class="card-body items-center text-center">
									<div
										class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content mb-2"
									>
										<Boxes />
									</div>
									<h3 class="font-medium">Title 3</h3>
									<p class="text-sm">
										AMauris sagittis magna a velit elementum, non pretium massa interdum.
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Product Section -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
			<!-- Product Images -->
			<div class="space-y-4">
				<div class="bg-base-100 rounded-lg overflow-hidden shadow-sm">
					<img
						src="/images/placeholder.jpg"
						alt="placeholder"
						class="w-full h-auto object-cover aspect-square"
					/>
				</div>
			</div>
			<!-- Product Info -->
			<div class="space-y-6">
				<div>
					<h1 class="text-3xl font-bold">NO PRODUCT</h1>
					<p class="text-lg text-base-content/70 mt-1">no category</p>
				</div>
			</div>
		</div>
	{/if}
</div>
<Notification {toastClosed} {notificationContent} {notificationError} />
{#if $cartProducts.length > 0}
	<CartFloat />
{/if}

<style>
</style>
