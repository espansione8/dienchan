<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Image } from '@unpic/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { notification } from '$lib/stores/notifications';
	import Loader from '$lib/components/Loader.svelte';
	import { country_list, province } from '$lib/stores/arrays.js';
	import { 
		Package, 
		Mail, 
		Phone, 
		MapPin, 
		ShoppingCart,
		CheckCircle,
		AlertCircle
	} from 'lucide-svelte';

	const { data } = $props();
	const { kitProducts, auth, userData } = data;

	let formEl: HTMLFormElement;
	let loading = $state(false);
	let openModal = $state(false);

	// Form data
	let formData = $state({
		selectedKit: '',
		quantity: 1,
		shippingName: userData?.name || '',
		shippingSurname: userData?.surname || '',
		shippingEmail: userData?.email || '',
		shippingPhone: userData?.phone || '',
		shippingMobilePhone: userData?.mobilePhone || '',
		shippingAddress: userData?.address || '',
		shippingCity: userData?.city || '',
		shippingCounty: userData?.county?.[0] || '',
		shippingPostalCode: userData?.postalCode || '',
		shippingCountry: userData?.country || 'Italy'
	});

	// Selected product details
	let selectedProduct = $derived(
		kitProducts.find((p) => p.prodId === formData.selectedKit)
	);

	const openOrderModal = () => {
		if (!formData.selectedKit) {
			notification.error('Seleziona un kit prima di procedere');
			return;
		}
		openModal = true;
	};

	const closeModal = () => {
		openModal = false;
	};

	const isFormValid = () => {
		return (
			formData.selectedKit &&
			formData.quantity > 0 &&
			formData.shippingName &&
			formData.shippingSurname &&
			formData.shippingEmail &&
			formData.shippingMobilePhone &&
			formData.shippingAddress &&
			formData.shippingCity &&
			formData.shippingCounty &&
			formData.shippingPostalCode &&
			formData.shippingCountry
		);
	};

	const formSubmit = () => {
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			await invalidateAll();

			if (result.type === 'success' && result.data) {
				const { action, message } = result.data;

				if (action === 'createOrder') {
					notification.success(message);
					closeModal();
					setTimeout(() => {
						goto('/profile-area');
					}, 2000);
				}
			}

			if (result.type === 'failure') {
				notification.error(result.data?.message || 'Errore durante la creazione dell\'ordine');
			}

			if (result.type === 'error') {
				notification.error('Errore server');
			}

			loading = false;
		};
	};

	const handleSubmit = async () => {
		if (!isFormValid()) {
			notification.error('Compila tutti i campi obbligatori');
			return;
		}

		if (formEl) {
			formEl.requestSubmit();
		}
	};
</script>

<svelte:head>
	<title>Ordina Kit Formatori</title>
</svelte:head>

<div class="container mx-auto p-4 md:p-6 max-w-6xl">


	{#if loading}
		<Loader />
	{:else}
		<!-- Main Content -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left Column - Product Selection -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Kit Selection Card -->
				<div class="card bg-base-100 shadow-xl border border-base-200">
					<div class="card-body">
						<h2 class="card-title text-2xl mb-4">
							<Package class="w-6 h-6" />
							Seleziona Kit
						</h2>

						{#if kitProducts.length === 0}
							<div class="alert alert-warning">
								<AlertCircle class="w-5 h-5" />
								<span>Nessun kit disponibile al momento</span>
							</div>
						{:else}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								{#each kitProducts as kit}
									<label
										class="card bg-base-100 border-2 hover:border-primary cursor-pointer transition-all"
										class:border-primary={formData.selectedKit === kit.prodId}
										class:bg-primary-500={formData.selectedKit === kit.prodId}
									>
										<input
											type="radio"
											name="selectedKit"
											value={kit.prodId}
											class="hidden"
											bind:group={formData.selectedKit}
										/>
										<div class="card-body p-4">
											{#if kit.urlPic}
												<div class="aspect-square w-full mb-3 rounded-lg overflow-hidden">
													<Image
														layout="constrained"
														aspectRatio={1}
														src={kit.urlPic}
														alt={kit.title}
														class="w-full h-full object-cover"
													/>
												</div>
											{/if}
											<h3 class="font-bold text-lg">{kit.title}</h3>
											{#if kit.descr}
												<p class="text-sm text-base-content/70 line-clamp-2">
													{kit.descr}
												</p>
											{/if}
										</div>
									</label>
								{/each}
							</div>
						{/if}

						{#if selectedProduct}
							<!-- Quantity Selector -->
							<div class="divider"></div>
							<div class="form-control">
								<label for="quantity" class="label">
									<span class="label-text font-medium text-lg">Quantità</span>
								</label>
								<input
									id="quantity"
									type="number"
									class="input input-bordered w-32"
									min="1"
									bind:value={formData.quantity}
								/>
							</div>
						{/if}
					</div>
				</div>

				{#if selectedProduct}
					<!-- Shipping Address Card -->
					<div class="card bg-base-100 shadow-xl border border-base-200">
						<div class="card-body">
							<h2 class="card-title text-2xl mb-4">
								<MapPin class="w-6 h-6" />
								Indirizzo di Spedizione
							</h2>

							<div class="space-y-4">
								<!-- Name and Surname -->
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div class="form-control">
										<label for="shippingName" class="label">
											<span class="label-text font-medium">Nome *</span>
										</label>
										<input
											id="shippingName"
											type="text"
											class="input input-bordered"
											placeholder="Nome"
											required
											bind:value={formData.shippingName}
										/>
									</div>

									<div class="form-control">
										<label for="shippingSurname" class="label">
											<span class="label-text font-medium">Cognome *</span>
										</label>
										<input
											id="shippingSurname"
											type="text"
											class="input input-bordered"
											placeholder="Cognome"
											required
											bind:value={formData.shippingSurname}
										/>
									</div>
								</div>

								<!-- Email -->
								<div class="form-control">
									<label for="shippingEmail" class="label">
										<span class="label-text font-medium">Email *</span>
									</label>
									<div class="input input-bordered flex items-center gap-2 pr-2">
										<Mail size={18} class="ml-2" />
										<input
											id="shippingEmail"
											type="email"
											class="flex-1 outline-none bg-transparent"
											placeholder="esempio@email.com"
											required
											bind:value={formData.shippingEmail}
										/>
									</div>
								</div>

								<!-- Phone Numbers -->
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div class="form-control">
										<label for="shippingPhone" class="label">
											<span class="label-text font-medium">Telefono</span>
										</label>
										<div class="input input-bordered flex items-center gap-2 pr-2">
											<Phone size={18} class="ml-2" />
											<input
												id="shippingPhone"
												type="tel"
												class="flex-1 outline-none bg-transparent"
												placeholder="+39 01234567"
												bind:value={formData.shippingPhone}
											/>
										</div>
									</div>

									<div class="form-control">
										<label for="shippingMobilePhone" class="label">
											<span class="label-text font-medium">Cellulare *</span>
										</label>
										<div class="input input-bordered flex items-center gap-2 pr-2">
											<Phone size={18} class="ml-2" />
											<input
												id="shippingMobilePhone"
												type="tel"
												class="flex-1 outline-none bg-transparent"
												placeholder="+39 3331234567"
												required
												bind:value={formData.shippingMobilePhone}
											/>
										</div>
									</div>
								</div>

								<!-- Address -->
								<div class="form-control">
									<label for="shippingAddress" class="label">
										<span class="label-text font-medium">Indirizzo *</span>
									</label>
									<div class="input input-bordered flex items-center gap-2 pr-2">
										<MapPin size={18} class="ml-2" />
										<input
											id="shippingAddress"
											type="text"
											class="flex-1 outline-none bg-transparent"
											placeholder="Via/Piazza, numero civico"
											required
											bind:value={formData.shippingAddress}
										/>
									</div>
								</div>

								<!-- City and Postal Code -->
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div class="form-control">
										<label for="shippingCity" class="label">
											<span class="label-text font-medium">Città *</span>
										</label>
										<input
											id="shippingCity"
											type="text"
											class="input input-bordered"
											placeholder="Città"
											required
											bind:value={formData.shippingCity}
										/>
									</div>

									<div class="form-control">
										<label for="shippingPostalCode" class="label">
											<span class="label-text font-medium">CAP *</span>
										</label>
										<input
											id="shippingPostalCode"
											type="text"
											class="input input-bordered"
											placeholder="12345"
											required
											bind:value={formData.shippingPostalCode}
										/>
									</div>
								</div>

								<!-- County and Country -->
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div class="form-control">
										<label for="shippingCounty" class="label">
											<span class="label-text font-medium">Provincia *</span>
										</label>
										<select
											id="shippingCounty"
											class="select select-bordered"
											required
											bind:value={formData.shippingCounty}
										>
											<option value="" disabled>Seleziona provincia</option>
											{#each $province as provincia}
												{#if provincia.title !== 'Online'}
													<option value={provincia.title}>
														{provincia.title} ({provincia.region})
													</option>
												{/if}
											{/each}
										</select>
									</div>

									<div class="form-control">
										<label for="shippingCountry" class="label">
											<span class="label-text font-medium">Nazione *</span>
										</label>
										<select
											id="shippingCountry"
											class="select select-bordered"
											required
											bind:value={formData.shippingCountry}
										>
											<option value="" disabled>Seleziona nazione</option>
											{#each $country_list as country}
												<option value={country}>
													{country}
												</option>
											{/each}
										</select>
									</div>
								</div>

								
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Right Column - Order Summary (Sticky) -->
			<div class="lg:col-span-1">
				<div class="card bg-base-100 shadow-xl border border-base-200 lg:sticky lg:top-4">
					<div class="card-body">
						<h2 class="card-title text-xl mb-4">Riepilogo Ordine</h2>

						{#if !selectedProduct}
							<div class="text-center py-8 text-base-content/50">
								<Package class="w-12 h-12 mx-auto mb-2 opacity-50" />
								<p>Seleziona un kit per visualizzare il riepilogo</p>
							</div>
						{:else}
							<div class="space-y-4">
								<!-- Product Info -->
								<div class="flex gap-3">
									{#if selectedProduct.urlPic}
										<div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
											<Image
												layout="constrained"
												aspectRatio={1}
												src={selectedProduct.urlPic}
												alt={selectedProduct.title}
												class="w-full h-full object-cover"
											/>
										</div>
									{/if}
									<div class="flex-1">
										<h3 class="font-bold">{selectedProduct.title}</h3>
										<p class="text-sm text-base-content/70">
											Quantità: {formData.quantity}
										</p>
									</div>
								</div>

								<div class="divider my-2"></div>

								<!-- Submit Button -->
								<button
									type="button"
									class="btn btn-primary w-full btn-lg"
									onclick={openOrderModal}
									disabled={!isFormValid()}
								>
									<ShoppingCart class="w-5 h-5" />
									Conferma Ordine
								</button>

								<p class="text-xs text-center text-base-content/60">
									Cliccando confermi di aver inserito tutti i dati correttamente
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Confirmation Modal -->
{#if openModal}
	<Modal
		isOpen={openModal}
		header="Conferma Ordine"
		cssClass="bg-white rounded-lg shadow-xl w-full max-w-2xl"
	>
		<button
			class="btn btn-sm btn-circle absolute right-2 top-2"
			onclick={closeModal}
		>
			✕
		</button>

		<form
			method="POST"
			action="?/createOrder"
			use:enhance={formSubmit}
			bind:this={formEl}
			class="px-6 pb-6"
		>
			<div class="space-y-6">
				<!-- Product Summary -->
				<div class="card bg-base-100 border border-base-200">
					<div class="card-body">
						<h3 class="font-bold text-lg mb-3">Prodotto</h3>
						{#if selectedProduct}
							<div class="flex gap-3 items-center">
								{#if selectedProduct.urlPic}
									<div class="w-16 h-16 rounded-lg overflow-hidden">
										<Image
											layout="constrained"
											aspectRatio={1}
											src={selectedProduct.urlPic}
											alt={selectedProduct.title}
											class="w-full h-full object-cover"
										/>
									</div>
								{/if}
								<div class="flex-1">
									<p class="font-bold">{selectedProduct.title}</p>
									<p class="text-sm">Quantità: {formData.quantity}</p>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Shipping Summary -->
				<div class="card bg-base-100 border border-base-200">
					<div class="card-body">
						<h3 class="font-bold text-lg mb-3">Indirizzo di Spedizione</h3>
						<div class="space-y-2 text-sm">
							<p>
								<span class="font-medium">{formData.shippingName} {formData.shippingSurname}</span>
							</p>
							<p>{formData.shippingAddress}</p>
							<p>
								{formData.shippingPostalCode} {formData.shippingCity} ({formData.shippingCounty})
							</p>
							<p>{formData.shippingCountry}</p>
							<p class="mt-2">
								<Mail size={14} class="inline" /> {formData.shippingEmail}
							</p>
							<p>
								<Phone size={14} class="inline" /> {formData.shippingMobilePhone}
							</p>
						
						</div>
					</div>
				</div>

				<!-- Alert -->
				<div class="alert alert-warning">
					<AlertCircle class="w-5 h-5" />
					<div>
						<p class="font-medium">Verifica attentamente i dati inseriti</p>
						<p class="text-sm">Una volta confermato, l'ordine verrà elaborato</p>
					</div>
				</div>

				<!-- Hidden form fields -->
				<input type="hidden" name="selectedKit" value={formData.selectedKit} />
				<input type="hidden" name="quantity" value={formData.quantity} />
				<input type="hidden" name="shippingName" value={formData.shippingName} />
				<input type="hidden" name="shippingSurname" value={formData.shippingSurname} />
				<input type="hidden" name="shippingEmail" value={formData.shippingEmail} />
				<input type="hidden" name="shippingPhone" value={formData.shippingPhone} />
				<input type="hidden" name="shippingMobilePhone" value={formData.shippingMobilePhone} />
				<input type="hidden" name="shippingAddress" value={formData.shippingAddress} />
				<input type="hidden" name="shippingCity" value={formData.shippingCity} />
				<input type="hidden" name="shippingCounty" value={formData.shippingCounty} />
				<input type="hidden" name="shippingPostalCode" value={formData.shippingPostalCode} />
				<input type="hidden" name="shippingCountry" value={formData.shippingCountry} />

				<!-- Action Buttons -->
				<div class="flex gap-3 justify-end">
					<button
						type="button"
						class="btn btn-outline"
						onclick={closeModal}
						disabled={loading}
					>
						Annulla
					</button>
					<button
						type="button"
						class="btn btn-primary"
						onclick={handleSubmit}
						disabled={loading}
					>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
							Elaborazione...
						{:else}
							<CheckCircle class="w-5 h-5" />
							Conferma Ordine
						{/if}
					</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>