<script lang="ts">
	import { Euro, Boxes, Weight, Tags } from 'lucide-svelte';
	let { data } = $props();
	let { getProduct } = $derived(data);
</script>

<svelte:head>
	<title>Dettagli prodotto</title>
</svelte:head>

<div class="container mx-auto px-4 py-6">
	<div class="grid grid-cols-1 lg:grid-cols-2 lg:mt-10 gap-8 items-stretch min-h-[400px]">
		{#if getProduct}
			<div class="h-full">
				<div class="carousel w-full h-full rounded-xl shadow-lg">
					{#each getProduct.uploadfiles as file}
						<div class="carousel-item w-full h-full">
							<img
								src={`${import.meta.env.VITE_BASE_URL}/uploads/${file.fileUrl}`}
								alt={file.filename}
								class="w-full h-full object-cover rounded-xl"
							/>
						</div>
					{:else}
						<img
							src="/images/no_img.jpg"
							alt="missing"
							class="w-full h-full object-cover rounded-xl shadow-lg"
						/>
					{/each}
				</div>
			</div>
			<div class="card bg-white text-gray-800 shadow-md border border-gray-200 h-full">
				<div class="card-body flex flex-col justify-between space-y-6">
					<div class="space-y-6">
						<h2 class="card-title text-3xl font-semibold text-gray-900">{getProduct.title}</h2>

						<p class="text-base leading-relaxed text-gray-600">{getProduct.descrShort}</p>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:mt-20">
							<div class="flex items-center gap-2">
								<Euro class="w-5 h-5 text-gray-500" />
								<span><strong>Prezzo:</strong> {getProduct.price} €</span>
							</div>
							<div class="flex items-center gap-2">
								<Boxes class="w-5 h-5 text-gray-500" />
								<span><strong>Quantità magazzino:</strong> {getProduct.stockQty} </span>
							</div>
							<div class="flex items-center gap-2">
								<Weight class="w-5 h-5 text-gray-500" />
								<span><strong>Peso:</strong> {getProduct.weight} KG</span>
							</div>
							<div class="flex items-center gap-2">
								<Tags class="w-5 h-5 text-gray-500" />
								<span><strong>Categoria:</strong> {getProduct.category.join(', ')}</span>
							</div>
						</div>
					</div>
					<!-- <div class="card-actions justify-end pt-6">
						<button class="btn btn-primary px-6">Aggiungi al carrello</button>
					</div> -->
				</div>
			</div>
		{:else}
			<div class="card bg-white text-gray-800 shadow-md border border-gray-200 h-full">
				no prodotti
			</div>
		{/if}
	</div>
</div>
