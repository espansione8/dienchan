<script lang="ts">
	import { enhance } from '$app/forms';
	import { CreditCard, DollarSign, Lock, ArrowLeft, CheckCircle } from 'lucide-svelte';

	// Props and state
	let {
		modalTitle,
		onCloseModal,
		postAction,
		auth,
		closedInput,
		//formData,
		province,
		country_list,
		getCourse,
		error,
		checkPass,
		testPass,
		checkSecondPass,
		testSecondPass,
		inputRef
	} = $props();

	let openModal = $state(true);
	let currentStep = $state(1);
	let totalSteps = $state(3);

	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function getStepTitle(step) {
		switch (step) {
			case 1:
				return 'Informazioni Personali';
			case 2:
				return 'Indirizzo di Spedizione';
			case 3:
				return 'Pagamento e Conferma';
			default:
				return '';
		}
	}

	const userData = {
		userId: '1YQTRN3P78SE',
		userCode: 'ea483538-d090-4ffa-bd22-6ea101dd0347',
		status: 'enabled',
		token: '',
		cookieId: '2abf1472-7551-4e1b-a289-c801072de78f',
		promotions: [],
		level: 'user',
		membership: {
			senior: '',
			membershipLevel: 'Socio ordinario',
			membershipStatus: true,
			membershipSignUp: '2025-05-19T01:57:23.618Z',
			membershipActivation: '2025-05-19T01:57:23.618Z',
			membershipExpiry: '2026-05-19T01:57:23.618Z'
		},
		codeSales: '',
		codeManager: '',
		codeSupervisor: '',
		codeAgency: '',
		codeSponsor: '',
		codeAdmin: '',
		codeSuperAdmin: '',
		name: 'João',
		namePublic: false,
		surname: 'Souza Silva',
		surnamePublic: false,
		businessData: {
			businessName: '',
			vatNumber: '',
			businessCategory: '',
			businessAddress: '',
			businessCity: '',
			businessPostalCode: '',
			businessState: '',
			businessCountry: '',
			businessCounty: '',
			numberEmployed: 0,
			grossIncome: '',
			role: ''
		},
		category: '',
		address: 'Rua Inexistente, 2000',
		addressPublic: false,
		city: 'Belo Horizonte',
		cityPublic: false,
		postalCode: '30260-080',
		postalCodePublic: false,
		county: 'Arezzo',
		countyPublic: false,
		region: '',
		regionPublic: false,
		country: 'Brazil',
		countryPublic: false,
		language: '',
		mobilePhone: '123456',
		mobilePhonePublic: false,
		phone: '+55555555555',
		phonePublic: false,
		email: 'tononno@gmail.com',
		emailPublic: false,
		documentUpload: '',
		photoUpload: '',
		gender: '',
		birthdate: '',
		socialSecurityNumber: '',
		card: {
			cardId: '',
			cardCode: '',
			cardActivation: null,
			cardExpiry: null,
			cardStatus: false
		},
		username: '',
		pointsSpent: 0,
		pointsBalance: 0,
		pointsTotal: 0,
		pointsBalanceDate: null,
		userAvatar: '',
		privacyDate: null,
		privacyAccept: '',
		revenue: 0,
		target0: 0,
		target1: 0,
		target2: 0,
		target3: 0,
		target4: 0,
		target5: 0,
		target6: 0,
		target7: 0,
		target8: 0,
		target9: 0,
		target10: 0,
		target11: 0,
		target12: 0,
		extra0: '',
		extra1: '',
		extra2: '',
		extra3: '',
		extra4: '',
		extra5: '',
		extra6: '',
		extra7: '',
		extra8: '',
		extra9: '',
		extra10: '',
		extra11: '',
		extra12: '',
		extraFieldNumber1: 0,
		extraFieldNumber2: 0,
		extraFieldNumber3: 0,
		extraFieldNumber4: 0,
		extraFieldNumber5: 0,
		extraFieldNumber6: 0,
		extraFieldNumber7: 0,
		extraFieldNumber8: 0,
		extraFieldNumber9: 0,
		extraFieldNumber10: 0,
		extraFieldNumber11: 0,
		extraFieldNumber12: 0,
		extraFieldNumber13: 0,
		extraFieldNumber14: 0,
		extraFieldNumber15: 0,
		extraFieldNumber16: 0,
		extraFieldNumber17: 0,
		extraFieldNumber18: 0,
		extraFieldNumber19: 0,
		extraFieldNumber20: 0,
		extraFieldNumber21: 0,
		extraFieldNumber22: 0,
		extraFieldNumber23: 0,
		extraFieldNumber24: 0,
		extraFieldText1: '',
		extraFieldText2: '',
		extraFieldText3: '',
		extraFieldText4: '',
		extraFieldText5: '',
		extraFieldText6: '',
		extraFieldText7: '',
		extraFieldText8: '',
		extraFieldText9: '',
		extraFieldText10: '',
		extraFieldText11: '',
		extraFieldText12: '',
		extraFieldText13: '',
		extraFieldText14: '',
		extraFieldText15: '',
		extraFieldText16: '',
		extraFieldText17: '',
		extraFieldText18: '',
		extraFieldText19: '',
		extraFieldText20: '',
		extraFieldText21: '',
		extraFieldText22: '',
		extraFieldText23: '',
		extraFieldText24: '',
		lastAccess: null,
		counterAccess: 0,
		remoteIP: '',
		remoteHost: '',
		remoteBrowser: '',
		notesOnUser: '',
		userCart: [],
		userWishList: [],
		documentPageArray: [],
		storicoCorsiPartecipati: [],
		storicoCorsiCreati: [],
		docModifyArray: [],
		uploadfiles: [],
		createdAt: '2025-05-19',
		updatedAt: '2025-05-19T01:57:23.620Z',
		__v: 0
	};

	let formData = $state({
		name: userData?.name || '',
		surname: userData?.surname || '',
		email: userData?.email || '',
		address: userData?.address || '',
		city: userData?.city || '',
		county: userData?.county || '',
		postalCode: userData?.postalCode || '',
		country: userData?.country || 'Italy',
		phone: userData?.phone || '',
		mobilePhone: userData?.mobilePhone || '',
		payment: 'Bonifico bancario',
		password1: '',
		password2: ''
	});
</script>

<div
	class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 overflow-y-auto"
	class:hidden={!openModal}
>
	<div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
		<!-- Header -->
		<div
			class="bg-primary text-primary-content px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10"
		>
			<h2 class="text-xl font-bold">{modalTitle}</h2>
			<button class="btn btn-circle btn-sm btn-ghost text-primary-content" onclick={onCloseModal}
				>✕</button
			>
		</div>

		<!-- Progress bar -->
		<div class="px-6 pt-4">
			<div class="w-full flex justify-between mb-2">
				{#each Array(totalSteps) as _, i}
					<div class="flex flex-col items-center">
						<div
							class={`w-10 h-10 rounded-full flex items-center justify-center ${i + 1 === currentStep ? 'bg-primary text-primary-content' : i + 1 < currentStep ? 'bg-success text-success-content' : 'bg-base-200'}`}
						>
							{#if i + 1 < currentStep}
								<CheckCircle size={20} />
							{:else}
								{i + 1}
							{/if}
						</div>
						<span class="text-xs mt-1">{getStepTitle(i + 1)}</span>
					</div>

					{#if i < totalSteps - 1}
						<div class="flex-1 flex items-center mx-2">
							<div class={`h-1 w-full ${i + 1 < currentStep ? 'bg-success' : 'bg-base-200'}`}></div>
						</div>
					{/if}
				{/each}
			</div>
		</div>

		<form method="POST" action={postAction} use:enhance class="px-6 pb-6">
			<!-- Step 1: Personal Information -->
			<div class={currentStep === 1 ? 'block' : 'hidden'}>
				<div class="card bg-base-100 shadow-sm border border-base-200 p-4 rounded-lg mt-4">
					<div class="card-title text-lg font-bold mb-4 pb-2 border-b">
						{#if auth}
							<div class="flex justify-between items-center w-full">
								<span>Dati Personali</span>
								<a href="/profile-modify" class="btn btn-sm btn-outline">Modifica profilo</a>
							</div>
						{:else}
							<span>Registrazione</span>
						{/if}
					</div>

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

						<!-- Email -->
						<div class="form-control w-full md:col-span-2">
							<label for="Email" class="label">
								<span class="label-text font-medium">Email</span>
							</label>
							<input
								id="Email"
								name="email"
								type="email"
								class="input input-bordered w-full"
								placeholder="esempio@email.com"
								required
								readonly={closedInput}
								bind:value={formData.email}
							/>
						</div>

						{#if !auth}
							<!-- Password -->
							<div class="form-control w-full md:col-span-2">
								<label for="password" class="label">
									<span class="label-text font-medium">
										Password
										<span class="text-xs text-base-content/70" class:text-error={error}>
											(Almeno 8 caratteri con numeri e lettere)
										</span>
									</span>
								</label>
								<div class="input input-bordered flex items-center gap-2 pr-2">
									<Lock size={18} color={checkPass ? 'green' : 'currentColor'} class="ml-2" />
									<input
										class="flex-1 outline-none bg-transparent"
										id="password"
										type="password"
										placeholder="Inserisci la password"
										aria-label="Password"
										bind:value={formData.password1}
										oninput={testPass}
										required={!auth}
									/>
								</div>
							</div>

							<!-- Confirm Password -->
							<div class="form-control w-full md:col-span-2">
								<label for="password2" class="label">
									<span class="label-text font-medium">
										Conferma password
										{#if error}
											<span class="text-xs text-error ml-2">{error}</span>
										{/if}
									</span>
								</label>
								<div class="input input-bordered flex items-center gap-2 pr-2">
									<Lock
										size={18}
										color={checkSecondPass && checkPass ? 'green' : 'currentColor'}
										class="ml-2"
									/>
									<input
										class="flex-1 outline-none bg-transparent"
										id="password2"
										type="password"
										placeholder="Conferma la password"
										bind:value={formData.password2}
										oninput={testSecondPass}
										bind:this={inputRef}
										required={!auth}
									/>
								</div>
							</div>
						{/if}

						<!-- Telefono -->
						<div class="form-control w-full">
							<label for="telefono" class="label">
								<span class="label-text font-medium">Telefono</span>
							</label>
							<input
								id="telefono"
								name="phone"
								type="tel"
								class="input input-bordered w-full"
								placeholder="+39 01234567"
								required
								readonly={closedInput}
								bind:value={formData.phone}
							/>
						</div>

						<!-- Cellulare -->
						<div class="form-control w-full">
							<label for="cellulare" class="label">
								<span class="label-text font-medium">Cellulare</span>
							</label>
							<input
								id="cellulare"
								name="mobilePhone"
								type="tel"
								class="input input-bordered w-full"
								placeholder="+39 3331234567"
								readonly={closedInput}
								bind:value={formData.mobilePhone}
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Step 2: Shipping Address -->
			<div class={currentStep === 2 ? 'block' : 'hidden'}>
				<div class="card bg-base-100 shadow-sm border border-base-200 p-4 rounded-lg mt-4">
					<div class="card-title text-lg font-bold mb-4 pb-2 border-b">
						<span>Indirizzo di Spedizione</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Indirizzo -->
						<div class="form-control w-full md:col-span-2">
							<label for="address" class="label">
								<span class="label-text font-medium">Indirizzo</span>
							</label>
							<input
								id="address"
								name="address"
								type="text"
								class="input input-bordered w-full"
								placeholder="Via/Piazza, numero civico"
								required
								readonly={closedInput}
								bind:value={formData.address}
							/>
						</div>

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

						<!-- Provincia -->
						<div class="form-control w-full">
							<label for="state" class="label">
								<span class="label-text font-medium">Provincia</span>
							</label>
							<select
								id="state"
								class="select select-bordered w-full"
								name="state"
								required
								disabled={closedInput}
								bind:value={formData.county}
							>
								<option value="" disabled selected>Seleziona provincia</option>
								{#each $province as provincia, i}
									<option value={provincia.title}>
										{provincia.title} ({provincia.region})
									</option>
								{/each}
							</select>
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
								<option value="" disabled selected>Seleziona nazione</option>
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

			<!-- Step 3: Payment and Confirmation -->
			<div class={currentStep === 3 ? 'block' : 'hidden'}>
				<div class="card bg-base-100 shadow-sm border border-base-200 p-4 rounded-lg mt-4">
					<div class="card-title text-lg font-bold mb-4 pb-2 border-b">
						<span>Metodo di Pagamento</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<label
							class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
							class:border-primary={formData.payment === 'Carta di credito'}
							class:bg-base-200={formData.payment === 'Carta di credito'}
						>
							<input
								type="radio"
								name="payment"
								value="Carta di credito"
								class="hidden"
								bind:group={formData.payment}
							/>
							<CreditCard class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Carta di Credito</span>
						</label>

						<label
							class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
							class:border-primary={formData.payment === 'Bonifico bancario'}
							class:bg-base-200={formData.payment === 'Bonifico bancario'}
						>
							<input
								type="radio"
								name="payment"
								value="Bonifico bancario"
								class="hidden"
								bind:group={formData.payment}
							/>
							<DollarSign class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Bonifico Bancario</span>
						</label>

						<label
							class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
							class:border-primary={formData.payment === 'Contanti'}
							class:bg-base-200={formData.payment === 'Contanti'}
						>
							<input
								type="radio"
								name="payment"
								value="Contanti"
								class="hidden"
								bind:group={formData.payment}
							/>
							<DollarSign class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Contanti (all'inizio corso)</span>
						</label>
					</div>

					<!-- Order Summary -->
					<div class="card bg-base-200 p-4 rounded-lg">
						<h3 class="font-bold text-lg mb-2">Riepilogo Ordine</h3>
						<div class="divider my-1"></div>

						<div class="flex justify-between items-center py-2">
							<span class="text-base-content/80">{'Corso'}</span>
							<span>400 €</span>
						</div>

						<div class="divider my-1"></div>

						<div class="flex justify-between items-center py-2 text-lg font-bold">
							<span>Totale</span>
							<span class="text-primary">25 €</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Navigation buttons -->
			<div class="flex justify-between mt-6">
				<button
					type="button"
					class="btn btn-outline"
					onclick={prevStep}
					class:hidden={currentStep === 1}
				>
					<ArrowLeft size={16} />
					Indietro
				</button>

				<div class="flex gap-2 ml-auto">
					<button type="button" class="btn btn-error btn-outline" onclick={onCloseModal}>
						Annulla
					</button>

					{#if currentStep < totalSteps}
						<button type="button" class="btn btn-primary" onclick={nextStep}> Continua </button>
					{:else}
						<button type="submit" class="btn btn-success"> Conferma Acquisto </button>
					{/if}
				</div>
			</div>
		</form>
	</div>
</div>
