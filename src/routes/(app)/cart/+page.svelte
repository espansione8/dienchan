<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms';
	import { cartProducts, removeFromCart, emptyCart } from '$lib/stores/cart';
	import Notification from '$lib/components/Notification.svelte';
	import { country_list, province } from '$lib/stores/arrays.js';
	import { Settings, X, Check, Lock } from 'lucide-svelte';

	let { data, form } = $props();
	let { userData, auth } = $derived(data);

	console.log('form', form);

	let cart = $state($cartProducts);
	console.log('cart', cart[0]);

	let error: string = $state('');
	let password1 = $state('');
	let password2 = $state('');
	let checkPass = $state(false);
	let checkSecondPass = $state(false);
	let inputRef: any = $state(null);

	let isModalConfirm = $state(false);
	let isModalSuccess = $state(false);
	let isModalSuccessLogin = $state(false);

	let name = $state(userData.name || '');
	let surname = $state(userData.surname || '');
	let email = $state(userData.email || '');
	let address = $state(userData.address || '');
	let city = $state(userData.city || '');
	let countryState = $state(userData.countryState || 'AG'); // provincia
	let postalCode = $state(userData.postalCode || '');
	let country = $state(userData.country || 'Italy');
	let phone = $state(userData.phone || '');
	let mobilePhone = $state(userData.mobilePhone || '');
	let paymentType = $state('bonifico');
	let closedInput = $state(false);

	let discountCode = $state('');
	let discountApplied = $state(false);
	let discountError = $state(false);
	// questa è la lista degli sconti attivi?
	let discountList: any[] = $state([]);
	let discountArray: any[] = $state([]);
	let discountErr = $state('');
	let totalDiscount = $state(0);

	let grandTotal = $state(0);

	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

	const testPass = () => {
		checkPass = password1.length >= 8;
		checkSecondPass = password1 === password2;
	};
	const testSecondPass = () => (checkSecondPass = password1 === password2);

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
		//return grandTotal;
	};

	// reset cart - original price

	if (auth) {
		closedInput = true;
	}
	const openInput = () => (closedInput = false);
	const closeInput = () => {
		closedInput = true;
	};

	const saveInput = async () => {
		closedInput = true;

		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/billing-data`, {
			method: 'POST',
			body: JSON.stringify({
				userId: userData.userId,
				name,
				surname,
				email,
				address,
				city,
				countryState,
				postalCode,
				country,
				phone,
				mobilePhone
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (response.status == 200) {
			clearTimeout(startTimeout);
			console.log('OK', response);
			let content = (await response.json()).message;
			toastClosed = false;
			notificationContent = content;
			closeNotification();
		}
		if (response.status != 200) {
			console.log('KO', response);
			let error = (await response.json()).message;
			toastClosed = false;
			notificationContent = error;
			notificationError = true;
			closeNotification();
		}
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

	let stringList: string = $state('[]');

	const discountTostring = () => {
		stringList = JSON.stringify(discountList);
	};

	const onConfirmCart = async () => {
		error = '';
		let path = `${import.meta.env.VITE_BASE_URL}/api/orders/purchase-first`;
		if (auth) path = `${import.meta.env.VITE_BASE_URL}/api/orders/purchase`;
		//if (!auth) {
		const response = await fetch(path, {
			method: 'POST',
			body: JSON.stringify({
				name,
				surname,
				email,
				password1, // only registration
				address,
				city,
				countryState,
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
		//console.log('res cart', res);
		if (response.status == 200) {
			// fieldReset();
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

	totalCart();
	// subTotal = grandTotal;
	let discountActive = $state();

	const totalDiscountActive = () => {
		totalDiscount = 0;
		discountActive.forEach((element: any) => {
			totalDiscount += element.totalDiscount;
		});
	};

	let subTotal = $derived(grandTotal - totalDiscount);
	////// STANDARD FUNCTIONS //////
	const resetFields = () => {
		openModal = false;
		name = '';
		surname = '';
		email = '';
		address = '';
		city = '';
		countryState = 'AG';
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
		//resetActive = false;
		//tableList = getTable;
	};

	const changeStatus = (event: any) => {
		if (event.target.form) {
			event.preventDefault();
			event.target.form.requestSubmit();
		}
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
			// prodId = item.prodId;
			// title = item.title;
			// price = item.price;
			// renewalLength = item.renewalLength;
			// descrShort = item.descrShort;
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			//orderId = item.orderId;
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
		//invalidateAll();
	};

	//notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
			notificationContent = '';
			notificationError = false;
		}, 3000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer

	$effect(() => {
		if (form != null) {
			async () => await invalidateAll();
			const { action, success, message, payload } = form;

			if (success) {
				name = userData.name;
				surname = userData.surname;
				email = userData.email;
				address = userData.address;
				city = userData.city;
				countryState = userData.countryState;
				postalCode = userData.postalCode;
				country = userData.country;
				phone = userData.phone;
				mobilePhone = userData.mobilePhone;
				// subTotal = 0;
				// totalDiscount = 0;
				discountActive = payload?.discountApplied ?? [];
				isModalConfirm = false;

				if (action == 'applyDiscount' || 'removeDiscount') {
					discountList = payload?.discountArray;
					discountTostring();
					discountErr = '';
					totalDiscountActive();
					// subTotal;
				}

				// if (action == 'removeDiscount') {
				// 	discountList = payload?.discountArray;
				// 	discountTostring();
				// 	// console.log('discountList', discountList);
				// }
			} else {
				notificationError = true;
				discountErr = message;
				discountCode = '';
			}
			closeNotification();
			totalCart();
			toastClosed = false;
			notificationContent = message;
			form = null;
		}
	}); // end effect
</script>

<svelte:head>
	<title>Carrello</title>
</svelte:head>

<div class="bg-base-200 grid grid-cols-12 grid-rows-[min-content] gap-y-12 p-4 lg:gap-x-8 lg:p-8">
	<section class="col-span-12 xl:col-span-9 bg-base-100 rounded-lg">
		<div class="flex flex-wrap justify-center gap-3 my-5">
			{#each $cartProducts as item}
				<div
					class="card card-compact overflow-hidden bg-base-100 max-w-xs rounded-xl shadow-md border"
				>
					<!-- src={imgSrc(item.category[0])} -->
					<figure class="px-4 pt-4">
						<img
							src={item.layoutView?.urlPic || '/images/picture.png'}
							alt="tipo corso"
							class="h-full w-full object-cover border-2 rounded-lg"
						/>
					</figure>
					<div class="card-body items-center text-center">
						<!-- data giorno -->
						<h2 class="card-title text-2xl">
							{item.eventStartDate}
						</h2>
						<!-- provincia -->
						<p class="card-text text-xl">
							<b>{item.countryState}</b>
						</p>
						<!-- title -->
						<h5
							class="card-text text-xl bg-base-200 border rounded-md shadow-sm font-semibold p-2 {item
								.layoutView?.bgColor || 'bg-primary'}"
						>
							{item.layoutView?.title}
						</h5>
						<!-- riflessologo -->
						<p class="card-text">
							Riflessologo: <b>{item.name} {item.surname}</b>
						</p>
						<!-- dalle x alle y -->
						<h5 class="card-text">
							Dalle <b>{item.timeStartDate}</b>
						</h5>
						<!-- price -->
						<p class="card-text">
							Prezzo: <b>{item.layoutView?.price}</b>
							<br />
							{#if !auth}
								+ 25 solo al primo corso
							{/if}
						</p>

						<div class="card-actions">
							<span class="flex justify-between gap-10 my-3">
								<a
									class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:text-gray-300"
									href={`/course-detail/${item.prodId}`}
								>
									Info
								</a>
								<button
									class="btn btn-sm bg-red-200 w-40 border border-red-400 rounded-md text-red-700 hover:text-red-700 hover:bg-red-400"
									onclick={() => onRemoveFromCart(item)}>Rimuovi dal Carrello</button
								>
							</span>
						</div>
					</div>
				</div>
			{:else}
				<p class="text-xl font-semibold text-red-400">Carrello vuoto</p>
			{/each}
		</div>
	</section>

	<section class="col-span-12 xl:col-span-3 bg-base-100 rounded-lg flex flex-col justify-start p-4">
		{#if $cartProducts.length > 0}
			<!-- PROFILO -->
			<div class="card bg-orange-100 shadow-xl p-3 rounded-lg">
				<div
					class="card-title bg-indigo-100 text-xl font-bold flex justify-between items-center px-4 py-2 rounded-lg"
				>
					{#if auth}
						<span>Profilo</span>
					{:else}
						<span class="">Prima iscrizione!</span>
					{/if}

					{#if auth}
						{#if closedInput}
							<button class="btn btn-outline btn-xs btn-neutral rounded-lg" onclick={openInput}>
								<Settings size="18" /> Modifica
							</button>
						{:else}
							<div class="flex space-x-2">
								<button class="btn btn-outline btn-xs btn-error rounded-lg" onclick={closeInput}>
									<X size="18" />
								</button>
								<button class="btn btn-outline btn-xs btn-success rounded-lg" onclick={saveInput}>
									<Check size="18" />
								</button>
							</div>
						{/if}
					{/if}
				</div>

				<form class="pt-2" method="POST" use:enhance>
					<fieldset disabled={closedInput} class="grid grid-cols-12 gap-2">
						<!-- Nome -->
						<div class="form-control col-span-12 md:col-span-6 w-full">
							<label for="Name" class="label font-bold">
								<span class="label-text">Nome</span>
							</label>
							<input
								id="Name"
								name="name"
								type="text"
								class="input input-bordered w-full rounded-lg"
								placeholder="Nome..."
								required
								readonly={closedInput}
								bind:value={name}
							/>
						</div>
						<!-- Cognome -->
						<div class="form-control col-span-12 md:col-span-6 w-full">
							<label for="Surname" class="label font-bold">
								<span class="label-text">Cognome</span>
							</label>
							<input
								id="Surname"
								name="surname"
								type="text"
								class="input input-bordered w-full rounded-lg"
								placeholder="Cognome..."
								required
								readonly={closedInput}
								bind:value={surname}
							/>
						</div>
						<!-- Email -->
						<div class="form-control col-span-12 w-full">
							<label for="Email" class="label font-bold">
								<span class="label-text">Email</span>
							</label>
							<input
								id="Email"
								name="email"
								type="email"
								class="input input-bordered w-full rounded-lg"
								placeholder="Email..."
								required
								readonly={closedInput}
								bind:value={email}
							/>
						</div>
						{#if !auth}
							<!-- Password -->
							<div class="col-span-12 w-full">
								<label for="password" class="label">
									<p class="font-bold">
										Password <br />
										<span class="text-sm text-gray-600" class:text-red-500={error}
											>( Almeno 8 caratteri numeri e lettere )</span
										>
									</p>
								</label>
								<div
									class="relative flex items-center space-x-2 rounded-r-md rounded-l-lg border border-gray-200 bg-white px-2 text-gray-900 shadow-xs"
								>
									<span class="flex items-center p-3 -m-2 rounded-l-md bg-indigo-200">
										<Lock color={checkPass ? 'green' : 'black'} />
									</span>
									<input
										class="input rounded-md w-full"
										id="password"
										type="password"
										placeholder="your password"
										aria-label="Password"
										aria-describedby="basic-password"
										bind:value={password1}
										oninput={testPass}
										required={!auth}
									/>
								</div>
							</div>

							<div class="col-span-12 w-full">
								<label for="password2" class="label">
									<p class="font-bold">
										Conferma password <br />
										{#if error}
											<span class="text-xs text-red-600">{error}</span>
										{/if}
									</p>
								</label>
								<div
									class="relative flex items-center space-x-2 rounded-r-md rounded-l-lg border border-gray-200 bg-white px-2 text-gray-900 shadow-xs"
								>
									<span class="flex items-center p-3 -m-2 rounded-l-md bg-indigo-200">
										<Lock color={checkSecondPass && checkPass ? 'green' : 'black'} />
									</span>
									<input
										class="input rounded-md w-full"
										id="password2"
										type="password"
										placeholder="Repeat password"
										bind:value={password2}
										oninput={testSecondPass}
										bind:this={inputRef}
										required={!auth}
									/>
								</div>
							</div>
						{/if}

						<!-- Indirizzo -->
						<div class="form-control col-span-12 w-full">
							<label for="address" class="label font-bold">
								<span class="label-text">Indirizzo</span>
							</label>
							<input
								id="address"
								name="address"
								type="text"
								class="input input-bordered w-full rounded-lg"
								placeholder="Indirizzo..."
								required
								readonly={closedInput}
								bind:value={address}
							/>
						</div>
						<!-- Città -->
						<div class="form-control col-span-12 md:col-span-6 w-full">
							<label for="city" class="label font-bold">
								<span class="label-text">Città</span>
							</label>
							<input
								id="city"
								name="city"
								type="text"
								class="input input-bordered w-full rounded-lg"
								placeholder="Città..."
								required
								readonly={closedInput}
								bind:value={city}
							/>
						</div>
						<!-- Provincia -->
						<div class="form-control col-span-12 md:col-span-6 w-full">
							<label for="state" class="label font-bold">
								<span class="label-text">Provincia</span>
							</label>
							<select
								id="state"
								class="select select-bordered w-full rounded-lg"
								name="state"
								required
								disabled={closedInput}
								bind:value={countryState}
							>
								<option selected disabled>Scegli</option>
								{#each $province as provincia, i}
									<option value={provincia.title}>
										{provincia.title} ({provincia.region})
									</option>
								{/each}
							</select>
						</div>
						<!-- CAP -->
						<div class="form-control col-span-12 md:col-span-6 w-full">
							<label for="postalcode" class="label font-bold">
								<span class="label-text">CAP</span>
							</label>
							<input
								id="postalCode"
								name="postalCode"
								type="text"
								class="input input-bordered w-full rounded-lg"
								placeholder="CAP..."
								required
								readonly={closedInput}
								bind:value={postalCode}
							/>
						</div>
						<!-- Nazione -->
						<div class="form-control col-span-12 md:col-span-6 w-full">
							<label for="country" class="label font-bold">
								<span class="label-text">Nazione</span>
							</label>
							<select
								id="country"
								class="select select-bordered w-full rounded-lg"
								name="country"
								required
								disabled={closedInput}
								bind:value={country}
							>
								<option selected disabled>Scegli</option>
								{#each $country_list as country}
									<option value={country}>
										{country}
									</option>
								{/each}
							</select>
						</div>
						<!-- Telefono -->
						<div class="form-control col-span-12 md:col-span-6 w-full">
							<label for="telefono" class="label font-bold">
								<span class="label-text">Telefono</span>
							</label>
							<input
								id="telefono"
								name="phone"
								type="text"
								class="input input-bordered w-full rounded-lg"
								placeholder="Telefono..."
								required
								readonly={closedInput}
								bind:value={phone}
							/>
						</div>
						<!-- Cellulare -->
						<div class="form-control col-span-12 md:col-span-6 w-full">
							<label for="cellulare" class="label font-bold">
								<span class="label-text">Cellulare</span>
							</label>
							<input
								id="cellulare"
								name="mobilePhone"
								type="text"
								class="input input-bordered w-full rounded-lg"
								placeholder="Cellulare..."
								readonly={closedInput}
								bind:value={mobilePhone}
							/>
						</div>
					</fieldset>
					<div class="col-span-2 mt-4 text-center">
						<div class="form-control mb-2">
							<label class="label">
								<span class="label-text text-md sm:text-xl font-semibold">Codice Sconto</span>
							</label>
							<div class="h-4">
								{#if discountErr}
									<span class="text-error">{discountErr}</span>
								{/if}
							</div>

							<div class="flex space-x-2 pt-2">
								<input
									type="text"
									id="discountCode"
									name="discountCode"
									placeholder="Inserisci il codice"
									class="input input-bordered w-full"
									bind:value={discountCode}
								/>
								<input type="hidden" name="cart" value={JSON.stringify(cart)} />
								<input type="hidden" name="grandTotal" value={grandTotal} />
								<input type="hidden" name="discountList" value={stringList} />
								<button
									class="btn"
									class:btn-primary={discountCode}
									formaction="?/applyDiscount"
									disabled={!discountCode}
								>
									Applica
								</button>
							</div>
						</div>
						{#if discountList.length != 0}
							{#each discountList as badgeCode, i}
								<div class="badge h-10 m-1">
									{badgeCode}
									{' '}
									<input type="hidden" name="cart" value={JSON.stringify(cart)} />
									<input type="hidden" name="grandTotal" value={grandTotal} />
									<input type="hidden" name="discountList" value={stringList} />
									<!-- <input type="hidden" name="removeCode" value={discountList[i]} /> -->
									<button
										type="submit"
										name="removeCode"
										value={badgeCode}
										formaction="?/removeDiscount"
										class="badge badge-error felx items-center ml-2"
									>
										X
									</button>
								</div>
							{/each}
						{/if}

						<!-- {#if discountList.length != 0}
							<h2 class="text-lg font-bold mt-4">Totale Carrello (con sconto):</h2>

							<p class="text-xl font-semibold text-black-800">{subTotal} €</p>
							
						{/if} -->
					</div>
					<section class=" ">
						<div class="text-center mt-6">
							<h2 class="text-2xl font-semibold">Totale Carrello:</h2>
							<p class="text-xl font-bold text-gray-800">{grandTotal} €</p>

							{#if $cartProducts.length > 0}
								{#if !auth}
									<p class="text-gray-800 font-semibold">+25 € solo per il primo corso</p>
								{/if}
								{#if discountList.length != 0}
									Totale sconto: {totalDiscount} €
								{/if}
								{#if discountList.length != 0}
									<div class="divider"></div>
									<p class="text-xl font-bold text-gray-800">Totale da pagare (con sconto):</p>
									<p class="text-xl font-bold text-gray-800">{subTotal} €</p>
								{/if}
								<!-- {#each discountActive as item}
									code: {item.code}
									discount: {item.totalDiscount}
									<br />
								{/each} -->
								<!-- 
								{#each cart as item, i}
									<div class="divider">--check item {i}--</div>
									<p class="text-xl font-bold text-gray-800">Titolo: {item.layoutView?.title}</p>
									<p class="text-xl font-bold text-gray-800">Quantità: {item.orderQuantity}</p>
									<p class="text-xl font-bold text-gray-800">Prezzo: {item.layoutView?.price}</p>
								{/each} -->
							{:else}
								<p class="text-xl font-semibold text-red-500">Nessun prodotto nel carrello</p>
							{/if}
						</div>
						<div class="flex justify-center space-x-4 mt-4">
							<button
								class="btn btn-sm rounded-lg w-32 {$cartProducts.length > 0
									? 'btn-error bg-red-500 text-white hover:bg-red-600 hover:scale-105 transition-transform'
									: 'btn-disabled bg-gray-200 text-gray-400'}"
								onclick={() => emptyCart()}
								disabled={$cartProducts.length == 0}
							>
								{#if $cartProducts.length == 0}
									<Lock class="mr-2" />
								{/if}
								Annulla
							</button>
							<button
								type="button"
								onclick={onConfirmForm}
								class="btn btn-sm rounded-lg w-32 {$cartProducts.length > 0
									? 'btn-success bg-green-500 text-white hover:bg-green-600 hover:scale-105 transition-transform'
									: 'btn-disabled bg-gray-200 text-gray-400'}"
								disabled={$cartProducts.length == 0}
							>
								{#if $cartProducts.length == 0}
									<Lock class="mr-2" />
								{/if}
								Acquista
							</button>
						</div>
					</section>
				</form>
			</div>
		{/if}
	</section>
</div>
<Notification {toastClosed} {notificationContent} {notificationError} />

{#if currentModal == 'new'}
	<!-- <Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Nuovo membership
			</header>

			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Nome</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<input
						class="input input-bordered join-item w-full"
						id="titolo"
						name="title"
						type="text"
						placeholder="Titolo"
						aria-label="Titolo"
						aria-describedby="basic-titolo"
						bind:value={title}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="price" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="price"
						type="number"
						name="price"
						placeholder="€"
						aria-label="price"
						aria-describedby="basic-price"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">Durata giorni</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calendar /></button>
					<input
						class="input input-bordered join-item w-full"
						id="renewalLength"
						type="number"
						name="renewalLength"
						aria-label="renewalLength"
						aria-describedby="renewalLength"
						min="1"
						max="36500"
						bind:value={renewalLength}
						required
					/>
				</div>
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">(max 36500 = 100 anni)</p>
				</label>
			</section>

			<section class="col-span-4">
				<div class="mt-6">
					<label for="descrShortN" class="form-label">
						<p class="font-bold mb-2">Descrizione (opzionale)</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShortN"
							name="descrShort"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={descrShort}
						></textarea>
					</div>
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}
						>Annulla</button
					>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Registra</button>
				</div>
			</div>
		</form>
	</Modal> -->
{/if}

<!-- modal CART -->
<dialog id="my_modal_2" class="modal" class:modal-open={isModalConfirm}>
	<div class="modal-box grid grid-cols-2">
		<h3 class="col-span-2 font-bold text-xl text-center mb-4">Riepilogo Ordine</h3>
		<div class="col-span-2 grid grid-cols-2 gap-2 mb-4">
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Nome/Cognome</p>
				<p class="font-bold text-center mt-1">{name} {surname}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Email</p>
				<p class="font-bold text-center mt-1">{email}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Città</p>
				<p class="font-bold text-center mt-1">{city}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Indirizzo</p>
				<p class="font-bold text-center mt-1">{address}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Codice Postale - Stato</p>
				<p class="font-bold text-center mt-1">{postalCode} - {country}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Paese</p>
				<p class="font-bold text-center mt-1">{countryState}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Telefono</p>
				<p class="font-bold text-center mt-1">{phone}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Cellulare</p>
				<p class="font-bold text-center mt-1">{mobilePhone}</p>
			</div>
		</div>
		<div class="col-span-2 flex flex-col items-center w-full gap-3 my-4">
			{#each $cartProducts as item}
				<div
					class="flex items-center w-full max-w-96 bg-indigo-100 rounded-lg shadow-md overflow-hidden"
				>
					<div class="w-1/3 p-3">
						<img
							src={item.layoutView?.urlPic}
							alt="Immagine corso"
							class="w-full h-full object-cover"
						/>
					</div>
					<div class="w-2/3 p-4 flex items-center justify-center">
						<h2 class="text-center text-md font-semibold">
							{item.layoutView?.title} <br /><br />
							{item.layoutView?.price}€
						</h2>
					</div>
				</div>
			{/each}
		</div>
		<div class="col-span-2 text-center mt-3">
			<h2 class="text-lg font-bold">Totale da pagare:</h2>

			<p class="text-xl font-semibold text-black-800">{subTotal} €</p>
			<!-- TODO: sconto tesserato c'è sempre se uno è già un socio, per ogni corso o sul totale -->
			<!-- {#if auth}
					<p class="text-gray-800">-25 € sconto tesserati</p>
				{/if} -->
			{#if discountList.length != 0}
				Sconto applicato: {totalDiscount} €
			{/if}
		</div>
		<p class=" col-span-2 font-bold text-lg text-center mt-6">Scegli il metodo di pagamento:</p>
		<div class="form-control col-span-2 mx-2">
			<label class="label cursor-pointer">
				<span class="label-text font-semibold">Bonifico (IBAN: 1548416800005462)</span>
				<input
					type="radio"
					name="radio-paymentType"
					class="radio checked:bg-blue-500"
					bind:group={paymentType}
					value={'bonifico'}
				/>
			</label>
		</div>
		<div class="form-control col-span-2 mx-2">
			<label class="label cursor-pointer">
				<span class="label-text font-semibold">Paypal</span>
				<input
					type="radio"
					name="radio-paymentType"
					class="radio checked:bg-blue-500"
					bind:group={paymentType}
					value={'paypal'}
				/>
			</label>
		</div>
		<div class="form-control col-span-2 mx-2">
			<label class="label cursor-pointer">
				<span class="label-text font-semibold">Contanti (all'inizio corso)</span>
				<input
					type="radio"
					name="radio-paymentType"
					class="radio checked:bg-blue-500"
					bind:group={paymentType}
					value={'contanti'}
				/>
			</label>
		</div>
		<div class="modal-action col-span-2">
			<button
				class="btn btn-sm btn-error w-24 hover:bg-white hover:text-red-500 rounded-lg"
				onclick={() => (isModalConfirm = false)}>Annulla</button
			>
			<button
				class="btn btn-sm btn-success w-24 hover:bg-white hover:text-green-500 rounded-lg"
				onclick={() => onConfirmCart()}>Conferma</button
			>
		</div>
	</div>
</dialog>
<!-- /modal CART -->

<!-- modal CONFIRM -->
<dialog id="my_modal_2" class="modal" class:modal-open={isModalSuccessLogin}>
	<div class="modal-box">
		<h3 class="font-bold text-lg">ORDINE CONFERMATO</h3>
		<p class="py-2 font-semibold">Ora puoi fare LOGIN con EMAIL e PASSWORD</p>
		<p class="py-1 font-semibold">per completare il PROFILO e vedere il tuo STORICO ordini</p>
		<div class="modal-action">
			<button
				class="btn btn-sm btn-primary w-24 hover:bg-white hover:blue-red-500 rounded-lg"
				onclick={() => (isModalSuccessLogin = false)}>Chiudi</button
			>
		</div>
	</div>
</dialog>
<!-- /modal CONFIRM -->

<!-- modal CONFIRM LOGIN -->
<dialog id="my_modal_2" class="modal" class:modal-open={isModalSuccess}>
	<div class="modal-box">
		<h3 class="font-bold text-lg">CORSO ORDINE CONFERMATO</h3>
		<p class="py-2 font-semibold">Puoi vedere lo storico ordini nella pagina: Impostazioni.</p>

		<div class="modal-action">
			<button
				class="btn btn-sm btn-primary w-24 hover:bg-white hover:text-blue-500 rounded-lg"
				onclick={() => (isModalSuccess = false)}>Chiudi</button
			>
		</div>
	</div>
</dialog>
<!-- /modal CONFIRM -->
