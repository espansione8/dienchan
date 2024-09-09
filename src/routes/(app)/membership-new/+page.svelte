<script lang="ts">
	import { CircleCheckBig } from 'lucide-svelte';
	import Notification from '$lib/components/Notification.svelte';
	import moment from 'moment';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();
	let { userData } = $derived(data);

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

	const onClickAssociateOrdinary = async () => {
		//alert('save data');
		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/memberships/new`, {
			method: 'POST',
			body: JSON.stringify({
				id: userData._id,
				userId: userData.userId,
				membershipLevel: 'Socio ordinario',
				membershipSignUp: new Date(),
				membershipActivation: new Date(),
				membershipExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
				membershipStatus: true
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
			if (content == 'Utente già socio!') {
				notificationError = true;
			}
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

	const onClickAssociateLifetime = async () => {
		//alert('save data');
		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/memberships/new`, {
			method: 'POST',
			body: JSON.stringify({
				id: userData._id,
				userId: userData.userId,
				membershipLevel: 'Socio vitalizio',
				membershipSignUp: new Date(),
				membershipActivation: new Date(),
				membershipExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 50)),
				membershipStatus: true
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
			if (content == 'Utente già socio!') {
				notificationError = true;
			}
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

	// const addOneYear = date => new Date(date.setFullYear(date.getFullYear() + 1));

	const onClickConfirmRenew = async () => {
		//alert('save data');
		isModalSuccess = false;
		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/memberships/renew`, {
			method: 'POST',
			body: JSON.stringify({
				id: userData._id,
				membershipActivation: userData.membership.membershipExpiry,
				membershipExpiry: new Date(
					new Date(userData.membership.membershipExpiry).setFullYear(
						new Date(userData.membership.membershipExpiry).getFullYear() + 1
					)
				),
				membershipStatus: true
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
			if (content == 'Rinnovo NON effettuato!') {
				notificationError = true;
			}
			invalidateAll();
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

	let paymentType = $state('bonifico');
	let isModalSuccess = $state(false);
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
						<img src="/images/card-1.jpg" alt="tipo corso" class="h-40 rounded-full object-cover" />
					</figure>
				</div>
				<div class="flex justify-between space-x-4 my-4">
					<button
						class="btn btn-sm bg-red-500 text-white w-2/5 rounded-xl"
						onclick={onClickAssociateOrdinary}
					>
						Associati</button
					>
					<button
						class="btn btn-sm bg-transparent border-2 border-white text-white w-2/5 rounded-xl"
						onclick={() => {
							isModalSuccess = true;
						}}>Rinnova</button
					>
				</div>
			</div>
		</div>
	</section>

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
					onclick={onClickAssociateLifetime}>Associati</button
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

<!-- modal CONFIRM RENEW -->
<dialog id="my_modal_2" class="modal" class:modal-open={isModalSuccess}>
	<div class="modal-box flex flex-col text-center">
		<h3 class="font-bold text-xl">Confermi rinnovo annuale: socio vitalizio?</h3>
		<!-- ATTENZIONE ERRORE 500 -->
		<p class="py-2 font-semibold mt-2">
			Attuale data di scadenza:
			<strong class='text-red-500'>{moment(userData.membership.membershipExpiry).format('DD/MM/YYYY')}</strong>
		</p>
		<p class=" font-semibold">
			Futura data di scadenza:
			<!-- ATTENZIONE ERRORE 500 -->
			<b class='text-green-500'>{moment(
				new Date(
					new Date(userData.membership.membershipExpiry).setFullYear(
						new Date(userData.membership.membershipExpiry).getFullYear() + 1
					)
				)
			).format('DD/MM/YYYY')}</b>
		</p>
		<hr class="bg-black h-0.5 mt-3 opacity-100 mx-auto w-[385px]" />
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
		<div class="modal-action">
			<button
				class="btn btn-sm btn-error w-24 hover:bg-white hover:text-red-500 rounded-lg"
				onclick={() => (isModalSuccess = false)}>Chiudi</button
			>
			<button
				class="btn btn-sm btn-success w-24 hover:bg-white hover:text-green-500 rounded-lg"
				onclick={onClickConfirmRenew}>Conferma</button
			>
		</div>
	</div>
</dialog>
