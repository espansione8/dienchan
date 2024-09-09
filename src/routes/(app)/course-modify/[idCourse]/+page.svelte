<script lang="ts">
	import { Calendar, Pen, Users, Building2, Send, List, Calculator, FileDown } from 'lucide-svelte';
	import Notification from '$lib/components/Notification.svelte';
	import { coursesTypes, coursesInfo } from '$lib/stores/arrays';
	import { province } from '$lib/stores/arrays.js';
	import moment from 'moment';
	const date = new Date();
	let { data } = $props();
	let { getCourse } = $derived(data);

	//console.log('getCourse', getCourse);

	const pad = (num: any) => {
		const newNum = Number(num);
		const norm = Math.floor(Math.abs(newNum));
		let text = '';
		if (norm < 10) text = '0';
		const outpupt = `${text}${norm}`;
		return outpupt;
	};

	const containsOnlyNumbers = (str: any) => {
		return str.replace(/[^\d]+/g, '');
	};

	let productCorsoTitolo = $state(getCourse.title);
	let productCorsoID = $state(getCourse.courseId);
	let productCorsoInfoExtra = $state(getCourse.infoExtra);
	let productCorsoDescrizione = $state(getCourse.descrLong);
	let productCorsoUserId = $state(getCourse.userId);
	let productCorsoStatus = $state(getCourse.status);
	let productCorsoProvincia = $state(getCourse.place);
	let productCorsoCategoria = $state();
	let productCorsoElencoTag: any[] = $state(getCourse.tag);
	let productCorsoInputTag = $state('');
	let productCorsoQuantitaPartecipanti = $state(getCourse.stockQty);
	let productCorsoElencoEmailNotifica = $state(getCourse.notificationEmail);
	let productCorsoInputEmailNotifica = $state('');
	let productPriceCorso = $state(getCourse.price);
	let productCorsoDataInizioOra = $state(moment(getCourse.eventStartDate).format('HH'));
	let productCorsoDataInizioGiorno = $state(moment(getCourse.eventStartDate).format('DD'));
	let productCorsoDataInizioMese = $state(moment(getCourse.eventStartDate).format('MM'));
	let productCorsoDataInizioAnno = $state(moment(getCourse.eventStartDate).format('YYYY'));
	let productCorsoDataInizioproductCorsoDataFineCompletoOra = $state(
		moment(getCourse.eventStartDate).format('HH')
	);
	let productCorsoDataInizioMinuto = $state(moment(getCourse.eventStartDate).format('mm'));
	let productCorsoDataFineGiorno = $state(moment(getCourse.eventEndDate).format('DD'));
	let productCorsoDataFineMese = $state(moment(getCourse.eventEndDate).format('MM'));
	let productCorsoDataFineAnno = $state(moment(getCourse.eventEndDate).format('YYYY'));
	let productCorsoDataFineOra = $state(moment(getCourse.eventEndDate).format('HH'));
	let productCorsoDataFineMinuto = $state(moment(getCourse.eventEndDate).format('mm'));
	let error = $state();
	let productCorsoDataInizioCompleto = $derived(
		`${productCorsoDataInizioAnno}-${productCorsoDataInizioMese}-${productCorsoDataInizioGiorno} ${productCorsoDataInizioOra}:${productCorsoDataInizioMinuto}`
	);
	let productCorsoDataFineCompleto = $derived(
		`${productCorsoDataFineAnno}-${productCorsoDataFineMese}-${productCorsoDataFineGiorno} ${productCorsoDataFineOra}:${productCorsoDataFineMinuto}`
	);

	// console.log('productCorsoDataInizioAnno', typeof productCorsoDataInizioAnno);
	// console.log('productCorsoDataInizioGiorno', typeof productCorsoDataInizioGiorno);

	// console.log('getCourse.eventStartDate', getCourse.eventStartDate);
	// console.log('productCorsoDataInizioAnno', productCorsoDataInizioAnno);

	async function submitForm() {
		//console.log('getCourse.name', getCourse.reflexologistName);
		const response = await fetch(`/api/courses/modify`, {
			method: 'POST',
			body: JSON.stringify({
				productCorsoID,
				productCorsoUserId,
				productCorsoTitolo,
				productCorsoInfoExtra,
				productCorsoDescrizione,
				productCorsoDataInizioCompleto,
				productCorsoDataFineCompleto,
				productCorsoStatus,
				productCorsoQuantitaPartecipanti,
				productCorsoProvincia,
				productCorsoCategoria,
				productCorsoElencoEmailNotifica,
				productCorsoElencoTag,
				productPriceCorso,
				reflexologistName: getCourse.reflexologistName,
				surname: getCourse.surname
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
			// fieldReset(); // svuota i campi dopo inserimento
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
		productCorsoTitolo = '';
		productCorsoDescrizione = '';
		productCorsoUserId = getCourse.userId;
		productCorsoDataInizioGiorno = pad(date.getDate());
		productCorsoDataInizioMese = pad(date.getMonth() + 1);
		productCorsoDataInizioAnno = pad(date.getFullYear());
		productCorsoDataInizioOra = pad(date.getHours());
		productCorsoDataInizioMinuto = pad(date.getMinutes());
		productCorsoDataFineGiorno = pad(date.getDate());
		productCorsoDataFineMese = pad(date.getMonth() + 1);
		productCorsoDataFineAnno = pad(date.getFullYear());
		productCorsoDataFineOra = pad(date.getHours() + 1);
		productCorsoDataFineMinuto = pad(date.getMinutes());
		productCorsoStatus = 'enabled';
		productCorsoQuantitaPartecipanti = 1;
		productCorsoProvincia = '';
		productCorsoCategoria = '';
		productCorsoInputEmailNotifica = '';
		productCorsoInputTag = '';
		productPriceCorso = 1;
		productCorsoElencoEmailNotifica = [getCourse.email];
		productCorsoElencoTag = [];
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
	const selectCategory = () => {
		switch (productCorsoCategoria) {
			case 'Corso base':
				productCorsoTitolo = $coursesInfo[0].title;
				productCorsoDescrizione = $coursesInfo[0].descr;
				break;
			case 'Corso avanzato':
				productCorsoTitolo = $coursesInfo[1].title;
				productCorsoDescrizione = $coursesInfo[1].descr;
				break;
			case 'Workshop':
				productCorsoTitolo = $coursesInfo[2].title;
				productCorsoDescrizione = $coursesInfo[2].descr;
				break;
			default:
		}
	};
</script>

<svelte:head>
	<title>Modifica corso</title>
</svelte:head>

<form
	onsubmit={submitForm}
	class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
>
	<header class="col-span-4 text-center text-2xl font-bold text-green-800">Modifica Corso</header>
	<!-- Categoria  -->
	<section class="col-span-4 md:col-span-2">
		<label for="categoria" class="form-label">
			<p class="font-bold mb-2">Categoria</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><Pen /></button>
			<select
				class="select select-bordered w-full rounded-md mt-2 rounded-l-none"
				id="categoria"
				aria-label="Categoria"
				aria-describedby="basic-categoria"
				bind:value={productCorsoCategoria}
				onchange={() => selectCategory()}
				required
			>
				<option disabled value="">Scegli</option>
				{#each $coursesTypes as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>
	</section>
	<!-- Prezzo corso -->
	<section class="col-span-4 md:col-span-2">
		<label for="priceCorso" class="form-label">
			<p class="font-bold mb-2">Prezzo corso</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><Calculator /></button>
			<input
				class="input input-bordered join-item w-full"
				id="priceCorso"
				type="number"
				placeholder="N."
				aria-label="priceCorso"
				aria-describedby="basic-priceCorso"
				step="0.50"
				min="1"
				bind:value={productPriceCorso}
				readonly
			/>
		</div>
	</section>
	<!-- Data Inizio -->
	<section class="col-span-4 md:col-span-1">
		<label for="data-inizio" class="form-label">
			<p class="font-bold mb-2">Data inizio</p>
		</label>
		<div class=" join join-horizontal rounded-md">
			<button class="join-item bg-gray-300 px-3"><Calendar /></button>
			<!-- Giorno Dropdown -->
			<select
				id="data-inizio-giorno"
				class="join-item select select-bordered w-20"
				aria-label="Seleziona Giorno"
				bind:value={productCorsoDataInizioGiorno}
				onchange={() => {
					productCorsoDataInizioGiorno = pad(productCorsoDataInizioGiorno);
				}}
				required
			>
				<option value="" disabled selected>Giorno</option>
				{#each Array(31)
					.fill()
					.map((_, i) => i + 1) as day}
					<option value={String(day).padStart(2, '0')}>{day}</option>
				{/each}
			</select>
			<button class="join-item bg-gray-300 px-3"> - </button>
			<!-- Mese Dropdown -->
			<select
				id="data-inizio-mese"
				class="join-item select select-bordered w-20"
				aria-label="Seleziona Mese"
				bind:value={productCorsoDataInizioMese}
				onchange={() => {
					productCorsoDataInizioMese = pad(productCorsoDataInizioMese);
				}}
				required
			>
				<option value="" disabled selected>Mese</option>
				{#each ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as month}
					<option value={month}>{month}</option>
				{/each}
			</select>
			<button class="join-item bg-gray-300 px-3"> - </button>
			<!-- Anno Dropdown -->
			<select
				id="data-inizio-anno"
				class="join-item select select-bordered w-26 rounded-r-md"
				aria-label="Seleziona Anno"
				bind:value={productCorsoDataInizioAnno}
				onchange={() => {
					productCorsoDataInizioAnno = containsOnlyNumbers(productCorsoDataInizioAnno);
				}}
				required
			>
				<option value="" disabled selected>Anno</option>
				{#each Array(20)
					.fill()
					.map((_, i) => 2024 - i) as year}
					<option value={year.toString()}>{year.toString()}</option>
				{/each}
			</select>
		</div>
	</section>

	<!-- Orario Inizio -->
	<section class="col-span-4 md:col-span-1">
		<label for="orario-inizio" class="form-label">
			<p class="font-bold mb-2">Orario inizio</p>
		</label>
		<div class="join join-horizontal rounded-md">
			<!-- Ore Dropdown -->
			<select
				id="data-inizio-ora"
				class="join-item select select-bordered w-20 rounded-l-md"
				aria-label="Seleziona Ora"
				bind:value={productCorsoDataInizioOra}
				onchange={() => {
					productCorsoDataInizioOra = pad(productCorsoDataInizioOra);
				}}
				required
			>
				<option value="" disabled selected>Ore</option>
				{#each Array(24)
					.fill()
					.map((_, i) => i) as hour}
					<option value={String(hour).padStart(2, '0')}>{hour}</option>
				{/each}
			</select>
			<button class="join-item bg-gray-300 px-3"> : </button>
			<!-- Minuti Dropdown -->
			<select
				id="data-inizio-minuto"
				class="join-item select select-bordered w-20 rounded-r-md"
				aria-label="Seleziona Minuti"
				bind:value={productCorsoDataInizioMinuto}
				onchange={() => {
					productCorsoDataInizioMinuto = pad(productCorsoDataInizioMinuto);
				}}
				required
			>
				<option value="" disabled selected>Minuti</option>
				{#each Array(60)
					.fill()
					.map((_, i) => i) as minute}
					<option value={String(minute).padStart(2, '0')}>{minute}</option>
				{/each}
			</select>
		</div>
		<div id="data-inizio-orario-Help" class="text-gray-600 mt-2 text-sm">Esempio orario: 23:59</div>
	</section>

	<!-- Data Fine -->

	<section class="col-span-4 md:col-span-1">
		<label for="data-fine" class="form-label">
			<p class="font-bold mb-2">Data fine</p>
		</label>
		<div class=" join join-horizontal rounded-md">
			<button class="join-item bg-gray-300 px-3"><Calendar /></button>
			<!-- Giorno Dropdown -->
			<select
				id="data-fine-giorno"
				class="join-item select select-bordered w-20"
				aria-label="Seleziona Giorno"
				bind:value={productCorsoDataFineGiorno}
				onchange={() => {
					productCorsoDataFineGiorno = pad(productCorsoDataFineGiorno);
				}}
				required
			>
				<option value="" disabled selected>Giorno</option>
				{#each Array(31)
					.fill()
					.map((_, i) => i + 1) as day}
					<option value={String(day).padStart(2, '0')}>{day}</option>
				{/each}
			</select>
			<button class="join-item bg-gray-300 px-3"> - </button>
			<!-- Mese Dropdown -->
			<select
				id="data-fine-mese"
				class="join-item select select-bordered w-20"
				aria-label="Seleziona Mese"
				bind:value={productCorsoDataFineMese}
				onchange={() => {
					productCorsoDataFineMese = pad(productCorsoDataFineMese);
				}}
				required
			>
				<option value="" disabled selected>Mese</option>
				{#each ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as month}
					<option value={month}>{month}</option>
				{/each}
			</select>
			<button class="join-item bg-gray-300 px-3"> - </button>
			<!-- Anno Dropdown -->
			<select
				id="data-fine-anno"
				class="join-item select select-bordered w-26 rounded-r-md"
				aria-label="Seleziona Anno"
				bind:value={productCorsoDataFineAnno}
				onchange={() => {
					productCorsoDataFineAnno = containsOnlyNumbers(productCorsoDataFineAnno);
				}}
				required
			>
				<option value="" disabled selected>Anno</option>
				{#each Array(20)
					.fill()
					.map((_, i) => 2024 - i) as year}
					<option value={year.toString()}>{year.toString()}</option>
				{/each}
			</select>
		</div>
	</section>
	<!-- Orario Fine -->

	<section class="col-span-4 md:col-span-1">
		<label for="orario-fine" class="form-label">
			<p class="font-bold mb-2">Orario inizio</p>
		</label>
		<div class="join join-horizontal rounded-md">
			<!-- Ore Dropdown -->
			<select
				id="data-fine-ora"
				class="join-item select select-bordered w-20 rounded-l-md"
				aria-label="Seleziona Ora"
				bind:value={productCorsoDataFineOra}
				onchange={() => {
					productCorsoDataFineOra = pad(productCorsoDataFineOra);
				}}
				required
			>
				<option value="" disabled selected>Ore</option>
				{#each Array(24)
					.fill()
					.map((_, i) => i) as hour}
					<option value={String(hour).padStart(2, '0')}>{hour}</option>
				{/each}
			</select>
			<button class="join-item bg-gray-300 px-3"> : </button>
			<!-- Minuti Dropdown -->
			<select
				id="data-fine-minuto"
				class="join-item select select-bordered w-20 rounded-r-md"
				aria-label="Seleziona Minuti"
				bind:value={productCorsoDataFineMinuto}
				onchange={() => {
					productCorsoDataFineMinuto = pad(productCorsoDataFineMinuto);
				}}
				required
			>
				<option value="" disabled selected>Minuti</option>
				{#each Array(60)
					.fill()
					.map((_, i) => i) as minute}
					<option value={String(minute).padStart(2, '0')}>{minute}</option>
				{/each}
			</select>
		</div>
		<div id="data-inizio-orario-Help" class="text-gray-600 mt-2 text-sm">Esempio orario: 23:59</div>
	</section>
	<!-- Numero partecipanti -->
	<section class="col-span-4 md:col-span-2">
		<label for="quantitaPartecipanti" class="form-label">
			<p class="font-bold mb-2">Numero partecipanti</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><Users /></button>
			<input
				class="input input-bordered join-item w-full"
				id="quantitaPartecipanti"
				type="number"
				placeholder="N."
				aria-label="quantitaPartecipanti"
				aria-describedby="basic-quantitaPartecipanti"
				step="1"
				min="0"
				bind:value={productCorsoQuantitaPartecipanti}
				required
			/>
		</div>
	</section>
	<!-- Provincia -->
	<section class="col-span-4 md:col-span-2">
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
				bind:value={productCorsoProvincia}
				required
			>
				<option disabled value="">Scegli</option>
				<option value="Online">Online</option>
				{#each $province as provincia, i}
					<option value={provincia.sigla}>
						{provincia.nome} ({provincia.sigla})
					</option>
				{/each}
			</select>
		</div>
	</section>
	<!-- Tag -->
	<section class="col-span-4 md:col-span-2">
		<label for="InputTag" class="form-label">
			<p class="font-bold mb-2">Tag</p>
		</label>
		<div class="join join-horizontal rounded-md w-full mb-2">
			<button class="join-item bg-gray-300 px-3"><List /></button>
			<input
				class="input input-bordered join-item w-full"
				id="InputTag"
				type="text"
				placeholder="Aggiungi Tag"
				aria-label="InputTag"
				aria-describedby="basic-InputTag"
				bind:value={productCorsoInputTag}
			/>
			<button
				type="button"
				class="join-item btn btn-primary"
				onclick={() => {
					if (productCorsoInputTag !== '') {
						productCorsoElencoTag.push(productCorsoInputTag);
						productCorsoElencoTag = productCorsoElencoTag;
						productCorsoInputTag = '';
					}
				}}
			>
				Aggiungi
			</button>
		</div>
		{#if productCorsoElencoTag.length !== 0}
			{#each productCorsoElencoTag as badgeTag}
				<div class="btn btn-primary mx-1 rounded-md">
					{badgeTag}
					{' '}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="badge badge-error felx items-center"
						onclick={() => {
							let index = productCorsoElencoTag.indexOf(badgeTag);
							if (index !== -1) {
								productCorsoElencoTag.splice(index, 1);
								productCorsoElencoTag = productCorsoElencoTag;
							}
						}}
					>
						X
					</span>
				</div>
			{/each}
		{/if}
	</section>
	<!-- Notifica email -->
	<section class="col-span-4 md:col-span-2">
		<label for="InputEmailNotifica" class="form-label">
			<p class="font-bold mb-2">Notifica Email</p>
		</label>
		<div class="join join-horizontal rounded-md w-full mb-2">
			<button class="join-item bg-gray-300 px-3"><Send /></button>
			<input
				class="input input-bordered join-item w-full"
				id="InputEmailNotifica"
				type="email"
				placeholder="Aggiungi Email"
				aria-label="InputEmailNotifica"
				aria-describedby="basic-InputEmailNotifica"
				bind:value={productCorsoInputEmailNotifica}
			/>
			<button
				type="button"
				class="join-item btn btn-primary"
				onclick={() => {
					function validateEmail(emailId: any) {
						var mailformat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,6})$/;
						if (emailId.match(mailformat)) {
							alert('ok email address.');
							productCorsoElencoEmailNotifica.push(productCorsoInputEmailNotifica);
							productCorsoElencoEmailNotifica = productCorsoElencoEmailNotifica;
							// productCorsoElencoEmailNotifica = [
							// 	...productCorsoElencoEmailNotifica,
							// 	productCorsoInputEmailNotifica
							// ];
						} else {
							alert('Invalid email address.');
						}
					}
					validateEmail(productCorsoInputEmailNotifica);
					// productCorsoElencoEmailNotifica.push(productCorsoInputEmailNotifica);
					// productCorsoElencoEmailNotifica = productCorsoElencoEmailNotifica;
					productCorsoInputEmailNotifica = '';
				}}
			>
				Aggiungi
			</button>
		</div>
		{#if productCorsoElencoEmailNotifica.length !== 0}
			{#each productCorsoElencoEmailNotifica as badgeEmailNotifica}
				<div class="btn btn-primary mx-1 rounded-md">
					{badgeEmailNotifica}
					{' '}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="badge badge-error felx items-center"
						onclick={() => {
							let index = productCorsoElencoEmailNotifica.indexOf(badgeEmailNotifica);

							if (index !== -1) {
								productCorsoElencoEmailNotifica.splice(index, 1);
								productCorsoElencoEmailNotifica = productCorsoElencoEmailNotifica;
							}
						}}
					>
						X
					</span>
				</div>
			{/each}
		{/if}
	</section>
	<!-- Titolo -->
	<section class="col-span-2">
		<label for="titolo" class="form-label">
			<p class="font-bold mb-2">Titolo</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><Pen /></button>
			<input
				class="input input-bordered join-item w-full"
				id="titolo"
				type="text"
				placeholder="Titolo"
				aria-label="Titolo"
				aria-describedby="basic-titolo"
				bind:value={productCorsoTitolo}
				readonly
			/>
		</div>
		<!-- Descrizione -->
		<label for="descrizione" class="form-label">
			<p class="font-bold mb-2">Descrizione</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><Pen /></button>
			<textarea
				class="textarea textarea-bordered h-24 join-item w-full"
				id="descrizione"
				placeholder="Descrizione ......"
				aria-label="descrizione"
				aria-describedby="basic-descrizione"
				bind:value={productCorsoDescrizione}
				readonly
			/>
		</div>
	</section>
	<!-- ALtre informazioni -->
	<section class="col-span-2">
		<label for="descrizione" class="form-label">
			<p class="font-bold mb-2">Altre informazioni</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><Pen /></button>
			<textarea
				class="textarea textarea-bordered join-item w-full"
				id="descrizione"
				rows="7"
				placeholder="Altre informazioni"
				aria-label="descrizione"
				aria-describedby="basic-descrizione"
				bind:value={productCorsoInfoExtra}
				required
			/>
		</div>
	</section>
	<!-- aggiorna corso button -->
	<div class="col-span-4 mt-5 flex justify-center">
		<button
			class="btn btn-success rounded-lg hover:bg-accent hover:text-green-800hover:bg-accent hover:text-green-900"
			type="submit"
		>
			<span class="flex items-center justify-center">
				<FileDown class="mr-2" />
				AGGIORNA CORSO
			</span>
		</button>
	</div>
</form>
<Notification {toastClosed} {notificationContent} {notificationError} />
