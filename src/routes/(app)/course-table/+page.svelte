<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import Papa from 'papaparse';
	import { enhance } from '$app/forms';
	import { notification } from '$lib/stores/notifications';
	import { province, months, days, hours, minutes } from '$lib/stores/arrays';
	import Modal from '$lib/components/Modal.svelte';
	import { courseKeysToDelete } from '$lib/stores/arrays';
	import Loader from '$lib/components/Loader.svelte';
	import {
		Funnel,
		XCircle,
		Trash2,
		Calendar,
		Pen,
		Users,
		Building2,
		Send,
		List,
		Calculator,
		CopyPlus,
		Settings,
		RefreshCcw,
		FileDown,
		ShieldAlert,
		UserRoundCheck
	} from 'lucide-svelte';

	const { data } = $props();
	const { getTable, getTableNames, userData, getLayout } = $derived(data);
	let tableList = $state(getTable);
	let loading = $state(false);

	const now = new Date();
	let currentYear = now.getFullYear().toString();
	let currentMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() restituisce 0-11, quindi aggiungiamo 1
	let currentDay = now.getDate().toString().padStart(2, '0');
	let currentHour = now.getHours().toString().padStart(2, '0');
	//let currentMinute = now.getMinutes();

	let title = $state('');
	let prodId = $state('');
	let descrLong = $state('');
	let infoExtra = $state('');
	let productCorsoUserId = $state(userData.userId);
	let productCorsoStatus = $state('enabled');
	let county = $state('');
	let location = $state('');
	let layoutId = $state('');
	let userId = $state('');
	let tagArray: any[] = $state([]);
	let tag = $state('');
	let stockQty = $state(1);
	let notificationEmail = $state([userData.email]);
	let inputEmail = $state('');
	let price = $state(1);
	let startYear = $state(currentYear);
	let startMonth = $state(currentMonth);
	let startDay = $state(currentDay);
	let startHour = $state(currentHour);
	let startMinute = $state('00');
	let mode = $state('ONLINE');
	let provinceArray = $state([]);
	let subscribers = $state([]);
	// filter Data
	let sortDirection = $state('asc');
	let sortColumn = $state('createdAt');
	let currentDialog = $state('');
	let currentModal = $state('');

	let openModal = $state(false);
	let postAction = $state('?/');
	let modalTitle = $state('');
	let resetActive = $state(false);

	// year input
	let max = new Date().getFullYear() + 2;
	let min = max - 3;
	let years = [];
	for (let i = max; i >= min; i--) {
		years.push(i.toString());
	}

	let eventStartDate = $derived(
		new Date(`${startYear}-${startMonth}-${startDay}T${startHour}:${startMinute}:00.000+00:00`)
	);

	// const sortTable = (column: string) => {
	// 	if (sortColumn === column) {
	// 		// Se la colonna è già selezionata, invertiamo la direzione
	// 		sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
	// 	} else {
	// 		// Altrimenti, impostiamo la nuova colonna e resettiamo la direzione
	// 		sortColumn = column;
	// 		sortDirection = 'asc';
	// 	}

	// 	tableList = tableList.sort((a: any, b: any) => {
	// 		let valueA = column === 'eventStartDate' ? new Date(a[column]) : a[column];
	// 		let valueB = column === 'eventStartDate' ? new Date(b[column]) : b[column];

	// 		if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
	// 		if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
	// 		return 0;
	// 	});
	// };

	//CSV file
	const csvCreate = () => {
		let csv = $state('');
		let newList: any = $state();

		// const flattenObject = (obj: any, prefix = '') => {
		// 	return Object.keys(obj).reduce((acc, k) => {
		// 		const pre = prefix.length ? prefix + '_' : '';
		// 		if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
		// 			Object.assign(acc, flattenObject(obj[k], pre + k));
		// 		} else {
		// 			acc[pre + k] = obj[k];
		// 		}
		// 		return acc;
		// 	}, {});
		// };

		const flattenObject = (obj: any, prefix = '') => {
			return Object.keys(obj).reduce((acc, k) => {
				const pre = prefix.length ? prefix + '_' : '';
				if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
					Object.assign(acc, flattenObject(obj[k], pre + k));
				} else if (Array.isArray(obj[k])) {
					acc[pre + k] = obj[k]
						.map((item: any) => {
							if (typeof item === 'object') {
								return Object.values(item).join(', ');
							} else {
								return item;
							}
						})
						.join(', ');
				} else {
					acc[pre + k] = obj[k];
				}
				return acc;
			}, {});
		};

		const flattenedArray = tableList.map((obj: any) => {
			return flattenObject(obj);
		});

		newList = flattenedArray.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt?.substring(0, 10),
			birthdate: obj.birthdate?.substring(0, 10)
		}));

		newList.forEach((obj: any) => {
			$courseKeysToDelete.forEach((key: string) => delete (obj as any)[key]);
		});
		//console.log('newList check', newList);

		//CSV UNPARSE
		csv = Papa.unparse(newList, {
			quotes: false, //or array of booleans
			quoteChar: '"',
			escapeChar: '"',
			delimiter: ';',
			header: true,
			//newline: '\r\n',
			skipEmptyLines: false //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
		});
		//console.log('csv', csv);

		//DOWNLOAD file
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		// create a link element to download the zip archive
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `TableExport_Corsi.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};

	const resetFields = () => {
		layoutId = '';
		price = 1;
		startYear = currentYear;
		startMonth = currentMonth;
		startDay = currentDay;
		startHour = currentHour;
		startMinute = '00';
		stockQty = 1;
		county = '';
		inputEmail = '';
		title = '';
		descrLong = '';
		infoExtra = '';
		location = '';
		productCorsoUserId = userData.userId;
		productCorsoStatus = 'enabled';
		notificationEmail = [userData.email];
		tag = '';
		tagArray = [];
		modalTitle = '';
		postAction = '?/';
		mode = 'ONLINE';
		provinceArray = [];
	};

	const refresh = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getTable;
		notification.info('Pagina ricaricata');
	};

	const selectLayout = (layout: any) => {
		const course = getLayout.find((item: any) => item.layoutId == layout); // layoutId
		//console.log('course', course, layoutId);
		title = course.title;
		descrLong = course.descr;
		price = course.price;
	};

	const addItem = (item: any, type: string) => {
		if (type == 'email') {
			var mailformat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,6})$/;
			if (item.match(mailformat)) {
				if (!notificationEmail.includes(item)) {
					notificationEmail.push(item);
				} else {
					notification.error('Email già inserita');
				}
			} else {
				notification.error('Email NON valida');
			}
		}
		if (type == 'tag')
			if (tag != '') {
				if (!tagArray.includes(item)) {
					tagArray.push(item);
				} else {
					notification.error('Tag già inserito');
				}
			} else {
				notification.error('Tag NON valido');
			}
		if (type == 'province') {
			if (county != '') {
				if (!provinceArray.includes(item)) {
					provinceArray.push(item);
					county = '';
				} else {
					notification.error('Provincia già inserita');
				}
			} else {
				notification.error('Provincia NON valida');
			}
		}

		inputEmail = '';
		tag = '';
		county = '';
	};

	const removeItem = (index: number, type: string) => {
		if (index !== -1) {
			if (type == 'email') notificationEmail.splice(index, 1);
			if (type == 'tag') tagArray.splice(index, 1); /// TAG
			if (type == 'province') provinceArray.splice(index, 1); /// PROVINCE
		}
	};

	const onClickModal = (type: string, item: any) => {
		currentModal = type;
		currentDialog = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo Corso';
		}
		if (type == 'modify') {
			postAction = `?/modify`;
			modalTitle = 'Modifica Corso';
			prodId = item.prodId;
			layoutId = item.layoutId;
			price = item.layoutView.price;
			stockQty = item.stockQty;
			county = item.county;
			notificationEmail = item.notificationEmail;
			tagArray = item.tag;
			provinceArray = item.county;
			title = item.layoutView.title;
			descrLong = item.layoutView.descr;
			infoExtra = item.infoExtra;
			location = item.location;
			startYear = item.eventStartDate.substring(0, 4);
			startMonth = item.eventStartDate.substring(5, 7);
			startDay = item.eventStartDate.substring(8, 10);
			startHour = item.eventStartDate.substring(11, 13);
			startMinute = item.eventStartDate.substring(14, 16);

			if (county[0] == 'Online') {
				mode = 'ONLINE';
			} else {
				mode = 'IN_PRESENZA';
			}
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Conferma rimozione';
			prodId = item.prodId;
			//console.log('item.prodId', item.prodId);
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtri di Ricerca';
			county = '';
			layoutId = '';
			userId = '';
		}
		if (type == 'subscribers') {
			modalTitle = 'Lista iscritti';
			subscribers = item;
		}
	};

	const onCloseModal = () => {
		openModal = false;
		currentModal = '';
		currentDialog = '';
		resetFields();
	};

	const onCloseModify = () => {
		openModal = false;
		currentModal = '';
		currentDialog = '';
		refresh();
	};

	const formSubmit = () => {
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			loading = true;
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { action, message, payload } = result.data; // { action, success, message, payload }
				if (action == 'filter') {
					resetActive = true;
					tableList = payload;
				} else {
					resetActive = false;
					tableList = getTable;
				}
				notification.info(message);
				openModal = false;
			}
			if (result.type === 'failure') {
				notification.error(result.data.message);
			}
			if (result.type === 'error') {
				notification.error(result.error.message);
			}
			// 'update()' is called by default by use:enhance
			// call 'await update()' if you need to ensure it completes before further client logic.
			resetFields();
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>Lista corsi</title>
</svelte:head>

{#if !getTable}
	<Loader />
{:else}
	<div class="overflow-x-auto table-zebra mt-5 px-4 mb-5">
		<div class="flex flex-col gap-4 mb-4">
			<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista corsi</h1>
			<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
				<button class="btn btn-info text-white w-full sm:w-auto" onclick={refresh}>
					<RefreshCcw />
				</button>
				{#if resetActive == true}
					<button class="btn btn-error rounded-md text-white" onclick={refresh}>
						<XCircle class="mt-1" /> Reset Filtro
					</button>
				{:else}
					<button
						class="btn btn-info rounded-md text-white"
						onclick={() => onClickModal('filter', null)}
					>
						<Funnel class="mt-1" /> Filtra
					</button>
				{/if}
				<button
					class="btn btn-info rounded-md text-white"
					onclick={() => onClickModal('new', null)}
				>
					<CopyPlus /> Nuovo
				</button>
				<button class="btn btn-info text-white w-full sm:w-auto" onclick={() => csvCreate()}>
					<FileDown />CSV
				</button>
			</div>
		</div>

		<table class="table mt-5 bg-white border-2">
			<!-- head -->
			<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
				<tr class="">
					<th>ID</th>
					<th>Data inserimento</th>
					<th>Riflessologo</th>
					<th>Titolo</th>
					<th>Data</th>
					<th>Luogo</th>
					<th>Prezzo</th>
					<th>Adesioni</th>
					<th>Azioni</th>
				</tr>
			</thead>
			<!-- body -->
			<tbody>
				<!-- row -->
				{#if tableList.length == 0}
					<tr class="hover:bg-gray-300">
						<td> </td>
					</tr>
				{:else}
					{#each tableList as row}
						<tr class="hover:bg-gray-300">
							<td>{row.prodId}</td>

							<td>{row.createdAt}</td>

							<td>{row.name} {row.surname}</td>

							<td>{row.layoutView?.title}</td>

							<td>{row.eventStartDate?.substring(0, 10)}</td>

							<td>
								<p class="card-text">
									{row.county}
								</p>
							</td>

							<td>{row.layoutView.price} €</td>

							<td>
								<button
									class="btn"
									onclick={() => onClickModal('subscribers', row.listSubscribers)}
									disabled={row.listSubscribers.length == 0}
								>
									<UserRoundCheck />
									{row.listSubscribers.length}
								</button>
							</td>

							<td class="flex items-center space-x-4">
								<button class="btn btn-sm" onclick={() => onClickModal('modify', row)}
									><Settings />
								</button>
								<button class="btn btn-error btn-sm" onclick={() => onClickModal('delete', row)}
									><Trash2 />
								</button>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
		{#if tableList.length == 0}
			<div
				class="alert alert-warning shadow-lg flex item-center text-center justify-center rounded-md mt-3 mx-auto w-full max-w-lg"
			>
				<div>
					<ShieldAlert />
					<br />
					<span class="mt-2 text-semibold">
						Nessun corso trovato. Cambia parametri o resetta il filtro.
					</span>
				</div>
			</div>
		{/if}
	</div>
{/if}

{#if currentModal == 'modify' || currentModal == 'new'}
	{#if loading}
		<Loader />
	{:else}
		<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-4xl">
			{#if currentModal == 'modify'}
				<button
					class="btn btn-sm btn-circle btn-error absolute right-2 top-2"
					onclick={onCloseModify}>✕</button
				>
			{:else}
				<button
					class="btn btn-sm btn-circle btn-error absolute right-2 top-2"
					onclick={onCloseModal}>✕</button
				>
			{/if}

			<form
				method="POST"
				action={postAction}
				use:enhance={formSubmit}
				class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			>
				{#if currentDialog == 'modify'}
					<section class="col-span-4 md:col-span-4">
						<label for="prodId" class="form-label">
							<p class="font-bold mb-2">ID codice</p>
						</label>

						<div class="join join-horizontal w-full">
							<button class="join-item bg-gray-300 px-3"><Pen /></button>
							<input
								class="input input-bordered join-item w-full"
								id="prodId"
								name="prodId"
								type="text"
								placeholder="prodId"
								bind:value={prodId}
								readonly
							/>
						</div>
					</section>
				{/if}

				<!-- Categoria  -->
				<section class="col-span-4 md:col-span-2">
					<label for="layoutId" class="form-label">
						<p class="font-bold">Tipo corso</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<select
							class="select select-bordered w-full rounded-md rounded-l-none"
							id="layoutId"
							name="layoutId"
							bind:value={layoutId}
							onchange={() => selectLayout(layoutId)}
							required
						>
							<option disabled value="">Scegli</option>
							{#each getLayout as option}
								<option value={option.layoutId}>{option.title}</option>
							{/each}
						</select>
					</div>
				</section>
				<!-- Prezzo corso -->
				<section class="col-span-4 md:col-span-2">
					<label for="price" class="form-label">
						<p class="font-bold mb-2">Prezzo corso</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Calculator /></button>
						<input
							class="input input-bordered join-item w-full"
							id="price"
							name="price"
							type="number"
							placeholder="Prezzo €"
							bind:value={price}
							readonly
						/>
					</div>
				</section>
				<!-- Data Inizio -->
				<section class="col-span-4 md:col-span-2">
					<label for="data-inizio" class="form-label">
						<p class="font-bold mb-2">Data inizio</p>
					</label>
					<div class=" join join-horizontal rounded-md">
						<button class="join-item bg-gray-300 px-3"><Calendar /></button>
						<!-- Giorno Dropdown -->
						<select
							id="productCorsoDataInizioGiorno"
							name="productCorsoDataInizioGiorno"
							class="join-item select select-bordered w-20"
							aria-label="Seleziona Giorno"
							bind:value={startDay}
							required
						>
							<option value="" disabled selected>Giorno</option>
							{#each $days as day}
								<option value={day}>{day}</option>
							{/each}
						</select>
						<button class="join-item bg-gray-300 px-3"> - </button>
						<!-- Mese Dropdown -->
						<select
							id="productCorsoDataInizioMese"
							name="productCorsoDataInizioMese"
							class="join-item select select-bordered w-32"
							aria-label="Seleziona Mese"
							bind:value={startMonth}
							required
						>
							<option value="" disabled selected>Mese</option>
							{#each $months as month}
								<option value={month.value}>{month.title}</option>
							{/each}
						</select>
						<button class="join-item bg-gray-300 px-3"> - </button>
						<!-- Anno Dropdown -->
						<select
							id="productCorsoDataInizioAnno"
							name="productCorsoDataInizioAnno"
							class="join-item select select-bordered w-26 rounded-r-md"
							aria-label="Seleziona Anno"
							bind:value={startYear}
							required
						>
							{#if currentDialog == 'modify'}
								<option value={startYear}>{startYear}</option>
							{:else}
								<option value="" disabled>Anno</option>
							{/if}

							{#each years as year}
								<option value={year}>{year}</option>
							{/each}
						</select>
					</div>
				</section>
				<!-- Orario Inizio -->
				<section class="ml-10 col-span-4 md:col-span-2">
					<label for="orario-inizio" class="form-label">
						<p class="font-bold mb-2">Orario inizio</p>
					</label>
					<div class="join join-horizontal rounded-md">
						<!-- Ore Dropdown -->
						<select
							id="productCorsoDataInizioOra"
							name="productCorsoDataInizioOra"
							class="join-item select select-bordered w-20 rounded-l-md"
							aria-label="Seleziona Ora"
							bind:value={startHour}
							required
						>
							<option value="" disabled selected>Ore</option>
							{#each $hours as hour}
								<option value={hour}>{hour}</option>
							{/each}
						</select>
						<button class="join-item bg-gray-300 px-3"> : </button>
						<!-- Minuti Dropdown -->
						<select
							id="productCorsoDataInizioMinuto"
							name="productCorsoDataInizioMinuto"
							class="join-item select select-bordered w-20 rounded-r-md"
							aria-label="Seleziona Minuti"
							bind:value={startMinute}
							required
						>
							<option value="" disabled selected>Minuti</option>
							{#each $minutes as minute}
								<option value={minute}>{minute}</option>
							{/each}
						</select>
					</div>
					<!-- <div id="data-inizio-orario-Help" class="text-gray-600 mt-2 text-sm">
			Esempio orario: 23:59
		</div> -->
				</section>
				<!-- Numero partecipanti -->
				<section class="col-span-4 md:col-span-4">
					<label for="stockQty" class="form-label">
						<p class="font-bold mb-2">Numero partecipanti</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Users /></button>
						<input
							class="input input-bordered join-item w-full"
							id="stockQty"
							name="stockQty"
							type="number"
							placeholder="N."
							step="1"
							min="0"
							bind:value={stockQty}
							required
						/>
					</div>
				</section>

				<!-- Modalità corso -->
				<section class="col-span-4">
					<p class="font-bold mb-2">Modalità corso</p>
					<div class="flex gap-4">
						<label class="label cursor-pointer flex gap-2">
							<input type="radio" name="mode" value="ONLINE" bind:group={mode} class="radio" />
							<span class="label-text">Online</span>
						</label>
						<label class="label cursor-pointer flex gap-2">
							<input type="radio" name="mode" value="IN_PRESENZA" bind:group={mode} class="radio" />
							<span class="label-text">In presenza</span>
						</label>
					</div>
				</section>

				{#if mode == 'IN_PRESENZA'}
					<!-- Provincia -->
					<section class="col-span-4 md:col-span-2">
						<label for="county" class="form-label">
							<p class="font-bold mb-2">Provincia</p>
						</label>
						<div class="join join-horizontal rounded-md w-full mb-2">
							<button class="join-item bg-gray-300 px-3"><Building2 /></button>
							<input type="hidden" name="provinceArray" bind:value={provinceArray} />
							<select
								class="select select-bordered w-full rounded-md rounded-l-none"
								id="county"
								name="county"
								bind:value={county}
							>
								<option disabled value="">Scegli</option>
								{#each $province as provincia}
									<option value={provincia.title}>
										{provincia.title} ({provincia.region})
									</option>
								{/each}
							</select>
							<button
								type="button"
								class="join-item btn btn-primary"
								onclick={() => addItem(county, 'province')}
							>
								Aggiungi
							</button>
						</div>

						{#if provinceArray.length > 0}
							{#each provinceArray as prov, i}
								<div class="btn btn-primary btn-sm m-1 rounded-md">
									{prov}
									<button
										type="button"
										class="badge badge-error ml-2"
										onclick={() => removeItem(i, 'province')}
									>
										X
									</button>
								</div>
							{/each}
						{/if}
					</section>

					<!-- Luogo -->
					<section class="col-span-4 md:col-span-2">
						<label for="location" class="form-label">
							<p class="font-bold mb-2">Luogo (indirizzo, città, CAP)</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button class="join-item bg-gray-300 px-3"><Pen /></button>
							<input
								class="input input-bordered join-item w-full"
								id="location"
								name="location"
								type="text"
								placeholder="es: via Roma, 1, Vigasio, 37069"
								bind:value={location}
								required
							/>
						</div>
					</section>
				{/if}

				{#if mode == 'ONLINE'}
					<!-- Luogo -->

					<section class="col-span-4 md:col-span-4">
						<input type="hidden" name="provinceArray" value="Online" />
						<label for="location" class="form-label">
							<p class="font-bold mb-2">Luogo</p>
						</label>
						<div class="join join-horizontal rounded-md w-full">
							<button class="join-item bg-gray-300 px-3"><Pen /></button>
							<input
								class="input input-bordered join-item w-full"
								id="location"
								name="location"
								type="text"
								placeholder="es: via Roma, 1, Vigasio, 37069"
								value="Online"
								readonly
							/>
						</div>
					</section>
				{/if}

				<!-- Provincia -->
				<!-- <section class="col-span-4 md:col-span-2">
			<label for="countryState" class="form-label">
				<p class="font-bold mb-2">Provincia</p>
			</label>
			<div class="join join-horizontal rounded-md w-full">
				<button class="join-item bg-gray-300 px-3"><Building2 /></button>
				<select
					class="select select-bordered w-full rounded-md rounded-l-none"
					id="countryState"
					name="countryState"
					placeholder="Scegli"
					bind:value={countryState}
					required
				>
					<option disabled value="">Scegli</option>
					{#each $province as provincia, i}
						<option value={provincia.title}>
							{provincia.title} ({provincia.region})
						</option>
					{/each}
				</select>
			</div>
		</section> -->
				<!-- place -->
				<!-- <section class="col-span-4 md:col-span-2">
			<label for="location" class="form-label">
				<p class="font-bold mb-2">Luogo (indirizzo, citta, CAP)</p></label
			>
			<div class="join join-horizontal rounded-md w-full">
				<button class="join-item bg-gray-300 px-3"><Pen /></button>
				<input
					class="input input-bordered join-item w-full"
					id="location"
					name="location"
					type="text"
					placeholder="es: via Roma, 1, Vigasio, 37069"
					bind:value={location}
					required
				/>
			</div>
		</section> -->
				<!-- Tag -->
				<section class="col-span-4 md:col-span-2">
					<label for="tag" class="form-label">
						<p class="font-bold mb-2">Tag</p>
					</label>
					<div class="join join-horizontal rounded-md w-full mb-2">
						<button class="join-item bg-gray-300 px-3"><List /></button>
						<input type="hidden" name="tagArray" bind:value={tagArray} />
						<input
							class="input input-bordered join-item w-full"
							id="tag"
							name="tag"
							type="text"
							placeholder="Aggiungi Tag"
							bind:value={tag}
						/>
						<button
							type="button"
							class="join-item btn btn-primary disabled:blue-500 disabled:cursor-not-allowed"
							onclick={() => addItem(tag, 'tag')}
						>
							Aggiungi
						</button>
					</div>
					{#if tagArray.length !== 0}
						{#each tagArray as badgeTag, i}
							<div class="btn btn-primary btn-sm m-1 rounded-md">
								{badgeTag}
								{' '}
								<button
									type="button"
									class="badge badge-error felx items-center"
									onclick={() => removeItem(i, 'tag')}
								>
									X
								</button>
							</div>
						{/each}
					{/if}
				</section>
				<!-- Notifica email -->
				<section class="col-span-4 md:col-span-2">
					<label for="notificationEmail" class="form-label">
						<p class="font-bold mb-2">Notifica Email</p>
					</label>
					<div class="join join-horizontal rounded-md w-full mb-2">
						<div class="join-item bg-gray-300 px-3"><Send /></div>
						<input type="hidden" name="notificationEmail" bind:value={notificationEmail} />
						<input
							class="input input-bordered join-item w-full"
							id="inputEmail"
							name="inputEmail"
							type="email"
							placeholder="Aggiungi Email"
							aria-label="InputEmailNotifica"
							aria-describedby="basic-InputEmailNotifica"
							bind:value={inputEmail}
						/>
						<button
							type="button"
							class="join-item btn btn-primary"
							onclick={() => addItem(inputEmail, 'email')}
						>
							Aggiungi
						</button>
					</div>
					{#if notificationEmail.length > 0}
						{#each notificationEmail as badgeEmailNotifica, i}
							<div class="btn btn-primary btn-sm m-1 rounded-md">
								{badgeEmailNotifica} &nbsp;
								<button
									type="button"
									class="badge badge-error felx items-center"
									onclick={() => removeItem(i, 'email')}
								>
									X
								</button>
							</div>
						{/each}
					{/if}
				</section>
				<!-- Titolo -->
				<section class="col-span-4 md:col-span-2">
					<label for="title" class="form-label">
						<p class="font-bold mb-2">Titolo</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<input
							class="input input-bordered join-item w-full"
							id="title"
							name="title"
							type="text"
							placeholder="Titolo"
							bind:value={title}
							readonly
						/>
					</div>
				</section>
				<!-- Descrizione -->
				<section class="col-span-4 md:col-span-4">
					<!-- Descrizione -->
					<label for="descrLong" class="form-label">
						<p class="font-bold mb-2">Descrizione</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrLong"
							name="descrLong"
							placeholder="Descrizione"
							bind:value={descrLong}
							readonly
						></textarea>
					</div>
				</section>
				<!-- ALtre informazione -->
				<section class="col-span-4">
					<label for="infoExtra" class="form-label">
						<p class="font-bold mb-2">Altre informazioni</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered join-item w-full"
							id="infoExtra"
							name="infoExtra"
							rows="6"
							placeholder="Altre informazioni"
							bind:value={infoExtra}
						></textarea>
					</div>
				</section>

				<!-- button -->
				<div class="col-span-4 mt-5 flex justify-center">
					<div class="bg-gray-50 flex justify-center">
						{#if currentModal == 'modify'}
							<button class="btn btn-error btn-sm mx-2" onclick={onCloseModify}> Annulla </button>
						{:else}
							<button class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
						{/if}

						<button type="submit" class="btn btn-success btn-sm mx-2 text-white">
							{#if currentDialog == 'new'}
								Registra
							{:else if currentDialog == 'modify'}
								Modifica
							{/if}
						</button>
					</div>
				</div>
				<input type="hidden" name="eventStartDate" value={eventStartDate.toISOString()} />
			</form>
		</Modal>
	{/if}
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		{#if loading}
			<Loader />
		{:else}
			<form
				method="POST"
				action={postAction}
				use:enhance={formSubmit}
				class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			>
				<input type="hidden" name="prodId" value={prodId} />
				<header class="col-span-4 text-center text-2xl font-bold text-green-800">
					Conferma rimozione
				</header>
				<div class="col-span-4 mt-5 flex justify-center">
					<div class="bg-gray-50 flex justify-center">
						<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
						<button type="submit" class="btn btn-error btn-sm mx-2 text-white"> Elimina </button>
					</div>
				</div>
			</form>
		{/if}
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		{#if loading}
			<Loader />
		{:else}
			<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
				<div class="space-y-4">
					<div>
						<label for="county" class="block text-sm font-medium text-gray-700 mb-1"
							>Provincia</label
						>
						<select
							id="county"
							name="county"
							bind:value={county}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli una Provincia</option>
							{#each $province as item}
								<option value={item.title}>{item.title}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="layoutId" class="block text-sm font-medium text-gray-700 mb-1"
							>Tipo corso</label
						>
						<select
							id="layoutId"
							name="layoutId"
							bind:value={layoutId}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli un tipo</option>
							{#each getLayout as option}
								<option value={option.layoutId}>{option.title}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="userId" class="block text-sm font-medium text-gray-700 mb-1"
							>Riflessologo</label
						>
						<select
							id="userId"
							name="userId"
							bind:value={userId}
							class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
						>
							<option value="">Scegli un riflessologo</option>
							{#each getTableNames as item}
								<option value={item.userId}>{item.name} {item.surname}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
					<button
						class="btn btn-error btn-sm rounded-md hover:bg-red-300"
						type="button"
						onclick={onCloseModal}
					>
						Annulla
					</button>
					<button class="btn btn-success btn-sm rounded-md hover:bg-green-400" type="submit">
						Applica Filtri
					</button>
				</div>
			</form>
		{/if}
	</Modal>
{/if}

{#if currentModal == 'subscribers'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		{#if loading}
			<Loader />
		{:else}
			<div
				class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			>
				{#each subscribers || [] as item}
					<div
						class="col-span-4
                           p-4
                           rounded-box
                           shadow-md
                           bg-base-200
                           flex flex-wrap
                           gap-x-6 gap-y-2
                           items-center
                           justify-between
                           "
					>
						<span class="font-bold text-lg text-primary">{item.name} {item.surname}</span>
						<span class="text-info-content break-words">{item.email}</span>
						<span class="text-sm text-base-content">{item.phone}</span>
						<span class="text-sm text-base-content">{item.mobilePhone}</span>
						<span class="text-sm text-base-content">{item.city}</span>
					</div>
				{/each}
			</div>
		{/if}
	</Modal>
{/if}
