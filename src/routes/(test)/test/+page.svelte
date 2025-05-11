<script>
	// Svelte 5 state management
	let activeTab = $state('description');
	let cartCount = $state(0);
	let selectedImage = $state(0);

	// Product data
	const product = {
		name: 'Pure Essence Wellness Oil V1',
		price: 39.99,
		description:
			'Our Pure Essence Wellness Oil is crafted from 100% organic ingredients, sourced from sustainable farms. This therapeutic-grade essential oil blend promotes relaxation, reduces stress, and enhances overall wellbeing.',
		benefits: [
			'Reduces stress and anxiety',
			'Improves sleep quality',
			'Enhances mental clarity',
			'Promotes skin health',
			'100% natural ingredients'
		],
		ingredients:
			'Lavender Oil, Eucalyptus Oil, Jojoba Oil, Rosemary Extract, Chamomile Extract, Vitamin E',
		images: [
			'/images/placeholder.jpg',
			'/images/placeholder.jpg',
			'/images/placeholder.jpg',
			'/images/placeholder.jpg'
		],
		reviews: [
			{
				name: 'Sarah M.',
				rating: 5,
				text: 'This oil has completely transformed my evening routine. I sleep better than ever!'
			},
			{
				name: 'James K.',
				rating: 4,
				text: 'Great product, lovely scent. I use it daily for meditation.'
			},
			{ name: 'Amelia P.', rating: 5, text: "The best wellness oil I've tried. Worth every penny!" }
		]
	};

	function addToCart() {
		cartCount += 1;
	}

	function setActiveTab(tab) {
		activeTab = tab;
	}

	function setSelectedImage(index) {
		selectedImage = index;
	}
</script>

<!-- Header -->
<header class="navbar bg-base-100 shadow-lg px-4 sm:px-8">
	<div class="flex-1">
		<a class="text-xl font-bold text-primary">NaturalWell</a>
	</div>
	<div class="flex-none">
		<div class="dropdown dropdown-end">
			<label tabindex="0" class="btn btn-ghost btn-circle">
				<div class="indicator">
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
							d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					{#if cartCount > 0}
						<span class="badge badge-sm indicator-item badge-secondary">{cartCount}</span>
					{/if}
				</div>
			</label>
		</div>
		<div class="dropdown dropdown-end">
			<label tabindex="0" class="btn btn-ghost btn-circle avatar">
				<div class="w-10 rounded-full">
					<img src="/placeholder.svg?height=40&width=40" alt="Avatar" />
				</div>
			</label>
		</div>
	</div>
</header>

<main class="container mx-auto px-4 py-8">
	<!-- Breadcrumbs -->
	<div class="text-sm breadcrumbs mb-6">
		<ul>
			<li><a>Home</a></li>
			<li><a>Wellness</a></li>
			<li>Essential Oils</li>
		</ul>
	</div>

	<!-- Product Section -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
		<!-- Product Images -->
		<div class="space-y-4">
			<div class="bg-base-200 rounded-lg overflow-hidden">
				<img
					src={product.images[selectedImage] || '/placeholder.svg'}
					alt={product.name}
					class="w-full h-auto object-cover aspect-square"
				/>
			</div>
			<div class="flex space-x-2 overflow-x-auto">
				{#each product.images as image, i}
					<div
						class="w-20 h-20 cursor-pointer rounded-md overflow-hidden border-2 {selectedImage === i
							? 'border-primary'
							: 'border-transparent'}"
						on:click={() => setSelectedImage(i)}
					>
						<img
							src={image || '/placeholder.svg'}
							alt="Thumbnail"
							class="w-full h-full object-cover"
						/>
					</div>
				{/each}
			</div>
		</div>

		<!-- Product Info -->
		<div class="space-y-6">
			<div>
				<h1 class="text-3xl font-bold">{product.name}</h1>
				<div class="flex items-center mt-2">
					<div class="rating rating-sm">
						<input type="radio" name="rating-2" class="mask mask-star-2 bg-accent" checked />
						<input type="radio" name="rating-2" class="mask mask-star-2 bg-accent" checked />
						<input type="radio" name="rating-2" class="mask mask-star-2 bg-accent" checked />
						<input type="radio" name="rating-2" class="mask mask-star-2 bg-accent" checked />
						<input type="radio" name="rating-2" class="mask mask-star-2 bg-accent" checked />
					</div>
					<span class="text-sm ml-2">(24 reviews)</span>
				</div>
			</div>

			<div class="text-2xl font-bold text-primary">${product.price}</div>

			<div class="prose">
				<p>{product.description}</p>
			</div>

			<div class="flex flex-col sm:flex-row gap-4">
				<div class="form-control">
					<div class="input-group">
						<button class="btn btn-square btn-outline">-</button>
						<input type="text" value="1" class="input input-bordered w-20 text-center" />
						<button class="btn btn-square btn-outline">+</button>
					</div>
				</div>
				<button class="btn btn-primary flex-1" on:click={addToCart}> Add to Cart </button>
				<button class="btn btn-outline btn-accent">
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
							d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
						/>
					</svg>
				</button>
			</div>

			<div class="flex items-center gap-2 text-sm">
				<div class="badge badge-outline">Organic</div>
				<div class="badge badge-outline">Vegan</div>
				<div class="badge badge-outline">Cruelty-Free</div>
			</div>

			<div class="alert alert-success shadow-lg">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current flex-shrink-0 h-6 w-6"
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
					<span>Free shipping on orders over $50</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Product Details Tabs -->
	<div class="mt-12">
		<div class="tabs tabs-boxed">
			<a
				class="tab {activeTab === 'description' ? 'tab-active' : ''}"
				on:click={() => setActiveTab('description')}
			>
				Description
			</a>
			<a
				class="tab {activeTab === 'ingredients' ? 'tab-active' : ''}"
				on:click={() => setActiveTab('ingredients')}
			>
				Ingredients
			</a>
			<a
				class="tab {activeTab === 'reviews' ? 'tab-active' : ''}"
				on:click={() => setActiveTab('reviews')}
			>
				Reviews
			</a>
		</div>

		<div class="p-6 bg-base-200 rounded-b-lg">
			{#if activeTab === 'description'}
				<div class="space-y-4">
					<h3 class="text-xl font-semibold">Product Benefits</h3>
					<ul class="list-disc pl-5 space-y-2">
						{#each product.benefits as benefit}
							<li>{benefit}</li>
						{/each}
					</ul>

					<h3 class="text-xl font-semibold mt-6">How to Use</h3>
					<p>
						Apply 2-3 drops to pulse points or add to a diffuser. For topical use, dilute with a
						carrier oil. Use daily for best results.
					</p>
				</div>
			{:else if activeTab === 'ingredients'}
				<div class="space-y-4">
					<h3 class="text-xl font-semibold">Ingredients</h3>
					<p>{product.ingredients}</p>

					<div class="alert alert-info mt-4">
						<div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								class="stroke-current flex-shrink-0 w-6 h-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							<span>All ingredients are 100% natural and ethically sourced.</span>
						</div>
					</div>
				</div>
			{:else if activeTab === 'reviews'}
				<div class="space-y-6">
					{#each product.reviews as review}
						<div class="bg-base-100 p-4 rounded-lg">
							<div class="flex justify-between">
								<div class="font-semibold">{review.name}</div>
								<div class="rating rating-sm">
									{#each Array(5) as _, i}
										<input
											type="radio"
											name={`rating-${review.name}`}
											class="mask mask-star-2 bg-accent"
											checked={i < review.rating}
											disabled
										/>
									{/each}
								</div>
							</div>
							<p class="mt-2">{review.text}</p>
						</div>
					{/each}

					<button class="btn btn-outline btn-primary">Write a Review</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Related Products -->
	<section class="mt-16">
		<h2 class="text-2xl font-bold mb-6">You May Also Like</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{#each Array(4) as _}
				<div class="card bg-base-100 shadow-xl">
					<figure><img src="/placeholder.svg?height=200&width=300" alt="Product" /></figure>
					<div class="card-body">
						<h3 class="card-title">Natural Wellness Product</h3>
						<div class="rating rating-sm">
							<input type="radio" name="rating-card" class="mask mask-star-2 bg-accent" checked />
							<input type="radio" name="rating-card" class="mask mask-star-2 bg-accent" checked />
							<input type="radio" name="rating-card" class="mask mask-star-2 bg-accent" checked />
							<input type="radio" name="rating-card" class="mask mask-star-2 bg-accent" checked />
							<input type="radio" name="rating-card" class="mask mask-star-2 bg-accent" />
						</div>
						<p class="text-primary font-bold mt-2">$29.99</p>
						<div class="card-actions justify-end">
							<button class="btn btn-primary btn-sm">Add to Cart</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
</main>

<!-- Newsletter -->
<section class="bg-accent text-accent-content py-16 mt-16">
	<div class="container mx-auto px-4 text-center">
		<h2 class="text-2xl font-bold mb-4">Join Our Wellness Journey</h2>
		<p class="max-w-md mx-auto mb-6">
			Subscribe to our newsletter for exclusive offers, wellness tips, and new product
			announcements.
		</p>
		<div class="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
			<input type="email" placeholder="Your email" class="input input-bordered w-full" />
			<button class="btn btn-secondary">Subscribe</button>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="footer p-10 bg-base-200 text-base-content">
	<div>
		<span class="footer-title">Shop</span>
		<a class="link link-hover">Essential Oils</a>
		<a class="link link-hover">Diffusers</a>
		<a class="link link-hover">Wellness Kits</a>
		<a class="link link-hover">Gift Sets</a>
	</div>
	<div>
		<span class="footer-title">Company</span>
		<a class="link link-hover">About us</a>
		<a class="link link-hover">Contact</a>
		<a class="link link-hover">Our Story</a>
		<a class="link link-hover">Sustainability</a>
	</div>
	<div>
		<span class="footer-title">Legal</span>
		<a class="link link-hover">Terms of use</a>
		<a class="link link-hover">Privacy policy</a>
		<a class="link link-hover">Cookie policy</a>
	</div>
	<div>
		<span class="footer-title">Newsletter</span>
		<div class="form-control w-80">
			<label class="label">
				<span class="label-text">Enter your email address</span>
			</label>
			<div class="relative">
				<input
					type="text"
					placeholder="username@site.com"
					class="input input-bordered w-full pr-16"
				/>
				<button class="btn btn-primary absolute top-0 right-0 rounded-l-none">Subscribe</button>
			</div>
		</div>
	</div>
</footer>

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
</style>
