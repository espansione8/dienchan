<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import Modal from '$lib/components/Modal.svelte';
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
		CircleCheckBig
	} from 'lucide-svelte';

	const testimonials = [
		{
			name: 'Stefania Sica',
			image: '/images/michael-dam-mEZ3PoFGs_k-unsplash.jpg',
			review:
				'Un metodo estremamente valido ed efficace anche per autotrattarsi. Ho seguito i corsi tenuti da Duyen, docente preparatissima e persona eccezionale! Consigliato vivamente!'
		},
		{
			name: 'Federico C',
			image: ' 	/images/michael-dam-mEZ3PoFGs_k-unsplash.jpg',
			review:
				'Per chi fa i corsi della durata di qualche giorno è possibile dormire direttamente sul posto grazie a letti a muro. È presente in bagno e una cucina per poter fare le proprie cose e fare colazione/cucinare all’occorrenza.'
		},
		{
			name: 'Moria',
			image: '/images/avatar.png',
			review:
				'Associazione ben organizzata che insegna egregiamente e con passione tecniche utili per il benessere psicofisico.'
		}
	];

	let { data, form } = $props();
	let { userData, auth } = $derived(data);

	let paymentType = $state('bonifico');
	let isModal = $state(false);
	let newExpire: any = $state(new Date());
	let currentDialog = $state('');
	let postAction = $state('?/renewMembership');
	let modalTitle = $state('');

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
	//let error = $state();
	let inputRef = $state();
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
		console.log('onClickDialog', type, { isModal });
		if (type == 'associate') {
			postAction = `?/newMembership`;
			modalTitle = 'Nuova iscrizione socio ordinario';
		}
		if (type == 'lifetime') {
			postAction = `?/newLifetime`;
			modalTitle = 'Nuova iscrizione socio vitalizio';
		}
		if (type == 'renew') {
			postAction = `?/renewMembership`;
			modalTitle = 'Rinnovo iscrizione';
			const newDate = newExpire.setFullYear(newExpire.getFullYear() + 1);
			newExpire = newDate.toISOString().substring(0, 10);
		}
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

	$effect(() => {
		if (form != null) {
			async () => await invalidateAll(); // MUST be async/await or tableList = getTable will trigger infinite loop
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
	}); // end effect
</script>

<svelte:head>
	<title>Diventa socio</title>
</svelte:head>

<div class="bg-blue-50 grid grid-cols-6 grid-rows-[min-content] gap-y-8 p-4 md:p-10">
	<span class="col-span-6 text-blue-900 font-bold text-5xl text-center mb-4">
		Diventa socio Dien Chan®
	</span>
	<!-- foto -->
	<section class="col-start-2 col-end-4 bg-trasparent rounded-lg">
		<img
			src="/images/riflessologo_dienchan.jpg"
			alt="foto riflessologo"
			class="h-90 object-cover"
		/>
	</section>
	<!-- elenco -->
	<section class="mt-10">
		<div class="space-y-5">
			<!-- Blocco 1 -->
			<div class="flex items-center">
				<div class="flex-shrink-0 flex items-center justify-center">
					<CircleCheckBig size="28" color="red" strokeWidth={4} />
				</div>
				<div class="flex-grow flex items-center ml-5">
					<p class="text-blue-900 font-semibold text-lg leading-tight w-96">
						Accedi al servizio di mappatura punti online e disegna schemi personalizzati per i tuoi
						trattamenti
					</p>
				</div>
			</div>
			<!-- Blocco 2 -->
			<div class="flex items-center">
				<div class="flex-shrink-0 flex items-center justify-center">
					<CircleCheckBig size="28" color="red" strokeWidth={4} />
				</div>
				<div class="flex-grow flex items-center ml-5">
					<p class="text-blue-900 font-semibold text-lg leading-tight w-96">
						Accedi gratuitamente ai video del corso base registrato da My Le dopo aver frequentato
						il corso con uno dei nostri riflessologi
					</p>
				</div>
			</div>
			<!-- Blocco 3 -->
			<div class="flex items-center">
				<div class="flex-shrink-0 flex items-center justify-center">
					<CircleCheckBig size="28" color="red" strokeWidth={4} />
				</div>
				<div class="flex-grow flex items-center ml-5">
					<p class="text-blue-900 font-semibold text-lg leading-tight w-96">
						Acquista strumenti e materiale didattico con lo sconto del 10% grazie al codice fornito
						dal tuo riflessologo
					</p>
				</div>
			</div>
			<!-- Blocco 4 -->
			<div class="flex items-center">
				<div class="flex-shrink-0 flex items-center justify-center">
					<CircleCheckBig size="28" color="red" strokeWidth={4} />
				</div>
				<div class="flex-grow flex items-center ml-5">
					<p class="text-blue-900 font-semibold text-lg leading-tight w-96">
						Partecipa agli incontri in diretta online organizzati annualmente con il nostro
						professore Bui Quoc Chau
					</p>
				</div>
			</div>
			<!-- Blocco 5 -->
			<div class="flex items-center">
				<div class="flex-shrink-0 flex items-center justify-center">
					<CircleCheckBig size="28" color="red" strokeWidth={4} />
				</div>
				<div class="flex-grow flex items-center ml-5">
					<p class="text-blue-900 font-semibold text-lg leading-tight w-96">
						Frequenta incontri di pratica o di aggiornamento organizzati dal tuo riflessologo di
						riferimento
					</p>
				</div>
			</div>
		</div>
	</section>
	{#if userData?.membership?.membershipLevel != 'Socio vitalizio'}
		<section class="col-start-2 col-end-4">
			<!-- Card per Socio Ordinario -->
			<div class="flex justify-center space-x-6 my-8">
				<div
					class="bg-gradient-to-b from-indigo-700 via-indigo-600 to-indigo-500 rounded-xl p-6 w-80 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
				>
					<div class="text-center">
						<h2
							class="text-white font-semibold text-lg mb-4 border-2 border-white rounded-md inline-block px-3 py-1"
						>
							SOCIO ORDINARIO
						</h2>
						<p class="text-4xl font-bold">25€ <span class="text-xl">annuali</span></p>
					</div>
					<div class="flex justify-center my-4">
						<figure class="px-4 pt-4">
							<img
								src="/images/card-1.jpg"
								alt="tipo corso"
								class="h-40 rounded-full object-cover"
							/>
						</figure>
					</div>
					<div class="flex justify-between space-x-4">
						{#if !auth}
							<button
								class="btn bg-red-500 text-white w-full rounded-xl mt-2"
								onclick={() => onClickDialog('associate')}
							>
								Associati</button
							>
						{:else}
							<button
								class="btn bg-transparent border-2 border-white text-white w-full rounded-xl mt-2"
								onclick={() => onClickDialog('renew')}>Rinnova</button
							>
						{/if}
					</div>
				</div>
			</div>
		</section>
	{/if}

	<section class="col-start-4 col-end-6">
		<!-- Card per Socio Vitalizio -->
		<div class="flex justify-center space-x-6 my-8">
			<div
				class="bg-gradient-to-b from-yellow-600 via-yellow-500 to-yellow-400 rounded-xl p-6 w-80 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
			>
				<div class="text-center">
					<h2
						class="text-white font-semibold text-lg mb-4 border-2 border-white rounded-md inline-block px-3 py-1"
					>
						SOCIO VITALIZIO
					</h2>
					<p class="text-4xl font-bold">390€</p>
					<!-- <p class="text-xl invisible"> /a vita</p> -->
				</div>
				<div class="flex justify-center my-4">
					<figure class="px-4 pt-4">
						<img src="/images/card-2.jpg" alt="tipo corso" class="h-40 rounded-full object-cover" />
					</figure>
				</div>
				<button
					class="btn bg-red-500 text-white w-full rounded-xl mt-2"
					onclick={() => onClickDialog('lifetime')}>Associati</button
				>
			</div>
		</div>
	</section>

	<section class="col-span-6 py-12 rounded-xl bg-gray-50">
		<!-- Sezione Testimonianze -->
		<div class="text-center mb-12">
			<h2 class="text-5xl font-extrabold text-gray-900 mb-6">Le parole dei nostri associati</h2>
			<p class="text-lg text-gray-700">Scopri cosa pensano di noi i nostri clienti</p>
		</div>

		<div class=" flex justify-center space-x-10 m-10">
			{#each testimonials as testimonial}
				<motion.div
					class="testimonial-card w-[450px] rounded-2xl shadow-lg bg-white p-8 transition-transform transform hover:scale-105"
					variants={{
						hidden: { opacity: 0, y: 20 },
						visible: { opacity: 1, y: 0 }
					}}
					initial="hidden"
					animate="visible"
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<div class="flex items-center mb-6">
						<img
							src={testimonial.image}
							alt={testimonial.name}
							class="mask mask-circle w-16 mr-4"
						/>
						<h4 class="text-xl font-semibold text-gray-800">{testimonial.name}</h4>
					</div>
					<p class="text-gray-700 text-base">{testimonial.review}</p>
				</motion.div>
			{/each}
		</div>
		<!-- Sezione Statistiche -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 mx-10">
			<div
				class="flex flex-col items-center justify-center p-2 bg-white rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
			>
				<h3 class="text-4xl font-bold text-gray-800">2,000+</h3>
				<p class="text-gray-600">Lezioni svolte</p>
			</div>
			<div
				class="flex flex-col items-center justify-center bg-white rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
			>
				<h3 class="text-4xl font-bold text-gray-800">360+</h3>
				<p class="text-gray-600">Riflessologi istruiti</p>
			</div>
			<div
				class="flex flex-col items-center justify-center bg-white rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
			>
				<h3 class="text-4xl font-bold text-gray-800">40+</h3>
				<p class="text-gray-600">Paesi di diffusione</p>
			</div>
			<div
				class="flex flex-col items-center justify-center bg-white rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
			>
				<h3 class="text-4xl font-bold text-gray-800">12+</h3>
				<p class="text-gray-600">Anni di esperienza</p>
			</div>
		</div>
	</section>

	<section class="col-span-6 py-12 rounded-xl bg-gray-50">
		<div class="container mx-auto p-4">
			<h1 class="text-3xl font-bold text-center -mt-8 mb-10">Domande e risposte</h1>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div
					id="question"
					class="bg-gray-100 p-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
				>
					<h2 class="text-lg font-semibold text-blue-800 mb-2">Come divento socio?</h2>
					<p class="text-gray-700">
						In questa pagina "Quote associative" è possibile iscriversi come socio ordinario
						premendo il pulsante "Associati" per 25 euro all'anno oppure come socio vitalizio
						premendo il pulsante "Associati a vita" per un singolo pagamento di 390€.
					</p>
				</div>

				<div
					id="answer"
					class="bg-gray-100 p-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
				>
					<h2 class="text-lg font-semibold text-blue-800 mb-2">
						Cosa succede se come socio ordinario non rinnovo l'iscrizione in tempo?
					</h2>
					<p class="text-gray-700">
						Se l'inscrizione a socio ordinario non viene rinnovato entro un anno dalla prima
						associazione o dall'ultimo rinnovo i privilegi da socio decadono.
					</p>
				</div>

				<div
					id="question"
					class="bg-gray-100 p-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
				>
					<h2 class="text-lg font-semibold text-blue-800 mb-2">
						Quali sono le differenze tra un socio ordinario e un socio vitalizio?
					</h2>
					<p class="text-gray-700">
						Il socio ordinario e il socio vitalizio godono degli stessi privilegi e accessi. L'unica
						differenza risiede nel pagamento. Al socio ordinario sarà richiesto di rinnovare
						manualmente l'abbonamento di 25 euro ogni anno, con il rischio di perdita dei privilegi
						in caso di mancato rinnovo. Al contrario al socio vitalizio sarà necessario pagare
						solamente una volta l'acconto di 390 euro per rimanere associato a vita, senza alcun
						bisogno di rinnovamento.
					</p>
				</div>

				<div
					id="answer"
					class="bg-gray-100 p-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
				>
					<h2 class="text-lg font-semibold text-blue-800 mb-2">
						Posso diventare socio vitalizio se sono già socio ordinario?
					</h2>
					<p class="text-gray-700">
						Come socio ordinario è possibile diventare soci vitalizi in qualsiasi momento premendo
						il pulsante "Associati a vita" e procedendo con il pagamento.
					</p>
				</div>
			</div>
		</div>
	</section>
</div>
<Notification {toastClosed} {notificationContent} {notificationError} />

<!-- modal CONFIRM -->
<dialog id="my_modal_2" class="modal" class:modal-open={false}>
	<div class="modal-box flex flex-col text-center">
		<div class="container mx-auto">
			<div class="flex justify-center">
				<div class="w-full">
					<form
						method="POST"
						action={postAction}
						use:enhance
						class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
					>
						<header class="col-span-4 text-center text-2xl font-bold text-green-800">
							{modalTitle}
						</header>
						{#if !auth}
							<section class="col-span-4 md:col-span-2">
								<label for="nome" class="form-label">
									<p class="font-bold mb-2">Nome</p>
								</label>
								<div class="join join-horizontal rounded-md w-full">
									<button class="join-item bg-gray-300 px-3"><User /></button>
									<input
										class="input input-bordered join-item w-full"
										id="nome"
										name="name"
										type="text"
										placeholder="Nome"
										aria-label="nome"
										aria-describedby="basic-nome"
										bind:value={name}
										required
									/>
								</div>
							</section>

							<section class="col-span-4 md:col-span-2">
								<label for="cognome" class="form-label">
									<p class="font-bold mb-2">Cognome</p>
								</label>
								<div class="join join-horizontal rounded-md w-full">
									<button class="join-item bg-gray-300 px-3"><User /></button>
									<input
										class="input input-bordered join-item w-full"
										id="cognome"
										name="surname"
										type="text"
										placeholder="Cognome"
										aria-label="cognome"
										aria-describedby="basic-cognome"
										bind:value={surname}
										required
									/>
								</div>
							</section>

							<section class="col-span-4">
								<label for="email" class="form-label">
									<p class="font-bold mb-2">Email</p>
								</label>
								<div class="join join-horizontal rounded-md w-full">
									<button class="join-item bg-gray-300 px-3"><Mail /></button>
									<input
										class="input input-bordered join-item w-full"
										id="email"
										name="email"
										type="email"
										placeholder="Tua Email"
										bind:value={email}
										required
									/>
								</div>
							</section>

							<section class="col-span-4">
								<label for="indirizzo" class="form-label">
									<p class="font-bold mb-2">Indirizzo</p>
								</label>
								<div class="join join-horizontal rounded-md w-full">
									<button class="join-item bg-gray-300 px-3"><MapPin /></button>
									<input
										class="input input-bordered join-item w-full"
										id="indirizzo"
										name="address"
										type="text"
										placeholder="Indirizzo"
										aria-label="indirizzo"
										aria-describedby="basic-indirizzo"
										bind:value={address}
										required
									/>
								</div>
							</section>

							<section class="col-span-4 md:col-span-2">
								<label for="cap" class="form-label">
									<p class="font-bold mb-2">CAP</p>
								</label>
								<div class="join join-horizontal rounded-md w-full">
									<button class="join-item bg-gray-300 px-3"><MapPin /></button>
									<input
										class="input input-bordered join-item w-full"
										id="cap"
										name="postalCode"
										type="text"
										placeholder="CAP"
										aria-label="cap"
										aria-describedby="basic-cap"
										bind:value={postalCode}
										required
									/>
								</div>
							</section>

							<section class="col-span-4 md:col-span-2">
								<label for="citta" class="form-label">
									<p class="font-bold mb-2">Città</p>
								</label>
								<div class="join join-horizontal rounded-md w-full">
									<button class="join-item bg-gray-300 px-3"><Building2 /></button>
									<input
										class="input input-bordered join-item w-full"
										id="citta"
										name="city"
										type="text"
										placeholder="Città"
										aria-label="citta"
										aria-describedby="basic-citta"
										bind:value={city}
										required
									/>
								</div>
							</section>

							<section class="col-span-4">
								<label for="provincia" class="form-label">
									<p class="font-bold mb-2">Provincia</p>
								</label>
								<div class="join join-horizontal rounded-md w-full">
									<button class="join-item bg-gray-300 px-3"><Building2 /></button>
									<select
										class="select select-bordered w-full rounded-md mt-2 rounded-l-none"
										id="provincia"
										name="countryState"
										aria-label="Provincia"
										aria-describedby="basic-provincia"
										placeholder="Scegli"
										bind:value={countryState}
										required
									>
										<option selected disabled>Scegli</option>
										{#each $province as provincia, i}
											<option value={provincia.title}>
												{provincia.title} ({provincia.code})
											</option>
										{/each}
									</select>
								</div>
							</section>

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
										name="country"
										required
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
							</section>

							<section class="col-span-4">
								<label for="telefono" class="form-label">
									<p class="font-bold mb-2">Telefono</p>
								</label>
								<div class="join join-horizontal rounded-md w-full">
									<button class="join-item bg-gray-300 px-3"><Phone /></button>
									<input
										class="input input-bordered join-item w-full"
										id="telefono"
										name="phone"
										type="text"
										placeholder="Telefono"
										aria-label="telefono"
										aria-describedby="basic-telefono"
										bind:value={phone}
									/>
								</div>
							</section>

							<section class="col-span-4">
								<label for="cellulare" class="form-label">
									<p class="font-bold mb-2">Cellulare</p>
								</label>
								<div class="join join-horizontal rounded-md w-full">
									<button class="join-item bg-gray-300 px-3"><Smartphone /></button>
									<input
										class="input input-bordered join-item w-full"
										id="cellulare"
										name="mobilePhone"
										type="text"
										placeholder="Cellulare"
										aria-label="cellulare"
										aria-describedby="basic-cellulare"
										bind:value={mobilePhone}
									/>
								</div>
							</section>
							<section class="col-span-4">
								<label for="password" class="form-label">
									<p class="font-bold mb-2">
										Password <br />
										<span class="text-sm text-gray-600"
											>( Almeno 8 caratteri numeri e lettere )</span
										>
									</p>
								</label>
								<div class="join join-horizontal rounded-md w-full">
									<button class="join-item bg-gray-300 px-3"
										><Lock color={checkPass ? 'green' : 'black'} /></button
									>
									<input
										class="input input-bordered join-item w-full"
										id="password"
										name="password1"
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
						{/if}
						<section class="col-span-4">
							<hr class="bg-black h-0.5 mt-3 opacity-100 mx-auto w-[385px]" />
							{#if auth}
								<p class="py-2 font-semibold mt-2">
									Attuale livello associazione: {userData?.membership?.membershipLevel}
								</p>
							{/if}
							{#if auth && currentDialog == 'renew'}
								<p class="py-2 font-semibold mt-2">
									Attuale data di scadenza:
									<strong class="text-red-500">{userData.membership.membershipExpiry}</strong>
								</p>
								<p class=" font-semibold">
									Futura data di scadenza:
									<b class="text-green-500">{newExpire}</b>
								</p>
							{/if}
							<p class="  font-bold text-lg text-center mt-4">
								{#if currentDialog == 'associate' || currentDialog == 'renew'}
									Totale: 25€
								{:else if currentDialog == 'lifetime'}
									Totale: 390€
								{/if}
							</p>
							<hr class="bg-black h-0.5 mt-3 opacity-100 mx-auto w-[385px]" />
							<p class="  font-bold text-lg text-center mt-4">Scegli il metodo di pagamento:</p>
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

							<div class="modal-action">
								<button
									type="button"
									class="btn btn-sm btn-error w-24 hover:bg-white hover:text-red-500 rounded-lg"
									onclick={() => (isModal = false)}>Chiudi</button
								>
								<button
									type="submit"
									class="btn btn-sm btn-success w-24 hover:bg-white hover:text-green-500 rounded-lg"
									>Conferma</button
								>
							</div>
						</section>
					</form>
				</div>
			</div>
		</div>
	</div>
</dialog>
<!-- modal END CONFIRM -->

<Modal
	isOpen={isModal}
	header={modalTitle}
	headerBg="bg-blue-600"
	footer="ERROR SPACE"
	footerColor="text-error"
>
	<button
		class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
		onclick={() => (isModal = false)}>✕</button
	>
	<!-- START CONTENT -->
	<div class="flex justify-center">
		<div class="w-full">
			<form
				method="POST"
				action={postAction}
				use:enhance
				class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			>
				<!-- <header class="col-span-4 text-center text-2xl font-bold text-green-800">
					{modalTitle}
				</header> -->
				{#if !auth}
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
								name="name"
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
								name="surname"
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
								name="email"
								type="email"
								placeholder="Tua Email"
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
								name="address"
								type="text"
								placeholder="Indirizzo"
								aria-label="indirizzo"
								aria-describedby="basic-indirizzo"
								bind:value={address}
								required
							/>
						</div>
					</section>
					<!-- CAP -->
					<section class="col-span-4 md:col-span-2">
						<label for="cap" class="form-label">
							<p class="font-bold mb-2">CAP</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button class="join-item bg-gray-300 px-3"><MapPin /></button>
							<input
								class="input input-bordered join-item w-full"
								id="cap"
								name="postalCode"
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
					<section class="col-span-4 md:col-span-2">
						<label for="citta" class="form-label">
							<p class="font-bold mb-2">Città</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button class="join-item bg-gray-300 px-3"><Building2 /></button>
							<input
								class="input input-bordered join-item w-full"
								id="citta"
								name="city"
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
					<section class="col-span-4">
						<label for="provincia" class="form-label">
							<p class="font-bold mb-2">Provincia</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button class="join-item bg-gray-300 px-3"><Building2 /></button>
							<select
								class="select select-bordered w-full rounded-md mt-2 rounded-l-none"
								id="provincia"
								name="countryState"
								aria-label="Provincia"
								aria-describedby="basic-provincia"
								placeholder="Scegli"
								bind:value={countryState}
								required
							>
								<option selected disabled>Scegli</option>
								{#each $province as provincia, i}
									<option value={provincia.title}>
										{provincia.title} ({provincia.code})
									</option>
								{/each}
							</select>
						</div>
					</section>
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
								name="country"
								required
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
								name="phone"
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
								name="mobilePhone"
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
								name="password1"
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
				{/if}
				<section class="col-span-4">
					<hr class="bg-black h-0.5 mt-3 opacity-100 mx-auto w-[385px]" />
					{#if auth}
						<p class="py-2 font-semibold mt-2">
							Attuale livello associazione: {userData?.membership?.membershipLevel}
						</p>
					{/if}
					{#if auth && currentDialog == 'renew'}
						<p class="py-2 font-semibold mt-2">
							Attuale data di scadenza:
							<strong class="text-red-500">{userData.membership.membershipExpiry}</strong>
						</p>
						<p class=" font-semibold">
							Futura data di scadenza:
							<b class="text-green-500">{newExpire}</b>
						</p>
					{/if}
					<p class="  font-bold text-lg text-center mt-4">
						{#if currentDialog == 'associate' || currentDialog == 'renew'}
							Totale: 25€
						{:else if currentDialog == 'lifetime'}
							Totale: 390€
						{/if}
					</p>
					<hr class="bg-black h-0.5 mt-3 opacity-100 mx-auto w-[385px]" />
					<p class="  font-bold text-lg text-center mt-4">Scegli il metodo di pagamento:</p>
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

					<!-- button -->
					<div class="modal-action">
						<button
							type="button"
							class="btn btn-sm btn-error w-24 hover:bg-white hover:text-red-500 rounded-lg"
							onclick={() => (isModal = false)}>Chiudi</button
						>
						<button
							type="submit"
							class="btn btn-sm btn-success w-24 hover:bg-white hover:text-green-500 rounded-lg"
							>Conferma</button
						>
					</div>
				</section>
			</form>
		</div>
	</div>
</Modal>
