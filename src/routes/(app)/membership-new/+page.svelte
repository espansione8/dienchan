<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { page } from '$app/stores';
	import { province, country_list } from '$lib/stores/arrays';
	import {
		Mail,
		User,
		Building2,
		MapPin,
		Globe,
		Phone,
		Smartphone,
		Lock,
		CheckCircle,
		CreditCard,
		Wallet,
		Calendar,
		Users,
		GraduationCap,
		Globe2,
		Clock
	} from 'lucide-svelte';

	const { data, form } = $props();
	//const { userData, auth } = $derived(data);
	//let { form } = $props();
	let auth = $page.data.auth;
	let userData = $page.data.user;

	if (auth) {
		userData.membership.membershipExpiry = userData.membership.membershipExpiry
			.toString()
			.substring(0, 10);
		userData.membership.membershipSignUp = userData.membership.membershipSignUp
			.toString()
			.substring(0, 10);
		userData.membership.membershipActivation = userData.membership.membershipActivation
			.toString()
			.substring(0, 10);
	}

	const testimonials = [
		{
			name: 'Stefania Sica',
			image: '/images/michael-dam-mEZ3PoFGs_k-unsplash.jpg',
			review:
				'Un metodo estremamente valido ed efficace anche per autotrattarsi. Ho seguito i corsi tenuti da Duyen, docente preparatissima e persona eccezionale! Consigliato vivamente!'
		},
		{
			name: 'Federico C',
			image: '/images/michael-dam-mEZ3PoFGs_k-unsplash.jpg',
			review:
				"Per chi fa i corsi della durata di qualche giorno è possibile dormire direttamente sul posto grazie a letti a muro. È presente in bagno e una cucina per poter fare le proprie cose e fare colazione/cucinare all'occorrenza."
		},
		{
			name: 'Moria',
			image: '/images/avatar.png',
			review:
				'Associazione ben organizzata che insegna egregiamente e con passione tecniche utili per il benessere psicofisico.'
		}
	];

	let paymentType = 'bonifico';
	let isModal = false;
	let newExpire = new Date().toISOString().substring(0, 10);
	let currentDialog = '';
	let postAction = '?/renewMembership';
	let modalTitle = '';

	let password1 = '';
	let password2 = '';
	let name = '';
	let surname = '';
	let email = '';
	let address = '';
	let postalCode = '';
	let city = '';
	let countryState = '';
	let country = '';
	let phone = '';
	let mobilePhone = '';
	let checkPass = false;
	let checkSecondPass = false;
	let inputRef = null;
	let membershipLevel = '';

	const testPass = () => {
		checkPass = password1.length >= 8;
		checkSecondPass = password1 === password2;
	};

	const testSecondPass = () => (checkSecondPass = password1 === password2);

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

	const onClickDialog = (type: string) => {
		currentDialog = type;
		isModal = true;

		if (type == 'associate') {
			postAction = `?/newMembership`;
			modalTitle = 'Nuova iscrizione socio ordinario';
			membershipLevel = 'Socio ordinario';
		}
		if (type == 'lifetime') {
			postAction = `?/newLifetime`;
			modalTitle = 'Nuova iscrizione socio vitalizio';
			membershipLevel = 'Socio vitalizio';
		}
		if (type == 'renew') {
			postAction = `?/renewMembership`;
			modalTitle = 'Rinnovo iscrizione';
			const nextYear = new Date(newExpire);
			nextYear.setFullYear(nextYear.getFullYear() + 1);
			newExpire = nextYear.toISOString().substring(0, 10);
		}
	};

	$effect(() => {
		if (form != null) {
			invalidateAll();
			const { action, success, message } = form;
			if (success) {
				fieldReset();
				isModal = false;
			} else {
				notificationError = true;
			}
			closeNotification();
			toastClosed = false;
			notificationContent = message;
		}
	});

	// notification
	let toastClosed: boolean = true;
	let notificationContent: string = '';
	let notificationError: boolean = false;
	let startTimeout: any;

	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 3000);
	};
</script>

<svelte:head>
	<title>Diventa socio Diện Chẩn</title>
	<meta
		name="description"
		content="Diventa socio dell'associazione Diện Chẩn e accedi a tutti i vantaggi"
	/>
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-b from-blue-50 to-teal-50 py-16 px-4 md:py-24">
	<div class="container mx-auto">
		<div class="flex flex-col md:flex-row items-center justify-between gap-8">
			<div class="md:w-1/2">
				<h1 class="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Diventa socio Diện Chẩn®</h1>
				<p class="text-lg text-blue-800 mb-8">
					Unisciti alla nostra comunità di professionisti del benessere e accedi a risorse
					esclusive, formazione continua e supporto professionale.
				</p>
				<div class="flex flex-wrap gap-4">
					{#if !auth}
						<button class="btn btn-primary btn-lg" onclick={() => onClickDialog('associate')}>
							Diventa Socio
						</button>
					{:else if userData?.membership?.membershipLevel != 'Socio vitalizio'}
						<button class="btn btn-primary btn-lg" onclick={() => onClickDialog('renew')}>
							Rinnova Iscrizione
						</button>
					{/if}
				</div>
			</div>
			<div class="md:w-1/2">
				<img
					src="/images/riflessologo_dienchan.jpg"
					alt="Riflessologo Diện Chẩn"
					class="rounded-lg shadow-xl max-w-full h-auto"
				/>
			</div>
		</div>
	</div>
</section>

<!-- Benefits Section -->
<section class="py-16 px-4 bg-white">
	<div class="container mx-auto">
		<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">
			Vantaggi dell'Associazione
		</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<div class="flex items-start gap-4">
					<div class="bg-blue-100 p-3 rounded-full">
						<CheckCircle class="text-blue-600 h-6 w-6" />
					</div>
					<div>
						<h3 class="font-semibold text-lg text-blue-900 mb-2">Mappatura Punti Online</h3>
						<p class="text-blue-800">
							Accedi al servizio di mappatura punti online e disegna schemi personalizzati per i
							tuoi trattamenti.
						</p>
					</div>
				</div>
			</div>

			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<div class="flex items-start gap-4">
					<div class="bg-blue-100 p-3 rounded-full">
						<CheckCircle class="text-blue-600 h-6 w-6" />
					</div>
					<div>
						<h3 class="font-semibold text-lg text-blue-900 mb-2">Video Corso Base</h3>
						<p class="text-blue-800">
							Accedi gratuitamente ai video del corso base registrato da My Le dopo aver frequentato
							il corso con uno dei nostri riflessologi.
						</p>
					</div>
				</div>
			</div>

			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<div class="flex items-start gap-4">
					<div class="bg-blue-100 p-3 rounded-full">
						<CheckCircle class="text-blue-600 h-6 w-6" />
					</div>
					<div>
						<h3 class="font-semibold text-lg text-blue-900 mb-2">Sconti Esclusivi</h3>
						<p class="text-blue-800">
							Acquista strumenti e materiale didattico con lo sconto del 10% grazie al codice
							fornito dal tuo riflessologo.
						</p>
					</div>
				</div>
			</div>

			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<div class="flex items-start gap-4">
					<div class="bg-blue-100 p-3 rounded-full">
						<CheckCircle class="text-blue-600 h-6 w-6" />
					</div>
					<div>
						<h3 class="font-semibold text-lg text-blue-900 mb-2">Incontri Online</h3>
						<p class="text-blue-800">
							Partecipa agli incontri in diretta online organizzati annualmente con il nostro
							professore Bui Quoc Chau.
						</p>
					</div>
				</div>
			</div>

			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<div class="flex items-start gap-4">
					<div class="bg-blue-100 p-3 rounded-full">
						<CheckCircle class="text-blue-600 h-6 w-6" />
					</div>
					<div>
						<h3 class="font-semibold text-lg text-blue-900 mb-2">Pratica e Aggiornamento</h3>
						<p class="text-blue-800">
							Frequenta incontri di pratica o di aggiornamento organizzati dal tuo riflessologo di
							riferimento.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Membership Options -->
<section class="py-16 px-4 bg-gradient-to-b from-teal-50 to-blue-50">
	<div class="container mx-auto">
		<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">
			Scegli il Tuo Piano di Associazione
		</h2>

		<div class="flex flex-col md:flex-row justify-center gap-8">
			{#if userData?.membership?.membershipLevel != 'Socio vitalizio'}
				<div
					class="bg-white rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-2xl w-full md:w-96"
				>
					<div class="bg-blue-600 p-4 text-white text-center">
						<h3 class="text-xl font-bold">SOCIO ORDINARIO</h3>
					</div>
					<div class="p-6">
						<div class="text-center mb-6">
							<p class="text-4xl font-bold text-blue-900">
								25€ <span class="text-xl text-blue-700">annuali</span>
							</p>
						</div>

						<div class="flex justify-center mb-6">
							<img
								src="/images/card-1.jpg"
								alt="Socio Ordinario"
								class="h-40 w-40 rounded-full object-cover border-4 border-blue-100"
							/>
						</div>

						<ul class="mb-8 space-y-3">
							<li class="flex items-center">
								<CheckCircle class="text-blue-600 h-4 w-4 mr-2" />
								<span>Accesso a tutti i vantaggi</span>
							</li>
							<li class="flex items-center">
								<CheckCircle class="text-blue-600 h-4 w-4 mr-2" />
								<span>Rinnovo annuale</span>
							</li>
						</ul>

						{#if !auth}
							<button class="btn btn-primary w-full" onclick={() => onClickDialog('associate')}>
								Associati Ora
							</button>
						{:else}
							<button class="btn btn-primary w-full" onclick={() => onClickDialog('renew')}>
								Rinnova Iscrizione
							</button>
						{/if}
					</div>
				</div>
			{/if}

			<div
				class="bg-white rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-2xl w-full md:w-96 relative"
			>
				<div class="bg-yellow-500 p-4 text-white text-center">
					<h3 class="text-xl font-bold">
						SOCIO VITALIZIO
						{#if userData?.membership?.membershipLevel != 'Socio vitalizio'}
							<div class="badge badge-warning text-white px-4 py-1 rounded-bl-lg font-semibold">
								Consigliato
							</div>
						{/if}
					</h3>
				</div>
				<div class="p-6">
					<div class="text-center mb-6">
						<p class="text-4xl font-bold text-blue-900">
							390€ <span class="text-xl text-blue-700">una tantum</span>
						</p>
					</div>

					<div class="flex justify-center mb-6">
						<img
							src="/images/card-2.jpg"
							alt="Socio Vitalizio"
							class="h-40 w-40 rounded-full object-cover border-4 border-yellow-100"
						/>
					</div>

					<ul class="mb-8 space-y-3">
						<li class="flex items-center">
							<CheckCircle class="text-yellow-500 h-4 w-4 mr-2" />
							<span>Accesso a tutti i vantaggi</span>
						</li>
						<li class="flex items-center">
							<CheckCircle class="text-yellow-500 h-4 w-4 mr-2" />
							<span>Nessun rinnovo necessario</span>
						</li>
						<li class="flex items-center">
							<CheckCircle class="text-yellow-500 h-4 w-4 mr-2" />
							<span>Supporto prioritario</span>
						</li>
						<li class="flex items-center">
							<CheckCircle class="text-yellow-500 h-4 w-4 mr-2" />
							<span>Accesso a vita</span>
						</li>
					</ul>

					{#if userData?.membership?.membershipLevel != 'Socio vitalizio'}
						<button
							class="btn bg-yellow-500 hover:bg-yellow-600 text-white w-full"
							onclick={() => onClickDialog('lifetime')}
						>
							Diventa Socio Vitalizio
						</button>
					{:else}
						<div class="bg-green-100 p-3 rounded-lg text-center text-green-800">
							<p>Sei già un Socio Vitalizio</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Testimonials Section -->
<section class="py-16 px-4 bg-white">
	<div class="container mx-auto">
		<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-4">
			Le parole dei nostri associati
		</h2>
		<p class="text-lg text-center text-blue-700 mb-12">
			Scopri cosa pensano di noi i nostri clienti
		</p>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each testimonials as testimonial}
				<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
					<div class="flex items-center mb-4">
						<img
							src={testimonial.image || '/placeholder.svg'}
							alt={testimonial.name}
							class="w-12 h-12 rounded-full object-cover mr-4"
						/>
						<h4 class="font-semibold text-lg text-blue-900">{testimonial.name}</h4>
					</div>
					<p class="text-blue-800 italic">"{testimonial.review}"</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="py-16 px-4 bg-gradient-to-b from-blue-50 to-teal-50">
	<div class="container mx-auto">
		<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">I nostri numeri</h2>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
			<div class="bg-white rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
				<div
					class="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
				>
					<Calendar class="text-blue-600 h-8 w-8" />
				</div>
				<h3 class="text-4xl font-bold text-blue-900 mb-2">2,000+</h3>
				<p class="text-blue-700">Lezioni svolte</p>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
				<div
					class="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
				>
					<Users class="text-blue-600 h-8 w-8" />
				</div>
				<h3 class="text-4xl font-bold text-blue-900 mb-2">360+</h3>
				<p class="text-blue-700">Riflessologi istruiti</p>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
				<div
					class="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
				>
					<Globe2 class="text-blue-600 h-8 w-8" />
				</div>
				<h3 class="text-4xl font-bold text-blue-900 mb-2">40+</h3>
				<p class="text-blue-700">Paesi di diffusione</p>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
				<div
					class="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
				>
					<Clock class="text-blue-600 h-8 w-8" />
				</div>
				<h3 class="text-4xl font-bold text-blue-900 mb-2">12+</h3>
				<p class="text-blue-700">Anni di esperienza</p>
			</div>
		</div>
	</div>
</section>

<!-- FAQ Section -->
<section class="py-16 px-4 bg-white">
	<div class="container mx-auto">
		<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">
			Domande frequenti
		</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<h3 class="font-semibold text-lg text-blue-900 mb-3">Come divento socio?</h3>
				<p class="text-blue-800">
					In questa pagina "Quote associative" è possibile iscriversi come socio ordinario premendo
					il pulsante "Associati" per 25 euro all\'anno oppure come socio vitalizio premendo il
					pulsante "Associati a vita" per un singolo pagamento di 390€.
				</p>
			</div>

			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<h3 class="font-semibold text-lg text-blue-900 mb-3">
					Cosa succede se come socio ordinario non rinnovo l\'iscrizione in tempo?
				</h3>
				<p class="text-blue-800">
					Se l\'iscrizione a socio ordinario non viene rinnovato entro un anno dalla prima
					associazione o dall\'ultimo rinnovo i privilegi da socio decadono.
				</p>
			</div>

			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<h3 class="font-semibold text-lg text-blue-900 mb-3">
					Quali sono le differenze tra un socio ordinario e un socio vitalizio?
				</h3>
				<p class="text-blue-800">
					Il socio ordinario e il socio vitalizio godono degli stessi privilegi e accessi. L\'unica
					differenza risiede nel pagamento. Al socio ordinario sarà richiesto di rinnovare
					manualmente l\'abbonamento di 25 euro ogni anno, con il rischio di perdita dei privilegi
					in caso di mancato rinnovo. Al contrario al socio vitalizio sarà necessario pagare
					solamente una volta l\'acconto di 390 euro per rimanere associato a vita, senza alcun
					bisogno di rinnovamento.
				</p>
			</div>

			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<h3 class="font-semibold text-lg text-blue-900 mb-3">
					Posso diventare socio vitalizio se sono già socio ordinario?
				</h3>
				<p class="text-blue-800">
					Come socio ordinario è possibile diventare soci vitalizi in qualsiasi momento premendo il
					pulsante "Associati a vita" e procedendo con il pagamento.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Notification Component -->
<Notification {toastClosed} {notificationContent} {notificationError} />

<!-- Modal for Registration/Renewal -->
<Modal isOpen={isModal} header={modalTitle} headerBg="bg-primary" footer="" footerColor="">
	<button
		class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white"
		onclick={() => (isModal = false)}
	>
		✕
	</button>

	<div class="p-4">
		<form method="POST" action={postAction} use:enhance class="space-y-6">
			{#if !auth}
				<div class="bg-blue-50 p-4 rounded-lg mb-6">
					<h3 class="font-semibold text-lg text-blue-900 mb-4">Informazioni Personali</h3>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Nome -->
						<div class="form-control">
							<label for="nome" class="label">
								<span class="label-text font-medium">Nome</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<User size={18} class="text-gray-500" />
								<input
									id="nome"
									name="name"
									type="text"
									class="flex-1 bg-transparent outline-none"
									placeholder="Inserisci il tuo nome"
									bind:value={name}
									required
								/>
							</div>
						</div>

						<!-- Cognome -->
						<div class="form-control">
							<label for="cognome" class="label">
								<span class="label-text font-medium">Cognome</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<User size={18} class="text-gray-500" />
								<input
									id="cognome"
									name="surname"
									type="text"
									class="flex-1 bg-transparent outline-none"
									placeholder="Inserisci il tuo cognome"
									bind:value={surname}
									required
								/>
							</div>
						</div>

						<!-- Email -->
						<div class="form-control md:col-span-2">
							<label for="email" class="label">
								<span class="label-text font-medium">Email</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<Mail size={18} class="text-gray-500" />
								<input
									id="email"
									name="email"
									type="email"
									class="flex-1 bg-transparent outline-none"
									placeholder="Inserisci la tua email"
									bind:value={email}
									required
								/>
							</div>
						</div>
					</div>
				</div>

				<div class="bg-blue-50 p-4 rounded-lg mb-6">
					<h3 class="font-semibold text-lg text-blue-900 mb-4">Indirizzo</h3>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Indirizzo -->
						<div class="form-control md:col-span-2">
							<label for="indirizzo" class="label">
								<span class="label-text font-medium">Indirizzo</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<MapPin size={18} class="text-gray-500" />
								<input
									id="indirizzo"
									name="address"
									type="text"
									class="flex-1 bg-transparent outline-none"
									placeholder="Via/Piazza e numero civico"
									bind:value={address}
									required
								/>
							</div>
						</div>

						<!-- CAP -->
						<div class="form-control">
							<label for="cap" class="label">
								<span class="label-text font-medium">CAP</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<MapPin size={18} class="text-gray-500" />
								<input
									id="cap"
									name="postalCode"
									type="text"
									class="flex-1 bg-transparent outline-none"
									placeholder="Codice postale"
									bind:value={postalCode}
									required
								/>
							</div>
						</div>

						<!-- Città -->
						<div class="form-control">
							<label for="citta" class="label">
								<span class="label-text font-medium">Città</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<Building2 size={18} class="text-gray-500" />
								<input
									id="citta"
									name="city"
									type="text"
									class="flex-1 bg-transparent outline-none"
									placeholder="Inserisci la città"
									bind:value={city}
									required
								/>
							</div>
						</div>

						<!-- Provincia -->
						<div class="form-control">
							<label for="provincia" class="label">
								<span class="label-text font-medium">Provincia</span>
							</label>
							<select
								id="provincia"
								name="countryState"
								class="select select-bordered w-full"
								bind:value={countryState}
								required
							>
								<option value="" disabled selected>Seleziona provincia</option>
								{#each $province as provincia}
									<option value={provincia.title}>
										{provincia.title} ({provincia.code})
									</option>
								{/each}
							</select>
						</div>

						<!-- Nazione -->
						<div class="form-control">
							<label for="nazione" class="label">
								<span class="label-text font-medium">Nazione</span>
							</label>
							<select
								id="nazione"
								name="country"
								class="select select-bordered w-full"
								bind:value={country}
								required
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

				<div class="bg-blue-50 p-4 rounded-lg mb-6">
					<h3 class="font-semibold text-lg text-blue-900 mb-4">Contatti</h3>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Telefono -->
						<div class="form-control">
							<label for="telefono" class="label">
								<span class="label-text font-medium">Telefono</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<Phone size={18} class="text-gray-500" />
								<input
									id="telefono"
									name="phone"
									type="tel"
									class="flex-1 bg-transparent outline-none"
									placeholder="Numero di telefono"
									bind:value={phone}
								/>
							</div>
						</div>

						<!-- Cellulare -->
						<div class="form-control">
							<label for="cellulare" class="label">
								<span class="label-text font-medium">Cellulare</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<Smartphone size={18} class="text-gray-500" />
								<input
									id="cellulare"
									name="mobilePhone"
									type="tel"
									class="flex-1 bg-transparent outline-none"
									placeholder="Numero di cellulare"
									bind:value={mobilePhone}
								/>
							</div>
						</div>
					</div>
				</div>

				<div class="bg-blue-50 p-4 rounded-lg mb-6">
					<h3 class="font-semibold text-lg text-blue-900 mb-4">Password</h3>

					<div class="grid grid-cols-1 gap-4">
						<!-- Password -->
						<div class="form-control">
							<label for="password" class="label">
								<div class="flex flex-col">
									<span class="label-text font-medium">Password</span>
									<span class="text-xs text-gray-500">Almeno 8 caratteri con numeri e lettere</span>
								</div>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<Lock size={18} color={checkPass ? 'green' : 'gray'} />
								<input
									id="password"
									name="password1"
									type="password"
									class="flex-1 bg-transparent outline-none"
									placeholder="Crea una password"
									bind:value={password1}
									oninput={testPass}
									required
								/>
							</div>
						</div>

						<!-- Conferma Password -->
						<div class="form-control">
							<label for="password2" class="label">
								<span class="label-text font-medium">Conferma Password</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<Lock size={18} color={checkSecondPass && checkPass ? 'green' : 'gray'} />
								<input
									id="password2"
									type="password"
									class="flex-1 bg-transparent outline-none"
									placeholder="Conferma la password"
									bind:value={password2}
									oninput={testSecondPass}
									bind:this={inputRef}
									required
								/>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="bg-blue-50 p-4 rounded-lg">
				<h3 class="font-semibold text-lg text-blue-900 mb-4">Riepilogo e Pagamento</h3>

				{#if auth}
					<div class="mb-4">
						<p class="font-medium">
							Attuale livello associazione: <span class="text-blue-700"
								>{userData?.membership?.membershipLevel}</span
							>
						</p>

						{#if currentDialog == 'renew'}
							<div class="mt-2 space-y-1">
								<p class="font-medium">
									Attuale data di scadenza:
									<span class="text-red-500">{userData.membership.membershipExpiry}</span>
								</p>
								<p class="font-medium">
									Futura data di scadenza:
									<span class="text-green-600">{newExpire}</span>
								</p>
							</div>
						{/if}
					</div>
				{/if}

				<div class="bg-white p-4 rounded-lg mb-6">
					<div class="flex justify-between items-center">
						<span class="font-medium">Totale da pagare:</span>
						<span class="text-xl font-bold text-blue-900">
							{#if currentDialog == 'associate' || currentDialog == 'renew'}
								25€
							{:else if currentDialog == 'lifetime'}
								390€
							{/if}
						</span>
					</div>
				</div>

				<div class="space-y-3">
					<h4 class="font-medium">Scegli il metodo di pagamento:</h4>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
						<label
							class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
							class:bg-blue-100={paymentType === 'bonifico'}
						>
							<input
								type="radio"
								name="radio-paymentType"
								class="radio radio-primary"
								bind:group={paymentType}
								value={'bonifico'}
							/>
							<div>
								<CreditCard size={18} class="inline-block mr-2" />
								<span>Bonifico</span>
								<p class="text-xs text-gray-500">IBAN: 1548416800005462</p>
							</div>
						</label>

						<label
							class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
							class:bg-blue-100={paymentType === 'paypal'}
						>
							<input
								type="radio"
								name="radio-paymentType"
								class="radio radio-primary"
								bind:group={paymentType}
								value={'paypal'}
							/>
							<div>
								<Wallet size={18} class="inline-block mr-2" />
								<span>PayPal</span>
							</div>
						</label>

						<label
							class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
							class:bg-blue-100={paymentType === 'contanti'}
						>
							<input
								type="radio"
								name="radio-paymentType"
								class="radio radio-primary"
								bind:group={paymentType}
								value={'contanti'}
							/>
							<div>
								<CreditCard size={18} class="inline-block mr-2" />
								<span>Contanti</span>
								<p class="text-xs text-gray-500">All\'inizio corso</p>
							</div>
						</label>
					</div>

					<input type="hidden" name="membershipLevel" value={membershipLevel} />
				</div>
			</div>

			<div class="flex justify-end gap-3 mt-6">
				<button type="button" class="btn btn-outline" onclick={() => (isModal = false)}>
					Annulla
				</button>
				<button type="submit" class="btn btn-primary"> Conferma </button>
			</div>
		</form>
	</div>
</Modal>
