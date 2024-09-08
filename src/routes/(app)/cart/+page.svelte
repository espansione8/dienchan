<script lang="ts">
	import { cart } from '$lib/stores/cart';
	import moment from 'moment';
	import { Lock } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import { province } from '$lib/stores/arrays.js';
	import { country_list } from '$lib/stores/arrays.js';
	import { coursesInfo } from '$lib/stores/arrays.js';
	import { Settings, X, Check } from 'lucide-svelte';

	let { data } = $props();
	let { userData, auth } = $derived(data);

	let error: string = $state('');
	let password1 = $state('');
	let password2 = $state('');
	let checkPass = $state(false);
	let checkSecondPass = $state(false);
	let inputRef: any = $state(null);

	const testPass = () => {
		checkPass = password1.length >= 8;
		checkSecondPass = password1 === password2;
	};
	const testSecondPass = () => (checkSecondPass = password1 === password2);

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
	// privacy
	// let namePublic = $state(userData.namePublic || false);
	// let surnamePublic = $state(userData.surnamePublic || false);
	// let emailPublic = $state(userData.emailPublic || false);
	// let addressPublic = $state(userData.addressPublic || false);
	// let cityPublic = $state(userData.cityPublic || false);
	// let statePublic = $state(userData.statePublic || false);
	// let postalCodePublic = $state(userData.postalCodePublic || false);
	// let countryPublic = $state(userData.countryPublic || false);
	// let phonePublic = $state(userData.phonePublic || false);
	// let mobilePhonePublic = $state(userData.mobilePhonePublic || false);
	let paymentType = $state('bonifico');
	let closedInput = $state(false);

	if (auth) {
		closedInput = true;
	}
	const openInput = () => (closedInput = false);
	const closeInput = () => {
		closedInput = true;
	};

	const saveInput = async () => {
		closedInput = true;
		//alert('save data');
		// console.log('test');

		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/billing-data`, {
			method: 'POST',
			body: JSON.stringify({
				//id: userData._id,
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
				// namePublic,
				// surnamePublic,
				// emailPublic
				// addressPublic,
				// cityPublic,
				// statePublic,
				// postalCodePublic,
				// countryPublic,
				// phonePublic,
				// mobilePhonePublic
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

	let isModalConfirm = $state(false);
	let isModalSuccess = $state(false);
	let isModalSuccessLogin = $state(false);

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

	const onConfirmCart = async () => {
		error = '';
		if (!auth) {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/orders/purchase-first`, {
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
					cart: $cart,
					paymentType
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const res = await response.json();
			if (response.status == 200) {
				//alert(res.message);
				//console.log('OK', response);
				fieldReset(); // svuota i campi dopo inserimento
				isModalConfirm = false;
				toastClosed = false;
				notificationContent = res.message;
				clearTimeout(startTimeout);
				closeNotification();
				isModalSuccess = true;
			}
			if (response.status != 200) {
				//alert(res.message);
				// console.log('OK', response);
				//isModalConfirm = false;
				toastClosed = false;
				notificationContent = res.message;
				clearTimeout(startTimeout);
			}
		} else {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/orders/purchase`, {
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
					cart: $cart,
					paymentType,
					userId: userData.userId
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const res = await response.json();
			if (response.status == 200) {
				//alert(res.message);
				//console.log('OK', response);
				fieldReset(); // svuota i campi dopo inserimento
				isModalConfirm = false;
				toastClosed = false;
				notificationContent = res.message;
				clearTimeout(startTimeout);
				closeNotification();
				isModalSuccessLogin = true;
			}
			if (response.status != 200) {
				//alert(res.message);
				// console.log('OK', response);
				//isModalConfirm = false;
				toastClosed = false;
				notificationContent = res.message;
				clearTimeout(startTimeout);
			}
		}
	};

	let total = $state(0);

	const totalCart = () => {
		total = 0;
		$cart.forEach((element) => {
			total = total + element.price;
		});
		if (auth) total -= 25;
		return total;
	};

	const categoryColors = {
		'Corso base': 'bg-green-500',
		'Corso avanzato': 'bg-orange-400',
		'Workshop - Bellezza viso': 'bg-purple-400',
		'Workshop - Difese immunitarie': 'bg-blue-400',
		'Workshop - Pronto soccorso': 'bg-blue-400',
		'Workshop - Occhi & Vista': 'bg-blue-400',
		Accademia: 'bg-red-600'
	};

	function siglaToProvincia(provinciaSigla: any) {
		const findProvincia = $province.find((prov) => prov.sigla === provinciaSigla);
		//**** listaProvince.place 'Online' is ignored */
		if (findProvincia) {
			return findProvincia.nome;
		} else if (provinciaSigla === 'Online') {
			return 'Online';
		}
	}

	// cart store
	totalCart();
	const removeFromCart = (courseId: any) => {
		cart.update((n) => {
			console.log('courseId', courseId.prodCorsoId);
			// Filtra il carrello per rimuovere il corso con l'ID specificato
			return n.filter((item) => item.prodCorsoId !== courseId.prodCorsoId);
		});
		totalCart();
	};

	const clearCart = () => {
		cart.set([]);
		totalCart();
	};

	const fieldReset = () => {
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
		clearCart();
	};

	const onClickInfo = (idCourse: any) => {
		//  console.log('idCourse', idCourse);
		goto(`/course-detail/${idCourse}`);
	};

	const findObjectByParam = (jsonArray, paramName, paramValue) => {
		// Itera attraverso ogni oggetto nell'array JSON
		console.log('jsonArray', jsonArray);
		console.log('paramName', paramName);
		console.log('paramValue', paramValue);
		for (let i = 0; i < jsonArray.length; i++) {
			// Controlla se il parametro nell'oggetto corrisponde al valore cercato
			if (jsonArray[i][paramName] === paramValue) {
				return jsonArray[i]; // Restituisce l'oggetto se trovato
			}
		}
		return null; // Restituisce null se non trova un oggetto corrispondente
	};

	// notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 3000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer

	const imgSrc = (value: string) => {
		const src = $coursesInfo.filter((item: any) => item.id == value);
		return src[0].urlPic;
	};
</script>

<svelte:head>
	<title>Carrello</title>
</svelte:head>

<div class="bg-base-200 grid grid-cols-12 grid-rows-[min-content] gap-y-12 p-4 lg:gap-x-8 lg:p-8">
	<section class="col-span-12 xl:col-span-9 bg-base-100 rounded-lg">
		<div class="flex flex-wrap justify-center gap-3 my-5">
			{#each $cart as item}
				<div
					class="card card-compact overflow-hidden bg-base-100 max-w-xs rounded-xl shadow-md border"
				>
					<figure class="px-4 pt-4">
						<img
							src={imgSrc(item.category[0])}
							alt="tipo corso"
							class="h-full w-full object-cover border-2 rounded-lg"
						/>
					</figure>
					<div class="card-body items-center text-center">
						<!-- data giorno -->
						<h2 class="card-title text-2xl">
							{moment(item.eventStartDate).format('DD/MM/YYYY')}
						</h2>
						<!-- luogo -->
						{#if item.place !== 'Online'}
							<p class="card-text text-xl">
								<b>{siglaToProvincia(item.place)}</b>
							</p>
						{:else if item.place === 'Online'}
							<p class="card-text text-xl">
								<b>{item.place}</b>
							</p>
						{/if}
						<!-- title -->
						<h5
							class="card-text text-xl bg-base-200 border rounded-md shadow-sm font-semibold p-2
							{categoryColors[item.category]}"
						>
							{item.title}
						</h5>
						<!-- riflessologo -->
						<p class="card-text">
							Riflessologo: <b>{item.reflexologistName} {item.reflexologistSurname}</b>
						</p>
						<!-- dalle x alle y -->
						<h5 class="card-text">
							Dalle <b>{moment(item.eventStartDate).format('HH:mm')}</b>
							alle <b>{moment(item.eventEndDate).format(' HH:mm')}</b>
						</h5>
						<!-- price -->
						<p class="card-text">
							Prezzo: <b>{item.price}</b>
						</p>

						<div class="card-actions">
							<span class="flex justify-between gap-10 my-3">
								<button
									class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:text-gray-300"
									onclick={() => onClickInfo(item.prodCorsoId)}>Info</button
								>
								<button
									class="btn btn-sm bg-red-200 w-40 border border-red-400 rounded-md text-red-700 hover:text-red-700 hover:bg-red-400"
									onclick={() => removeFromCart(item)}>Rimuovi dal Carrello</button
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
		{#if $cart.length > 0}
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
								<Settings size="18" />
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

				<form class=" pt-2" onsubmit={onConfirmForm}>
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
									class="relative flex items-center space-x-2 rounded-r-md rounded-l-lg border border-gray-200 bg-white px-2 text-gray-900 shadow-sm"
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
									class="relative flex items-center space-x-2 rounded-r-md rounded-l-lg border border-gray-200 bg-white px-2 text-gray-900 shadow-sm"
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
									<option value={provincia.sigla}>
										{provincia.nome} ({provincia.sigla})
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
					<section class=" ">
						<div class="text-center mt-6">
							<h2 class="text-2xl font-semibold">Totale Carrello:</h2>
							{#if $cart.length > 0}
								<p class="text-xl font-bold text-gray-800">{total} €</p>
								{#if auth}
									<p class="text-gray-800">-25 € sconto tesserati</p>
								{/if}
							{:else}
								<p class="text-xl font-semibold text-red-500">Nessun prodotto nel carrello</p>
							{/if}
						</div>
						<div class="flex justify-center space-x-4 mt-4">
							<button
								class="btn btn-sm rounded-lg w-32 {$cart.length > 0
									? 'btn-error bg-red-500 text-white hover:bg-red-600 hover:scale-105 transition-transform'
									: 'btn-disabled bg-gray-200 text-gray-400'}"
								onclick={() => clearCart()}
								disabled={$cart.length == 0}
							>
								{#if $cart.length == 0}
									<Lock class="mr-2" />
								{/if}
								Svuota
							</button>
							<button
								type="submit"
								class="btn btn-sm rounded-lg w-32 {$cart.length > 0
									? 'btn-success bg-green-500 text-white hover:bg-green-600 hover:scale-105 transition-transform'
									: 'btn-disabled bg-gray-200 text-gray-400'}"
								disabled={$cart.length == 0}
							>
								{#if $cart.length == 0}
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

<!-- modal CART -->
<dialog id="my_modal_2" class="modal" class:modal-open={isModalConfirm}>
	<div class="modal-box grid grid-cols-2">
		<h3 class="col-span-2 font-bold text-xl text-center mb-4">Riepilogo Ordine</h3>
		{#if !auth}
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
		{/if}
		<div class="col-span-2 flex flex-col items-center w-full gap-3 my-4">
			{#each $cart as item}
				<div
					class="flex items-center w-full max-w-96 bg-indigo-100 rounded-lg shadow-md overflow-hidden"
				>
					<div class="w-1/3 p-3">
						<img
							src={imgSrc(item.category[0])}
							alt="Immagine corso"
							class="w-full h-full object-cover"
						/>
					</div>
					<div class="w-2/3 p-4 flex items-center justify-center">
						<h2 class="text-center text-md font-semibold">
							{item.title} <br /><br />
							{item.price}€
						</h2>
					</div>
				</div>
			{/each}
		</div>
		<div class="col-span-2 text-center mt-3">
			<h2 class="text-lg font-bold">Totale Carrello:</h2>
			{#if $cart.length > 0}
				<p class="text-xl font-semibold text-black-800">{total} €</p>
				{#if auth}
					<p class="text-gray-800">-25 € sconto tesserati</p>
				{/if}
			{/if}
		</div>
		<p class=" col-span-2 font-bold text-lg text-center mt-4">Scegli il metodo di pagamento:</p>
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
<dialog id="my_modal_2" class="modal" class:modal-open={isModalSuccess}>
	<div class="modal-box">
		<h3 class="font-bold text-lg">ORDINE CONFERMATO</h3>
		<p class="py-2 font-semibold">Ora puoi fare LOGIN con EMAIL e PASSWORD</p>
		<p class="py-1 font-semibold">per completare il PROFILO e vedere il tuo STORICO ordini</p>
		<div class="modal-action">
			<button
				class="btn btn-sm btn-primary w-24 hover:bg-white hover:blue-red-500 rounded-lg"
				onclick={() => (isModalSuccess = false)}>Chiudi</button
			>
		</div>
	</div>
</dialog>
<!-- /modal CONFIRM -->

<!-- modal CONFIRM LOGIN -->
<dialog id="my_modal_2" class="modal" class:modal-open={isModalSuccessLogin}>
	<div class="modal-box">
		<h3 class="font-bold text-lg">CORSO ORDINE CONFERMATO</h3>
		<p class="py-2 font-semibold">Puoi vedere lo storico odini nella pagina: Impostazioni.</p>

		<div class="modal-action">
			<button
				class="btn btn-sm btn-primary w-24 hover:bg-white hover:text-blue-500 rounded-lg"
				onclick={() => (isModalSuccessLogin = false)}>Chiudi</button
			>
		</div>
	</div>
</dialog>
<!-- /modal CONFIRM -->
