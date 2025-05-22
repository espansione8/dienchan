<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import Notification from '$lib/components/Notification.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import { country_list, province } from '$lib/stores/arrays.js';
	import {
		Lock,
		Trash2,
		Calendar,
		MapPin,
		User,
		Users,
		HandCoins,
		CreditCard,
		Landmark,
		Coins,
		Mail,
		Phone,
		Check,
		ArrowLeft,
		CheckCircle
	} from 'lucide-svelte';

	const { data } = $props();
	const { getCourse, userData, auth } = $derived(data);

	const userfiles = $derived(userData?.uploadfiles || []);
	const picFilter = $derived(userfiles.filter((file: any) => file.type == 'avatar'));

	// reset cart - original price
	// const totalCart = () => {
	// 	grandTotal = 0;
	// 	$cartProducts.forEach((element: any) => {
	// 		if (element.type == 'course') {
	// 			grandTotal += element.layoutView.price;
	// 		} else {
	// 			grandTotal += element.price;
	// 		}
	// 	});
	// 	//return grandTotal;
	// };

	let loading = $state(false);
	let closedInput = $state(false);
	if (auth) {
		closedInput = true;
	}

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
	// Modal
	let openModal = $state(false);
	let postAction = $state('?/');
	let modalTitle = $state('');
	//let currentModal = $state('');
	let currentStep = $state(1);
	let totalSteps = $state(3);
	let passwordsMatch = $state(true);

	const resetFields = () => {
		formData.name = userData?.name || '';
		formData.surname = userData?.surname || '';
		formData.email = userData?.email || '';
		formData.address = userData?.address || '';
		formData.city = userData?.city || '';
		formData.county = userData?.county || '';
		formData.postalCode = userData?.postalCode || '';
		formData.country = userData?.country || 'Italy';
		formData.phone = userData?.phone || '';
		formData.mobilePhone = userData?.mobilePhone || '';
		formData.payment = 'Bonifico bancario';
		formData.password1 = '';
		formData.password2 = '';
	};

	const checkPasswordsMatch = () => {
		if (!auth && formData.password1 && formData.password2) {
			passwordsMatch = formData.password1 === formData.password2;
		} else {
			passwordsMatch = true;
		}
	};

	const nextStep = () => {
		if (!isCurrentStepValid()) return;
		if (currentStep < totalSteps) {
			currentStep++;
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			currentStep--;
		}
	};

	const getStepTitle = (step) => {
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
	};

	const isStep1Valid = () => {
		if (!formData.name || !formData.surname || !formData.email || !formData.mobilePhone) {
			return false;
		}

		if (!auth) {
			if (!formData.password1 || !formData.password2 || formData.password1.length < 8) {
				return false;
			}
			if (formData.password1 !== formData.password2) {
				return false;
			}
		}

		return true;
	};

	const isStep2Valid = () => {
		return !!(
			formData.address &&
			formData.city &&
			formData.postalCode &&
			formData.county &&
			formData.country
		);
	};

	const isStep3Valid = () => {
		return !!formData.payment;
	};

	const isCurrentStepValid = () => {
		switch (currentStep) {
			case 1:
				return isStep1Valid();
			case 2:
				return isStep2Valid();
			case 3:
				return isStep3Valid();
			default:
				return false;
		}
	};

	const onClickModal = (type: string, item: any) => {
		//currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Acquista il Corso';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		//currentModal = '';
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

	const formSubmit = () => {
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await invalidateAll();
			//console.log('formData', formData);
			if (result.type === 'success' && result.data) {
				const { payload } = result.data; // { action, success, message, payload }
				// subTotal = 0;
				// totalDiscount = 0;
				// discountActive = payload?.discountApplied ?? [];
				// isModalConfirm = false;

				// if (action == 'applyDiscount' || 'removeDiscount') {
				// 	discountList = payload?.discountArray;
				// 	discountTostring();
				// 	discountErr = '';
				// 	totalDiscountActive();
				// 	// subTotal;
				// }

				// if (action == 'removeDiscount') {
				// 	discountList = payload?.discountArray;
				// 	discountTostring();
				// 	// console.log('discountList', discountList);
				// }
				if (payload) {
					notificationContent = "L'ordine è stato inviato. Controlla lo storico nel tuo profilo";
				} else {
					notificationContent =
						"Benvenuto! L'ordine è stato inviato. Tra poco verrai reindirizzato sul tuo profilo.";
					setTimeout(() => {
						goto('/profile-modify');
					}, 6000);
				}
				onCloseModal();
			}
			if (result.type === 'failure') {
				notificationContent = result.data.message;
				notificationError = true;
			}
			if (result.type === 'error') {
				notificationContent = result.error;
				notificationError = true;
			}
			// 'update()' is called by default by use:enhance
			// call 'await update()' if you need to ensure it completes before further client logic.
			clearTimeout(startTimeout);
			closeNotification();
			toastClosed = false;
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>{getCourse.layoutView.title}</title>
</svelte:head>

{#if !getCourse}
	<Loader />
{:else}
	<div class="container mx-auto p-4">
		<div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-xl overflow-hidden">
			<!-- Hero Section -->
			<div class="relative">
				<div class="absolute inset-0 bg-blue-900/20"></div>
				<div class="container mx-auto px-6 py-16 relative z-10">
					<div class="flex flex-col md:flex-row items-center gap-8">
						<!-- Course Image -->
						<div class="w-full md:w-1/3">
							<div
								class="relative rounded-xl overflow-hidden shadow-2xl transform transition-transform hover:scale-105"
							>
								<img
									src={getCourse.layoutView?.urlPic || '/images/placeholder.jpg'}
									alt="course type"
									class="h-80 w-full object-contain"
								/>
								<!-- <div
								class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 to-transparent p-4"
							>
								<div class="badge badge-lg bg-blue-600 text-white p-3 font-bold">
									{getCourse.layoutView.price} €
								</div>
							</div> -->
								<div class="absolute -top-1 -right-1 z-10 opacity-85">
									<div class="relative">
										<div
											class="bg-gradient-to-r from-primary to-primary/80 text-primary-content px-4 py-2 rounded-bl-lg rounded-tr-lg shadow-md"
										>
											<span class="text-xs font-semibold">PREZZO</span>
											<div class="flex items-baseline">
												<span class="text-2xl font-bold">€ {getCourse.layoutView.price}</span>
											</div>
										</div>
										<div
											class="absolute top-0 right-0 w-0 h-0 border-t-8 border-t-primary/80 border-r-8 border-r-transparent transform translate-x-full"
										></div>
									</div>
								</div>
							</div>
						</div>

						<!-- Course Details -->
						<div class="w-full md:w-2/3 space-y-6">
							<div class="flex items-center gap-3">
								<div class="badge badge-lg bg-blue-100 text-blue-800 p-3">
									<Calendar class="w-4 h-4 mr-1" />
									{getCourse.eventStartDate.substring(0, 10)} alle {getCourse.eventStartDate.substring(
										11,
										16
									)}
								</div>
								<div class="badge badge-lg bg-blue-100 text-blue-800 p-3">
									<MapPin class="w-4 h-4 mr-1" />
									{getCourse.county}
								</div>
							</div>

							<h1 class="text-4xl md:text-5xl font-bold text-blue-900 leading-tight">
								{getCourse.layoutView.title}
							</h1>

							<div class="flex items-center gap-4">
								<!-- Instructor Avatar -->
								<div class="avatar">
									<div class="w-24 rounded-full ring ring-blue-500 ring-offset-2">
										{#if picFilter.length > 0}
											<img
												src={`/files/${userData.userId}/${picFilter[0].filename}`}
												alt="avatar"
												loading="lazy"
											/>
										{:else}
											<img src="/images/avatar.png" alt="avatar" loading="lazy" />
										{/if}
									</div>
								</div>
								<div>
									<p class="text-lg font-medium text-blue-800">
										<User class="w-4 h-4 inline mr-1" />
										Riflessologo: {getCourse.name}
										{getCourse.surname}
									</p>
									<p class="text-sm text-blue-600">
										<Users class="w-4 h-4 inline mr-1" />
										Posti disponibili: {getCourse.stockQty}
									</p>
								</div>
							</div>

							<!-- <div class="flex flex-wrap gap-3 mt-4"> -->
							<button class="btn btn-primary gap-2" onclick={() => onClickModal('new', null)}>
								<CreditCard class="w-5 h-5" /> Acquista Ora
							</button>
							<!-- </div> -->
						</div>
					</div>
				</div>
			</div>

			<!-- Main Content -->
			<div class="container mx-auto px-6 py-12">
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<!-- Course Description -->
					<div class="lg:col-span-2">
						<div class="tabs tabs-lift">
							<input
								type="radio"
								name="course_tabs"
								role="tab"
								class="tab text-lg font-medium"
								aria-label="Descrizione"
								checked={true}
							/>
							<div
								role="tabpanel"
								class="tab-content bg-white rounded-b-xl p-6 shadow-md max-w-none"
							>
								<p class="text-lg text-gray-700 leading-relaxed">
									{getCourse.layoutView.descr}
								</p>
								<hr class="my-6" />
								<div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
									<p class="text-blue-800">
										Le attività dell'Associazione sono rivolte esclusivamente agli Associati con la
										quota associativa rinnovata nell'anno corrente.
									</p>
								</div>
								<p class="mt-6">
									Pertanto per qualunque attività è richiesta innanzitutto l'iscrizione e/o il
									rinnovo della Quota ordinaria di € 25,00 Questo da diritto di partecipare alle
									attività gratuite come, per esempio, il CORSO BASE DI AUTOTRATTAMENTO oppure al
									CORSO AVANZATO INTENSIVO DI APPROFONDIMENTO RISERVATI AI SOCI, L'ASSOCIAZIONE NON
									FA ATTIVITA' COMMERCIALI, distribuisce esclusivamente materiale didattico
									necessario ai suoi Associati al fine della pratica della Riflessologia facciale.
								</p>
								<p class="mt-4">
									Per i Soci che desiderano iscriversi a entrambi i corsi Base e Avanzato, è
									richiesto il possesso dei Kit Base e Plus, contenente strumenti e materiali
									didattici indispensabili. Il kit può essere acquistato presso il negozio online
									www.dienchan-online.com (con sede in Vietnam), attività completamente indipendente
									dall'Associazione. Il materiale verrà ritirato dai partecipanti all'inizio del
									corso.
								</p>
							</div>
						</div>

						{#if getCourse.tag.length > 0}
							<div class="mt-8">
								<h3 class="text-xl font-semibold text-gray-800 mb-4">Tag del corso:</h3>
								<div class="flex flex-wrap gap-3">
									{#each getCourse.tag as tag}
										<div
											class="badge badge-lg bg-blue-100 text-blue-800 p-4 font-medium hover:bg-blue-200 transition-colors cursor-pointer"
										>
											{tag}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<!-- Course Info and Extra Info -->
					<div class="lg:col-span-1">
						<div class="bg-white rounded-xl shadow-md p-6 space-y-6">
							<h3 class="text-2xl font-bold text-blue-900 border-b pb-4">Dettagli del Corso</h3>
							<div class="space-y-4">
								<div class="flex items-center gap-3">
									<div>
										<p class="text-sm text-gray-500">ID:{getCourse.prodId}</p>
									</div>
								</div>
								<div class="flex items-center gap-3">
									<div class="bg-blue-100 p-2 rounded-full">
										<Calendar class="w-5 h-5 text-blue-700" />
									</div>
									<div>
										<p class="text-sm text-gray-500">Data e Ora</p>
										<p class="font-medium">
											{getCourse.eventStartDate.substring(0, 10)} alle {getCourse.eventStartDate.substring(
												11,
												16
											)}
										</p>
									</div>
								</div>

								<div class="flex items-center gap-3">
									<div class="bg-blue-100 p-2 rounded-full">
										<MapPin class="w-5 h-5 text-blue-700" />
									</div>
									<div>
										<p class="text-sm text-gray-500">Luogo</p>
										<p class="font-medium">{getCourse.county}</p>
									</div>
								</div>

								<div class="flex items-center gap-3">
									<div class="bg-blue-100 p-2 rounded-full">
										<Users class="w-5 h-5 text-blue-700" />
									</div>
									<div>
										<p class="text-sm text-gray-500">Numero partecipanti</p>
										<p class="font-medium">{getCourse.stockQty}</p>
									</div>
								</div>

								<div class="flex items-center gap-3">
									<div class="bg-blue-100 p-2 rounded-full">
										<Coins class="w-5 h-5 text-blue-700" />
									</div>
									<div>
										<p class="text-sm text-gray-500">Prezzo</p>
										<p class="font-medium text-xl text-blue-900">{getCourse.layoutView.price} €</p>
									</div>
								</div>

								{#if !auth}
									<div class="flex items-center gap-3">
										<div class="bg-blue-100 p-2 rounded-full">
											<Coins class="w-5 h-5 text-blue-700" />
										</div>
										<div>
											<p class="text-sm text-gray-500">Tesseramento per il primo corso</p>
											<p class="font-medium text-xl text-blue-900">+25 €</p>
										</div>
									</div>
								{/if}
							</div>

							{#if getCourse.infoExtra.length > 0}
								<div class="mt-8">
									<div class="collapse collapse-arrow bg-blue-50 rounded-lg">
										<input type="checkbox" checked />
										<div class="collapse-title text-lg font-medium text-blue-800">
											Informazioni Extra
										</div>
										<div class="collapse-content">
											<p class="text-gray-700">{getCourse.infoExtra}</p>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
<Notification {toastClosed} {notificationContent} {notificationError} />

<Modal
	isOpen={openModal}
	header={modalTitle}
	cssClass={'bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'}
>
	<button
		class="btn btn-sm btn-circle absolute right-2 top-2 text-base-content"
		onclick={onCloseModal}>✕</button
	>
	{#if loading}
		<Loader />
	{:else}
		<form method="POST" action={postAction} use:enhance={formSubmit} class="px-6 pb-6">
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
								<div
									class={`h-1 w-full ${i + 1 < currentStep ? 'bg-success' : 'bg-base-200'}`}
								></div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
			<!-- Step 1 -->
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

						<div class="form-control w-full md:col-span-2">
							<label for="Email" class="label">
								<span class="label-text font-medium">Email</span>
							</label>
							<div class="input validator input-bordered flex items-center gap-2 pr-2 w-full">
								<Mail size={18} class="ml-2" />
								<input
									id="Email"
									name="email"
									type="email"
									class=""
									placeholder="esempio@email.com"
									required
									readonly={closedInput}
									bind:value={formData.email}
								/>
							</div>
							<div class="validator-hint hidden">Inserire email valida</div>
						</div>

						{#if !auth}
							<div class="form-control w-full">
								<label for="password" class="label">
									<span class="label-text font-medium">
										Password <span class="text-xs">
											(Almeno 8 caratteri con numeri e lettere)
										</span>
									</span>
								</label>
								<div class="input validator input-bordered flex items-center gap-2 pr-2">
									<Lock size={18} class="ml-2" />
									<input
										class="flex-1 outline-none bg-transparent"
										id="password"
										name="password1"
										type="password"
										placeholder="Inserisci la password"
										aria-label="Password"
										bind:value={formData.password1}
										minlength="8"
										required={!auth}
										onblur={checkPasswordsMatch}
									/>
								</div>
								<div class="validator-hint hidden">Inserire password valida</div>
							</div>

							<div class="form-control w-full">
								<label for="password2" class="label">
									<span class="label-text font-medium">
										Conferma password {#if !passwordsMatch}
											<span class="text-error text-xs"> (non corrispondente) </span>
										{/if}</span
									>
								</label>
								<div class="input validator input-bordered flex items-center gap-2 pr-2">
									<Lock
										size={18}
										class="ml-2"
										color={passwordsMatch ? (formData.password2 ? 'green' : 'currentColor') : 'red'}
									/>
									<input
										class="flex-1 outline-none bg-transparent"
										id="password2"
										name="password2"
										type="password"
										placeholder="Conferma la password"
										bind:value={formData.password2}
										minlength="8"
										required={!auth}
										oninput={checkPasswordsMatch}
									/>
								</div>
								<div class="validator-hint hidden">Inserire password valida</div>
							</div>
						{/if}

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
								readonly={closedInput}
								bind:value={formData.phone}
							/>
						</div>

						<div class="form-control w-full">
							<label for="cellulare" class="label">
								<span class="label-text font-medium">
									Cellulare <span class="text-xs"> (richiesto) </span>
								</span>
							</label>
							<input
								id="cellulare"
								name="mobilePhone"
								type="tel"
								class="input input-bordered w-full"
								placeholder="+39 3331234567"
								required
								readonly={closedInput}
								bind:value={formData.mobilePhone}
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Step 2 -->
			<div class={currentStep === 2 ? 'block' : 'hidden'}>
				<div class="card bg-base-100 shadow-sm border border-base-200 p-4 rounded-lg mt-4">
					<div class="card-title text-lg font-bold mb-4 pb-2 border-b">
						{#if auth}
							<div class="flex justify-between items-center w-full">
								<span>Indirizzo di Fatturazione/Spedizione</span>
								<a href="/profile-modify" class="btn btn-sm btn-outline">Modifica profilo</a>
							</div>
						{:else}
							<span>Indirizzo di Fatturazione/Spedizione</span>
						{/if}
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
								<option value="" disabled selected>Seleziona provincia</option>
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
							{#if closedInput}
								<input type="hidden" name="country" value={formData.country} />
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Step 3 -->
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
							<Landmark class="h-8 w-8 text-primary" />
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
							<HandCoins class="h-8 w-8 text-primary" />
							<span class="text-center font-medium"> Contanti (all'inizio corso) </span>
						</label>
					</div>

					<!-- Summary -->
					<div class="card bg-base-200 p-4 rounded-lg">
						<h3 class="font-bold text-lg mb-2">Riepilogo Ordine</h3>
						<div class="divider my-1"></div>

						<div class="flex justify-between items-center py-2">
							<span class="text-base-content/80">{getCourse.layoutView.title || 'Corso'}</span>
							<span>{getCourse.layoutView.price} €</span>
						</div>
						{#if !auth}
							<div class="flex justify-between items-center py-2">
								<span class="text-base-content/80">Tesseramento per il primo corso</span>
								<span>25 €</span>
							</div>
						{/if}

						<div class="divider my-1"></div>

						<div class="flex justify-between items-center py-2 text-lg font-bold">
							<span>Totale</span>
							{#if !auth}
								<span class="text-primary">{getCourse.layoutView.price + 25} €</span>
								<input type="hidden" name="totalValue" value={getCourse.layoutView.price + 25} />
							{:else}
								<span class="text-primary">{getCourse.layoutView.price} €</span>
								<input type="hidden" name="totalValue" value={getCourse.layoutView.price} />
							{/if}
						</div>
					</div>
				</div>
				<input type="hidden" name="cart" value={JSON.stringify(getCourse)} />
			</div>

			<!-- Navigation -->
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
						<button
							type="button"
							class="btn btn-primary"
							onclick={nextStep}
							disabled={!isCurrentStepValid()}
						>
							Continua
						</button>
					{:else}
						<button type="submit" class="btn btn-success" disabled={!isCurrentStepValid()}>
							Conferma Acquisto
						</button>
					{/if}
				</div>
			</div>
		</form>
	{/if}
</Modal>

<style>
</style>
