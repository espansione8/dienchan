<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { Image } from '@unpic/svelte';
	import type { CartItem } from '$lib/types';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { notification } from '$lib/stores/notifications';
	import Loader from '$lib/components/Loader.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { province, country_list } from '$lib/stores/arrays';
	import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
	import {
		Mail,
		Landmark,
		Building2,
		MapPin,
		Globe,
		Phone,
		Smartphone,
		Lock,
		CheckCircle,
		CreditCard,
		ArrowLeft,
		Calendar,
		Users,
		Clock
	} from 'lucide-svelte';

	const { data } = $props();
	const { userData, auth, getMembership, stripePublishableKey } = data;
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
			review: 'Associazione ben organizzata che insegna egregiamente e con passione tecniche utili per il benessere psicofisico.'
		}
	];

	// Stripe state
	let stripe: Stripe | null = $state(null);
	let elements: StripeElements | null = $state(null);
	let cardElement: any;
	let stripeError = $state<string | null>(null);
	let paymentMethodId = $state<string | null>(null);

	let cartItem: CartItem = $state();
	let closedInput = $state(false);
	if (auth) {
		closedInput = true;
	}

	// form
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
		payment: 'Carta di credito',
		membershipLevel: ''
	});
	let password1: string = $state('');
	let password2: string = $state('');

	// Modal
	let openModal = $state(false);
	let postAction = $state('?/');
	let modalTitle = $state('');
	let currentModal = $state('');
	let loading = $state(false);

	// Modal step
	let currentStep = $state(1);
	let totalSteps = $state(3);
	let passwordsMatch = $state(true);

	const initializeStripe = async () => {
		loading = true;
		if (!stripePublishableKey) {
			stripeError = 'La chiave pubblica di Stripe non è disponibile.';
			loading = false;
			return;
		}

		try {
			if (!stripe) {
				stripe = await loadStripe(stripePublishableKey);
			}

			if (stripe) {
				if (!elements) {
					elements = stripe.elements();
				}
				cardElement = elements.create('card', {
					hidePostalCode: true,
					style: {
						base: {
							fontSize: '16px',
							color: '#424770',
							'::placeholder': {
								color: '#aab7c4'
							}
						},
						invalid: {
							color: '#9e2146'
						}
					}
				});

				// IMPORTANT: element DOM must be in the HTML
				const cardElementContainer = document.getElementById('card-element');
				if (cardElementContainer) {
					cardElement.mount(cardElementContainer);
					stripeError = null;
					//console.log('Stripe Card Element montato con successo.');
				} else {
					console.error("ERRORE: Elemento '#card-element' non trovato nel DOM per il montaggio di Stripe.");
					stripeError = "Si è verificato un errore durante l'inizializzazione del pagamento. Riprova.";
				}
			} else {
				stripeError = 'Impossibile caricare Stripe. Riprova più tardi.';
			}
			loading = false;
		} catch (e: any) {
			console.error("Errore durante l'inizializzazione di Stripe:", e);
			stripeError = `Errore di inizializzazione: ${e.message || 'Errore sconosciuto'}`;
			loading = false;
		}
	};

	const getStripeId = async () => {
		if (formData.payment === 'Carta di credito' && currentStep === totalSteps) {
			stripeError = null;

			if (!stripe || !elements || !cardElement) {
				stripeError = 'Stripe non è stato inizializzato correttamente. Riprova.';
				notification.error(stripeError);
				loading = false;
			}

			// get PaymentMethod  Stripe.js
			const { paymentMethod, error } = await stripe.createPaymentMethod({
				type: 'card',
				card: cardElement,
				billing_details: {
					name: `${formData.name} ${formData.surname}`,
					email: formData.email,
					phone: formData.phone,
					address: {
						city: formData.city,
						country: formData.country === 'Italy' ? 'IT' : formData.country,
						line1: formData.address,
						postal_code: formData.postalCode,
						state: formData.county
					}
				}
			});

			if (error) {
				stripeError = error.message;
				notification.error(stripeError);
				console.error('Stripe.js error:', error);
				loading = false;
			}

			if (paymentMethod) {
				paymentMethodId = paymentMethod.id;
				//alert(`paymentMethodId created: ${paymentMethod.id}`);
			} else {
				// Edge case: no error but also no paymentMethod (shouldn't happen with Stripe API)
				stripeError = 'Impossibile creare il metodo di pagamento. Riprova.';
				notification.error(stripeError);
				loading = false;
			}
		}
	};

	const checkMembership = (title: string) => {
		return getMembership.filter((item) => item.title === title)[0];
	};

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
		formData.payment = 'Carta di credito';
		formData.membershipLevel = '';
		password1 = '';
		password2 = '';
		if (cardElement) {
			cardElement.destroy();
			cardElement = null;
			elements = null;
			stripe = null;
			stripeError = null;
			paymentMethodId = null;
		}
	};

	const checkPasswordsMatch = () => {
		if (!auth && password1 && password2) {
			passwordsMatch = password1 === password2;
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
			if (!password1 || !password2 || password1.length < 8) {
				return false;
			}
			if (password1 !== password2) {
				return false;
			}
		}

		return true;
	};

	const isStep2Valid = () => {
		return !!(formData.address && formData.city && formData.postalCode && formData.county && formData.country);
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
		currentModal = type;
		openModal = true;
		initializeStripe();
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Tesseramento';
			cartItem = checkMembership(item);
			formData.membershipLevel = item;
		}
		if (type == 'renew') {
			postAction = `?/renew`;
			modalTitle = 'Rinnovo Tessera';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		currentModal = '';
		currentStep = 1;
	};

	const formSubmit = () => {
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {

			await invalidateAll();
			//console.log('formData', formData);
			if (result.type === 'success' && result.data) {
				const { action, message, payload } = result.data; // { action, success, message, payload }

				if (action === 'new') {
					if (payload.redirect) {
						setTimeout(() => {
							goto('/profile-modify');
						}, 4000);
					}
				}

				notification.info(message);
				onCloseModal();
			}
			if (result.type === 'failure') {
				notification.error(result.data.message || 'Errore carrello');
				onCloseModal();
			}
			if (result.type === 'error') {
				notification.error(result.error.message || 'Errore Server');
				onCloseModal();
			}
			// if (result.type === 'redirect') {
			// emptyCart();
			// await applyAction(result);
			// }
			// 'update()' is called by default by use:enhance
			// call 'await update()' if you need to ensure it completes before further client logic.
			resetFields();
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>Diventa socio Diện Chẩn</title>
	<meta name="description" content="Diventa socio dell'associazione Diện Chẩn e accedi a tutti i vantaggi" />
</svelte:head>

<noscript>
	<h1 style="font-weight:700; text-align: center;">Please enable Javascript to continue.</h1>
	<style type="text/css">
		#main-content {
			display: none;
		}
	</style>
</noscript>

<!-- Hero Section -->
<section class="bg-gradient-to-b from-blue-50 to-teal-50 py-16 px-4 md:py-24">
	<div class="container mx-auto">
		<div class="flex flex-col md:flex-row items-center justify-between gap-8">
			<div class="md:w-1/2">
				<h1 class="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Diventa socio Diện Chẩn®</h1>
				<p class="text-lg text-blue-800 mb-8">
					Unisciti alla nostra comunità di professionisti del benessere e accedi a risorse esclusive, formazione continua e supporto professionale.
				</p>
				<div class="flex flex-wrap gap-4">
					{#if !auth}
						<button class="btn btn-primary btn-lg" onclick={() => onClickModal('new', 'Socio ordinario')}> Diventa Socio </button>
					{:else if userData?.membership?.membershipLevel != 'Socio vitalizio'}
						<button class="btn btn-primary btn-lg" onclick={() => onClickModal('renew', null)}> Rinnova Iscrizione </button>
					{/if}
				</div>
			</div>
			<div class="md:w-1/2">
				<Image
					layout="constrained"
					aspectRatio={1}
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
		<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">Vantaggi dell'Associazione</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<div class="flex items-start gap-4">
					<div class="bg-blue-100 p-3 rounded-full">
						<CheckCircle class="text-blue-600 h-6 w-6" />
					</div>
					<div>
						<h3 class="font-semibold text-lg text-blue-900 mb-2">Mappatura Punti Online</h3>
						<p class="text-blue-800">Accedi al servizio di mappatura punti online e disegna schemi personalizzati per i tuoi trattamenti.</p>
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
							Accedi gratuitamente ai video del corso base registrato da My Le dopo aver frequentato il corso con uno dei nostri riflessologi.
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
						<p class="text-blue-800">Acquista strumenti e materiale didattico con lo sconto del 10% grazie al codice fornito dal tuo riflessologo.</p>
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
						<p class="text-blue-800">Partecipa agli incontri in diretta online organizzati annualmente con il nostro professore Bui Quoc Chau.</p>
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
						<p class="text-blue-800">Frequenta incontri di pratica o di aggiornamento organizzati dal tuo riflessologo di riferimento.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Membership Options -->
<section class="py-16 px-4 bg-gradient-to-b from-teal-50 to-blue-50">
	<div class="container mx-auto">
		<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">Scegli il Tuo Piano di Associazione</h2>

		<div class="flex flex-col md:flex-row justify-center gap-8">
			{#if userData?.membership?.membershipLevel != 'Socio vitalizio'}
				<div class="bg-white rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-2xl w-full md:w-96">
					<div class="bg-blue-600 p-4 text-white text-center">
						<h3 class="text-xl font-bold">SOCIO ORDINARIO</h3>
					</div>
					<div class="p-6 flex flex-col">
						<div class="text-center mb-6">
							<p class="text-4xl font-bold text-blue-900">
								25€ <span class="text-xl text-blue-700">annuali</span>
							</p>
						</div>

						<div class="flex justify-center mb-6">
							<Image
								layout="constrained"
								aspectRatio={1}
								src="/images/card-1.jpg"
								alt="Socio Ordinario"
								class="h-40 w-40 rounded-full object-cover border-4 border-blue-100"
							/>
						</div>

						<ul class="mb-8 space-y-3 flex-grow">
							<li class="flex items-center">
								<CheckCircle class="text-blue-600 h-4 w-4 mr-2" />
								<span>Accesso a tutti i vantaggi</span>
							</li>
							<li class="flex items-center">
								<CheckCircle class="text-blue-600 h-4 w-4 mr-2" />
								<span>Rinnovo annuale</span>
							</li>
							<li class="flex items-center invisible">
								<CheckCircle class="text-blue-600 h-4 w-4 mr-2" />
								<span>Invisible spacer</span>
							</li>
							<li class="flex items-center invisible">
								<CheckCircle class="text-blue-600 h-4 w-4 mr-2" />
								<span>Invisible spacer</span>
							</li>
						</ul>
						<div class="mt-auto">
							{#if !auth}
								<button class="btn btn-primary w-full" onclick={() => onClickModal('new', 'Socio ordinario')}> Associati Ora </button>
							{:else}
								<button class="btn btn-primary w-full" onclick={() => onClickModal('renew', null)}> Rinnova Iscrizione </button>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<div class="bg-white rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-2xl w-full md:w-96 relative">
				<div class="bg-yellow-500 p-4 text-white text-center">
					<h3 class="text-xl font-bold">
						SOCIO VITALIZIO
						{#if userData?.membership?.membershipLevel != 'Socio vitalizio'}
							<div class="badge badge-warning text-white px-4 py-1 rounded-bl-lg font-semibold">Consigliato</div>
						{/if}
					</h3>
				</div>
				<div class="p-6 flex flex-col flex-1">
					<div class="text-center mb-6">
						<p class="text-4xl font-bold text-blue-900">
							390€ <span class="text-xl text-blue-700">una tantum</span>
						</p>
					</div>

					<div class="flex justify-center mb-6">
						<Image
							layout="constrained"
							aspectRatio={1}
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
					<div class="mt-auto">
						{#if userData?.membership?.membershipLevel != 'Socio vitalizio'}
							<button class="btn bg-yellow-500 hover:bg-yellow-600 text-white w-full" onclick={() => onClickModal('new', 'Socio vitalizio')}>
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
	</div>
</section>

<!-- Testimonials Section -->
<section class="py-16 px-4 bg-white">
	<div class="container mx-auto">
		<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-4">Le parole dei nostri associati</h2>
		<p class="text-lg text-center text-blue-700 mb-12">Scopri cosa pensano di noi i nostri clienti</p>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each testimonials as testimonial}
				<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
					<div class="flex items-center mb-4">
						<Image
							layout="constrained"
							aspectRatio={1}
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
				<div class="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
					<Calendar class="text-blue-600 h-8 w-8" />
				</div>
				<h3 class="text-4xl font-bold text-blue-900 mb-2">2,000+</h3>
				<p class="text-blue-700">Lezioni svolte</p>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
				<div class="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
					<Users class="text-blue-600 h-8 w-8" />
				</div>
				<h3 class="text-4xl font-bold text-blue-900 mb-2">360+</h3>
				<p class="text-blue-700">Riflessologi istruiti</p>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
				<div class="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
					<Globe class="text-blue-600 h-8 w-8" />
				</div>
				<h3 class="text-4xl font-bold text-blue-900 mb-2">40+</h3>
				<p class="text-blue-700">Paesi di diffusione</p>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
				<div class="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
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
		<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">Domande frequenti</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<h3 class="font-semibold text-lg text-blue-900 mb-3">Come divento socio?</h3>
				<p class="text-blue-800">
					In questa pagina "Quote associative" è possibile iscriversi come socio ordinario premendo il pulsante "Associati" per 25 euro all\'anno
					oppure come socio vitalizio premendo il pulsante "Associati a vita" per un singolo pagamento di 390€.
				</p>
			</div>

			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<h3 class="font-semibold text-lg text-blue-900 mb-3">Cosa succede se come socio ordinario non rinnovo l\'iscrizione in tempo?</h3>
				<p class="text-blue-800">
					Se l\'iscrizione a socio ordinario non viene rinnovato entro un anno dalla prima associazione o dall\'ultimo rinnovo i privilegi da socio
					decadono.
				</p>
			</div>

			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<h3 class="font-semibold text-lg text-blue-900 mb-3">Quali sono le differenze tra un socio ordinario e un socio vitalizio?</h3>
				<p class="text-blue-800">
					Il socio ordinario e il socio vitalizio godono degli stessi privilegi e accessi. L\'unica differenza risiede nel pagamento. Al socio
					ordinario sarà richiesto di rinnovare manualmente l\'abbonamento di 25 euro ogni anno, con il rischio di perdita dei privilegi in caso di
					mancato rinnovo. Al contrario al socio vitalizio sarà necessario pagare solamente una volta l\'acconto di 390 euro per rimanere associato a
					vita, senza alcun bisogno di rinnovamento.
				</p>
			</div>

			<div class="bg-blue-50 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
				<h3 class="font-semibold text-lg text-blue-900 mb-3">Posso diventare socio vitalizio se sono già socio ordinario?</h3>
				<p class="text-blue-800">
					Come socio ordinario è possibile diventare soci vitalizi in qualsiasi momento premendo il pulsante "Associati a vita" e procedendo con il
					pagamento.
				</p>
			</div>
		</div>
	</div>
</section>

{#if currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle} cssClass={'bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'}>
		<button class="btn btn-sm btn-circle absolute right-2 top-2 text-base-content" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
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
								<div class={`h-1 w-full ${i + 1 < currentStep ? 'bg-success' : 'bg-base-200'}`}></div>
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
										Password <span class="text-xs"> (Almeno 8 caratteri con numeri e lettere) </span>
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
										bind:value={password1}
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
									<Lock size={18} class="ml-2" color={passwordsMatch ? (password2 ? 'green' : 'currentColor') : 'red'} />
									<input
										class="flex-1 outline-none bg-transparent"
										id="password2"
										name="password2"
										type="password"
										placeholder="Conferma la password"
										bind:value={password2}
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
							<select id="county" class="select select-bordered w-full" name="county" required disabled={closedInput} bind:value={formData.county}>
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
							<select id="country" class="select select-bordered w-full" name="country" required disabled={closedInput} bind:value={formData.country}>
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

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						<label
							class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
							class:border-primary={formData.payment === 'Carta di credito'}
							class:bg-base-200={formData.payment === 'Carta di credito'}
						>
							<input type="radio" name="payment" value="Carta di credito" class="hidden" bind:group={formData.payment} />
							<CreditCard class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Carta di Credito</span>
						</label>

						<label
							class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
							class:border-primary={formData.payment === 'Bonifico bancario'}
							class:bg-base-200={formData.payment === 'Bonifico bancario'}
						>
							<input type="radio" name="payment" value="Bonifico bancario" class="hidden" bind:group={formData.payment} />
							<Landmark class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Bonifico Bancario</span>
						</label>
					</div>

					<div class="card bg-base-100 shadow-xl p-6" class:hidden={formData.payment !== 'Carta di credito'}>
						<h3 class="text-xl font-semibold mb-4">Informazioni sulla carta di credito</h3>
						<div class="form-control">
							<div id="card-element" class="border border-base-300 p-3 rounded-md"></div>
							{#if stripeError}
								<p class="text-error text-sm mt-2">{stripeError}</p>
							{/if}
						</div>
						<p class="text-sm text-gray-500 mt-2">
							<Lock size={14} class="inline-block mr-1" /> Le tue informazioni di pagamento sono protette.
						</p>
						{#if !paymentMethodId}
							<button type="button" class="btn btn-info mt-4" onclick={getStripeId}>VERIFICA CARTA </button>
						{:else}
							<div class="btn btn-primary mt-4">CARTA OK <CheckCircle /></div>
						{/if}
					</div>

					{#if formData.payment === 'Bonifico bancario'}
						<div class="card bg-base-100 shadow-xl p-6">
							<h3 class="text-xl font-semibold mb-4">Dettagli Bonifico Bancario</h3>
							<p>Effettua un bonifico bancario alle seguenti coordinate:</p>
							<p><strong>IBAN:</strong> IT93 R076 0111 5000 0102 3646 647</p>
							<p><strong>BIC/SWIFT:</strong> BPPIITRRXXX</p>
							<p><strong>INTESTATO A:</strong> ASSOCIAZIONE DIEN CHAN BUI QUOC CHAU Italia</p>
							<p>VIA TICINO 12F, 25015, DESENZANO DEL GARDA, BRESCIA</p>
							<br />
							<p>Si prega di includere il tuo ID ordine nella causale del bonifico. Il tuo ordine sarà elaborato dopo la conferma del pagamento.</p>
						</div>
					{/if}

					<!-- Summary -->
					<div class="card bg-base-200 p-4 rounded-lg">
						<h3 class="font-bold text-lg mb-2">Riepilogo Ordine</h3>

						<div class="flex justify-between items-center py-2 border-b border-base-300">
							<span class="text-base-content/80 font-medium">{cartItem?.title || 'Tesseramento'}</span>
							<span class="font-semibold">{cartItem?.price || 0} €</span>
						</div>

						<div class="divider my-1"></div>

						<div class="flex justify-between items-center pt-2 text-xl font-bold">
							<span>Totale Finale</span>
							<span class="text-primary">€ {cartItem?.price || 0}</span>
							<input type="hidden" name="totalValue" value={cartItem?.price} />
						</div>
					</div>
				</div>
				<input type="hidden" name="membershipLevel" value={formData.membershipLevel} />
				{#if paymentMethodId}
					<input type="hidden" name="paymentMethodId" value={paymentMethodId} />
				{/if}
			</div>

			<!-- Navigation -->
			<div class="flex justify-between mt-6">
				<button type="button" class="btn btn-outline" onclick={prevStep} class:hidden={currentStep === 1}>
					<ArrowLeft size={16} />
					Indietro
				</button>

				<div class="flex gap-2 ml-auto">
					<button type="button" class="btn btn-error btn-outline" onclick={onCloseModal}> Annulla </button>

					{#if currentStep < totalSteps}
						<button type="button" class="btn btn-primary" onclick={nextStep} disabled={!isCurrentStepValid()}> Continua </button>
					{:else}
						<button type="submit" class="btn btn-success" disabled={!isCurrentStepValid()}> Conferma Acquisto </button>
					{/if}
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'renew'}
	<Modal isOpen={openModal} header={modalTitle} cssClass={'bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'}>
		<button class="btn btn-sm btn-circle absolute right-2 top-2 text-base-content" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
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
								<div class={`h-1 w-full ${i + 1 < currentStep ? 'bg-success' : 'bg-base-200'}`}></div>
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
							<select id="county" class="select select-bordered w-full" name="county" required disabled={closedInput} bind:value={formData.county}>
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
							<select id="country" class="select select-bordered w-full" name="country" required disabled={closedInput} bind:value={formData.country}>
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

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						<label
							class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
							class:border-primary={formData.payment === 'Carta di credito'}
							class:bg-base-200={formData.payment === 'Carta di credito'}
						>
							<input type="radio" name="payment" value="Carta di credito" class="hidden" bind:group={formData.payment} />
							<CreditCard class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Carta di Credito</span>
						</label>

						<label
							class="card bg-base-100 border-2 hover:border-primary hover:bg-base-200 cursor-pointer transition-all p-4 flex flex-col items-center justify-center gap-2"
							class:border-primary={formData.payment === 'Bonifico bancario'}
							class:bg-base-200={formData.payment === 'Bonifico bancario'}
						>
							<input type="radio" name="payment" value="Bonifico bancario" class="hidden" bind:group={formData.payment} />
							<Landmark class="h-8 w-8 text-primary" />
							<span class="text-center font-medium">Bonifico Bancario</span>
						</label>
					</div>

					<div class="card bg-base-100 shadow-xl p-6" class:hidden={formData.payment !== 'Carta di credito'}>
						<h3 class="text-xl font-semibold mb-4">Informazioni sulla carta di credito</h3>
						<div class="form-control">
							<div id="card-element" class="border border-base-300 p-3 rounded-md"></div>
							{#if stripeError}
								<p class="text-error text-sm mt-2">{stripeError}</p>
							{/if}
						</div>
						<p class="text-sm text-gray-500 mt-2">
							<Lock size={14} class="inline-block mr-1" /> Le tue informazioni di pagamento sono protette.
						</p>
						{#if !paymentMethodId}
							<button type="button" class="btn btn-info mt-4" onclick={getStripeId}>VERIFICA CARTA </button>
						{:else}
							<div class="btn btn-primary mt-4">CARTA OK <CheckCircle /></div>
						{/if}
					</div>

					{#if formData.payment === 'Bonifico bancario'}
						<div class="card bg-base-100 shadow-xl p-6">
							<h3 class="text-xl font-semibold mb-4">Dettagli Bonifico Bancario</h3>
							<p>Effettua un bonifico bancario alle seguenti coordinate:</p>
							<p><strong>IBAN:</strong> IT93 R076 0111 5000 0102 3646 647</p>
							<p><strong>BIC/SWIFT:</strong> BPPIITRRXXX</p>
							<p><strong>INTESTATO A:</strong> ASSOCIAZIONE DIEN CHAN BUI QUOC CHAU Italia</p>
							<p>VIA TICINO 12F, 25015, DESENZANO DEL GARDA, BRESCIA</p>
							<br />
							<p>Si prega di includere il tuo ID ordine nella causale del bonifico. Il tuo ordine sarà elaborato dopo la conferma del pagamento.</p>
						</div>
					{/if}

					<!-- Summary -->
					<div class="card bg-base-200 p-4 rounded-lg">
						<h3 class="font-bold text-lg mb-2">Riepilogo Ordine</h3>

						<div class="flex justify-between items-center py-2 border-b border-base-300">
							<span class="text-base-content/80 font-medium">Rinnovo Tessera Annuale</span>
							<span class="font-semibold">€ 25.00</span>
						</div>

						<div class="divider my-1"></div>

						<div class="flex justify-between items-center pt-2 text-xl font-bold">
							<span>Totale Finale</span>
							<span class="text-primary">€ 25.00</span>
							<input type="hidden" name="totalValue" value={25} />
						</div>
					</div>
				</div>
				{#if paymentMethodId}
					<input type="hidden" name="paymentMethodId" value={paymentMethodId} />
				{/if}
			</div>

			<!-- Navigation -->
			<div class="flex justify-between mt-6">
				<button type="button" class="btn btn-outline" onclick={prevStep} class:hidden={currentStep === 1}>
					<ArrowLeft size={16} />
					Indietro
				</button>

				<div class="flex gap-2 ml-auto">
					<button type="button" class="btn btn-error btn-outline" onclick={onCloseModal}> Annulla </button>

					{#if currentStep < totalSteps}
						<button type="button" class="btn btn-primary" onclick={nextStep} disabled={!isCurrentStepValid()}> Continua </button>
					{:else}
						<button type="submit" class="btn btn-success" disabled={!isCurrentStepValid()}> Conferma Acquisto </button>
					{/if}
				</div>
			</div>
		</form>
	</Modal>
{/if}
