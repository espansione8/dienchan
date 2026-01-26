<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { Image } from '@unpic/svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { notification } from '$lib/stores/notifications';
	import Loader from '$lib/components/Loader.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { tick } from 'svelte';
	import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
	import {
		Mail,
		Landmark,
		Phone,
		Smartphone,
		Lock,
		CircleCheckBig,
		CreditCard,
		ArrowLeft,
		ShieldCheck,
		Users,
		Building2,
		FileText,
		Download,
		Receipt,
		Info,
		Clock,
		CheckCircle2,
		AlertCircle,
		Calendar
	} from 'lucide-svelte';

	const { data } = $props();
	const { userData, auth, stripePublishableKey, insuranceOrders } = $derived(data);

	let formEl: HTMLFormElement;
	let stripe: Stripe | null = $state(null);
	let elements: StripeElements | null = $state(null);
	let cardElement: any;
	let stripeError = $state<string | null>(null);
	let clientSecret = $state<string | null>(null);
	let paymentIntentId = $state<string | null>(null);

	let formData = $state({
		name: userData?.name || '',
		surname: userData?.surname || '',
		email: userData?.email || '',
		address: userData?.address || '',
		city: userData?.city || '',
		county: userData?.county[0] || '',
		postalCode: userData?.postalCode || '',
		country: userData?.country || 'Italy',
		phone: userData?.phone || '',
		mobilePhone: userData?.mobilePhone || '',
		payment: 'Carta di credito'
	});

	let openModal = $state(false);
	let postAction = $state('?/new');
	let modalTitle = $state('Acquisto Contributo Socio Praticante');
	let loading = $state(false);

	let currentStep = $state(1);
	let totalSteps = $state(3);

	// ===== LOGICA STATO ASSICURAZIONE =====

	// Verifica se ci sono ordini insurance in elaborazione
	// (filtrati dal server: status='requested', orderConfirmed=false, statusPayment='pending' o 'done')
	const hasPendingInsuranceOrder = $derived(insuranceOrders && insuranceOrders.length > 0);

	// Verifica se l'assicurazione è attiva
	const hasActiveInsurance = $derived(userData?.insurance?.insuranceStatus === true);

	// Calcola i giorni rimanenti alla scadenza
	const daysUntilExpiry = $derived.by(() => {
		if (!userData?.insurance?.insuranceExpiry) return null;
		const expiry = new Date(userData.insurance.insuranceExpiry);
		const today = new Date();
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	});

	// Mostra bottone rinnova se mancano meno di 14 giorni alla scadenza
	const showRenewButton = $derived(hasActiveInsurance && daysUntilExpiry !== null && daysUntilExpiry <= 14 && daysUntilExpiry > 0);

	// Nasconde il bottone acquista se c'è assicurazione attiva o ordine pendente
	const hideAcquistaButton = $derived(hasActiveInsurance || hasPendingInsuranceOrder);

	// Formatta la data di scadenza
	const formatExpiryDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('it-IT', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});
	};

	// Trova l'ordine pendente più recente (già filtrato dal server)
	const pendingOrder = $derived.by(() => {
		if (!hasPendingInsuranceOrder || !insuranceOrders || insuranceOrders.length === 0) return null;
		// Ordina per data decrescente e prendi il più recente
		return [...insuranceOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0];
	});

	// ===== FINE LOGICA STATO ASSICURAZIONE =====

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

				const cardElementContainer = document.getElementById('card-element');
				if (cardElementContainer) {
					cardElement.mount(cardElementContainer);
					stripeError = null;
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

	const resetFields = () => {
		formData.payment = 'Carta di credito';
		if (cardElement) {
			cardElement.destroy();
			cardElement = null;
			elements = null;
			stripe = null;
			stripeError = null;
			clientSecret = null;
			paymentIntentId = null;
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
				return 'Indirizzo';
			case 3:
				return 'Pagamento e Conferma';
			default:
				return '';
		}
	};

	const isStep1Valid = () => {
		return !!(formData.name && formData.surname && formData.email && formData.mobilePhone);
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

	const onClickModal = () => {
		openModal = true;
		initializeStripe();
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		currentStep = 1;
	};

	const createPaymentIntent = async () => {
		if (formData.payment !== 'Carta di credito' || clientSecret) {
			return true;
		}

		loading = true;
		stripeError = null;

		try {
			const response = await fetch('?/createPaymentIntent', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					email: formData.email,
					name: formData.name,
					surname: formData.surname
				})
			});

			const result = await response.json();

			if (result.type === 'success' && result.data) {
				const dataArray: any[] = JSON.parse(result.data);
				const resSecret = dataArray?.[4];
				const resIntent = dataArray?.[5];

				if (resSecret && resIntent) {
					clientSecret = resSecret;
					paymentIntentId = resIntent;
					loading = false;
					return true;
				} else {
					stripeError = 'Errore durante la creazione del pagamento (1)';
					notification.error(stripeError);
					loading = false;
					return false;
				}
			} else if (result.type === 'failure') {
				stripeError = 'Errore durante la creazione del pagamento (2)';
				notification.error(stripeError);
				loading = false;
				return false;
			} else {
				stripeError = 'Errore durante la creazione del pagamento';
				notification.error(stripeError);
				loading = false;
				return false;
			}
		} catch (error: any) {
			console.error('createPaymentIntent error:', error);
			stripeError = `Errore: ${error.message}`;
			notification.error(stripeError);
			loading = false;
			return false;
		}
	};

	const confirmPaymentWith3DS = async () => {
		if (formData.payment !== 'Carta di credito' || !clientSecret) {
			return true;
		}

		loading = true;
		stripeError = null;

		if (!stripe || !cardElement) {
			stripeError = 'Stripe non è stato inizializzato correttamente. Riprova.';
			notification.error(stripeError);
			loading = false;
			return false;
		}

		try {
			const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
				payment_method: {
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
				}
			});

			if (error) {
				stripeError = error.message;
				notification.error(stripeError || 'Errore durante il pagamento');
				loading = false;
				return false;
			}

			if (paymentIntent && paymentIntent.status === 'succeeded') {
				paymentIntentId = paymentIntent.id;
				loading = false;
				return true;
			} else {
				stripeError = `Pagamento non completato: ${paymentIntent?.status || 'unknown'}`;
				notification.error(stripeError);
				loading = false;
				return false;
			}
		} catch (err: any) {
			stripeError = err.message || 'Errore sconosciuto';
			notification.error(stripeError);
			loading = false;
			return false;
		}
	};

	const formSubmit = () => {
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { message } = result.data;
				notification.info(message);
				onCloseModal();
			}
			if (result.type === 'failure') {
				notification.error(result.data.message || 'Errore acquisto');
				onCloseModal();
			}
			if (result.type === 'error') {
				notification.error(result.error.message || 'Errore Server');
				onCloseModal();
			}
			resetFields();
			loading = false;
		};
	};

	const handleFinalSubmit = async () => {
		loading = true;

		if (!isCurrentStepValid()) {
			notification.error('Completa tutti i campi richiesti');
			loading = false;
			return;
		}

		if (formData.payment === 'Carta di credito' && !clientSecret) {
			const intentCreated = await createPaymentIntent();
			if (!intentCreated) {
				return;
			}
		}

		if (formData.payment === 'Carta di credito') {
			const paymentConfirmed = await confirmPaymentWith3DS();
			if (!paymentConfirmed) {
				return;
			}
		}

		await tick();

		if (formEl) {
			formEl.requestSubmit();
		}
	};
</script>

<svelte:head>
	<title>Contributo Socio Praticante</title>
	<meta name="description" content="Acquista il contributo socio praticante per godere delle agevolazioni dell'associazione" />
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
		{#if !auth}
			<!-- Messaggio per utenti non loggati -->
			<div class="text-center">
				<h1 class="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Contributo Socio Praticante</h1>
				<div class="alert alert-warning shadow-lg max-w-2xl mx-auto">
					<div class="flex items-center gap-4">
						<ShieldCheck class="h-6 w-6" />
						<div>
							<h3 class="font-bold">Accesso Richiesto</h3>
							<div class="text-sm">Devi essere loggato e avere una membership attiva per acquistare il contributo socio praticante.</div>
						</div>
					</div>
				</div>
				<div class="mt-8 flex gap-4 justify-center">
					<a href="/login" class="btn btn-primary btn-lg">Accedi</a>
					<a href="/membership-new" class="btn btn-outline btn-lg">Registrati</a>
				</div>
			</div>
		{:else}
			<!-- Contenuto per utenti loggati -->
			<div class="flex flex-col md:flex-row items-start justify-between gap-8">
				<div class="md:w-1/2">
					<h1 class="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Contributo Socio Praticante</h1>
					<p class="text-lg text-blue-800 mb-6 leading-relaxed">
						Il presente contributo permette a un socio praticante di godere di alcune agevolazioni quali utilizzo delle sale dell'associazione con
						tariffa agevolata e inclusione della polizza di copertura RC dell'associazione.
					</p>

					<!-- Status Cards -->
					{#if hasActiveInsurance}
						<!-- Assicurazione Attiva -->
						<div class="alert alert-success shadow-lg mb-4">
							<div class="flex items-start gap-3">
								<CheckCircle2 class="h-6 w-6 flex-shrink-0" />
								<div class="flex-1">
									<h3 class="font-bold text-lg">Assicurazione Attiva</h3>
									<p class="text-sm">La tua copertura è attiva e operativa</p>
									{#if userData?.insurance?.insuranceExpiry}
										<div class="mt-2 flex items-center gap-2 text-sm">
											<Calendar class="h-4 w-4" />
											<span>Scadenza: <strong>{formatExpiryDate(userData.insurance.insuranceExpiry)}</strong></span>
										</div>
										<!-- {#if daysUntilExpiry !== null}
											<div class="mt-1 flex items-center gap-2 text-sm">
												<Clock class="h-4 w-4" />
												<span>
													{#if daysUntilExpiry > 0}
														Giorni rimanenti: <strong>{daysUntilExpiry}</strong>
													{:else}
														<strong class="text-error">Assicurazione scaduta</strong>
													{/if}
												</span>
											</div>
										{/if} -->
									{/if}
								</div>
							</div>
						</div>

						{#if showRenewButton}
							<div class="alert alert-warning shadow-lg mb-4">
								<div class="flex items-start gap-3">
									<AlertCircle class="h-6 w-6 flex-shrink-0" />
									<div class="flex-1">
										<h3 class="font-bold">Rinnovo Disponibile</h3>
										<p class="text-sm">La tua assicurazione scade tra meno di 2 settimane. Rinnova ora per continuare a godere delle agevolazioni!</p>
									</div>
								</div>
							</div>
							<button class="btn btn-warning btn-lg w-full md:w-auto" onclick={onClickModal}> Rinnova Assicurazione </button>
						{/if}
					{:else if !hasPendingInsuranceOrder}
						<!-- Nessuna Assicurazione - Mostra solo se NON c'è ordine pendente -->
						<div class="flex flex-wrap gap-4">
							<button class="btn btn-primary btn-lg" onclick={onClickModal}> Acquista Ora </button>
						</div>
					{/if}
				</div>

				<!-- Agevolazioni Incluse -->
				<div class="md:w-1/2">
					<div class="bg-white rounded-xl p-6 shadow-lg">
						<h2 class="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
							<CircleCheckBig class="text-blue-600 h-6 w-6" />
							Agevolazioni Incluse
						</h2>

						<div class="space-y-4">
							<div class="flex items-start gap-3">
								<div class="bg-blue-100 p-2 rounded-lg flex-shrink-0">
									<Building2 class="text-blue-600 h-5 w-5" />
								</div>
								<div>
									<h3 class="font-semibold text-blue-900 mb-1">Utilizzo Sale Associazione</h3>
									<p class="text-sm text-blue-700">Accesso con tariffa agevolata riservata ai soci praticanti</p>
								</div>
							</div>

							<div class="divider my-2"></div>

							<div class="flex items-start gap-3">
								<div class="bg-blue-100 p-2 rounded-lg flex-shrink-0">
									<ShieldCheck class="text-blue-600 h-5 w-5" />
								</div>
								<div>
									<h3 class="font-semibold text-blue-900 mb-1">Copertura RC CIVILE e PENALE</h3>
									<p class="text-sm text-blue-700">Polizza Responsabilità Civile e Penale dell'associazione inclusa</p>
								</div>
							</div>

							<div class="divider my-2"></div>

							<div class="flex items-start gap-3">
								<div class="bg-blue-100 p-2 rounded-lg flex-shrink-0">
									<Users class="text-blue-600 h-5 w-5" />
								</div>
								<div>
									<h3 class="font-semibold text-blue-900 mb-1">Supporto Associativo</h3>
									<p class="text-sm text-blue-700">Accesso alle attività riservate ai soci praticanti</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>

<!-- Sezione Ordine in Elaborazione (solo ordini con pagamento pending e assicurazione NON attiva) -->
{#if auth && hasPendingInsuranceOrder && !hasActiveInsurance}
	<section class="py-16 px-4 bg-white">
		<div class="container mx-auto max-w-4xl">
			<div class="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl shadow-xl p-8">
				<div class="flex items-start gap-4 mb-6">
					<div class="flex-shrink-0">
						<div class="bg-blue-500 rounded-full p-4 shadow-lg">
							<Clock class="h-8 w-8 text-white" />
						</div>
					</div>

					<div class="flex-1">
						<div class="flex items-center gap-3 mb-3">
							<h2 class="font-bold text-3xl text-blue-900">Ordine in Elaborazione</h2>
						</div>
						<!-- <div class="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
							<span class="relative flex h-2.5 w-2.5">
								<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
								<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
							</span>
							<span class="text-sm font-semibold text-blue-700">In attesa di documentazione</span>
						</div> -->
					</div>
				</div>

				<div class="bg-white/90 backdrop-blur rounded-xl p-5 mb-6 border border-blue-100 shadow-sm">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p class="text-sm text-gray-600 mb-1">Numero ordine</p>
							<p class="font-bold text-2xl text-blue-900">#{pendingOrder?.orderId}</p>
						</div>
						<div>
							<p class="text-sm text-gray-600 mb-1">Data ricezione</p>
							<p class="font-semibold text-lg text-gray-800">
								{new Date(pendingOrder?.orderDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
							</p>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-xl p-6 shadow-md mb-6">
					<div class="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
						<div class="bg-blue-100 rounded-lg p-2.5">
							<FileText class="h-6 w-6 text-blue-600" />
						</div>
						<h3 class="font-bold text-xl text-blue-900">Passi per completare l'attivazione</h3>
					</div>

					<div class="space-y-5">
						<div class="flex items-start gap-4">
							<span
								class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-base font-bold flex-shrink-0 mt-1 shadow-md"
								>1</span
							>
							<div class="flex-1 pt-1">
								<p class="text-base font-semibold text-gray-900 mb-1">Scarica il modulo di adesione</p>
								<p class="text-sm text-gray-600">Troverai il modulo allegato all'email di conferma che hai ricevuto.</p>
							</div>
						</div>

						<div class="flex items-start gap-4">
							<span
								class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-base font-bold flex-shrink-0 mt-1 shadow-md"
								>2</span
							>
							<div class="flex-1 pt-1">
								<p class="text-base font-semibold text-gray-900 mb-1">Compila e firma il modulo</p>
								<p class="text-sm text-gray-600">Completa tutte le sezioni indicate nel documento.</p>
							</div>
						</div>

						<div class="flex items-start gap-4">
							<span
								class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-base font-bold flex-shrink-0 mt-1 shadow-md"
								>3</span
							>
							<div class="flex-1 pt-1">
								<p class="text-base font-semibold text-gray-900 mb-2">Invia il modulo firmato via email</p>
								<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
									<div class="flex items-center gap-2 mb-2">
										<Mail class="h-5 w-5 text-blue-600" />
										<p class="text-sm font-semibold text-blue-900">Indirizzo email:</p>
									</div>
									<a href="mailto:amministrazionedienchan@gmail.com" class="text-blue-600 hover:text-blue-700 font-semibold text-base break-all">
										amministrazionedienchan@gmail.com
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
					<div class="flex items-start gap-3">
						<div class="bg-green-100 rounded-lg p-2.5 flex-shrink-0">
							<CheckCircle2 class="h-6 w-6 text-green-600" />
						</div>
						<div>
							<p class="text-base font-bold text-green-900 mb-2">Attivazione</p>
							<p class="text-sm text-green-700">La tua assicurazione sarà attivata dopo aver ricevuto il modulo firmato.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}

<!-- Contribution Details Section -->
{#if auth && !hideAcquistaButton}
	<section class="py-16 px-4 bg-gradient-to-b from-teal-50 to-blue-50">
		<div class="container mx-auto">
			<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">Dettagli Contributo</h2>

			<div class="flex justify-center">
				<div class="bg-white rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-2xl w-full md:w-96">
					<div class="bg-blue-600 p-4 text-white text-center">
						<h3 class="text-xl font-bold">CONTRIBUTO SOCIO PRATICANTE</h3>
					</div>
					<div class="p-6 flex flex-col">
						<div class="text-center mb-6">
							<p class="text-4xl font-bold text-blue-900">
								70€ <span class="text-xl text-blue-700">annuali</span>
							</p>
						</div>

						<div class="flex justify-center mb-6">
							<ShieldCheck class="h-40 w-40 text-blue-600" />
						</div>

						<ul class="mb-8 space-y-3 flex-grow">
							<li class="flex items-center">
								<CircleCheckBig class="text-blue-600 h-4 w-4 mr-2 flex-shrink-0" />
								<span>Utilizzo sale con tariffa agevolata</span>
							</li>
							<li class="flex items-center">
								<CircleCheckBig class="text-blue-600 h-4 w-4 mr-2 flex-shrink-0" />
								<span>Polizza RC associazione inclusa</span>
							</li>
							<li class="flex items-center">
								<CircleCheckBig class="text-blue-600 h-4 w-4 mr-2 flex-shrink-0" />
								<span>Supporto e attività riservate</span>
							</li>
						</ul>
						<div class="mt-auto">
							<button class="btn btn-primary w-full" onclick={onClickModal}> Acquista Ora </button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}

<!-- Resources Section -->
{#if auth}
	<section class="py-16 px-4 bg-white">
		<div id="risorse" class="container mx-auto">
			<h2 class="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-4">Risorse da Consultare</h2>
			<p class="text-center text-blue-700 mb-12 max-w-2xl mx-auto">
				Scarica e consulta i documenti informativi per comprendere meglio i vantaggi e le modalità del contributo socio praticante
			</p>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<!-- PDF 1 -->
				<div
					class="group bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
				>
					<div class="flex flex-col items-center text-center h-full">
						<div class="bg-sky-500 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
							<FileText class="h-12 w-12 text-white" />
						</div>
						<h3 class="font-bold text-xl text-sky-900 mb-3">Tutela legale</h3>
						<p class="text-sky-800 text-sm mb-6 flex-grow">Testo completo</p>
						<a
							href="https://riflessologiadienchan.it/wp-content/uploads/2026/01/TUTELA-LEGALE-SPA-449029-coperto-.pdf"
							download
							class="btn btn-primary w-full bg-sky-500 hover:bg-sky-600 border-sky-500 transition-colors"
						>
							<Download class="h-5 w-5 mr-2" />
							Scarica PDF
						</a>
					</div>
				</div>

				<!-- PDF 2 -->
				<div
					class="group bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
				>
					<div class="flex flex-col items-center text-center h-full">
						<div class="bg-sky-500 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
							<ShieldCheck class="h-12 w-12 text-white" />
						</div>
						<h3 class="font-bold text-xl text-sky-900 mb-3">Set informativo Unipol Mondo</h3>
						<p class="text-sky-800 text-sm mb-6 flex-grow">Professionista Professioni Sanitarie</p>
						<a
							href="https://riflessologiadienchan.it/wp-content/uploads/2026/01/UNIPOL-210620818-coperto-completo.pdf"
							download
							class="btn btn-primary w-full bg-sky-500 hover:bg-sky-600 border-sky-500 transition-colors"
						>
							<Download class="h-5 w-5 mr-2" />
							Scarica PDF
						</a>
					</div>
				</div>

				<!-- PDF 3 -->
				<div
					class="group bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
				>
					<div class="flex flex-col items-center text-center h-full">
						<div class="bg-sky-500 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
							<Receipt class="h-12 w-12 text-white" />
						</div>
						<h3 class="font-bold text-xl text-sky-900 mb-3">Copertura luoghi pubblici</h3>
						<p class="text-sky-800 text-sm mb-6 flex-grow">per eventi e fiere</p>
						<a
							href="https://riflessologiadienchan.it/wp-content/uploads/2026/01/ITAS_M16297317-1.pdf"
							download
							class="btn btn-primary w-full bg-sky-500 hover:bg-sky-600 border-sky-500 transition-colors"
						>
							<Download class="h-5 w-5 mr-2" />
							Scarica PDF
						</a>
					</div>
				</div>
			</div>

			<div class="mt-12 text-center">
				<div class="inline-flex items-center gap-2 bg-sky-50 px-6 py-3 rounded-full">
					<Info class="h-5 w-5 text-sky-600" />
					<span class="text-sky-900 font-medium">Per ulteriori informazioni contatta la segreteria dell'associazione</span>
				</div>
			</div>
		</div>
	</section>
{/if}

<!-- Modal -->
{#if auth}
	<Modal isOpen={openModal} header={modalTitle} cssClass={'bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'}>
		<button class="btn btn-sm btn-circle absolute right-2 top-2 text-base-content" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<form method="POST" action={postAction} use:enhance={formSubmit} class="px-6 pb-6" bind:this={formEl}>
			<!-- Progress Steps -->
			<div class="px-6 pt-4">
				<div class="w-full flex justify-between mb-2">
					{#each Array(totalSteps) as _, i}
						<div class="flex flex-col items-center">
							<div
								class={`w-10 h-10 rounded-full flex items-center justify-center ${i + 1 === currentStep ? 'bg-primary text-primary-content' : i + 1 < currentStep ? 'bg-success text-success-content' : 'bg-base-200'}`}
							>
								{#if i + 1 < currentStep}
									<CircleCheckBig size={20} />
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

			<!-- Step 1: Informazioni Personali -->
			<div class={currentStep === 1 ? 'block' : 'hidden'}>
				<div class="card bg-base-100 shadow-sm border border-base-200 p-4 rounded-lg mt-4">
					<div class="card-title text-lg font-bold mb-4 pb-2 border-b">
						<div class="flex justify-between items-center w-full">
							<span>Dati Personali</span>
							<a href="/profile-area" class="btn btn-xs btn-outline">Modifica profilo</a>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control w-full">
							<label for="Name" class="label">
								<span class="label-text font-medium">Nome</span>
							</label>
							<input id="Name" type="text" class="input input-bordered w-full" readonly value={formData.name} />
						</div>

						<div class="form-control w-full">
							<label for="Surname" class="label">
								<span class="label-text font-medium">Cognome</span>
							</label>
							<input id="Surname" type="text" class="input input-bordered w-full" readonly value={formData.surname} />
						</div>

						<div class="form-control w-full md:col-span-2">
							<label for="Email" class="label">
								<span class="label-text font-medium">Email</span>
							</label>
							<div class="input input-bordered flex items-center gap-2 pr-2 w-full">
								<Mail size={18} class="ml-2" />
								<input id="Email" type="email" class="flex-1 bg-transparent" readonly value={formData.email} />
							</div>
						</div>

						<div class="form-control w-full">
							<label for="telefono" class="label">
								<span class="label-text font-medium">Telefono</span>
							</label>
							<div class="input input-bordered flex items-center gap-2 pr-2 w-full">
								<Phone size={18} class="ml-2" />
								<input id="telefono" type="tel" class="flex-1 bg-transparent" readonly value={formData.phone} />
							</div>
						</div>

						<div class="form-control w-full">
							<label for="cellulare" class="label">
								<span class="label-text font-medium">Cellulare</span>
							</label>
							<div class="input input-bordered flex items-center gap-2 pr-2 w-full">
								<Smartphone size={18} class="ml-2" />
								<input id="cellulare" type="tel" class="flex-1 bg-transparent" readonly value={formData.mobilePhone} />
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Step 2: Indirizzo -->
			<div class={currentStep === 2 ? 'block' : 'hidden'}>
				<div class="card bg-base-100 shadow-sm border border-base-200 p-4 rounded-lg mt-4">
					<div class="card-title text-lg font-bold mb-4 pb-2 border-b">
						<div class="flex justify-between items-center w-full">
							<span>Indirizzo di Fatturazione</span>
							<a href="/profile-area" class="btn btn-xs btn-outline">Modifica profilo</a>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control w-full md:col-span-2">
							<label for="address" class="label">
								<span class="label-text font-medium">Indirizzo</span>
							</label>
							<input id="address" type="text" class="input input-bordered w-full" readonly value={formData.address} />
						</div>

						<div class="form-control w-full">
							<label for="city" class="label">
								<span class="label-text font-medium">Città</span>
							</label>
							<input id="city" type="text" class="input input-bordered w-full" readonly value={formData.city} />
						</div>

						<div class="form-control w-full">
							<label for="postalCode" class="label">
								<span class="label-text font-medium">CAP</span>
							</label>
							<input id="postalCode" type="text" class="input input-bordered w-full" readonly value={formData.postalCode} />
						</div>

						<div class="form-control w-full">
							<label for="county" class="label">
								<span class="label-text font-medium">Provincia</span>
							</label>
							<input id="county" type="text" class="input input-bordered w-full" readonly value={formData.county} />
						</div>

						<div class="form-control w-full">
							<label for="country" class="label">
								<span class="label-text font-medium">Nazione</span>
							</label>
							<input id="country" type="text" class="input input-bordered w-full" readonly value={formData.country} />
						</div>
					</div>
				</div>
			</div>

			<!-- Step 3: Pagamento -->
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
							<Lock size={14} class="inline-block mr-1" /> Le tue informazioni di pagamento sono protette e crittografate con 3D Secure.
						</p>
						<div class="alert alert-info mt-4">
							<Lock size={14} class="inline-block mr-1" />
							<span
								>Il pagamento sarà elaborato con 3D Secure per la massima sicurezza. Potresti essere reindirizzato alla tua banca per
								l'autenticazione.</span
							>
						</div>
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
					<div class="card bg-base-200 p-4 rounded-lg mt-4">
						<h3 class="font-bold text-lg mb-2">Riepilogo Ordine</h3>

						<div class="flex justify-between items-center py-2 border-b border-base-300">
							<span class="text-base-content/80 font-medium">Contributo Socio Praticante Annuale</span>
							<span class="font-semibold">€ 70.00</span>
						</div>

						<div class="divider my-1"></div>

						<div class="flex justify-between items-center pt-2 text-xl font-bold">
							<span>Totale Finale</span>
							<span class="text-primary">€ 70.00</span>
						</div>
					</div>
				</div>

				<input type="hidden" name="paymentIntentId" value={paymentIntentId} />
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
						<button type="button" class="btn btn-success" onclick={handleFinalSubmit} disabled={!isCurrentStepValid()}>
							{#if showRenewButton}
								Conferma Rinnovo
							{:else}
								Conferma Acquisto
							{/if}
						</button>
					{/if}
				</div>
			</div>
		</form>
	</Modal>
{/if}
