<script lang="ts">
	import moment from 'moment';
	import { coursesInfo } from '$lib/stores/arrays.js';
	import { cartProducts, addToCart, removeFromCart } from '$lib/stores/cart';
	import { province } from '$lib/stores/arrays.js';

	let { data } = $props();
	let { getCourse, userData } = $derived(data);

	const checkCart = (id) => {
		const check = $cartProducts.some((item) => item.prodId == id);
		return check;
	};

	let userfiles = $state(userData.uploadfiles);
	let findAvatar = $state(userfiles.filter((file: any) => file.type === 'avatar'));

	let picFilter = $derived(
		userData.uploadfiles.filter((item: any) => {
			return item.type == 'avatar';
		})
	);

	function siglaToProvincia(provinciaSigla: any) {
		const findProvincia = $province.find((prov) => prov.sigla === provinciaSigla);
		return findProvincia.nome;
	}

	// // cart store
	// const addToCart = (course) => {
	// 	cart.update((n) => {
	// 		// console.log('n', n);
	// 		n.push(course);
	// 		return n;
	// 	});
	// };

	// const removeFromCart = (prodId) => {
	// 	cart.update((n) => {
	// 		// Filtra il carrello per rimuovere il corso con l'ID specificato
	// 		return n.filter((item) => item.prodId !== prodId.prodId);
	// 	});
	// };

	const course = $coursesInfo.filter((item: any) => item.id == getCourse.category);
</script>

<svelte:head>
	<title>{getCourse.title}</title>
</svelte:head>

<div class="flex p-10 bg-gray-100 rounded-lg shadow-lg">
	<div class="flex flex-col gap-6 p-7 bg-white rounded-lg shadow-md w-full">
		<!-- Prima riga con immagine, data, titolo e luogo -->
		<div class="flex items-center mx-auto gap-20">
			<!-- Immagine del corso -->
			<div class="relative w-60 shrink-0 rounded-md overflow-hidden shadow-2xl">
				<img src={course[0].urlPic} alt="course type" class="h-full w-full object-cover" />
			</div>
			<!-- Dettagli del corso -->
			<div class="flex flex-col gap-4 mx-auto text-center">
				<div class="text-3xl font-bold text-blue-600">
					<!-- {getCourse.eventStartDate} -->
					{moment(getCourse.eventStartDate).format('DD/MM/YYYY')}
				</div>
				<div class="text-2xl font-bold text-blue-500 -mt-4">
					Dalle {moment(getCourse.eventStartDate).format('HH:mm')} alle {moment(
						getCourse.eventEndDate
					).format('HH:mm')}
				</div>
				<div class="text-4xl font-semibold text-gray-800">{getCourse.title}</div>
				<div class=" text-3xl text-blue-900">
					<p>
						<b>{siglaToProvincia(getCourse.place)}</b>
					</p>
				</div>
			</div>
			<!-- immagine riflessologo -->
			{#if findAvatar.length > 0}
				<img
					src={`/files/${userData.userId}/${picFilter[0].filename}`}
					alt="avatar"
					class="w-60 mask mask-circle shadow-2xl"
					loading="lazy"
				/>
			{:else}
				<img
					src="/images/avatar.png"
					alt="avatar"
					class="w-60 mask mask-circle shadow-2xl"
					loading="lazy"
				/>
			{/if}
		</div>
		<div class="grid grid-cols-12 gap-10 mt-3">
			<!-- Descrizione del corso + TAG -->
			<section class="col-span-7">
				<div role="tablist" class="tabs tabs-lifted">
					<input
						type="radio"
						name="my_tabs"
						role="tab"
						class="tab text-xl italic"
						aria-label="Descrizione"
						checked={true}
					/>
					<div
						role="tabpanel"
						class="tab-content border-base-300 rounded-lg text-lg leading-relaxed text-gray-600 bg-gray-50 p-4 shadow-inner"
					>
						<p class="my-3">
							{getCourse.descrLong}
						</p>
						<hr />
						<p class="my-3">
							Le attività dell’Associazione sono rivolte esclusivamente agli Associati con la quota
							associativa rinnovata nell’anno corrente.
						</p>

						<p class="my-3">
							Pertanto per qualunque attività è richiesta innanzitutto l’iscrizione e/o il rinnovo
							della Quota ordinaria di € 25,00 Questo dà diritto di partecipare alle attività
							gratuite come, per esempio, il CORSO BASE DI AUTOTRATTAMENTO oppure al CORSO AVANZATO
							INTENSIVO DI APPROFONDIMENTO RISERVATI AI SOCI, L’ASSOCIAZIONE NON FA’ ATTIVITA’
							COMMERCIALI, distribuisce esclusivamente materiale didattico necessario ai suoi
							Associati al fine della pratica della Riflessologia facciale.
						</p>
						<p class="my-3">
							Pertanto, per i Soci che intendono iscriversi sia al Corso base di autotrattamento
							riservato ai Soci, sia al Corso Avanzato Intensivo di approfondimento riservato ai
							soci, dovranno dotarsi dei materiali e strumenti(denominato Kit base plus)
							acquistabile presso il negozio online www.dienchan-online.com (di diritto vietnamita)
							separato dall’attività dell’Associazione. Ritirerà il materiale all’inizio del Corso
							base.
						</p>
					</div>

					<!-- <input
						type="radio"
						name="my_tabs"
						role="tab"
						class="tab tab text-xl italic"
						aria-label="Informazioni"
					/> -->
					<!-- <div
						role="tabpanel"
						class="tab-content border-base-300 rounded-lg text-xl leading-relaxed text-gray-600 bg-gray-50 p-4 shadow-inner"
					>
						
					</div> -->
				</div>

				{#if getCourse.tag.length > 0}
					<span class="flex flex-row gap-4 mt-3">
						<strong>Tag:</strong>
						{#each getCourse.tag as tag}
							<div
								class="badge text-lg font-semibold py-3 px-5 rounded-full flex items-center gap-2 shadow-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500 text-blue-900 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white cursor-pointer transform transition-transform duration-300 hover:scale-105"
							>
								{tag}
							</div>
						{/each}
					</span>
				{/if}
			</section>
			<!-- Dettagli -->
			<section class="col-span-5 space-y-3 mt-12">
				<!-- Riflessologo -->
				<div class="text-2xl font-semibold text-gray-700">
					Riflessologo: <b>{getCourse.name} {getCourse.surname}</b>
				</div>
				<!-- Luogo -->
				<div class="text-2xl font-semibold text-gray-700">
					Luogo: <b>{siglaToProvincia(getCourse.place)} </b>
				</div>
				<!-- Data -->
				<div class="text-2xl font-semibold text-gray-700">
					Data: <b>{moment(getCourse.eventStartDate).format('DD/MM/YYYY')} </b> da
					<b>{moment(getCourse.eventStartDate).format('HH:mm')}</b>
					a <b>{moment(getCourse.eventEndDate).format('HH:mm')}</b>
				</div>
				<!-- Numero partecipanti -->
				<div class="text-2xl font-semibold text-gray-700">
					Numero partecipanti: <b>{getCourse.stockQty} </b>
				</div>
				<!-- Prezzo -->
				<div class="text-2xl font-semibold text-gray-700">
					Prezzo: <b>{getCourse.price} €</b>
				</div>
				<div class="flex justify-start">
					<!-- {#if $cartProducts.some((item: any) => item.prodId == getCourse.prodId)} -->
					{#if checkCart(getCourse.prodId)}
						<button
							class="btn btn-sm bg-red-200 w-40 border border-red-400 rounded-md text-red-700 hover:text-red-700 hover:bg-red-400"
							onclick={() => removeFromCart($cartProducts, getCourse)}>Rimuovi dal Carrello</button
						>
					{:else}
						<button
							class="btn btn-sm bg-green-200 w-40 btn-success rounded-md text-green-700 hover:text-green-300"
							onclick={() => addToCart($cartProducts, getCourse, false)}>Aggiungi a Carrello</button
						>
					{/if}
				</div>

				{#if getCourse.infoExtra.length > 0}
					<div role="tablist" class="tabs tabs-lifted pt-12">
						<input
							type="radio"
							name="my_tabs2"
							role="tab"
							class="tab text-xl italic"
							aria-label="Informazioni"
							checked={true}
						/>
						<div
							role="tabpanel"
							class="tab-content border-base-300 rounded-lg text-lg leading-relaxed text-gray-600 bg-gray-50 p-4 shadow-inner"
						>
							{getCourse.infoExtra}
						</div>
					</div>
				{/if}
			</section>
		</div>
	</div>
</div>

<style>
</style>
