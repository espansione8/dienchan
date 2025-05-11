<script>
	// Svelte 5 state management
	let selectedImage = $state(0);
	let quantity = $state(1);
	let activeTab = $state('description');

	// Product data
	const product = {
		name: 'Harmony Essential Oil Blend V2',
		tagline: 'Balance • Calm • Wellness',
		price: 42.99,
		salePrice: 36.99,
		rating: 4.8,
		reviewCount: 124,
		stock: 'In Stock',
		description:
			'Our signature blend combines 7 therapeutic-grade essential oils to create a harmonious balance for mind and body. Expertly crafted to reduce stress, enhance focus, and promote overall wellbeing.',
		benefits: [
			'Reduces stress and anxiety',
			'Enhances mental clarity and focus',
			'Promotes restful sleep',
			'Balances mood and emotions',
			'Supports immune function'
		],
		ingredients:
			'Organic Lavender Oil, Wild-Crafted Frankincense, Bergamot Oil, Ylang Ylang Extract, Cedarwood Oil, Chamomile Oil, Vetiver Root Oil',
		usage:
			'Apply 2-3 drops to pulse points, add to diffuser, or mix with carrier oil for massage. Use morning and evening for optimal results.',
		images: [
			'/images/placeholder.jpg',
			'/images/no_img.jpg',
			'/images/placeholder.jpg',
			'/images/no_img.jpg',
			'/images/image_placeholder.png'
		],
		features: [
			'100% Pure & Natural',
			'Ethically Sourced',
			'No Synthetic Additives',
			'Cruelty-Free'
		],
		relatedProducts: [
			{ name: 'Clarity Mind Mist', price: 28.99, image: '/images/image_placeholder.png' },
			{
				name: 'Tranquil Sleep Blend',
				price: 38.99,
				image: '/images/image_placeholder.png'
			},
			{
				name: 'Vitality Wellness Drops',
				price: 44.99,
				image: '/images/image_placeholder.png'
			}
		]
	};

	function incrementQuantity() {
		quantity += 1;
	}

	function decrementQuantity() {
		if (quantity > 1) quantity -= 1;
	}

	function setActiveTab(tab) {
		activeTab = tab;
	}

	function setSelectedImage(index) {
		selectedImage = index;
	}
</script>

<main class="container mx-auto px-4 py-8 max-w-7xl">
	<!-- Product Section -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
		<!-- Product Images -->
		<div class="space-y-4">
			<div class="bg-base-100 rounded-lg overflow-hidden shadow-sm">
				<img
					src={product.images[selectedImage] || '/images/image_placeholder.png'}
					alt={product.name}
					class="w-full h-auto object-cover aspect-square"
				/>
			</div>
			<div class="flex space-x-3">
				{#each product.images as image, i}
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
			</div>
		</div>

		<!-- Product Info -->
		<div class="space-y-6">
			<div>
				<div class="badge badge-primary mb-2">BESTSELLER</div>
				<h1 class="text-3xl font-bold">{product.name}</h1>
				<p class="text-lg text-base-content/70 mt-1">{product.tagline}</p>

				<div class="flex items-center mt-3">
					<div class="rating rating-sm">
						{#each Array(5) as _, i}
							<input
								type="radio"
								name="rating-product"
								class="mask mask-star-2 bg-accent"
								checked={i < Math.floor(product.rating)}
								disabled
							/>
						{/each}
					</div>
					<span class="text-sm ml-2">{product.rating} ({product.reviewCount} reviews)</span>
				</div>
			</div>

			<div class="flex items-baseline">
				<span class="text-3xl font-bold text-primary">${product.salePrice}</span>
				{#if product.salePrice < product.price}
					<span class="text-xl line-through ml-3 text-base-content/60">${product.price}</span>
					<span class="badge badge-secondary ml-3"
						>SAVE ${(product.price - product.salePrice).toFixed(2)}</span
					>
				{/if}
			</div>

			<div class="divider my-2"></div>

			<div class="prose max-w-none">
				<p>{product.description}</p>
			</div>

			<div class="flex flex-wrap gap-2 mt-4">
				{#each product.features as feature}
					<div class="badge badge-outline">{feature}</div>
				{/each}
			</div>

			<div class="flex items-center text-sm font-medium text-success">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 mr-1"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
				{product.stock} 2222
			</div>

			<div class="divider my-2"></div>

			<div class="flex flex-col sm:flex-row gap-4">
				<div class="join">
					<button class="btn join-item" onclick={decrementQuantity}>-</button>
					<input type="text" value={quantity} class="input join-item w-16 text-center" readonly />
					<button class="btn join-item" onclick={incrementQuantity}>+</button>
				</div>

				<button class="btn btn-primary flex-1 sm:flex-none sm:min-w-[200px]"> Add to Cart </button>

				<button class="btn btn-outline btn-accent">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
						/>
					</svg>
					Save
				</button>
			</div>

			<div class="alert bg-primary/10 text-primary-focus border-none">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current shrink-0 h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div>
					<h3 class="font-bold">Free shipping on orders over $50</h3>
					<div class="text-xs">Orders ship within 24 hours</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Product Details Tabs -->
	<div class="mt-16">
		<div class="tabs tabs-boxed justify-center">
			<button
				class="tab {activeTab === 'description' ? 'tab-active' : ''}"
				onclick={() => setActiveTab('description')}
			>
				Description
			</button>
			<button
				class="tab {activeTab === 'ingredients' ? 'tab-active' : ''}"
				onclick={() => setActiveTab('ingredients')}
			>
				Ingredients
			</button>
			<button
				class="tab {activeTab === 'usage' ? 'tab-active' : ''}"
				onclick={() => setActiveTab('usage')}
			>
				How to Use
			</button>
		</div>

		<div class="p-8 bg-base-100 rounded-lg shadow-sm mt-2">
			{#if activeTab === 'description'}
				<div class="space-y-6 max-w-3xl mx-auto">
					<h3 class="text-xl font-semibold">About This Product</h3>
					<p>{product.description}</p>

					<h3 class="text-xl font-semibold">Key Benefits</h3>
					<ul class="space-y-2">
						{#each product.benefits as benefit}
							<li class="flex items-start">
								<svg
									class="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									/>
								</svg>
								<span>{benefit}</span>
							</li>
						{/each}
					</ul>
				</div>
			{:else if activeTab === 'ingredients'}
				<div class="space-y-6 max-w-3xl mx-auto">
					<h3 class="text-xl font-semibold">Ingredients</h3>
					<p class="leading-relaxed">{product.ingredients}</p>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
						<div class="card bg-base-200">
							<div class="card-body">
								<h3 class="card-title text-primary">Sourcing</h3>
								<p>
									We source our ingredients from sustainable farms and wild-crafted sources around
									the world, ensuring the highest quality and purity.
								</p>
							</div>
						</div>
						<div class="card bg-base-200">
							<div class="card-body">
								<h3 class="card-title text-primary">Quality Testing</h3>
								<p>
									Each batch undergoes rigorous testing for purity and potency, ensuring you receive
									only the finest natural wellness products.
								</p>
							</div>
						</div>
					</div>
				</div>
			{:else if activeTab === 'usage'}
				<div class="space-y-6 max-w-3xl mx-auto">
					<h3 class="text-xl font-semibold">How to Use</h3>
					<p class="leading-relaxed">{product.usage}</p>

					<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
						<div class="card bg-base-200">
							<div class="card-body items-center text-center">
								<div
									class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content mb-2"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
										/>
									</svg>
								</div>
								<h3 class="font-medium">Topical Application</h3>
								<p class="text-sm">Apply 2-3 drops to pulse points or areas of concern.</p>
							</div>
						</div>
						<div class="card bg-base-200">
							<div class="card-body items-center text-center">
								<div
									class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content mb-2"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
										/>
									</svg>
								</div>
								<h3 class="font-medium">Diffusion</h3>
								<p class="text-sm">Add 5-7 drops to your diffuser with water.</p>
							</div>
						</div>
						<div class="card bg-base-200">
							<div class="card-body items-center text-center">
								<div
									class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content mb-2"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
										/>
									</svg>
								</div>
								<h3 class="font-medium">Bath</h3>
								<p class="text-sm">Add 8-10 drops to warm bath water and soak.</p>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Customer Favorites -->
	<section class="mt-20">
		<div class="flex items-center justify-between mb-8">
			<h2 class="text-2xl font-bold">Customer Favorites</h2>
			<a href="#" class="text-primary font-medium flex items-center">
				View All
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 ml-1"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
			</a>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each product.relatedProducts as relatedProduct}
				<div class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
					<figure class="px-6 pt-6">
						<img
							src={relatedProduct.image || '/images/image_placeholder.png'}
							alt={relatedProduct.name}
							class="rounded-xl object-cover h-48 w-full"
						/>
					</figure>
					<div class="card-body">
						<h3 class="card-title">{relatedProduct.name}</h3>
						<div class="rating rating-sm">
							<input
								type="radio"
								name="rating-related"
								class="mask mask-star-2 bg-accent"
								checked
							/>
							<input
								type="radio"
								name="rating-related"
								class="mask mask-star-2 bg-accent"
								checked
							/>
							<input
								type="radio"
								name="rating-related"
								class="mask mask-star-2 bg-accent"
								checked
							/>
							<input
								type="radio"
								name="rating-related"
								class="mask mask-star-2 bg-accent"
								checked
							/>
							<input
								type="radio"
								name="rating-related"
								class="mask mask-star-2 bg-accent"
								checked
							/>
						</div>
						<p class="text-primary font-bold mt-2">${relatedProduct.price}</p>
						<div class="card-actions justify-end mt-2">
							<button class="btn btn-primary btn-sm">Add to Cart</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
</main>

<style>
	/* Custom styles to apply the specified colors */
	:global(html) {
		--primary: #1a93dc;
		--primary-focus: #1684c7;
		--primary-content: #ffffff;

		--secondary: #f50101;
		--secondary-focus: #d90101;
		--secondary-content: #ffffff;

		--accent: #292fa7;
		--accent-focus: #232896;
		--accent-content: #ffffff;
	}

	/* Additional custom styles */
	.tabs-boxed .tab-active {
		background-color: var(--primary);
		color: var(--primary-content);
	}

	/* Smooth transitions */
	.tab,
	button,
	.card {
		transition: all 0.2s ease-in-out;
	}
</style>
