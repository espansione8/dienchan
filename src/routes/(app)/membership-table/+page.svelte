<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import Papa from 'papaparse';
	import {
		ListPlus,
		XCircle,
		Check,
		Funnel,
		Pen,
		Calendar,
		Calculator,
		FileDown,
		RefreshCcw,
		Trash2,
		X
	} from 'lucide-svelte';

	let { data, form } = $props(); // pull data from server
	const { getTable } = $derived(data); // deconstruct data from server
	let tableList = $state(getTable);

	let prodId = $state(null);
	let status = $state('');
	let title = $state('');
	let descrShort = $state('');
	let price: number | null = $state(0);
	let renewalLength: number = $state(365);
	let resetActive = $state(false);
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

	// OLD FETCH
	// const onChangeStatus = async (prodId: string, status: string) => {
	// 	const data = {
	// 		prodId,
	// 		status
	// 	};
	// 	try {
	// 		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/products/setStatus`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json'
	// 			},
	// 			body: JSON.stringify(data)
	// 		});
	// 		const response = await res.json();
	// 		if (response.status == 200) {
	// 			invalidateAll();
	// 			clearTimeout(startTimeout);
	// 			openModal = false;
	// 			toastClosed = false;
	// 			notificationContent = 'status cambiato';
	// 			resetFieldsModalFilter();
	// 			closeNotification();
	// 		} else {
	// 			toastClosed = false;
	// 			notificationContent = 'errore status';
	// 			notificationError = true;
	// 			closeNotification();
	// 		}
	// 	} catch (err) {
	// 		console.log('Error:', err);
	// 	}
	// };

	// const csvCreate = () => {
	// 	let csv = $state('');
	// 	let newList: any = $state();

	// 	const flattenObject = (obj: any, prefix = '') => {
	// 		return Object.keys(obj).reduce((acc, k) => {
	// 			const pre = prefix.length ? prefix + '_' : '';
	// 			if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
	// 				Object.assign(acc, flattenObject(obj[k], pre + k));
	// 			} else {
	// 				acc[pre + k] = obj[k];
	// 			}
	// 			return acc;
	// 		}, {});
	// 	};

	// 	const flattenedArray = tableList.map((obj: any) => {
	// 		return flattenObject(obj);
	// 	});

	// 	newList = flattenedArray.map((obj: any) => ({
	// 		...obj,
	// 		createdAt: obj.createdAt?.substring(0, 10),
	// 		birthdate: obj.birthdate?.substring(0, 10)
	// 	}));

	// 	newList.forEach((obj: any) => {
	// 		delete obj.__v;
	// 		delete obj.attribute1;
	// 		delete obj.attribute2;
	// 		delete obj.attribute3;
	// 		delete obj.attribute4;
	// 		delete obj.attribute5;
	// 		delete obj.attribute6;
	// 		delete obj.attribute7;
	// 		delete obj.attribute8;
	// 		delete obj.attribute9;
	// 		delete obj.brand;
	// 		delete obj.brandId;
	// 		delete obj.bundleProduct;
	// 		delete obj.categoryId;
	// 		delete obj.cost;
	// 		delete obj.dateAdd;
	// 		delete obj.dateUpd;
	// 		delete obj.depth;
	// 		delete obj.attribute10;
	// 		delete obj.condition;
	// 		delete obj.feature;
	// 		delete obj.filterPermissionToEdit;
	// 		delete obj.height;
	// 		delete obj.image1;
	// 		delete obj.image2;
	// 		delete obj.image3;
	// 		delete obj.image4;
	// 		delete obj.image5;
	// 		delete obj.image6;
	// 		delete obj.image7;
	// 		delete obj.image8;
	// 		delete obj.imgFull;
	// 		delete obj.imgThumb;
	// 		delete obj.listSubscribers;
	// 		delete obj.manufacturer;
	// 		delete obj.manufacturerCod;
	// 		delete obj.msrp;
	// 		delete obj.notes;
	// 		delete obj.points;
	// 		delete obj.priceSetByBundle;
	// 		delete obj.promoEndDate;
	// 		delete obj.promoStartDate;
	// 		delete obj.promoterProCod;
	// 		delete obj.rating;
	// 		delete obj.rewardProgramDetails;
	// 		delete obj.shippingCost;
	// 		delete obj.sku;
	// 		delete obj.state;
	// 		delete obj.value1;
	// 		delete obj.value2;
	// 		delete obj.value3;
	// 		delete obj.value4;
	// 		delete obj.value5;
	// 		delete obj.value6;
	// 		delete obj.value7;
	// 		delete obj.value8;
	// 		delete obj.value9;
	// 		delete obj.value10;
	// 		delete obj.vatType;
	// 		delete obj.vatValue;
	// 		delete obj.weight;
	// 		delete obj.video;
	// 		delete obj.birthdate;
	// 		delete obj.filterPermissionToSee;
	// 		delete obj.manufacturerId;
	// 		delete obj.orderQuantity;
	// 		delete obj.width;
	// 		delete obj.extra0;
	// 		delete obj.extra1;
	// 		delete obj.extra2;
	// 		delete obj.extra3;
	// 		delete obj.extra4;
	// 		delete obj.extra5;
	// 		delete obj.extra6;
	// 		delete obj.extra7;
	// 		delete obj.extra8;
	// 		delete obj.extra9;
	// 		delete obj.extra10;
	// 		delete obj.extra11;
	// 		delete obj.extra12;
	// 		delete obj.extraFieldNumber1;
	// 		delete obj.extraFieldNumber2;
	// 		delete obj.extraFieldNumber3;
	// 		delete obj.extraFieldNumber4;
	// 		delete obj.extraFieldNumber5;
	// 		delete obj.extraFieldNumber6;
	// 		delete obj.extraFieldNumber7;
	// 		delete obj.extraFieldNumber8;
	// 		delete obj.extraFieldNumber9;
	// 		delete obj.extraFieldNumber10;
	// 		delete obj.extraFieldNumber11;
	// 		delete obj.extraFieldNumber12;
	// 		delete obj.extraFieldNumber13;
	// 		delete obj.extraFieldNumber14;
	// 		delete obj.extraFieldNumber15;
	// 		delete obj.extraFieldNumber16;
	// 		delete obj.extraFieldNumber17;
	// 		delete obj.extraFieldNumber18;
	// 		delete obj.extraFieldNumber19;
	// 		delete obj.extraFieldNumber20;
	// 		delete obj.extraFieldNumber21;
	// 		delete obj.extraFieldNumber22;
	// 		delete obj.extraFieldNumber23;
	// 		delete obj.extraFieldNumber24;
	// 		delete obj.extraFieldText1;
	// 		delete obj.extraFieldText2;
	// 		delete obj.extraFieldText3;
	// 		delete obj.extraFieldText4;
	// 		delete obj.extraFieldText5;
	// 		delete obj.extraFieldText6;
	// 		delete obj.extraFieldText7;
	// 		delete obj.extraFieldText8;
	// 		delete obj.extraFieldText9;
	// 		delete obj.extraFieldText10;
	// 		delete obj.extraFieldText11;
	// 		delete obj.extraFieldText12;
	// 		delete obj.extraFieldText13;
	// 		delete obj.extraFieldText14;
	// 		delete obj.extraFieldText15;
	// 		delete obj.extraFieldText16;
	// 		delete obj.extraFieldText17;
	// 		delete obj.extraFieldText18;
	// 		delete obj.extraFieldText19;
	// 		delete obj.extraFieldText20;
	// 		delete obj.extraFieldText21;
	// 		delete obj.extraFieldText22;
	// 		delete obj.extraFieldText23;
	// 		delete obj.extraFieldText24;
	// 		delete obj.userView_businessData_businessName;
	// 		delete obj.userView_businessData_businessAddress;
	// 		delete obj.userView_businessData_vatNumber;
	// 		delete obj.userView_businessData_businessPostalCode;
	// 		delete obj.userView_businessData_businessCategory;
	// 		delete obj.userView_businessData_businessCity;
	// 		delete obj.userView_businessData_businessState;
	// 		delete obj.userView_businessData_businessCountry;
	// 		delete obj.userView_businessData_businessCounty;
	// 		delete obj.userView_businessData_numberEmployed;
	// 		delete obj.userView_businessData_grossIncome;
	// 		delete obj.userView_businessData_role;
	// 		delete obj.userView_card_cardId;
	// 		delete obj.userView_card_cardCode;
	// 		delete obj.userView_card_cardActivation;
	// 		delete obj.userView_card_cardExpiry;
	// 		delete obj.userView_card_cardStatus;
	// 		delete obj.userView_userId;
	// 		delete obj.userView_userCode;
	// 		delete obj.userView_active;
	// 		delete obj.userView_token;
	// 		delete obj.userView_cookieId;
	// 		delete obj.userView_promotions;
	// 		delete obj.userView_level;
	// 		delete obj.userView_codeSales;
	// 		delete obj.userView_codeManager;
	// 		delete obj.userView_codeSupervisor;
	// 		delete obj.userView_codeAgency;
	// 		delete obj.userView_codeSponsor;
	// 		delete obj.userView_codeAdmin;
	// 		delete obj.userView_codeSuperAdmin;
	// 		delete obj.userView_name;
	// 		delete obj.userView_namePublic;
	// 		delete obj.userView_surname;
	// 		delete obj.userView_surnamePublic;
	// 		delete obj.userView_category;
	// 		delete obj.userView_address;
	// 		delete obj.userView_addressPublic;
	// 		delete obj.userView_city;
	// 		delete obj.userView_cityPublic;
	// 		delete obj.userView_postalCode;
	// 		delete obj.userView_postalCodePublic;
	// 		delete obj.userView_countryState;
	// 		delete obj.userView_statePublic;
	// 		delete obj.userView_region;
	// 		delete obj.userView_regionPublic;
	// 		delete obj.userView_country;
	// 		delete obj.userView_countryPublic;
	// 		delete obj.userView_language;
	// 		delete obj.userView_mobilePhone;
	// 		delete obj.userView_mobilePhonePublic;
	// 		delete obj.userView_phone;
	// 		delete obj.userView_phonePublic;
	// 		delete obj.userView_email;
	// 		delete obj.userView_emailPublic;
	// 		delete obj.userView_documentUpload;
	// 		delete obj.userView_photoUpload;
	// 		delete obj.userView_gender;
	// 		delete obj.userView_birthdate;
	// 		delete obj.userView_socialSecurityNumber;
	// 		delete obj.userView_username;
	// 		delete obj.userView_password;
	// 		delete obj.userView_pointsSpent;
	// 		delete obj.userView_pointsBalance;
	// 		delete obj.userView_pointsTotal;
	// 		delete obj.userView_pointsBalanceDate;
	// 		delete obj.userView_userAvatar;
	// 		delete obj.userView_privacyDate;
	// 		delete obj.userView_privacyAccept;
	// 		delete obj.userView_revenue;
	// 		delete obj.userView_target0;
	// 		delete obj.userView_target1;
	// 		delete obj.userView_target2;
	// 		delete obj.userView_target3;
	// 		delete obj.userView_target4;
	// 		delete obj.userView_target5;
	// 		delete obj.userView_target6;
	// 		delete obj.userView_target7;
	// 		delete obj.userView_target8;
	// 		delete obj.userView_target9;
	// 		delete obj.userView_target10;
	// 		delete obj.userView_target11;
	// 		delete obj.userView_target12;
	// 		delete obj.userView_extra0;
	// 		delete obj.userView_extra1;
	// 		delete obj.userView_extra2;
	// 		delete obj.userView_extra3;
	// 		delete obj.userView_extra4;
	// 		delete obj.userView_extra5;
	// 		delete obj.userView_extra6;
	// 		delete obj.userView_extra7;
	// 		delete obj.userView_extra8;
	// 		delete obj.userView_extra9;
	// 		delete obj.userView_extra10;
	// 		delete obj.userView_extra11;
	// 		delete obj.userView_extra12;
	// 		delete obj.userView_extraFieldNumber1;
	// 		delete obj.userView_extraFieldNumber2;
	// 		delete obj.userView_extraFieldNumber3;
	// 		delete obj.userView_extraFieldNumber4;
	// 		delete obj.userView_extraFieldNumber5;
	// 		delete obj.userView_extraFieldNumber6;
	// 		delete obj.userView_extraFieldNumber7;
	// 		delete obj.userView_extraFieldNumber8;
	// 		delete obj.userView_extraFieldNumber9;
	// 		delete obj.userView_extraFieldNumber10;
	// 		delete obj.userView_extraFieldNumber11;
	// 		delete obj.userView_extraFieldNumber12;
	// 		delete obj.userView_extraFieldNumber13;
	// 		delete obj.userView_extraFieldNumber14;
	// 		delete obj.userView_extraFieldNumber15;
	// 		delete obj.userView_extraFieldNumber16;
	// 		delete obj.userView_extraFieldNumber17;
	// 		delete obj.userView_extraFieldNumber18;
	// 		delete obj.userView_extraFieldNumber19;
	// 		delete obj.userView_extraFieldNumber20;
	// 		delete obj.userView_extraFieldNumber21;
	// 		delete obj.userView_extraFieldNumber22;
	// 		delete obj.userView_extraFieldNumber23;
	// 		delete obj.userView_extraFieldNumber24;
	// 		delete obj.userView_extraFieldText1;
	// 		delete obj.userView_extraFieldText2;
	// 		delete obj.userView_extraFieldText3;
	// 		delete obj.userView_extraFieldText4;
	// 		delete obj.userView_extraFieldText5;
	// 		delete obj.userView_extraFieldText6;
	// 		delete obj.userView_extraFieldText7;
	// 		delete obj.userView_extraFieldText8;
	// 		delete obj.userView_extraFieldText9;
	// 		delete obj.userView_extraFieldText10;
	// 		delete obj.userView_extraFieldText11;
	// 		delete obj.userView_extraFieldText12;
	// 		delete obj.userView_extraFieldText13;
	// 		delete obj.userView_extraFieldText14;
	// 		delete obj.userView_extraFieldText15;
	// 		delete obj.userView_extraFieldText16;
	// 		delete obj.userView_extraFieldText17;
	// 		delete obj.userView_extraFieldText18;
	// 		delete obj.userView_extraFieldText19;
	// 		delete obj.userView_extraFieldText20;
	// 		delete obj.userView_extraFieldText21;
	// 		delete obj.userView_extraFieldText22;
	// 		delete obj.userView_extraFieldText23;
	// 		delete obj.userView_extraFieldText24;
	// 		delete obj.userView_lastAccess;
	// 		delete obj.userView_counterAccess;
	// 		delete obj.userView_remoteIP;
	// 		delete obj.userView_remoteHost;
	// 		delete obj.userView_remoteBrowser;
	// 		delete obj.userView_notesOnUser;
	// 		delete obj.userView_userCart;
	// 		delete obj.userView_userWishList;
	// 		delete obj.userView_documentPageArray;
	// 		delete obj.userView_storicoCorsiPartecipati;
	// 		delete obj.userView_storicoCorsiCreati;
	// 		delete obj.userView_docModifyArray;
	// 		delete obj.userView_uploadfiles;
	// 		delete obj.userView_createdAt;
	// 		delete obj.userView_updatedAt;
	// 		delete obj.userView___v;
	// 		delete obj.timeStartDate;
	// 		delete obj.timeEndDate;
	// 	});

	// 	//console.log('newList check', newList);

	// 	//CSV UNPARSE
	// 	csv = Papa.unparse(newList, {
	// 		quotes: false, //or array of booleans
	// 		quoteChar: '"',
	// 		escapeChar: '"',
	// 		delimiter: ';',
	// 		header: true,
	// 		//newline: '\r\n',
	// 		skipEmptyLines: false //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
	// 	});
	// 	//console.log('csv', csv);

	// 	//DOWNLOAD file
	// 	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	// 	// create a link element to download the zip archive
	// 	const link = document.createElement('a');
	// 	link.href = URL.createObjectURL(blob);
	// 	link.download = `TableExport_Corsi.csv`;
	// 	document.body.appendChild(link);
	// 	link.click();
	// 	document.body.removeChild(link);

	// 	// Release the URL object
	// 	URL.revokeObjectURL(link.href);
	// };

	const changeStatus = (event: any) => {
		if (event.target.form) {
			event.preventDefault();
			event.target.form.requestSubmit();
		}
	};

	const resetFieldsModalFilter = () => {
		openModal = false;
		prodId = null;
		status = '';
		title = '';
		descrShort = '';
		price = null;
		renewalLength = 365;
		modalTitle = '';
		postAction = '?/';
	};

	const onFilterReset = () => {
		invalidateAll();
		resetActive = false;
		tableList = getTable;
	};

	const onClickModal = (type: string, item: any) => {
		currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo';
		}
		if (type == 'modify') {
			postAction = `?/modify`;
			modalTitle = 'Modifica';
			prodId = item.prodId;
			title = item.title;
			price = item.price;
			renewalLength = item.renewalLength;
			descrShort = item.descrShort;
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			prodId = item.prodId;
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtra';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFieldsModalFilter();
		currentModal = '';
		//invalidateAll();
	};

	$effect(() => {
		//console.log('form', form);
		if (form != null) {
			//console.log('form triggered');
			async () => await invalidateAll(); // MUST be async/await or tableList = getTable will trigger infinite loop
			const { action, success, message, filterTableList } = form;
			if (success) {
				//console.log('filterTableList effect', filterTableList);
				currentModal = '';
				if (action == 'filter') {
					resetActive = true;
					tableList = filterTableList;
				} else {
					resetActive = false;
					tableList = getTable;
				}
			} else {
				notificationError = true;
			}
			resetFieldsModalFilter();
			clearTimeout(startTimeout);
			closeNotification();
			toastClosed = false;
			notificationContent = message;
			form = null; // reset form TESTING
		}
	}); // end effect

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
</script>

<svelte:head>
	<title>Lista Membership</title>
</svelte:head>

<noscript>
	<h1 style="font-weight:700; text-align: center;">Please enable Javascript to continue.</h1>
	<style type="text/css">
		#main-content {
			display: none;
		}
	</style>
</noscript>

<div class="overflow-x-auto table-zebra mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista Membership</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={onFilterReset}>
				<RefreshCcw />
			</button>
			{#if resetActive}
				<button class="btn btn-error text-white w-full sm:w-auto" onclick={onFilterReset}>
					<XCircle /> Reset Filtro
				</button>
			{:else}
				<button
					class="btn btn-info text-white w-full sm:w-auto"
					onclick={() => onClickModal('filter', null)}
				>
					<Funnel /> Filtra
				</button>
			{/if}
			<button
				class="btn btn-info text-white w-full sm:w-auto"
				onclick={() => onClickModal('new', null)}
			>
				<ListPlus />Nuovo
			</button>
			<button class="btn btn-info text-white w-full sm:w-auto">
				<FileDown />CSV
			</button>
		</div>
	</div>

	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr class="">
				<th>Status</th>
				<th>Titolo</th>
				<th>Prezzo</th>
				<th>Rinnovo</th>
				<th>Descrizione</th>
				<th>Azioni</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row -->
			{#if tableList.length == 0}
				<tr class="hover:bg-gray-300"><td> no data</td></tr>
			{/if}
			{#each tableList as row}
				<tr class="hover:bg-gray-300">
					<td class="">
						<form method="POST" action="?/changeStatus" use:enhance>
							<div>
								<input type="hidden" name="prodId" value={row.prodId} />
								<input type="hidden" name="status" value={row.status} />
								<input
									type="checkbox"
									id="setting"
									checked={row.status == 'enabled'}
									onchange={changeStatus}
									class="toggle toggle-success"
								/>
							</div>
						</form>
					</td>
					<td>{row.title}</td>
					<td>{row.price} €</td>
					<td>{row.renewalLength} giorni</td>
					<td>{row.descrShort}</td>
					<td class="space-4">
						<button onclick={() => onClickModal('modify', row)} class="btn btn-sm">
							Modifica
						</button>
						<button onclick={() => onClickModal('delete', row)} class="btn btn-error btn-sm">
							<Trash2 />
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

{#if currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Nuovo membership
			</header>

			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Nome</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<input
						class="input input-bordered join-item w-full"
						id="titolo"
						name="title"
						type="text"
						placeholder="Titolo"
						aria-label="Titolo"
						aria-describedby="basic-titolo"
						bind:value={title}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="price" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="price"
						type="number"
						name="price"
						placeholder="€"
						aria-label="price"
						aria-describedby="basic-price"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">Durata giorni</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calendar /></button>
					<input
						class="input input-bordered join-item w-full"
						id="renewalLength"
						type="number"
						name="renewalLength"
						aria-label="renewalLength"
						aria-describedby="renewalLength"
						min="1"
						max="36500"
						bind:value={renewalLength}
						required
					/>
				</div>
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">(max 36500 = 100 anni)</p>
				</label>
			</section>

			<section class="col-span-4">
				<div class="mt-6">
					<label for="descrShortN" class="form-label">
						<p class="font-bold mb-2">Descrizione (opzionale)</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShortN"
							name="descrShort"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={descrShort}
						></textarea>
					</div>
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}
						>Annulla</button
					>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Registra</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="prodId" value={prodId} />
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Modifica membership
			</header>

			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Nome</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<input
						class="input input-bordered join-item w-full"
						id="titolo"
						name="title"
						type="text"
						placeholder="Titolo"
						aria-label="Titolo"
						aria-describedby="basic-titolo"
						bind:value={title}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="price" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="price"
						type="number"
						name="price"
						placeholder="€"
						aria-label="price"
						aria-describedby="basic-price"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">Durata giorni</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calendar /></button>
					<input
						class="input input-bordered join-item w-full"
						id="renewalLength"
						type="number"
						name="renewalLength"
						aria-label="renewalLength"
						aria-describedby="renewalLength"
						min="1"
						max="36500"
						bind:value={renewalLength}
						required
					/>
				</div>
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">(max 36500 = 100 anni)</p>
				</label>
			</section>

			<section class="col-span-4">
				<div class="mt-6">
					<label for="descrShort" class="form-label">
						<p class="font-bold mb-2">Descrizione (opzionale)</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShort"
							name="descrShort"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={descrShort}
						></textarea>
					</div>
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}>
						Annulla
					</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Modifica</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="prodId" value={prodId} />
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Conferma rimozione
			</header>
			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}>Annulla</button>
					<button type="submit" class="btn btn-error btn-sm mx-2 text-white">Elimina</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">
			<!-- <input type="hidden" name="prodId" value={prodId} /> -->
			<div class="space-y-4">
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
					<select
						id="status"
						name="status"
						bind:value={status}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="enabled">attivo</option>
						<option value="disabled">inattivo</option>
					</select>
				</div>

				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
					<input
						type="text"
						id="title"
						name="title"
						bind:value={title}
						placeholder="titolo"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
			</div>

			<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
				<button type="button" class="btn btn-error btn-sm hover:bg-red-300" onclick={onCloseModal}>
					Annulla
				</button>
				<button type="submit" class="btn btn-success btn-sm hover:bg-green-400"> Filtra </button>
			</div>
		</form>
	</Modal>
{/if}

<!-- <Modal isOpen={currentModal} header={modalTitle}>
	<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
		>✕</button
	>
	{#if currentModal == 'new'}
		<form
			method="POST"
			action={postAction}
			use:enhance
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Nuovo membership
			</header>

			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Nome</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<input
						class="input input-bordered join-item w-full"
						id="titolo"
						name="title"
						type="text"
						placeholder="Titolo"
						aria-label="Titolo"
						aria-describedby="basic-titolo"
						bind:value={title}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="price" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="price"
						type="number"
						name="price"
						placeholder="€"
						aria-label="price"
						aria-describedby="basic-price"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">Durata giorni</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calendar /></button>
					<input
						class="input input-bordered join-item w-full"
						id="renewalLength"
						type="number"
						name="renewalLength"
						aria-label="renewalLength"
						aria-describedby="renewalLength"
						min="1"
						max="36500"
						bind:value={renewalLength}
						required
					/>
				</div>
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">(max 36500 = 100 anni)</p>
				</label>
			</section>

			<section class="col-span-4">
				<div class="mt-6">
					<label for="descrShortN" class="form-label">
						<p class="font-bold mb-2">Descrizione (opzionale)</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShortN"
							name="descrShort"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={descrShort}
						></textarea>
					</div>
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}>
						Annulla
					</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Registra </button>
				</div>
			</div>
		</form>
	{/if}

	{#if currentModal == 'modify'}
		<form
			method="POST"
			action={postAction}
			use:enhance
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="prodId" value={prodId} />
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Modifica membership
			</header>

			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Nome</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<input
						class="input input-bordered join-item w-full"
						id="titolo"
						name="title"
						type="text"
						placeholder="Titolo"
						aria-label="Titolo"
						aria-describedby="basic-titolo"
						bind:value={title}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="price" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="price"
						type="number"
						name="price"
						placeholder="€"
						aria-label="price"
						aria-describedby="basic-price"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">Durata giorni</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calendar /></button>
					<input
						class="input input-bordered join-item w-full"
						id="renewalLength"
						type="number"
						name="renewalLength"
						aria-label="renewalLength"
						aria-describedby="renewalLength"
						min="1"
						max="36500"
						bind:value={renewalLength}
						required
					/>
				</div>
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">(max 36500 = 100 anni)</p>
				</label>
			</section>

			<section class="col-span-4">
				<div class="mt-6">
					<label for="descrShort" class="form-label">
						<p class="font-bold mb-2">Descrizione (opzionale)</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShort"
							name="descrShort"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={descrShort}
						></textarea>
					</div>
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}>
						Annulla
					</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white"> Modifica </button>
				</div>
			</div>
		</form>
	{/if}

	{#if currentModal == 'delete'}
		<form
			method="POST"
			action={postAction}
			use:enhance
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="prodId" value={prodId} />
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Conferma eliminazione
			</header>
			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
					<button type="submit" class="btn btn-error btn-sm mx-2 text-white"> Elimina </button>
				</div>
			</div>
		</form>
	{/if}

	{#if currentModal == 'filter'}
		<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">

			<div class="space-y-4">
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
					<select
						id="status"
						name="status"
						bind:value={status}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="enabled">attivo</option>
						<option value="disabled">inattivo</option>
					</select>
				</div>

				<div>
					<label for="membershipLevel" class="block text-sm font-medium text-gray-700 mb-1"
						>Nome</label
					>
					<input
						type="text"
						id="title"
						name="title"
						bind:value={title}
						placeholder="titolo"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>

				<div>
					<label for="price" class="block text-sm font-medium text-gray-700 mb-1">Prezzo</label>
					<input
						type="number"
						id="price"
						name="price"
						bind:value={price}
						placeholder="€"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div>
					<label for="renewalLengthF" class="block text-sm font-medium text-gray-700 mb-1"
						>Rinnovo</label
					>
					<input
						type="number"
						id="renewalLengthF"
						bind:value={renewalLength}
						placeholder="Giorni"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div> 
			</div>

			<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
				<button type="button" class="btn btn-error btn-sm hover:bg-red-300" onclick={onCloseModal}>
					Annulla
				</button>
				<button type="submit" class="btn btn-success btn-sm hover:bg-green-400">
					Applica Filtri
				</button>
			</div>
		</form>
	{/if}
</Modal> -->
