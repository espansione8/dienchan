<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import Notification from '$lib/components/Notification.svelte';
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
		Check
	} from 'lucide-svelte';

	let { data, form } = $props();
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
		paymentType: 'bank-transfer',
		password1: '',
		password2: ''
	});
	// Modal
	let openModal = $state(false);
	let postAction = $state('?/');
	let modalTitle = $state('');
	//let currentModal = $state('');

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
		//currentModal = '';
		//resetFields();
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
				//currentModal = '';
				formData.name = userData.name;
				formData.surname = userData.surname;
				formData.email = userData.email;
				formData.address = userData.address;
				formData.city = userData.city;
				formData.county = userData.county;
				formData.postalCode = userData.postalCode;
				formData.country = userData.country;
				formData.phone = userData.phone;
				formData.mobilePhone = userData.mobilePhone;
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
			} else {
				notificationError = true;
				// discountErr = message;
				// discountCode = '';
			}
			//resetFields();
			clearTimeout(startTimeout);
			closeNotification();
			toastClosed = false;
			notificationContent = message;
			form = null; // reset form
			//totalCart();
		}
	}); // end effect
</script>

<svelte:head>
	<title>{getCourse.layoutView.title}</title>
</svelte:head>

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
						<div role="tabpanel" class="tab-content bg-white rounded-b-xl p-6 shadow-md max-w-none">
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
								Pertanto per qualunque attività è richiesta innanzitutto l'iscrizione e/o il rinnovo
								della Quota ordinaria di € 25,00 Questo da diritto di partecipare alle attività
								gratuite come, per esempio, il CORSO BASE DI AUTOTRATTAMENTO oppure al CORSO
								AVANZATO INTENSIVO DI APPROFONDIMENTO RISERVATI AI SOCI, L'ASSOCIAZIONE NON FA
								ATTIVITA' COMMERCIALI, distribuisce esclusivamente materiale didattico necessario ai
								suoi Associati al fine della pratica della Riflessologia facciale.
							</p>
							<p class="mt-4">
								Per i Soci che desiderano iscriversi a entrambi i corsi Base e Avanzato, è richiesto
								il possesso dei Kit Base e Plus, contenente strumenti e materiali didattici
								indispensabili. Il kit può essere acquistato presso il negozio online
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

<Notification {toastClosed} {notificationContent} {notificationError} />

<Modal isOpen={openModal} header={modalTitle}>
	<button
		class="btn btn-sm btn-circle absolute right-2 top-2 text-base-content"
		onclick={onCloseModal}>✕</button
	>

	<form method="POST" action={postAction} use:enhance class="p-4 space-y-6">
		<div class="card bg-base-100 shadow-sm border border-base-200 rounded-lg overflow-hidden">
			<div class="bg-primary/10 px-4 py-3 border-b border-base-200">
				<div class="flex justify-between items-center">
					{#if auth}
						<h3 class="font-bold text-lg">Dati di spedizione</h3>
						<a href="/profile-modify" class="btn btn-sm btn-outline">Modifica profilo</a>
					{:else}
						<h3 class="font-bold text-lg">Prima iscrizione</h3>
					{/if}
				</div>
			</div>

			<div class="p-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="Name" class="label">
							<span class="label-text font-medium">Nome</span>
						</label>
						<input
							id="Name"
							name="name"
							type="text"
							class="input"
							placeholder="Inserisci il tuo nome"
							required
							readonly={closedInput}
							bind:value={formData.name}
						/>
					</div>

					<div>
						<label for="Surname" class="label">
							<span class="label-text font-medium">Cognome</span>
						</label>
						<input
							id="Surname"
							name="surname"
							type="text"
							class="input"
							placeholder="Inserisci il tuo cognome"
							required
							readonly={closedInput}
							bind:value={formData.surname}
						/>
					</div>

					<div class="md:col-span-2">
						<span class="label-text font-medium">Email (per login)</span>
						<label for="Email" class="input validator">
							<Mail />
							<input
								id="Email"
								name="email"
								type="email"
								placeholder="esempio@email.com"
								required
								readonly={closedInput}
								bind:value={formData.email}
							/>
						</label>
						<div class="validator-hint hidden">Inserire email valida</div>
					</div>

					{#if !auth}
						<div class="md:col-span-2">
							<span class="label-text font-medium">
								Password
								<span class="text-xs"> (Almeno 8 caratteri con numeri e lettere) </span>
							</span>
							<label for="password" class="input validator">
								<Lock />
								<input
									id="password"
									type="password"
									name="password1"
									placeholder="Inserisci la password"
									aria-label="Password"
									bind:value={formData.password1}
									minlength="8"
									required={!auth}
								/>
							</label>
							<div class="validator-hint hidden">Inserire password valida</div>
						</div>

						<div class="md:col-span-2">
							<span class="label-text font-medium">Conferma password</span>
							<label for="password2" class="input validator">
								<Lock />
								<input
									id="password2"
									type="password"
									name="password2"
									placeholder="Conferma la password"
									bind:value={formData.password2}
									minlength="8"
									required={!auth}
								/>
							</label>
							<div class="validator-hint hidden">Inserire password valida</div>
						</div>
					{/if}
				</div>

				<div class="divider my-4">Indirizzo</div>

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

					<div>
						<label for="telefono" class="label">
							<span class="font-medium">Telefono</span>
						</label>
						<input
							id="telefono"
							name="phone"
							type="text"
							class="input"
							placeholder="+39 01234567"
							required
							readonly={closedInput}
							bind:value={formData.phone}
						/>
					</div>

					<div>
						<label for="cellulare" class="label">
							<span class="font-medium">Cellulare</span>
						</label>
						<input
							id="cellulare"
							name="mobilePhone"
							type="text"
							class="input"
							placeholder="+39 3331234567"
							readonly={closedInput}
							bind:value={formData.mobilePhone}
						/>
					</div>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-sm border border-base-200 rounded-lg overflow-hidden">
			<div class="bg-primary/10 px-4 py-3 border-b border-base-200">
				<h3 class="font-bold text-lg">Metodo di Pagamento</h3>
			</div>

			<div class="p-4">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
					<label
						class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4"
						class:border-primary={formData.paymentType === 'credit-card'}
						class:bg-base-200={formData.paymentType === 'credit-card'}
					>
						<div class="flex flex-col items-center justify-center gap-2">
							<input
								type="radio"
								name="payment"
								value="credit-card"
								class="hidden"
								bind:group={formData.paymentType}
							/>
							<CreditCard class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Carta di Credito / Paypal</span>
						</div>
					</label>

					<label
						class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4"
						class:border-primary={formData.paymentType === 'bank-transfer'}
						class:bg-base-200={formData.paymentType === 'bank-transfer'}
					>
						<div class="flex flex-col items-center justify-center gap-2">
							<input
								type="radio"
								name="payment"
								value="bank-transfer"
								class="hidden"
								bind:group={formData.paymentType}
							/>
							<Landmark class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Bonifico Bancario</span>
						</div>
					</label>

					<label
						class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4"
						class:border-primary={formData.paymentType === 'cash'}
						class:bg-base-200={formData.paymentType === 'cash'}
					>
						<div class="flex flex-col items-center justify-center gap-2">
							<input
								type="radio"
								name="payment"
								value="cash"
								class="hidden"
								bind:group={formData.paymentType}
							/>
							<HandCoins class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Contanti (all'inizio corso)</span>
						</div>
					</label>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-sm border border-base-200 rounded-lg overflow-hidden">
			<div class="bg-primary/10 px-4 py-3 border-b border-base-200">
				<h3 class="font-bold text-lg">Riepilogo Ordine</h3>
			</div>

			<div class="p-4">
				<div class="flex justify-between items-center py-2">
					<span class="text-base-content/80">{getCourse.layoutView.title || 'Corso'}</span>
					<span>{getCourse.layoutView.price} €</span>
				</div>
				{#if !auth}
					<div class="flex justify-between items-center py-2">
						<span class="text-base-content/80">'Tesseramento per il primo corso'</span>
						<span>25 €</span>
					</div>
				{/if}

				<div class="divider my-1"></div>

				<div class="flex justify-between items-center py-2 text-lg font-bold">
					<span>Totale</span>
					{#if !auth}
						<span class="text-primary">{getCourse.layoutView.price + 25} €</span>
					{:else}
						<span class="text-primary">{getCourse.layoutView.price} €</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex justify-end gap-3 mt-6">
			<button class="btn btn-outline btn-error" type="button" onclick={onCloseModal}>
				Annulla
			</button>
			<button class="btn btn-primary" type="submit"> Conferma Acquisto </button>
		</div>
	</form>
</Modal>

<style>
</style>
