<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Papa from 'papaparse';
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import { province, months, days, hours, minutes } from '$lib/stores/arrays';
	import Modal from '$lib/components/Modal.svelte';
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
		ShieldAlert
	} from 'lucide-svelte';

	let { data, form } = $props();
	let { getTable, getTableNames, userData, getLayout } = $derived(data);
	let tableList = $state(getTable);

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
	let mode = $state('');
	let provinceArray = $state([]);
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

		const flattenObject = (obj: any, prefix = '') => {
			return Object.keys(obj).reduce((acc, k) => {
				const pre = prefix.length ? prefix + '_' : '';
				if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
					Object.assign(acc, flattenObject(obj[k], pre + k));
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
			delete obj.__v;
			delete obj.attribute1;
			delete obj.attribute2;
			delete obj.attribute3;
			delete obj.attribute4;
			delete obj.attribute5;
			delete obj.attribute6;
			delete obj.attribute7;
			delete obj.attribute8;
			delete obj.attribute9;
			delete obj.brand;
			delete obj.brandId;
			delete obj.bundleProduct;
			delete obj.categoryId;
			delete obj.cost;
			delete obj.dateAdd;
			delete obj.dateUpd;
			delete obj.depth;
			delete obj.attribute10;
			delete obj.condition;
			delete obj.feature;
			delete obj.filterPermissionToEdit;
			delete obj.height;
			delete obj.image1;
			delete obj.image2;
			delete obj.image3;
			delete obj.image4;
			delete obj.image5;
			delete obj.image6;
			delete obj.image7;
			delete obj.image8;
			delete obj.imgFull;
			delete obj.imgThumb;
			delete obj.listSubscribers;
			delete obj.manufacturer;
			delete obj.manufacturerCod;
			delete obj.msrp;
			delete obj.notes;
			delete obj.points;
			delete obj.priceSetByBundle;
			delete obj.promoEndDate;
			delete obj.promoStartDate;
			delete obj.promoterProCod;
			delete obj.rating;
			delete obj.rewardProgramDetails;
			delete obj.shippingCost;
			delete obj.sku;
			delete obj.state;
			delete obj.value1;
			delete obj.value2;
			delete obj.value3;
			delete obj.value4;
			delete obj.value5;
			delete obj.value6;
			delete obj.value7;
			delete obj.value8;
			delete obj.value9;
			delete obj.value10;
			delete obj.vatType;
			delete obj.vatValue;
			delete obj.weight;
			delete obj.video;
			delete obj.birthdate;
			delete obj.filterPermissionToSee;
			delete obj.manufacturerId;
			delete obj.orderQuantity;
			delete obj.width;
			delete obj.extra0;
			delete obj.extra1;
			delete obj.extra2;
			delete obj.extra3;
			delete obj.extra4;
			delete obj.extra5;
			delete obj.extra6;
			delete obj.extra7;
			delete obj.extra8;
			delete obj.extra9;
			delete obj.extra10;
			delete obj.extra11;
			delete obj.extra12;
			delete obj.extraFieldNumber1;
			delete obj.extraFieldNumber2;
			delete obj.extraFieldNumber3;
			delete obj.extraFieldNumber4;
			delete obj.extraFieldNumber5;
			delete obj.extraFieldNumber6;
			delete obj.extraFieldNumber7;
			delete obj.extraFieldNumber8;
			delete obj.extraFieldNumber9;
			delete obj.extraFieldNumber10;
			delete obj.extraFieldNumber11;
			delete obj.extraFieldNumber12;
			delete obj.extraFieldNumber13;
			delete obj.extraFieldNumber14;
			delete obj.extraFieldNumber15;
			delete obj.extraFieldNumber16;
			delete obj.extraFieldNumber17;
			delete obj.extraFieldNumber18;
			delete obj.extraFieldNumber19;
			delete obj.extraFieldNumber20;
			delete obj.extraFieldNumber21;
			delete obj.extraFieldNumber22;
			delete obj.extraFieldNumber23;
			delete obj.extraFieldNumber24;
			delete obj.extraFieldText1;
			delete obj.extraFieldText2;
			delete obj.extraFieldText3;
			delete obj.extraFieldText4;
			delete obj.extraFieldText5;
			delete obj.extraFieldText6;
			delete obj.extraFieldText7;
			delete obj.extraFieldText8;
			delete obj.extraFieldText9;
			delete obj.extraFieldText10;
			delete obj.extraFieldText11;
			delete obj.extraFieldText12;
			delete obj.extraFieldText13;
			delete obj.extraFieldText14;
			delete obj.extraFieldText15;
			delete obj.extraFieldText16;
			delete obj.extraFieldText17;
			delete obj.extraFieldText18;
			delete obj.extraFieldText19;
			delete obj.extraFieldText20;
			delete obj.extraFieldText21;
			delete obj.extraFieldText22;
			delete obj.extraFieldText23;
			delete obj.extraFieldText24;
			delete obj.userView_businessData_businessName;
			delete obj.userView_businessData_businessAddress;
			delete obj.userView_businessData_vatNumber;
			delete obj.userView_businessData_businessPostalCode;
			delete obj.userView_businessData_businessCategory;
			delete obj.userView_businessData_businessCity;
			delete obj.userView_businessData_businessState;
			delete obj.userView_businessData_businessCountry;
			delete obj.userView_businessData_businessCounty;
			delete obj.userView_businessData_numberEmployed;
			delete obj.userView_businessData_grossIncome;
			delete obj.userView_businessData_role;
			delete obj.userView_card_cardId;
			delete obj.userView_card_cardCode;
			delete obj.userView_card_cardActivation;
			delete obj.userView_card_cardExpiry;
			delete obj.userView_card_cardStatus;
			delete obj.userView_userId;
			delete obj.userView_userCode;
			delete obj.userView_active;
			delete obj.userView_token;
			delete obj.userView_cookieId;
			delete obj.userView_promotions;
			delete obj.userView_level;
			delete obj.userView_codeSales;
			delete obj.userView_codeManager;
			delete obj.userView_codeSupervisor;
			delete obj.userView_codeAgency;
			delete obj.userView_codeSponsor;
			delete obj.userView_codeAdmin;
			delete obj.userView_codeSuperAdmin;
			delete obj.userView_name;
			delete obj.userView_namePublic;
			delete obj.userView_surname;
			delete obj.userView_surnamePublic;
			delete obj.userView_category;
			delete obj.userView_address;
			delete obj.userView_addressPublic;
			delete obj.userView_city;
			delete obj.userView_cityPublic;
			delete obj.userView_postalCode;
			delete obj.userView_postalCodePublic;
			delete obj.userView_county;
			delete obj.userView_statePublic;
			delete obj.userView_region;
			delete obj.userView_regionPublic;
			delete obj.userView_country;
			delete obj.userView_countryPublic;
			delete obj.userView_language;
			delete obj.userView_mobilePhone;
			delete obj.userView_mobilePhonePublic;
			delete obj.userView_phone;
			delete obj.userView_phonePublic;
			delete obj.userView_email;
			delete obj.userView_emailPublic;
			delete obj.userView_documentUpload;
			delete obj.userView_photoUpload;
			delete obj.userView_gender;
			delete obj.userView_birthdate;
			delete obj.userView_socialSecurityNumber;
			delete obj.userView_username;
			delete obj.userView_password;
			delete obj.userView_pointsSpent;
			delete obj.userView_pointsBalance;
			delete obj.userView_pointsTotal;
			delete obj.userView_pointsBalanceDate;
			delete obj.userView_userAvatar;
			delete obj.userView_privacyDate;
			delete obj.userView_privacyAccept;
			delete obj.userView_revenue;
			delete obj.userView_target0;
			delete obj.userView_target1;
			delete obj.userView_target2;
			delete obj.userView_target3;
			delete obj.userView_target4;
			delete obj.userView_target5;
			delete obj.userView_target6;
			delete obj.userView_target7;
			delete obj.userView_target8;
			delete obj.userView_target9;
			delete obj.userView_target10;
			delete obj.userView_target11;
			delete obj.userView_target12;
			delete obj.userView_extra0;
			delete obj.userView_extra1;
			delete obj.userView_extra2;
			delete obj.userView_extra3;
			delete obj.userView_extra4;
			delete obj.userView_extra5;
			delete obj.userView_extra6;
			delete obj.userView_extra7;
			delete obj.userView_extra8;
			delete obj.userView_extra9;
			delete obj.userView_extra10;
			delete obj.userView_extra11;
			delete obj.userView_extra12;
			delete obj.userView_extraFieldNumber1;
			delete obj.userView_extraFieldNumber2;
			delete obj.userView_extraFieldNumber3;
			delete obj.userView_extraFieldNumber4;
			delete obj.userView_extraFieldNumber5;
			delete obj.userView_extraFieldNumber6;
			delete obj.userView_extraFieldNumber7;
			delete obj.userView_extraFieldNumber8;
			delete obj.userView_extraFieldNumber9;
			delete obj.userView_extraFieldNumber10;
			delete obj.userView_extraFieldNumber11;
			delete obj.userView_extraFieldNumber12;
			delete obj.userView_extraFieldNumber13;
			delete obj.userView_extraFieldNumber14;
			delete obj.userView_extraFieldNumber15;
			delete obj.userView_extraFieldNumber16;
			delete obj.userView_extraFieldNumber17;
			delete obj.userView_extraFieldNumber18;
			delete obj.userView_extraFieldNumber19;
			delete obj.userView_extraFieldNumber20;
			delete obj.userView_extraFieldNumber21;
			delete obj.userView_extraFieldNumber22;
			delete obj.userView_extraFieldNumber23;
			delete obj.userView_extraFieldNumber24;
			delete obj.userView_extraFieldText1;
			delete obj.userView_extraFieldText2;
			delete obj.userView_extraFieldText3;
			delete obj.userView_extraFieldText4;
			delete obj.userView_extraFieldText5;
			delete obj.userView_extraFieldText6;
			delete obj.userView_extraFieldText7;
			delete obj.userView_extraFieldText8;
			delete obj.userView_extraFieldText9;
			delete obj.userView_extraFieldText10;
			delete obj.userView_extraFieldText11;
			delete obj.userView_extraFieldText12;
			delete obj.userView_extraFieldText13;
			delete obj.userView_extraFieldText14;
			delete obj.userView_extraFieldText15;
			delete obj.userView_extraFieldText16;
			delete obj.userView_extraFieldText17;
			delete obj.userView_extraFieldText18;
			delete obj.userView_extraFieldText19;
			delete obj.userView_extraFieldText20;
			delete obj.userView_extraFieldText21;
			delete obj.userView_extraFieldText22;
			delete obj.userView_extraFieldText23;
			delete obj.userView_extraFieldText24;
			delete obj.userView_lastAccess;
			delete obj.userView_counterAccess;
			delete obj.userView_remoteIP;
			delete obj.userView_remoteHost;
			delete obj.userView_remoteBrowser;
			delete obj.userView_notesOnUser;
			delete obj.userView_userCart;
			delete obj.userView_userWishList;
			delete obj.userView_documentPageArray;
			delete obj.userView_storicoCorsiPartecipati;
			delete obj.userView_storicoCorsiCreati;
			delete obj.userView_docModifyArray;
			delete obj.userView_uploadfiles;
			delete obj.userView_createdAt;
			delete obj.userView_updatedAt;
			delete obj.userView___v;
			delete obj.timeStartDate;
			delete obj.timeEndDate;
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
		mode = '';

		form = null;
	};

	const resetData = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getTable;
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
					notificationError = true;
					notificationContent = 'Email già inserita';
					toastClosed = false;
					closeNotification();
				}
			} else {
				notificationError = true;
				notificationContent = 'Email NON valida';
				toastClosed = false;
				closeNotification();
			}
		}
		if (type == 'tag')
			if (tag != '') {
				if (!tagArray.includes(item)) {
					tagArray.push(item);
				} else {
					notificationError = true;
					notificationContent = 'Tag già inserito';
					toastClosed = false;
					closeNotification();
				}
			} else {
				notificationError = true;
				notificationContent = 'Tag NON valido';
				toastClosed = false;
				closeNotification();
			}
		if (type == 'province') {
			if (county != '') {
				if (!provinceArray.includes(item)) {
					provinceArray.push(item);
					county = '';
				} else {
					notificationError = true;
					notificationContent = 'Provincia già inserita';
					toastClosed = false;
					closeNotification();
				}
			} else {
				notificationError = true;
				notificationContent = 'Provincia NON valida';
				toastClosed = false;
				closeNotification();
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
	};

	const onCloseModal = () => {
		openModal = false;
		currentModal = '';
		currentDialog = '';
		resetFields();

		// questo serve per ripristinare i valori di tag e province e mail quando si preme annulla o closeModal

		tableList = getTable;
	};

	const onChangeRadioMode = () => {
		location = '';
		provinceArray = [];
	};

	$effect(() => {
		if (form != null) {
			async () => await invalidateAll();
			const { action, success, message, filterTableList } = form;
			if (success) {
				notificationError = false;
				openModal = false;
				resetActive = false;
				if (action == 'filter') {
					resetActive = true;
					tableList = filterTableList;
				} else {
					resetActive = false;
					tableList = getTable;
				}
			} else {
				notificationError = true;
				// errMessage = message;
			}
			resetFields();
			clearTimeout(startTimeout);
			closeNotification();
			toastClosed = false;
			notificationContent = message;
			form = null;
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
		}, 3000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer
</script>

<svelte:head>
	<title>Lista corsi</title>
</svelte:head>

<div class="overflow-x-auto table-zebra mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista corsi</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={resetData}>
				<RefreshCcw />
			</button>
			{#if resetActive == true}
				<button class="btn btn-error rounded-md text-white" onclick={resetData}>
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
			<button class="btn btn-info rounded-md text-white" onclick={() => onClickModal('new', null)}>
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
				<th>Data inserimento</th>
				<th>Riflessologo</th>
				<th>Titolo</th>
				<th>Data</th>
				<th>Luogo</th>
				<th>Prezzo</th>
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
						<!-- Data inserimento -->
						<td>{row.createdAt}</td>
						<!-- Nome Cognome Riflessologo -->
						<td>{row.name} {row.surname}</td>
						<!-- Email Riflessologo -->
						<!-- <td>{row.notificationEmail[0]}</td> -->
						<!-- Titolo -->
						<td>{row.layoutView?.title}</td>
						<!-- Data -->
						<td>{row.eventStartDate?.substring(0, 10)}</td>
						<!-- <td>{row.eventStartDate}</td> -->
						<!-- Luogo -->
						<td>
							<p class="card-text">
								{row.county}
							</p>
						</td>
						<!-- Prezzo -->
						<td>{row.layoutView.price} €</td>
						<!-- Azione -->
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

<Notification {toastClosed} {notificationContent} {notificationError} />

{#if currentModal == 'modify' || currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-4xl">
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
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
						<input
							type="radio"
							name="mode"
							value="ONLINE"
							bind:group={mode}
							class="radio"
							onchange={() => onChangeRadioMode()}
							required
						/>
						<span class="label-text">Online</span>
					</label>
					<label class="label cursor-pointer flex gap-2">
						<input
							type="radio"
							name="mode"
							value="IN_PRESENZA"
							bind:group={mode}
							class="radio"
							onchange={() => onChangeRadioMode()}
						/>
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
					<button class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>

					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">
						{#if currentDialog == 'new'}
							Registra
						{:else if currentDialog == 'modify'}
							Modifica
						{/if}
					</button>
				</div>
			</div>
			<input type="hidden" name="eventStartDate" value={eventStartDate} />
		</form>
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
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
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
					<button type="submit" class="btn btn-error btn-sm mx-2 text-white"> Elimina </button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="county" class="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
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
							<option value={item.userId}>{item.surname} {item.name}</option>
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
	</Modal>
{/if}
