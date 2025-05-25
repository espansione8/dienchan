<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { goto, invalidateAll } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms';
	import { cartProducts, addToCart, removeFromCart, emptyCart } from '$lib/stores/cart';
	import Notification from '$lib/components/Notification.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import { country_list, province } from '$lib/stores/arrays.js';
	import { imgCheck } from '$lib/tools/tools.js';
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
		HandCoins,
		Mail,
		Phone,
		User,
		MapPin,
		ArrowLeft,
		CheckCircle,
		Tag
	} from 'lucide-svelte';

	let { data, form } = $props();
	let { userData, auth } = $derived(data);

	let loading = $state(false);
	let cart = $state($cartProducts);

	let error = $state('');
	let password1 = $state('');
	let password2 = $state('');
	let checkPass = $state(false);
	let checkSecondPass = $state(false);
	let inputRef = $state(null);

	let isModalConfirm = $state(false);
	let isModalSuccess = $state(false);
	let isModalSuccessLogin = $state(false);

	let name = $state(userData?.name || '');
	let surname = $state(userData?.surname || '');
	let email = $state(userData?.email || '');
	let address = $state(userData?.address || '');
	let city = $state(userData?.city || '');
	let county = $state(userData?.county || 'AG'); // provincia
	let postalCode = $state(userData?.postalCode || '');
	let country = $state(userData?.country || 'Italy');
	let phone = $state(userData?.phone || '');
	let mobilePhone = $state(userData?.mobilePhone || '');
	let paymentType = $state('bonifico');
	let closedInput = $state(false);

	let discountCode = $state('');
	let discountApplied = $state(false);
	let discountError = $state(false);
	let discountList = $state([]);
	let discountArray = $state([]);
	let discountErr = $state('');
	let totalDiscount = $state(0);

	let grandTotal = $state(0);
	let subTotal = $derived(grandTotal - totalDiscount);

	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

	const checkCart = (id: any) => {
		const check = $cartProducts.some((item) => item.prodId == id);
		return check;
	};

	const testPass = () => {
		checkPass = password1.length >= 8;
		checkSecondPass = password1 === password2;
	};

	const testSecondPass = () => {
		checkSecondPass = password1 === password2;
	};

	// reset cart - original price
	const totalCart = () => {
		grandTotal = 0;
		$cartProducts.forEach((element: any) => {
			if (element.type == 'course') {
				grandTotal += element.layoutView.price;
			} else {
				grandTotal += element.price;
			}
		});
	};

	const onConfirmForm = async () => {
		if (!auth) {
			if (!checkPass || !checkSecondPass) {
				error = 'CONTROLLARE LE PASSWORD';
				inputRef.focus();
				return;
			}
		}
		isModalConfirm = true;
	};

	let stringList = $state('[]');

	const discountTostring = () => {
		stringList = JSON.stringify(discountList);
	};

	const onConfirmCart = async () => {
		error = '';
		let path = `${import.meta.env.VITE_BASE_URL}/api/orders/purchase-first`;
		if (auth) path = `${import.meta.env.VITE_BASE_URL}/api/orders/purchase`;

		const response = await fetch(path, {
			method: 'POST',
			body: JSON.stringify({
				name,
				surname,
				email,
				password1, // only registration
				address,
				city,
				county,
				postalCode,
				country,
				phone,
				mobilePhone,
				cart: $cartProducts,
				paymentType,
				userId: userData.userId
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const res = await response.json();

		if (response.status == 200) {
			isModalConfirm = false;
			toastClosed = false;
			notificationContent = res.message;
			clearTimeout(startTimeout);
			closeNotification();
			if (auth) {
				isModalSuccess = true;
			} else {
				isModalSuccessLogin = true;
			}
		}
		if (response.status != 200) {
			toastClosed = false;
			notificationError = true;
			notificationContent = res.message;
			clearTimeout(startTimeout);
		}
	};

	const onRemoveFromCart = (item: any) => {
		removeFromCart($cartProducts, item);
		totalDiscountActive();
		stringList = '[]';
		discountList = [];
		cart = $cartProducts;
		discountCode = '';
		totalCart();
	};

	const totalDiscountActive = () => {
		totalDiscount = 0;
		if (discountList.length > 0) {
			discountList.forEach((element: any) => {
				totalDiscount += element.totalDiscount;
			});
		}
	};

	const resetFields = () => {
		openModal = false;
		name = '';
		surname = '';
		email = '';
		address = '';
		city = '';
		county = 'AG';
		postalCode = '';
		country = 'Italy';
		phone = '';
		mobilePhone = '';
		discountErr = '';
		form = null;
		modalTitle = '';
		postAction = '?/';
		emptyCart();
	};

	const resetData = () => {
		invalidateAll();
		resetFields();
	};

	const onClickModal = (type: string, item: any) => {
		currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo';
		}
		if (type == 'modify') {
			postAction = `?/modify`;
			modalTitle = 'Modifica';
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtra';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		currentModal = '';
	};

	//notification
	let toastClosed = $state(true);
	let notificationContent = $state('');
	let notificationError = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
			notificationContent = '';
			notificationError = false;
		}, 3000); // 1000 milliseconds = 1 second
	};

	const formSubmit = () => {
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { action, success, message, payload } = result.data;

				name = userData.name;
				surname = userData.surname;
				email = userData.email;
				address = userData.address;
				city = userData.city;
				county = userData.county;
				postalCode = userData.postalCode;
				country = userData.country;
				phone = userData.phone;
				mobilePhone = userData.mobilePhone;
				discountList = payload?.discountApplied ?? [];
				isModalConfirm = false;

				if (action == 'applyDiscount' || 'removeDiscount') {
					discountList = payload?.discountArray;
					discountTostring();
					discountErr = '';
					totalDiscountActive();
				}

				notificationContent = result.data.message;
				onCloseModal();
			}
			if (result.type === 'failure') {
				notificationContent = result.data.message;
				notificationError = true;
				discountErr = result.data.message;
				discountCode = '';
			}
			if (result.type === 'error') {
				notificationContent = result.error;
				notificationError = true;
				discountErr = result.error;
				discountCode = '';
			}

			clearTimeout(startTimeout);
			closeNotification();
			toastClosed = false;
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
														href="/course-detail/{item.prodId}"
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
													onclick={() => removeFromCart($cartProducts, item)}
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
													onclick={() => addToCart($cartProducts, item, false)}
													disabled={item.orderQuantity >= item.stockQty}>+</button
												>
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>

						<div class="flex justify-between pt-6">
							<button class="btn btn-outline btn-error" onclick={() => emptyCart()}>
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
			{#if $cartProducts.length > 0}
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
											bind:value={name}
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
											bind:value={surname}
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
											bind:value={email}
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
												bind:value={phone}
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
												bind:value={mobilePhone}
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
											bind:value={address}
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
											bind:value={city}
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
											bind:value={postalCode}
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
											bind:value={county}
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
											<input type="hidden" name="county" value={county} />
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
											bind:value={country}
										>
											<option value="" disabled>Seleziona nazione</option>
											{#each $country_list as countryItem}
												<option value={countryItem}>
													{countryItem}
												</option>
											{/each}
										</select>
										{#if closedInput}
											<input type="hidden" name="country" value={country} />
										{/if}
									</div>
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
							<span>Subtotale</span>
							<span>€ {grandTotal}</span>
						</div>

						{#if !auth}
							<div class="flex justify-between">
								<span>Tesseramento (primo corso)</span>
								<span>€ 25</span>
							</div>
						{/if}

						{#if discountList.length > 0}
							<div class="flex justify-between text-success">
								<span>Sconto</span>
								<span>- € {totalDiscount}</span>
							</div>
						{/if}

						<div class="divider my-2"></div>

						<div class="flex justify-between font-bold text-lg">
							<span>Totale</span>
							{#if !auth}
								<span class="text-primary">€ {subTotal + 25}</span>
							{:else}
								<span class="text-primary">€ {subTotal}</span>
							{/if}
						</div>

						<!-- Discount Code -->
						<div class="pt-4">
							<form method="POST" use:enhance={formSubmit}>
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
										/>
										<input type="hidden" name="cart" value={JSON.stringify($cartProducts)} />
										<input type="hidden" name="grandTotal" value={grandTotal} />
										<input type="hidden" name="discountList" value={stringList} />
										<button
											class="btn btn-primary"
											formaction="?/applyDiscount"
											disabled={!discountCode}
										>
											Applica
										</button>
									</div>
									{#if discountErr}
										<div class="label">
											<span class="label-text-alt text-error">{discountErr}</span>
										</div>
									{/if}
								</label>

								{#if discountList.length > 0}
									<div class="flex flex-wrap gap-2 mt-3">
										{#each discountList as badgeCode, i}
											<div class="badge badge-lg bg-primary/10 text-primary gap-2">
												<Tag size={14} />
												{badgeCode}
												<input type="hidden" name="cart" value={JSON.stringify($cartProducts)} />
												<input type="hidden" name="grandTotal" value={grandTotal} />
												<input type="hidden" name="discountList" value={stringList} />
												<button
													type="submit"
													name="removeCode"
													value={badgeCode}
													formaction="?/removeDiscount"
													class="btn btn-xs btn-circle btn-ghost"
												>
													<X size={14} />
												</button>
											</div>
										{/each}
									</div>
								{/if}
							</form>
						</div>

						<button
							class="btn btn-primary w-full mt-4"
							onclick={onConfirmForm}
							disabled={$cartProducts.length === 0}
						>
							Procedi al checkout
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

<!-- Confirmation Modal -->
<dialog id="confirmation-modal" class="modal" class:modal-open={isModalConfirm}>
	<div class="modal-box max-w-3xl">
		<h3 class="font-bold text-xl text-center mb-6">Riepilogo Ordine</h3>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
			<div class="space-y-4">
				<h4 class="font-medium text-primary">Informazioni Personali</h4>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<p class="text-sm text-base-content/70">Nome</p>
						<p class="font-medium">{name}</p>
					</div>
					<div>
						<p class="text-sm text-base-content/70">Cognome</p>
						<p class="font-medium">{surname}</p>
					</div>
					<div class="col-span-2">
						<p class="text-sm text-base-content/70">Email</p>
						<p class="font-medium">{email}</p>
					</div>
					<div>
						<p class="text-sm text-base-content/70">Telefono</p>
						<p class="font-medium">{phone || 'Non specificato'}</p>
					</div>
					<div>
						<p class="text-sm text-base-content/70">Cellulare</p>
						<p class="font-medium">{mobilePhone}</p>
					</div>
				</div>
			</div>

			<div class="space-y-4">
				<h4 class="font-medium text-primary">Indirizzo di Spedizione</h4>

				<div class="grid grid-cols-2 gap-2">
					<div class="col-span-2">
						<p class="text-sm text-base-content/70">Indirizzo</p>
						<p class="font-medium">{address}</p>
					</div>
					<div>
						<p class="text-sm text-base-content/70">Città</p>
						<p class="font-medium">{city}</p>
					</div>
					<div>
						<p class="text-sm text-base-content/70">CAP</p>
						<p class="font-medium">{postalCode}</p>
					</div>
					<div>
						<p class="text-sm text-base-content/70">Provincia</p>
						<p class="font-medium">{county}</p>
					</div>
					<div>
						<p class="text-sm text-base-content/70">Nazione</p>
						<p class="font-medium">{country}</p>
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
								<td class="text-right">€ {item.price}</td>
							</tr>
						{/each}
						{#if !auth}
							<tr>
								<td>Tesseramento (primo corso)</td>
								<td class="text-right">1</td>
								<td class="text-right">€ 25</td>
							</tr>
						{/if}
						{#if discountList.length > 0}
							<tr class="text-success">
								<td colspan="2">Sconto</td>
								<td class="text-right">- € {totalDiscount}</td>
							</tr>
						{/if}
					</tbody>
					<tfoot>
						<tr>
							<th colspan="2">Totale</th>
							<th class="text-right">
								{#if !auth}
									€ {subTotal + 25}
								{:else}
									€ {subTotal}
								{/if}
							</th>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>

		<div class="space-y-4">
			<h4 class="font-medium text-primary">Metodo di Pagamento</h4>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<label
					class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
					class:border-primary={paymentType === 'bonifico'}
					class:bg-base-200={paymentType === 'bonifico'}
				>
					<input
						type="radio"
						name="payment"
						value="bonifico"
						class="hidden"
						bind:group={paymentType}
					/>
					<Landmark class="h-8 w-8 text-primary" />
					<span class="text-center font-medium">Bonifico Bancario</span>
				</label>

				<label
					class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
					class:border-primary={paymentType === 'paypal'}
					class:bg-base-200={paymentType === 'paypal'}
				>
					<input
						type="radio"
						name="payment"
						value="paypal"
						class="hidden"
						bind:group={paymentType}
					/>
					<CreditCard class="h-8 w-8 text-primary" />
					<span class="text-center font-medium">Paypal</span>
				</label>

				<label
					class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
					class:border-primary={paymentType === 'contanti'}
					class:bg-base-200={paymentType === 'contanti'}
				>
					<input
						type="radio"
						name="payment"
						value="contanti"
						class="hidden"
						bind:group={paymentType}
					/>
					<HandCoins class="h-8 w-8 text-primary" />
					<span class="text-center font-medium">Contanti (all'inizio corso)</span>
				</label>
			</div>
		</div>

		<div class="modal-action">
			<button class="btn btn-outline btn-error" onclick={() => (isModalConfirm = false)}>
				Annulla
			</button>
			<button class="btn btn-primary" onclick={() => onConfirmCart()}> Conferma Acquisto </button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => (isModalConfirm = false)}>close</button>
	</form>
</dialog>

<!-- Success Modal (Logged In) -->
<dialog id="success-modal" class="modal" class:modal-open={isModalSuccess}>
	<div class="modal-box text-center">
		<div class="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
			<CheckCircle size={40} class="text-success" />
		</div>
		<h3 class="font-bold text-xl mb-2">Ordine Confermato</h3>
		<p class="py-2">Puoi vedere lo storico ordini nella pagina: Impostazioni.</p>
		<div class="modal-action justify-center">
			<button class="btn btn-primary" onclick={() => (isModalSuccess = false)}> Chiudi </button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => (isModalSuccess = false)}>close</button>
	</form>
</dialog>

<!-- Success Modal (New User) -->
<dialog id="success-login-modal" class="modal" class:modal-open={isModalSuccessLogin}>
	<div class="modal-box text-center">
		<div class="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
			<CheckCircle size={40} class="text-success" />
		</div>
		<h3 class="font-bold text-xl mb-2">Ordine Confermato</h3>
		<p class="py-2 font-medium">Ora puoi fare LOGIN con EMAIL e PASSWORD</p>
		<p class="py-1">per completare il PROFILO e vedere il tuo STORICO ordini</p>
		<div class="modal-action justify-center">
			<button class="btn btn-primary" onclick={() => (isModalSuccessLogin = false)}>
				Chiudi
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => (isModalSuccessLogin = false)}>close</button>
	</form>
</dialog>
