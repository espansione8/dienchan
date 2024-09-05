<script lang="ts">
	import { cart } from '$lib/stores/cart';
	import moment from 'moment';
	import { Lock } from 'lucide-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import { province } from '$lib/stores/arrays.js';
	import { country_list } from '$lib/stores/arrays.js';
	import { coursesInfo } from '$lib/stores/arrays.js';
	import { Settings, X, Check } from 'lucide-svelte';

	const date = new Date();

	let { data } = $props();
	let { userData, auth } = $derived(data);

	const pad = (num: any) => {
		const newNum = Number(num);
		const norm = Math.floor(Math.abs(newNum));
		let text = '';
		if (norm < 10) text = '0';
		const outpupt = `${text}${norm}`;
		return outpupt;
	};

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

	// function findNameRiflessologo(userIdCode) {
	// 	const findRiflessologo = getTableUser.find((user) => user.userId === userIdCode);
	// 	// const findRiflessologo = '';

	// 	if (!findRiflessologo) {
	// 		console.warn(`Nessun riflessologo trovato per l'ID: ${userIdCode}`);
	// 		return 'Riflessologo non trovato';
	// 	}
	// 	return `${findRiflessologo.name} ${findRiflessologo.surname}`;
	// }

	let productCorsoTitolo = $state('');
	let productCorsoDescrizione = $state('');
	let productCorsoUserId = $state(userData.userId);
	let productCorsoStatus = $state('enabled');
	let productCorsoProvincia = $state('');
	let productCorsoCategoria = $state('Corso');
	let productCorsoElencoTag: any[] = $state([]);
	let productCorsoInputTag = $state('');
	let productCorsoQuantitaPartecipanti = $state(1);
	// let eventoProdotti;
	let productCorsoElencoEmailNotifica = $state([userData.email]);
	let productCorsoInputEmailNotifica = $state('');
	let productCorsoPoints = $state(1);

	let productCorsoDataInizioGiorno = $state(pad(date.getDate()));
	let productCorsoDataInizioMese = $state(pad(date.getMonth() + 1));
	let productCorsoDataInizioAnno = $state(date.getFullYear());
	let productCorsoDataInizioOra = $state(pad(date.getHours()));
	let productCorsoDataInizioMinuto = $state(pad(date.getMinutes()));

	let productCorsoDataFineGiorno = $state(pad(date.getDate()));
	let productCorsoDataFineMese = $state(pad(date.getMonth() + 1));
	let productCorsoDataFineAnno = $state(pad(date.getFullYear()));
	let productCorsoDataFineOra = $state(pad(date.getHours() + 1));
	let productCorsoDataFineMinuto = $state(date.getMinutes());

	let productCorsoDataInizioCompleto = $derived(
		`${productCorsoDataInizioAnno}-${productCorsoDataInizioMese}-${productCorsoDataInizioGiorno} ${productCorsoDataInizioOra}:${productCorsoDataInizioMinuto}`
	);
	let productCorsoDataFineCompleto = $derived(
		`${productCorsoDataFineAnno}-${productCorsoDataFineMese}-${productCorsoDataFineGiorno} ${productCorsoDataFineOra}:${productCorsoDataFineMinuto}`
	);

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
	// let max = $state(new Date().getFullYear());
	// let min = $derived(max - 90);
	// let years = $state([]);
	let namePublic = $state(userData.namePublic || false);
	let surnamePublic = $state(userData.surnamePublic || false);
	let emailPublic = $state(userData.emailPublic || false);
	let addressPublic = $state(userData.addressPublic || false);
	let cityPublic = $state(userData.cityPublic || false);
	let statePublic = $state(userData.statePublic || false);
	let postalCodePublic = $state(userData.postalCodePublic || false);
	let countryPublic = $state(userData.countryPublic || false);
	let phonePublic = $state(userData.phonePublic || false);
	let mobilePhonePublic = $state(userData.mobilePhonePublic || false);
	// let regionPublic = userData.regionPublic || false;
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
				namePublic,
				surnamePublic,
				emailPublic,
				address,
				city,
				countryState,
				postalCode,
				// region,
				country,
				phone,
				mobilePhone,
				addressPublic,
				cityPublic,
				statePublic,
				postalCodePublic,
				// regionPublic,
				countryPublic,
				phonePublic,
				mobilePhonePublic
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
	const onConfirmForm = async () => {
		if (!checkPass || !checkSecondPass) {
			error = 'CONTROLLARE LE PASSWORD';
			inputRef.focus();
			return;
		}
		isModalConfirm = true;
	};
	const onConfirmCart = async () => {
		error = '';
		let newSubscription = false;
		if (auth) newSubscription = true;
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
			alert(res.message);
			fieldReset(); // svuota i campi dopo inserimento
		}
		if (response.status != 200) {
			alert(res.message);
		}
	};

	let total = $state(0);
	const totalCart = () => {
		$cart.forEach((element) => {
			total = total + element.price;
		});
		if (auth) total -= 25;
		return total;
	};

	// console.log('total', total);

	const fieldReset = () => {};

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
			<div class="card bg-gray-100 shadow-xl p-3 rounded-lg">
				<div
					class="card-title bg-gray-300 text-lg font-semibold flex justify-between items-center px-4 py-2 rounded-lg"
				>
					{#if auth}
						<span>Profilo</span>
					{:else}
						<span>Prima iscrizione</span>
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
								class="relative flex items-center space-x-2 rounded-r-md rounded-l-lg border border-gray-400 bg-white px-2 text-gray-900 shadow-sm"
							>
								<span class="flex items-center p-3 -m-2 rounded-l-md bg-gray-400">
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
									required
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
								class="relative flex items-center space-x-2 rounded-r-md rounded-l-lg border border-gray-400 bg-white px-2 text-gray-900 shadow-sm"
							>
								<span class="flex items-center p-3 -m-2 rounded-l-md bg-gray-400">
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
									required
								/>
							</div>
						</div>
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
				</form>
			</div>
		{/if}

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
	</section>
</div>
<Notification {toastClosed} {notificationContent} {notificationError} />

<!-- modal CART -->
<dialog id="my_modal_2" class="modal" class:modal-open={isModalConfirm}>
	<div class="modal-box">
		<h3 class="font-bold text-lg">Riepilogo Ordine</h3>
		<p class="py-1 font-semibold">Nome: {name} {surname}</p>
		<p class="py-1 font-semibold">Email: {email}</p>
		<p class="py-1 font-semibold">Indirizzo: {address}</p>
		<p class="py-1 font-semibold">Città: {city}</p>
		<p class="py-1 font-semibold">{postalCode} - {countryState} - {country}</p>
		<p class="py-1 font-semibold">Tel: {phone} / Cell:{mobilePhone}</p>
		{#each $cart as item}
			<p class="inline-block py-2">
				<img
					src={imgSrc(item.category[0])}
					alt="tipo corso"
					class="w-16 object-cover border-2 rounded-lg"
				/> <span class="font-semibold">{item.title}</span>
			</p>
		{/each}
		<p class="py-4 font-bold">scelgi il metodo di pagamento</p>
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text font-semibold">Bonifico IBAN asdasd12345333</span>
				<input
					type="radio"
					name="radio-paymentType"
					class="radio checked:bg-blue-500"
					bind:group={paymentType}
					value={'bonifico'}
				/>
			</label>
		</div>
		<div class="form-control">
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
		<div class="form-control">
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
		<div class="modal-action">
			<button class="btn btn-error" onclick={() => (isModalConfirm = false)}>Annulla</button>
			<button class="btn btn-success" onclick={() => onConfirmCart()}>Conferma</button>
		</div>
	</div>
</dialog>

<!-- /modal CART -->
