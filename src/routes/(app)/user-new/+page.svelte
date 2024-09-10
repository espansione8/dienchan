<script lang="ts">
	import Notification from '$lib/components/Notification.svelte';
	import { province } from '$lib/stores/arrays';
	import {
		Mail,
		User,
		Building2,
		UserPlus,
		MapPin,
		Globe,
		Phone,
		Smartphone,
		Lock
	} from 'lucide-svelte';
	import { country_list } from '$lib/stores/arrays.js';

	let provinceFilterate = $province.filter((p) => p.sigla !== 'ON');

	const countryList = $country_list;
	let password1 = $state('');
	let password2 = $state('');
	let name = $state('');
	let surname = $state('');
	let email = $state('');
	let address = $state('');
	let postalCode = $state('');
	let city = $state('');
	let countryState = $state('');
	let country = $state('');
	let phone = $state('');
	let mobilePhone = $state('');
	let checkPass = $state(false);
	let checkSecondPass = $state(false);
	let error = $state();
	let inputRef = $state();

	async function submitRegistration() {
		error = null;
		if (!checkPass || !checkSecondPass) {
			error = 'PASSWORD DIFFERENTI';
			inputRef.focus();
			return;
		}
		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/sign-up-admin`, {
			method: 'POST',
			body: JSON.stringify({
				name,
				surname,
				email,
				address,
				postalCode,
				city,
				countryState,
				country,
				phone,
				mobilePhone,
				password1
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
			fieldReset(); // svuota i campi dopo inserimento
		}
		if (response.status != 200) {
			console.log('KO', response);
			let error = (await response.json()).message;
			toastClosed = false;
			notificationContent = error;
			notificationError = true;
			closeNotification();
		}
	}

	const fieldReset = () => {
		name = '';
		surname = '';
		email = '';
		address = '';
		postalCode = '';
		city = '';
		countryState = '';
		country = '';
		phone = '';
		mobilePhone = '';
		password1 = '';
		password2 = '';
	};

	const testPass = () => {
		checkPass = password1.length >= 8;
		checkSecondPass = password1 === password2;
	};
	const testSecondPass = () => (checkSecondPass = password1 === password2);

	// notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 5000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer
</script>

<div class="container mx-auto">
	<div class="flex justify-center">
		<div class="w-full md:w-1/2">
			<form
				action=""
				onsubmit={submitRegistration}
				class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			>
				<header class="col-span-4 text-center text-2xl font-bold text-green-800">
					Registra un nuovo utente
				</header>
				<!-- Nome -->
				<section class="col-span-4 md:col-span-2">
					<label for="nome" class="form-label">
						<p class="font-bold mb-2">Nome</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><User /></button>
						<input
							class="input input-bordered join-item w-full"
							id="nome"
							type="text"
							placeholder="Nome"
							aria-label="nome"
							aria-describedby="basic-nome"
							bind:value={name}
							required
						/>
					</div>
				</section>
				<!-- Cognome -->
				<section class="col-span-4 md:col-span-2">
					<label for="cognome" class="form-label">
						<p class="font-bold mb-2">Cognome</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><User /></button>
						<input
							class="input input-bordered join-item w-full"
							id="cognome"
							type="text"
							placeholder="Cognome"
							aria-label="cognome"
							aria-describedby="basic-cognome"
							bind:value={surname}
							required
						/>
					</div>
				</section>
				<!-- Email -->
				<section class="col-span-4">
					<label for="email" class="form-label">
						<p class="font-bold mb-2">Email</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Mail /></button>
						<input
							class="input input-bordered join-item w-full"
							id="email"
							type="email"
							placeholder="Tua Email"
							aria-label="Email"
							aria-describedby="basic-email"
							bind:value={email}
							required
						/>
					</div>
				</section>
				<!-- Indirizzo -->
				<section class="col-span-4">
					<label for="indirizzo" class="form-label">
						<p class="font-bold mb-2">Indirizzo</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><MapPin /></button>
						<input
							class="input input-bordered join-item w-full"
							id="indirizzo"
							type="text"
							placeholder="Indirizzo"
							aria-label="indirizzo"
							aria-describedby="basic-indirizzo"
							bind:value={address}
							required
						/>
					</div>
				</section>
				<!-- Trio -->
				<div class="col-span-4 gap-10 flex justify-between md:col-span-4">
					<!-- CAP -->
					<section class="">
						<label for="cap" class="form-label">
							<p class="font-bold mb-2">CAP</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button class="join-item bg-gray-300 px-3"><MapPin /></button>
							<input
								class="input input-bordered join-item w-full"
								id="cap"
								type="text"
								placeholder="CAP"
								aria-label="cap"
								aria-describedby="basic-cap"
								bind:value={postalCode}
								required
							/>
						</div>
					</section>
					<!-- Citta -->
					<section class="">
						<label for="citta" class="form-label">
							<p class="font-bold mb-2">Città</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button class="join-item bg-gray-300 px-3"><Building2 /></button>
							<input
								class="input input-bordered join-item w-full"
								id="citta"
								type="text"
								placeholder="Città"
								aria-label="citta"
								aria-describedby="basic-citta"
								bind:value={city}
								required
							/>
						</div>
					</section>
					<!-- Provincia -->
					<section class="">
						<label for="provincia" class="form-label">
							<p class="font-bold mb-2">Provincia</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button class="join-item bg-gray-300 px-3"><Building2 /></button>
							<select
								class="select select-bordered w-full rounded-md mt-2 rounded-l-none"
								id="provincia"
								aria-label="Provincia"
								aria-describedby="basic-provincia"
								placeholder="Scegli"
								bind:value={countryState}
								required
							>
								<option selected disabled>Scegli</option>
								{#each provinceFilterate as provincia, i}
									<option value={provincia.sigla}>
										{provincia.nome} ({provincia.sigla})
									</option>
								{/each}
							</select>
						</div>
					</section>
				</div>
				<!-- Nazione -->
				<section class="col-span-4">
					<label for="nazione" class="form-label">
						<p class="font-bold mb-2">Nazione</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Globe /></button>
						<select
							class="select select-bordered w-full rounded-md mt-2 rounded-l-none"
							aria-label="Default select example"
							id="nazione"
							name="nazione"
							required
							bind:value={country}
						>
							<option selected disabled>Scegli</option>
							{#each countryList as country}
								<option value={country}>
									{country}
								</option>
							{/each}
						</select>
					</div>
				</section>
				<!-- Telefono -->
				<section class="col-span-4">
					<label for="telefono" class="form-label">
						<p class="font-bold mb-2">Telefono</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Phone /></button>
						<input
							class="input input-bordered join-item w-full"
							id="telefono"
							type="text"
							placeholder="Telefono"
							aria-label="telefono"
							aria-describedby="basic-telefono"
							bind:value={phone}
						/>
					</div>
				</section>
				<!-- Cellulare -->
				<section class="col-span-4">
					<label for="cellulare" class="form-label">
						<p class="font-bold mb-2">Cellulare</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Smartphone /></button>
						<input
							class="input input-bordered join-item w-full"
							id="cellulare"
							type="text"
							placeholder="Cellulare"
							aria-label="cellulare"
							aria-describedby="basic-cellulare"
							bind:value={mobilePhone}
						/>
					</div>
				</section>
				<!-- Password -->
				<section class="col-span-4">
					<label for="password" class="form-label">
						<p class="font-bold mb-2">
							Password <br />
							<span class="text-sm text-gray-600">( Almeno 8 caratteri numeri e lettere )</span>
						</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"
							><Lock color={checkPass ? 'green' : 'black'} /></button
						>
						<input
							class="input input-bordered join-item w-full"
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
				</section>
				<!-- Conferma password -->
				<section class="col-span-4">
					<label for="password2" class="form-label">
						<p class="font-bold mb-2">Conferma password</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"
							><Lock color={checkSecondPass && checkPass ? 'green' : 'black'} /></button
						>
						<input
							class="input input-bordered join-item w-full"
							id="password2"
							type="password"
							placeholder="Repeat password"
							bind:value={password2}
							oninput={testSecondPass}
							bind:this={inputRef}
							required
						/>
					</div>
				</section>
				<!-- button -->
				<div class="col-span-4 mt-5 flex justify-center">
					<button
						class="btn btn-success rounded-lg hover:bg-accent hover:text-green-800hover:bg-accent hover:text-green-900"
						type="submit"
					>
						<span class="flex items-center justify-center">
							INSERISCI
							<UserPlus class="ml-2" />
						</span>
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
<Notification {toastClosed} {notificationContent} {notificationError} />
