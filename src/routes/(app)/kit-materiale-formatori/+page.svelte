<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Papa from 'papaparse';
	import { Image } from '@unpic/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { notification } from '$lib/stores/notifications';
	import Loader from '$lib/components/Loader.svelte';
	import { country_list, province, orderKeysToDelete } from '$lib/stores/arrays.js';
	import type { Order } from '$lib/types';
	import { Package, Mail, Phone, MapPin, ShoppingCart, CheckCircle, AlertCircle, FileDown, Plus, Minus, Trash2 } from 'lucide-svelte';

	const { data } = $props();
	const { kitProducts, auth, userData } = data;
	let { tableList } = $derived(data);

	console.log('tableList', tableList)




	let formEl: HTMLFormElement;
	let loading = $state(false);
	let openModal = $state(false);

	// Cart state - array of selected kits with quantities
	let cart = $state<Array<{ prodId: string; quantity: number }>>([]);

	// Form data
	let formData = $state({
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

	// Cart management functions
	const addToCart = (prodId: string) => {
		const existingItem = cart.find(item => item.prodId === prodId);
		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			cart.push({ prodId, quantity: 1 });
		}
		cart = [...cart]; // Trigger reactivity
	};

	const removeFromCart = (prodId: string) => {
		cart = cart.filter(item => item.prodId !== prodId);
	};

	const updateQuantity = (prodId: string, quantity: number) => {
		const item = cart.find(item => item.prodId === prodId);
		if (item) {
			item.quantity = Math.max(1, quantity);
			cart = [...cart]; // Trigger reactivity
		}
	};

	const incrementQuantity = (prodId: string) => {
		const item = cart.find(item => item.prodId === prodId);
		if (item) {
			item.quantity += 1;
			cart = [...cart];
		}
	};

	const decrementQuantity = (prodId: string) => {
		const item = cart.find(item => item.prodId === prodId);
		if (item && item.quantity > 1) {
			item.quantity -= 1;
			cart = [...cart];
		}
	};

	const isInCart = (prodId: string) => {
		return cart.some(item => item.prodId === prodId);
	};

	const getCartItem = (prodId: string) => {
		return cart.find(item => item.prodId === prodId);
	};

	// Get total items in cart
	const totalItems = $derived(cart.reduce((sum, item) => sum + item.quantity, 0));

	const openOrderModal = () => {
		if (cart.length === 0) {
			notification.error('Aggiungi almeno un kit al carrello');
			return;
		}
		openModal = true;
	};

	const closeModal = () => {
		openModal = false;
	};

	const isFormValid = () => {
		return (
			cart.length > 0 &&
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

	const csvCreate = (content: Order[]) => {
		// Prima rimuovi userView da tutti gli ordini
		const cleanedContent = content.map(order => {
			const { userView, ...rest } = order;
			return rest;
		});

		const flattenObject = (obj, prefix = '') => {
			let result = {};
			const orderType = obj.type;

			for (const key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					const value = obj[key];
					const newPrefix = prefix ? `${prefix}.${key}` : key;

					if (newPrefix === 'cart' && Array.isArray(value)) {
						const cartString = value
							.map((cartItem) => {
								if (orderType === 'product') {
									return `(${cartItem.title}: ${cartItem.orderQuantity})`;
								} else if (orderType === 'course') {
									if (cartItem.type === 'product') {
										return `(${cartItem.title}: 1)`;
									} else if (cartItem.type === 'course' || cartItem.type === 'event') {
										return `(${cartItem.layoutView.title}: 1)`;
									}
								} else if (orderType === 'membership') {
									return `(${cartItem.title}: 1)`;
								}
								return '';
							})
							.filter(Boolean)
							.join(', ');
						result[newPrefix] = cartString;
					} else if (Array.isArray(value)) {
						value.forEach((item, index) => {
							if (typeof item === 'object' && item !== null) {
								Object.assign(result, flattenObject(item, `${newPrefix}.${index}`));
							} else {
								result[`${newPrefix}.${index}`] = item;
							}
						});
					} else if (typeof value === 'object' && value !== null) {
						Object.assign(result, flattenObject(value, newPrefix));
					} else {
						result[newPrefix] = value;
					}
				}
			}
			return result;
		};

		const dataToExport = cleanedContent.map((order) => {
			const flatOrder: any = flattenObject(order);
			if (flatOrder.createdAt) flatOrder.createdAt = (flatOrder.createdAt as string).substring(0, 10);
			$orderKeysToDelete.forEach((key: string) => delete (flatOrder as any)[key]);
			return flatOrder;
		});

		const csv = Papa.unparse(dataToExport, {
			quotes: false,
			quoteChar: '"',
			escapeChar: '"',
			delimiter: ';',
			header: true,
			skipEmptyLines: false
		});

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `Export_orders_materiale_formatori_${new Date().toLocaleDateString()}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
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
					cart = []; // Clear cart after successful order
					setTimeout(() => {
						goto('/profile-area');
					}, 2000);
				}
			}

			if (result.type === 'failure') {
				notification.error(result.data?.message || "Errore durante la creazione dell'ordine");
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
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left Column - Product Selection -->
			<div class="lg:col-span-2 space-y-6">
				<button class="btn btn-info text-white w-full sm:w-auto flex mx-auto" onclick={() => csvCreate(tableList)}>
					<FileDown />CSV ordini formatori
				</button>

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
									<div
										class="card bg-base-100 border-2 hover:border-primary transition-all"
										class:border-primary={isInCart(kit.prodId)}
										class:bg-primary-500={isInCart(kit.prodId)}
									>
										<div class="card-body p-4">
											{#if kit.urlPic}
												<div class="aspect-square w-full mb-3 rounded-lg overflow-hidden">
													<Image layout="constrained" aspectRatio={1} src={kit.urlPic} alt={kit.title} class="w-full h-full object-cover" />
												</div>
											{/if}
											<h3 class="font-bold text-lg">{kit.title}</h3>
											{#if kit.descr}
												<p class="text-sm text-base-content/70 line-clamp-2">
													{kit.descr}
												</p>
											{/if}

											{#if isInCart(kit.prodId)}
												{@const cartItem = getCartItem(kit.prodId)}
												<div class="flex items-center justify-between mt-3 gap-2">
													<div class="join">
														<button class="btn btn-sm join-item" onclick={() => decrementQuantity(kit.prodId)}>
															<Minus size={16} />
														</button>
														<input 
															type="number" 
															class="input input-sm join-item w-16 text-center" 
															value={cartItem?.quantity || 1}
															min="1"
															onchange={(e) => updateQuantity(kit.prodId, parseInt(e.currentTarget.value) || 1)}
														/>
														<button class="btn btn-sm join-item" onclick={() => incrementQuantity(kit.prodId)}>
															<Plus size={16} />
														</button>
													</div>
													<button class="btn btn-sm btn-error btn-outline" onclick={() => removeFromCart(kit.prodId)}>
														<Trash2 size={16} />
													</button>
												</div>
											{:else}
												<button class="btn btn-primary btn-sm mt-3 w-full" onclick={() => addToCart(kit.prodId)}>
													<Plus size={16} />
													Aggiungi
												</button>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				{#if cart.length > 0}
					<!-- Shipping Address Card -->
					<div class="card bg-base-100 shadow-xl border border-base-200">
						<div class="card-body">
							<h2 class="card-title text-2xl mb-4">
								<MapPin class="w-6 h-6" />
								Indirizzo di Spedizione
							</h2>

							<div class="space-y-4">
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

								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div class="form-control">
										<label for="shippingCounty" class="label">
											<span class="label-text font-medium">Provincia *</span>
										</label>
										<select id="shippingCounty" class="select select-bordered" required bind:value={formData.shippingCounty}>
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
										<select id="shippingCountry" class="select select-bordered" required bind:value={formData.shippingCountry}>
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

			<!-- Right Column - Cart Summary (Sticky) -->
			<div class="lg:col-span-1">
				<div class="card bg-base-100 shadow-xl border border-base-200 lg:sticky lg:top-4">
					<div class="card-body">
						<h2 class="card-title text-xl mb-4">
							Carrello
							{#if cart.length > 0}
								<span class="badge badge-primary">{totalItems}</span>
							{/if}
						</h2>

						{#if cart.length === 0}
							<div class="text-center py-8 text-base-content/50">
								<ShoppingCart class="w-12 h-12 mx-auto mb-2 opacity-50" />
								<p>Il carrello è vuoto</p>
								<p class="text-sm">Aggiungi kit per procedere</p>
							</div>
						{:else}
							<div class="space-y-4">
								<!-- Cart Items -->
								<div class="space-y-3 max-h-96 overflow-y-auto">
									{#each cart as item}
										{@const product = kitProducts.find(p => p.prodId === item.prodId)}
										{#if product}
											<div class="flex gap-3 p-2 rounded-lg bg-base-200">
												{#if product.urlPic}
													<div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
														<Image
															layout="constrained"
															aspectRatio={1}
															src={product.urlPic}
															alt={product.title}
															class="w-full h-full object-cover"
														/>
													</div>
												{/if}
												<div class="flex-1 min-w-0">
													<h3 class="font-bold text-sm truncate">{product.title}</h3>
													<p class="text-xs text-base-content/70">
														Quantità: {item.quantity}
													</p>
												</div>
											</div>
										{/if}
									{/each}
								</div>

								<div class="divider my-2"></div>

								<div class="text-lg font-bold">
									Totale articoli: {totalItems}
								</div>

								<!-- Submit Button -->
								<button type="button" class="btn btn-primary w-full btn-lg" onclick={openOrderModal} disabled={!isFormValid()}>
									<ShoppingCart class="w-5 h-5" />
									Conferma Ordine
								</button>

								<p class="text-xs text-center text-base-content/60">Cliccando confermi di aver inserito tutti i dati correttamente</p>
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
	<Modal isOpen={openModal} header="Conferma Ordine" cssClass="bg-white rounded-lg shadow-xl w-full max-w-2xl">
		<button class="btn btn-sm btn-circle absolute right-2 top-2" onclick={closeModal}> ✕ </button>

		<form method="POST" action="?/createOrder" use:enhance={formSubmit} bind:this={formEl} class="px-6 pb-6">
			<div class="space-y-6">
				<!-- Cart Summary -->
				<div class="card bg-base-100 border border-base-200">
					<div class="card-body">
						<h3 class="font-bold text-lg mb-3">Prodotti Ordinati</h3>
						<div class="space-y-3">
							{#each cart as item}
								{@const product = kitProducts.find(p => p.prodId === item.prodId)}
								{#if product}
									<div class="flex gap-3 items-center">
										{#if product.urlPic}
											<div class="w-16 h-16 rounded-lg overflow-hidden">
												<Image
													layout="constrained"
													aspectRatio={1}
													src={product.urlPic}
													alt={product.title}
													class="w-full h-full object-cover"
												/>
											</div>
										{/if}
										<div class="flex-1">
											<p class="font-bold">{product.title}</p>
											<p class="text-sm">Quantità: {item.quantity}</p>
										</div>
									</div>
								{/if}
							{/each}
						</div>
						<div class="divider my-2"></div>
						<div class="text-right font-bold">
							Totale articoli: {totalItems}
						</div>
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
								{formData.shippingPostalCode}
								{formData.shippingCity} ({formData.shippingCounty})
							</p>
							<p>{formData.shippingCountry}</p>
							<p class="mt-2">
								<Mail size={14} class="inline" />
								{formData.shippingEmail}
							</p>
							<p>
								<Phone size={14} class="inline" />
								{formData.shippingMobilePhone}
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
				<input type="hidden" name="cart" value={JSON.stringify(cart)} />
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
					<button type="button" class="btn btn-outline" onclick={closeModal} disabled={loading}> Annulla </button>
					<button type="button" class="btn btn-primary" onclick={handleSubmit} disabled={loading}>
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