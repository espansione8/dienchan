<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import { notification } from '$lib/stores/notifications';
	import { cartProducts, addToCart, removeFromCart, emptyCart } from '$lib/stores/cart';
	import Loader from '$lib/components/Loader.svelte';
	import { country_list, province } from '$lib/stores/arrays';
	import { imgCheck } from '$lib/tools/tools';
	import {
		Settings,
		X,
		Check,
		Lock,
		BookOpen,
		Tags,
		Boxes,
		ShoppingCart,
		CircleX,
		Info,
		Trash2,
		CreditCard,
		Landmark,
		Pen,
		Mail,
		Phone,
		User,
		MapPin,
		ArrowLeft,
		CheckCircle,
		Tag,
		HandCoins
	} from 'lucide-svelte';

	const { data } = $props();
	const { userData, auth } = $derived(data);

	const BASE_URL = '';

	let error = $state('');
	let password1 = $state('');
	let password2 = $state('');
	let checkPass = $state(false);
	let checkSecondPass = $state(false);
	let inputRef = $state(null);

	let formData = $state({
		name: userData?.name || '',
		surname: userData?.surname || '',
		email: userData?.email || '',
		address: userData?.address || '',
		city: userData?.city || '',
		county: userData?.county || 'AG', // provincia
		postalCode: userData?.postalCode || '',
		country: userData?.country || 'Italy',
		phone: userData?.phone || '',
		mobilePhone: userData?.mobilePhone || '',
		paymentType: 'Bonifico bancario',
		orderNotes: ''
	});

	let closedInput = $state(true);

	// discount
	let discountCode = $state('');
	let discountList = $state([]);

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');
	let loading = $state(false);

	// cart
	let cart = $state($cartProducts);
	let subTotal: any = $derived(() => {
		let total = 0;
		$cartProducts.forEach((element: any) => {
			if (element.type == 'course') {
				total += element.layoutView.price * (element.orderQuantity || 1);
			} else {
				total += element.price * (element.orderQuantity || 1);
			}
		});
		return total;
	});
	// testing NEW VERSION using reduce
	let totalDiscount = $derived(() =>
		discountList.reduce((acc, element: any) => acc + (element.totalDiscount || 0), 0)
	);
	// let totalDiscount = $derived(() => { // OLD VERSION using totalDiscount()
	// 	let total = 0;
	// 	discountList.forEach((element: any) => {
	// 		total += element.totalDiscount || 0;
	// 	});
	// 	return total;
	// });
	let grandTotal = $derived(subTotal() - totalDiscount() + 9);

	const testPass = () => {
		checkPass = password1.length >= 8;
		checkSecondPass = password1 === password2;
	};

	const testSecondPass = () => {
		checkSecondPass = password1 === password2;
	};

	const onRemoveFromCart = (item: any) => {
		removeFromCart($cartProducts, item);
		discountList = [];
		cart = $cartProducts;
		discountCode = '';
	};

	const updateQuantity = (item: any, increment: boolean) => {
		if (increment) {
			addToCart($cartProducts, item, false);
		} else {
			removeFromCart($cartProducts, item);
		}
		cart = $cartProducts;
		// reset discount
		discountList = [];
		discountCode = '';
	};

	const onEmptyCart = () => {
		emptyCart();
		// reset discounts;
		discountList = [];
		discountCode = '';
		cart = $cartProducts;
	};

	const resetFields = () => {
		openModal = false;
		if (!auth) {
			formData.name = '';
			formData.surname = '';
			formData.email = '';
			formData.address = '';
			formData.city = '';
			formData.county = 'AG';
			formData.postalCode = '';
			formData.country = 'Italy';
			formData.phone = '';
			formData.mobilePhone = '';
			formData.paymentType = 'Bonifico bancario bancario';
		}
		modalTitle = '';
		postAction = '?/';
		loading = false;
	};

	const refresh = () => {
		invalidateAll();
		resetFields();
	};

	const onClickModal = (type: string, item: any) => {
		currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Riepilogo Ordine';
		}
		// if (type == 'modify') {
		// 	postAction = `?/modify`;
		// 	modalTitle = 'Modifica';
		// }
		// if (type == 'delete') {
		// 	postAction = `?/delete`;
		// 	modalTitle = 'Elimina';
		// }
		// if (type == 'filter') {
		// 	postAction = `?/filter`;
		// 	modalTitle = 'Filtra';
		// }
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		currentModal = '';
	};

	const formSubmit = () => {
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			loading = true;
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { action, message, payload } = result.data; // { action, success, message, payload }

				if (action === 'new') {
					onEmptyCart();
					currentModal = 'success';
				}
				if (action === 'applyDiscount' || action === 'removeDiscount') {
					discountList = payload?.discountApplied || [];
					discountCode = '';
				}

				notification.info(message);
				//onCloseModal();
			}
			if (result.type === 'failure') {
				notification.error(result.data.message || 'Errore carrello');
				discountCode = '';
			}
			if (result.type === 'error') {
				notification.error(result.error.message || 'Errore ');
				discountCode = '';
			}
			// if (result.type === 'redirect') {
			// 	emptyCart();
			// }
			// 'update()' is called by default by use:enhance
			// call 'await update()' if you need to ensure it completes before further client logic.
			resetFields();
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>Carrello</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="flex flex-col lg:flex-row gap-8">
		<!-- Cart Items Section -->
		<div class="w-full lg:w-2/3">
			<div class="bg-white rounded-xl shadow-md overflow-hidden">
				<div class="bg-primary text-primary-content px-6 py-4 flex justify-between items-center">
					<h2 class="text-xl font-bold">Il tuo carrello</h2>
					<span class="badge badge-lg badge-outline font-semibold"
						>{$cartProducts.length} prodotti</span
					>
				</div>

				{#if $cartProducts.length > 0}
					<div class="p-6">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							{#each $cartProducts as item}
								<div class="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
									<div class="flex flex-col h-full">
										<div class="p-4 flex gap-4">
											<div class="w-1/3">
												<div
													class="aspect-square bg-base-200/30 rounded-lg overflow-hidden flex items-center justify-center"
												>
													<img
														src={imgCheck.single(item.uploadfiles, 'product-primary')}
														alt="product"
														class="h-full w-full object-contain p-2"
													/>
												</div>
											</div>

											<div class="w-2/3">
												<div class="flex justify-between items-start">
													<a
														href="/product-detail/{item.prodId}"
														class="hover:text-primary transition-colors"
													>
														<h3 class="text-base font-bold">{item.title}</h3>
													</a>
													<!-- <div class="text-lg font-bold text-primary">€{item.price}</div> -->
												</div>

												<div class="flex items-center gap-2 mt-2 text-xs">
													<Tags size={14} class="text-primary flex-shrink-0" />
													<span class="font-medium">{item.category?.[0] || 'Categoria'}</span>
												</div>

												<div class="flex items-center gap-1 mt-2 text-xs">
													{#if item.stockQty < 1}
														<div class="text-error flex items-center gap-1">
															<Boxes size={14} />
															<span>Esaurito</span>
														</div>
													{:else}
														<div class="text-success flex items-center gap-1">
															<Boxes size={14} />
															<span>{item.stockQty} disponibili</span>
														</div>
													{/if}
												</div>
												<div class="flex items-center gap-1 mt-1 text-xs">
													<div class="text-lg font-bold text-primary">€ {item.price} pz</div>
												</div>
											</div>
										</div>

										<div
											class="mt-auto border-t border-base-200 p-4 flex items-center justify-between"
										>
											<div class="flex items-center gap-2">
												<button
													class="btn btn-xs btn-outline btn-error"
													onclick={() => onRemoveFromCart(item)}
												>
													<Trash2 size={14} />
													Rimuovi
												</button>

												<a href="/product-detail/{item.prodId}" class="btn btn-xs btn-outline">
													<Info size={14} />
													Dettagli
												</a>
											</div>

											<div class="join">
												<button
													class="join-item btn btn-xs"
													onclick={() => updateQuantity(item, false)}
													disabled={item.orderQuantity <= 1}>-</button
												>
												<input
													type="text"
													class="join-item input input-xs input-bordered w-10 text-center"
													value={item.orderQuantity || 1}
													readonly
												/>
												<button
													class="join-item btn btn-xs"
													onclick={() => updateQuantity(item, true)}
													disabled={item.orderQuantity >= item.stockQty}>+</button
												>
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>

						<div class="flex justify-between pt-6">
							<button class="btn btn-outline btn-error" onclick={() => onEmptyCart()}>
								<Trash2 size={16} />
								Svuota carrello
							</button>

							<a href="/product-shop" class="btn btn-outline">
								<ArrowLeft size={16} />
								Continua lo shopping
							</a>
						</div>
					</div>
				{:else}
					<div class="p-16 flex flex-col items-center justify-center text-center">
						<div class="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
							<ShoppingCart size={32} class="text-base-content/50" />
						</div>
						<h3 class="text-xl font-bold mb-2">Il tuo carrello è vuoto</h3>
						<p class="text-base-content/70 mb-6">
							Aggiungi alcuni prodotti per iniziare lo shopping
						</p>
						<a href="/product-shop" class="btn btn-primary"> Inizia lo shopping </a>
					</div>
				{/if}
			</div>
		</div>

		<!-- Order Summary Section -->
		<div class="w-full lg:w-1/3 space-y-6">
			<!-- {#if $cartProducts.length > 0} -->
			<!-- User Profile -->
			<div class="bg-white rounded-xl shadow-md overflow-hidden">
				<div class="bg-primary text-primary-content px-6 py-4 flex justify-between items-center">
					<h2 class="text-xl font-bold">
						{#if auth}
							Profilo
						{:else}
							Prima iscrizione
						{/if}
					</h2>

					{#if auth}
						<a href="/profile-modify" class="btn btn-sm btn-outline">
							<Settings size={16} /> Modifica
						</a>
					{/if}
				</div>

				<div class="p-6">
					<form method="POST" use:enhance={formSubmit}>
						<div class="space-y-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<!-- Nome -->
								<div class="form-control w-full">
									<label for="Name" class="label">
										<span class="label-text font-medium">Nome</span>
									</label>
									<input
										id="Name"
										name="name"
										type="text"
										class="input input-bordered w-full"
										placeholder="Inserisci il tuo nome"
										required
										readonly={closedInput}
										bind:value={formData.name}
									/>
								</div>

								<!-- Cognome -->
								<div class="form-control w-full">
									<label for="Surname" class="label">
										<span class="label-text font-medium">Cognome</span>
									</label>
									<input
										id="Surname"
										name="surname"
										type="text"
										class="input input-bordered w-full"
										placeholder="Inserisci il tuo cognome"
										required
										readonly={closedInput}
										bind:value={formData.surname}
									/>
								</div>
							</div>

							<!-- Email -->
							<div class="form-control w-full">
								<label for="Email" class="label">
									<span class="label-text font-medium">Email</span>
								</label>
								<div class="input input-bordered flex items-center gap-2 pr-2">
									<Mail size={18} class="ml-2" />
									<input
										id="Email"
										name="email"
										type="email"
										class="flex-1 outline-none bg-transparent"
										placeholder="esempio@email.com"
										required
										readonly={closedInput}
										bind:value={formData.email}
									/>
								</div>
							</div>

							{#if !auth}
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<!-- Password -->
									<div class="form-control w-full">
										<label for="password" class="label">
											<span class="label-text font-medium">
												Password <span class="text-xs"> (Almeno 8 caratteri) </span>
											</span>
										</label>
										<div class="input input-bordered flex items-center gap-2 pr-2">
											<Lock size={18} class="ml-2" color={checkPass ? 'green' : 'currentColor'} />
											<input
												class="flex-1 outline-none bg-transparent"
												id="password"
												name="password1"
												type="password"
												placeholder="Inserisci la password"
												aria-label="Password"
												bind:value={password1}
												minlength="8"
												required={!auth}
												oninput={testPass}
											/>
										</div>
									</div>

									<!-- Confirm Password -->
									<div class="form-control w-full">
										<label for="password2" class="label">
											<span class="label-text font-medium">
												Conferma password {#if !checkSecondPass && password2}
													<span class="text-error text-xs"> (non corrispondente) </span>
												{/if}
											</span>
										</label>
										<div class="input input-bordered flex items-center gap-2 pr-2">
											<Lock
												size={18}
												class="ml-2"
												color={checkSecondPass && checkPass
													? 'green'
													: password2
														? 'red'
														: 'currentColor'}
											/>
											<input
												class="flex-1 outline-none bg-transparent"
												id="password2"
												name="password2"
												type="password"
												placeholder="Conferma la password"
												bind:value={password2}
												minlength="8"
												required={!auth}
												oninput={testSecondPass}
												bind:this={inputRef}
											/>
										</div>
									</div>
								</div>
							{/if}

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<!-- Telefono -->
								<div class="form-control w-full">
									<label for="telefono" class="label">
										<span class="label-text font-medium">Telefono</span>
									</label>
									<div class="input input-bordered flex items-center gap-2 pr-2">
										<Phone size={18} class="ml-2" />
										<input
											id="telefono"
											name="phone"
											type="tel"
											class="flex-1 outline-none bg-transparent"
											placeholder="+39 01234567"
											readonly={closedInput}
											bind:value={formData.phone}
										/>
									</div>
								</div>

								<!-- Cellulare -->
								<div class="form-control w-full">
									<label for="cellulare" class="label">
										<span class="label-text font-medium">
											Cellulare <span class="text-xs"> (richiesto) </span>
										</span>
									</label>
									<div class="input input-bordered flex items-center gap-2 pr-2">
										<Phone size={18} class="ml-2" />
										<input
											id="cellulare"
											name="mobilePhone"
											type="tel"
											class="flex-1 outline-none bg-transparent"
											placeholder="+39 3331234567"
											required
											readonly={closedInput}
											bind:value={formData.mobilePhone}
										/>
									</div>
								</div>
							</div>

							<div class="divider my-2">Indirizzo</div>

							<!-- Indirizzo -->
							<div class="form-control w-full">
								<label for="address" class="label">
									<span class="label-text font-medium">Indirizzo</span>
								</label>
								<div class="input input-bordered flex items-center gap-2 pr-2">
									<MapPin size={18} class="ml-2" />
									<input
										id="address"
										name="address"
										type="text"
										class="flex-1 outline-none bg-transparent"
										placeholder="Via/Piazza, numero civico"
										required
										readonly={closedInput}
										bind:value={formData.address}
									/>
								</div>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<!-- Città -->
								<div class="form-control w-full">
									<label for="city" class="label">
										<span class="label-text font-medium">Città</span>
									</label>
									<input
										id="city"
										name="city"
										type="text"
										class="input input-bordered w-full"
										placeholder="Inserisci la città"
										required
										readonly={closedInput}
										bind:value={formData.city}
									/>
								</div>

								<!-- CAP -->
								<div class="form-control w-full">
									<label for="postalcode" class="label">
										<span class="label-text font-medium">CAP</span>
									</label>
									<input
										id="postalCode"
										name="postalCode"
										type="text"
										class="input input-bordered w-full"
										placeholder="12345"
										required
										readonly={closedInput}
										bind:value={formData.postalCode}
									/>
								</div>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<!-- Provincia -->
								<div class="form-control w-full">
									<label for="state" class="label">
										<span class="label-text font-medium">Provincia</span>
									</label>
									<select
										id="county"
										class="select select-bordered w-full"
										name="county"
										required
										disabled={closedInput}
										bind:value={formData.county}
									>
										<option value="" disabled>Seleziona provincia</option>
										{#each $province as provincia, i}
											{#if provincia.title !== 'Online'}
												<option value={provincia.title}>
													{provincia.title} ({provincia.region})
												</option>
											{/if}
										{/each}
									</select>
									{#if closedInput}
										<input type="hidden" name="county" value={formData.county} />
									{/if}
								</div>

								<!-- Nazione -->
								<div class="form-control w-full">
									<label for="country" class="label">
										<span class="label-text font-medium">Nazione</span>
									</label>
									<select
										id="country"
										class="select select-bordered w-full"
										name="country"
										required
										disabled={closedInput}
										bind:value={formData.country}
									>
										<option value="" disabled>Seleziona nazione</option>
										{#each $country_list as countryItem}
											<option value={countryItem}>
												{countryItem}
											</option>
										{/each}
									</select>
									{#if closedInput}
										<input type="hidden" name="country" value={formData.country} />
									{/if}
								</div>
							</div>
							<div class="divider my-2 font-medium text-primary">Metodo di Pagamento</div>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
								<div class="form-control w-full">
									<label
										class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
										class:border-primary={formData.paymentType === 'Bonifico bancario'}
										class:bg-base-200={formData.paymentType === 'Bonifico bancario'}
									>
										<input
											type="radio"
											name="payment"
											value="Bonifico bancario"
											class="hidden"
											bind:group={formData.paymentType}
										/>
										<Landmark class="h-8 w-8 text-primary" />
										<span class="text-center font-medium">Bonifico bancario</span>
									</label>
								</div>
								<div class="form-control w-full">
									<label
										class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
										class:border-primary={formData.paymentType === 'paypal'}
										class:bg-base-200={formData.paymentType === 'paypal'}
									>
										<input
											type="radio"
											name="payment"
											value="paypal"
											class="hidden"
											bind:group={formData.paymentType}
										/>
										<CreditCard class="h-8 w-8 text-primary" />
										<span class="text-center font-medium">Paypal</span>
									</label>
								</div>
								<!-- <label
				class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
				class:border-primary={formData.paymentType === 'contanti'}
				class:bg-base-200={formData.paymentType === 'contanti'}
			>
				<input
					type="radio"
					name="payment"
					value="contanti"
					class="hidden"
					bind:group={formData.paymentType}
				/>
				<HandCoins class="h-8 w-8 text-primary" />
				<span class="text-center font-medium">Contanti (all'inizio corso)</span>
			</label> -->
								<!-- </div> -->
							</div>
						</div>
					</form>
				</div>
			</div>

			<!-- Order Summary -->
			<div class="bg-white rounded-xl shadow-md overflow-hidden">
				<div class="bg-primary text-primary-content px-6 py-4">
					<h2 class="text-xl font-bold">Riepilogo ordine</h2>
				</div>

				<div class="p-6 space-y-4">
					<div class="flex justify-between">
						<span>Carrello</span>
						<span>€ {subTotal().toFixed(2)}</span>
					</div>
					<div class="flex justify-between text-success">
						<span>Spedizione</span>
						<span>€ 9</span>
					</div>
					{#if discountList.length > 0}
						<div class="flex justify-between text-success">
							<span>Sconto</span>
							<span>- € {totalDiscount().toFixed(2)}</span>
						</div>
					{/if}

					<div class="divider my-2"></div>

					<div class="flex justify-between font-bold text-lg">
						<span>Totale</span>
						<span class="text-primary">€ {grandTotal.toFixed(2)}</span>
					</div>

					<!-- Discount Code -->
					<div class="pt-4">
						<form method="POST" action="?/applyDiscount" use:enhance={formSubmit}>
							<label class="form-control w-full">
								<div class="label">
									<span class="label-text font-medium">Codice sconto</span>
								</div>
								<div class="flex gap-2">
									<input
										type="text"
										id="discountCode"
										name="discountCode"
										placeholder="Inserisci il codice"
										class="input input-bordered w-full"
										bind:value={discountCode}
										disabled={loading || $cartProducts.length < 1}
									/>
									<input type="hidden" name="cart" value={JSON.stringify($cartProducts)} />
									<input type="hidden" name="subTotal" value={subTotal()} />
									<input type="hidden" name="discountList" value={JSON.stringify(discountList)} />
									<button type="submit" class="btn btn-primary" disabled={!discountCode || loading}>
										{#if loading}
											<span class="loading loading-spinner loading-sm"></span>
										{:else}
											Applica
										{/if}
									</button>
								</div>
							</label>
						</form>

						{#if discountList.length > 0}
							<form method="POST" action="?/removeDiscount" use:enhance={formSubmit}>
								<div class="flex flex-wrap gap-2 mt-3">
									{#each discountList as badgeCode, i}
										<div class="badge badge-lg bg-primary/10 text-primary gap-2">
											<Tag size={14} />
											{badgeCode.code}
											<input type="hidden" name="cart" value={JSON.stringify($cartProducts)} />
											<input type="hidden" name="subTotal" value={subTotal()} />
											<input
												type="hidden"
												name="discountList"
												value={JSON.stringify(discountList)}
											/>
											<input type="hidden" name="removeCode" value={badgeCode.code} />
											<button
												type="submit"
												name="removeCode"
												class="btn btn-xs btn-circle btn-ghost"
												disabled={loading}
											>
												<X size={14} />
											</button>
										</div>
									{/each}
								</div>
							</form>
						{/if}
					</div>

					<button
						class="btn btn-primary w-full mt-4"
						onclick={() => onClickModal('new', null)}
						disabled={$cartProducts.length === 0}
					>
						Procedi al checkout
					</button>
				</div>
			</div>
			<!-- {/if} -->
		</div>
	</div>
</div>

{#if currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-3xl p-6">
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		{#if loading}
			<Loader />
		{:else}
			<div class="">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-4">
					<div class="space-y-4">
						<h4 class="font-medium text-primary">Informazioni Personali</h4>

						<div class="grid grid-cols-2 gap-2">
							<div>
								<p class="text-sm text-base-content/70">Nome</p>
								<p class="font-medium">{formData.name}</p>
							</div>
							<div>
								<p class="text-sm text-base-content/70">Cognome</p>
								<p class="font-medium">{formData.surname}</p>
							</div>
							<div class="col-span-2">
								<p class="text-sm text-base-content/70">Email</p>
								<p class="font-medium">{formData.email}</p>
							</div>
							<div>
								<p class="text-sm text-base-content/70">Telefono</p>
								<p class="font-medium">{formData.phone || 'Non specificato'}</p>
							</div>
							<div>
								<p class="text-sm text-base-content/70">Cellulare</p>
								<p class="font-medium">{formData.mobilePhone}</p>
							</div>
						</div>
					</div>

					<div class="space-y-4">
						<h4 class="font-medium text-primary">Indirizzo di Spedizione</h4>

						<div class="grid grid-cols-2 gap-2">
							<div class="col-span-2">
								<p class="text-sm text-base-content/70">Indirizzo</p>
								<p class="font-medium">{formData.address}</p>
							</div>
							<div>
								<p class="text-sm text-base-content/70">Città</p>
								<p class="font-medium">{formData.city}</p>
							</div>
							<div>
								<p class="text-sm text-base-content/70">CAP</p>
								<p class="font-medium">{formData.postalCode}</p>
							</div>
							<div>
								<p class="text-sm text-base-content/70">Provincia</p>
								<p class="font-medium">{formData.county}</p>
							</div>
							<div>
								<p class="text-sm text-base-content/70">Nazione</p>
								<p class="font-medium">{formData.country}</p>
							</div>
						</div>
					</div>
				</div>

				<div class="space-y-4 mb-6">
					<h4 class="font-medium text-primary">Prodotti</h4>

					<div class="overflow-x-auto">
						<table class="table table-zebra w-full">
							<thead>
								<tr>
									<th>Prodotto</th>
									<th class="text-right">Quantità</th>
									<th class="text-right">Prezzo</th>
								</tr>
							</thead>
							<tbody>
								{#each $cartProducts as item}
									<tr>
										<td>{item.title}</td>
										<td class="text-right">{item.orderQuantity || 1}</td>
										<td class="text-right">€ {item.price.toFixed(2)}</td>
									</tr>
								{/each}
								<tr class="text-info">
									<td colspan="2">Spedizione</td>
									<td class="text-right"> € 9</td>
								</tr>
								{#if discountList.length > 0}
									<tr class="text-success">
										<td colspan="2">Sconto</td>
										<td class="text-right">- € {totalDiscount().toFixed(2)}</td>
									</tr>
								{/if}
							</tbody>
							<tfoot>
								<tr>
									<th colspan="2">Totale</th>
									<th class="text-right">
										€ {grandTotal.toFixed(2)}
									</th>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>

				<!-- <div class="space-y-4">
					<h4 class="font-medium text-primary">Metodo di Pagamento</h4>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<label
							class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
							class:border-primary={formData.paymentType === 'Bonifico bancario'}
							class:bg-base-200={formData.paymentType === 'Bonifico bancario'}
						>
							<input
								type="radio"
								name="payment"
								value="Bonifico bancario"
								class="hidden"
								bind:group={formData.paymentType}
							/>
							<Landmark class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Bonifico bancario Bancario</span>
						</label>

						<label
							class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
							class:border-primary={formData.paymentType === 'paypal'}
							class:bg-base-200={formData.paymentType === 'paypal'}
						>
							<input
								type="radio"
								name="payment"
								value="paypal"
								class="hidden"
								bind:group={formData.paymentType}
							/>
							<CreditCard class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Paypal</span>
						</label>

						<label
							class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
							class:border-primary={formData.paymentType === 'contanti'}
							class:bg-base-200={formData.paymentType === 'contanti'}
						>
							<input
								type="radio"
								name="payment"
								value="contanti"
								class="hidden"
								bind:group={formData.paymentType}
							/>
							<HandCoins class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Contanti (all'inizio corso)</span>
						</label>
					</div>
				</div> -->
				<form method="POST" action={postAction} use:enhance={formSubmit} class="">
					<input type="hidden" name="name" value={formData.name} />
					<input type="hidden" name="surname" value={formData.surname} />
					<input type="hidden" name="email" value={formData.email} />
					{#if !auth}
						<input type="hidden" name="password1" value={password1} />
						<input type="hidden" name="password2" value={password2} />
					{/if}
					<input type="hidden" name="address" value={formData.address} />
					<input type="hidden" name="city" value={formData.city} />
					<input type="hidden" name="county" value={formData.county} />
					<input type="hidden" name="postalCode" value={formData.postalCode} />
					<input type="hidden" name="country" value={formData.country} />
					<input type="hidden" name="phone" value={formData.phone} />
					<input type="hidden" name="mobilePhone" value={formData.mobilePhone} />
					<input type="hidden" name="payment" value={formData.paymentType} />
					<input type="hidden" name="cart" value={JSON.stringify(cart)} />
					<input type="hidden" name="totalValue" value={grandTotal} />
					<input type="hidden" name="discountList" value={JSON.stringify(discountList)} />
					<div class="modal-action">
						<button class="btn btn-outline btn-error" onclick={onCloseModal}> Annulla </button>
						<button type="submit" class="btn btn-primary"> Conferma Acquisto </button>
					</div>
				</form>
			</div>
		{/if}
	</Modal>
{/if}

{#if currentModal == 'success'}
	<dialog id="success-modal" class="modal modal-open">
		<div class="modal-box text-center">
			<div
				class="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4"
			>
				<CheckCircle size={40} class="text-success" />
			</div>
			<h3 class="font-bold text-xl mb-2">Ordine Confermato</h3>
			<p class="py-2">Puoi vedere lo storico ordini nell'AREA PERSONALE.</p>
			<div class="modal-action justify-center">
				<button class="btn btn-primary" onclick={onCloseModal}> Chiudi </button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={onCloseModal}>close</button>
		</form>
	</dialog>
{/if}

{#if currentModal == 'newUser'}
	<dialog id="success-login-modal" class="modal modal-open">
		<div class="modal-box text-center">
			<div
				class="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4"
			>
				<CheckCircle size={40} class="text-success" />
			</div>
			<h3 class="font-bold text-xl mb-2">Ordine Confermato</h3>
			<p class="py-2 font-medium">Ora puoi fare LOGIN con EMAIL e PASSWORD</p>
			<p class="py-1">per completare il PROFILO e vedere il tuo STORICO ordini</p>
			<div class="modal-action justify-center">
				<button class="btn btn-primary" onclick={onCloseModal}> Chiudi </button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={onCloseModal}>close</button>
		</form>
	</dialog>
{/if}
