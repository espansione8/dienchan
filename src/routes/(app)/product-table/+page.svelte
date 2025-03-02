<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	//import { page } from '$app/stores'; // $page.data.user $page.data.auth
	import Notification from '$lib/components/Notification.svelte';
	import DragDrop from '$lib/components/DragDrop.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Papa from 'papaparse';
	import {
		CopyPlus,
		RefreshCcw,
		XCircle,
		Filter,
		FileDown,
		Settings,
		FileSearch2,
		Trash2,
		EyeOff,
		Eye,
		Calculator,
		List,
		Users,
		Pen,
		FolderOpen
	} from 'lucide-svelte';

	let { data, form } = $props();
	//let auth = $state($page.data.auth);
	//let userData = $state($page.data.user);
	let { getTable, categories } = $derived(data);
	let tableList = $state(getTable);

	let resetActive = $state(false);
	let isModal = $state(false);
	let currentDialog = $state('');
	let postAction = $state('?/');
	let modalTitle = $state('');
	let deleteId = $state('');

	let title = $state('');
	let cod = $state('');
	let descrShort = $state('');
	let stockQty = $state(0);
	let category = $state('');
	let price = $state(0);
	let prodId = $state('');

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

		// JOBSPRONTO
		// const flattenedArray = currentList.map((obj: any) => {
		// 		const flattenedAvailability = {
		// 			monday_available: obj.weeklyAvailability.monday.available,
		// 			tuesday_available: obj.weeklyAvailability.tuesday.available,
		// 			wednesday_available: obj.weeklyAvailability.wednesday.available,
		// 			thursday_available: obj.weeklyAvailability.thursday.available,
		// 			friday_available: obj.weeklyAvailability.friday.available,
		// 			saturday_available: obj.weeklyAvailability.saturday.available,
		// 			sunday_available: obj.weeklyAvailability.sunday.available
		// 		};
		// 		const cvFilter = $derived(
		// 			obj.uploadfiles.filter((item: any) => {
		// 				return item.type == 'cv';
		// 			})
		// 		);
		// 		let pdfLink = '';
		// 		if (cvFilter[0]?.type == 'cv') {
		// 			console.log(cvFilter[0].filename);

		// 			pdfLink = `${import.meta.env.VITE_BASE_URL}/files/${obj.userId}/${cvFilter[0].filename}`;
		// 		}
		// 		let rolesFlat: any[] = [];
		// 		obj.rolesList.map((item: any) => rolesFlat.push(item.title));
		// 		// const flattenedRoles = { roles: rolesFlat };
		// 		let languagesFlat: any[] = [];
		// 		obj.languageList.map((item: any) => languagesFlat.push(item.title));
		// 		// const flattenedLanguages = {	languages: languagesFlat };

		// 		let traitFlat: any[] = [];
		// 		obj.personalityBoost.map((item: any, i: number) => {
		// 			if (item) traitFlat.push(`[${i}] ${item.question}: ${item.answer}`);
		// 		});
		// 		// const flattenedLanguages = {	languages: languagesFlat };

		// 		return {
		// 			...obj,
		// 			...flattenedAvailability,
		// 			...{ roles: rolesFlat },
		// 			...{ languages: languagesFlat },
		// 			...{ CV: pdfLink },
		// 			...{ personality: traitFlat }
		// 		};
		// 	});

		// newList = flattenedArray.map((obj: any) => ({
		// 	...obj,
		// 	createdAt: obj.createdAt?.substring(0, 10),
		// 	birthdate: obj.birthdate?.substring(0, 10)
		// }));

		//console.log('newList', newList);
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
			delete obj.userView_countryState;
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
		const link = document.createElement('a'); //
		link.href = URL.createObjectURL(blob);
		link.download = `TableExport_prodotti.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};

	const onFilterReset = () => {
		invalidateAll();
		tableList = getTable;
		resetActive = false;
		title = '';
		cod = '';
		descrShort = '';
		stockQty = 0;
		category = '';
		price = 0;
	};

	const onRefresh = () => {
		invalidateAll();
		tableList = getTable;
	};

	const onCloseModal = () => {
		isModal = false;
		onRefresh();
	};

	const onClickDialog = (type: string, item: any) => {
		currentDialog = type;
		isModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo prodotto';
			prodId = item.prodId;
		}
		if (type == 'modify') {
			postAction = `?/modify`;
			modalTitle = 'Modifica prodotto';
			prodId = item.prodId;
			title = item.title;
			descrShort = item.descrShort;
			stockQty = item.stockQty;
			category = item.category;
			price = item.price;
			console.log('price.category', price, category);
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina prodotto';
			deleteId = item.prodId;
			console.log('deleteId', deleteId);
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtro prodotto';
		}
	};

	$effect(() => {
		if (form != null) {
			async () => await invalidateAll(); // MUST be async/await or tableList = getTable will trigger infinite loop
			const { action, success, message, filterTableList } = form;
			if (success) {
				//fieldReset();
				isModal = false;
				if (filterTableList) {
					tableList = filterTableList;
				} else {
					tableList = getTable;
				}
			} else {
				notificationError = true;
			}
			clearTimeout(startTimeout);
			closeNotification();
			toastClosed = false;
			notificationContent = message;
		}
	}); // end effect

	// notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 5000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer
</script>

<svelte:head>
	<title>Lista Prodotti</title>
</svelte:head>

<noscript>
	<h1 style="font-weight:700; text-align: center;">Please enable Javascript to continue.</h1>
	<style type="text/css">
		#main-content {
			display: none;
		}
	</style>
</noscript>

<div class="overflow-x-auto mt-5 px-4 mb-5">
	<!-- {languageTag()}
	{m.home} -->
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista prodotti</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={onRefresh}>
				<RefreshCcw />
			</button>
			{#if resetActive}
				<button class="btn btn-error rounded-md text-white" onclick={onFilterReset}>
					<XCircle class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button
					class="btn btn-info rounded-md text-white"
					onclick={() => onClickDialog('filter', null)}
				>
					<Filter class="mt-1" /> Filtra
				</button>
			{/if}
			<button class="btn btn-info rounded-md text-white" onclick={() => onClickDialog('new', null)}>
				<CopyPlus /> Nuovo
			</button>
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={() => csvCreate()}>
				<FileDown />CSV
			</button>
		</div>
	</div>

	<table class="table mt-5">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600 sticky top-0">
			<tr>
				<th>ID</th>
				<th></th>
				<th>Status</th>
				<th>Titolo</th>
				<th>Categoria</th>
				<th>Prezzo</th>
				<th>Quantità</th>
				<th>Bundle</th>
				<th>Azione</th>
			</tr>
		</thead>

		<tbody class="">
			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<td>{row.prodId}</td>
					<td>
						<img
							class="max-h-20"
							src={row.uploadfiles[0]?.type == 'product-primary'
								? `files/${row.uploadfiles[0]?.fileUrl}`
								: '/images/picture.png'}
							alt={row.title}
						/>
					</td>
					<td class="">
						<form method="POST" action={`?/changeStatus`} use:enhance>
							<input type="hidden" name="prodId" value={row.prodId} />
							<input type="hidden" name="status" value={row.status} />
							<span class="flex items-center">
								{#if row.status == 'enabled'}
									<button type="submit" class="btn btn-success btn-sm font-semibold"><Eye /></button
									>
								{:else}
									<button type="submit" class="btn btn-error btn-sm font-semibold"
										><EyeOff /></button
									>
								{/if}
							</span>
						</form>
					</td>
					<td>{row.title}</td>
					<td>{row.category[0]}</td>
					<td>{row.price}</td>
					<td>{row.stockQty}</td>
					<td><div class="badge badge-primary badge-md">0</div></td>
					<td class="flex items-center justify-center space-x-4">
						<!-- Action -->
						<button
							onclick={() => onClickDialog('modify', row)}
							class="btn btn-sm bg-gray-200 btn-neutral text-gray-700"
							><Settings />
						</button>
						<button
							onclick={() => goto(`/product-detail/${row.prodId}`)}
							class="btn btn-sm bg-green-200 btn-green-400 text-green-800"
							><FileSearch2 />
						</button>
						<button class="btn btn-error btn-sm" onclick={() => onClickDialog('delete', row)}
							><Trash2 /></button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

<Modal isOpen={isModal} header={modalTitle} cssClass="max-w-4xl">
	<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={onCloseModal}
		>✕</button
	>
	{#if currentDialog == 'new'}
		<form
			action={postAction}
			method="POST"
			enctype="multipart/form-data"
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			use:enhance
		>
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Nuovo Prodotto
			</header>
			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Titolo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
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
			<section class="col-span-4">
				<label for="descrizione" class="form-label">
					<p class="font-bold mb-2">Descrizione</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<textarea
						class="textarea textarea-bordered h-24 join-item w-full"
						id="descrizione"
						name="descrShort"
						placeholder="Descrizione"
						aria-label="descrizione"
						aria-describedby="basic-descrizione"
						bind:value={descrShort}
						required
					></textarea>
				</div>
			</section>
			<section class="col-span-1 md:col-span-2">
				<label for="quantitaProdotto" class="form-label">
					<p class="font-bold mb-2">Quantità</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><Users /></button>
					<input
						class="input input-bordered join-item w-full"
						id="quantitaProdotto"
						name="stockQty"
						type="number"
						placeholder="N."
						aria-label="quantitaProdotto"
						aria-describedby="basic-quantitaProdotto"
						step="1"
						min="1"
						bind:value={stockQty}
						required
					/>
				</div>
			</section>
			<section class="col-span-4 md:col-span-2">
				<label for="category" class="form-label">
					<p class="font-bold mb-2">Categoria</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><List /></button>
					<select
						class="select select-bordered w-full rounded-md rounded-l-none"
						id="category"
						name="category"
						aria-label="category"
						aria-describedby="basic-category"
						bind:value={category}
						required
					>
						<option disabled value="">Scegli</option>
						<option value="strumenti">Strumenti</option>
						<option value="materiali">Materiali</option>
						<option value="altro">Altro</option>
					</select>
				</div>
			</section>
			<section class="col-span-4 md:col-span-2">
				<label for="cost" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="cost"
						name="price"
						type="number"
						placeholder="N."
						aria-label="cost"
						aria-describedby="basic-cost"
						step="0.50"
						min="1"
						bind:value={price}
						required
					/>
				</div>
			</section>
			<section class="col-span-4 md:col-span-2">
				<label for="product-primary" class="form-label">
					<p class="font-bold mb-2">foto prodotto</p>
				</label>
				<DragDrop inputName="product-primary" />
			</section>
			<section class="lg:col-span-4 mt-2">
				<div class="col-span-4 mt-10 flex justify-center">
					<button class="btn btn-error mx-1" type="button" onclick={onCloseModal}>Annulla</button>
					<button class="btn btn-success mx-1" type="submit">
						<span class="flex items-center justify-center"> REGISTRA PRODOTTO </span>
					</button>
				</div>
			</section>
		</form>
	{/if}

	{#if currentDialog == 'modify'}
		<form
			action={postAction}
			method="POST"
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			use:enhance
		>
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Modifica Prodotto
			</header>
			<input type="hidden" name="prodId" value={prodId} />
			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Titolo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
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
			<section class="col-span-4">
				<label for="descrizione" class="form-label">
					<p class="font-bold mb-2">Descrizione</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<textarea
						class="textarea textarea-bordered h-24 join-item w-full"
						id="descrizione"
						name="descrShort"
						placeholder="Descrizione"
						aria-label="descrizione"
						aria-describedby="basic-descrizione"
						bind:value={descrShort}
						required
					></textarea>
				</div>
			</section>
			<section class="col-span-1 md:col-span-2">
				<label for="quantitaProdotto" class="form-label">
					<p class="font-bold mb-2">Quantità</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><Users /></button>
					<input
						class="input input-bordered join-item w-full"
						id="quantitaProdotto"
						name="stockQty"
						type="number"
						placeholder="N."
						aria-label="quantitaProdotto"
						aria-describedby="basic-quantitaProdotto"
						step="1"
						min="1"
						bind:value={stockQty}
						required
					/>
				</div>
			</section>
			<section class="col-span-4 md:col-span-2">
				<label for="category" class="form-label">
					<p class="font-bold mb-2">Categoria</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><List /></button>
					<select
						class="select select-bordered w-full rounded-md rounded-l-none"
						id="category"
						name="category"
						aria-label="category"
						aria-describedby="basic-category"
						bind:value={category[0]}
						required
					>
						<option disabled value="">Scegli</option>
						<option value="strumenti">Strumenti</option>
						<option value="materiali">Materiali</option>
						<option value="altro">Altro</option>
					</select>
				</div>
			</section>
			<section class="col-span-4 md:col-span-2">
				<label for="cost" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="cost"
						name="price"
						type="number"
						placeholder="N."
						aria-label="cost"
						aria-describedby="basic-cost"
						step="0.50"
						min="1"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<section class="lg:col-span-4 mt-2">
				<div class="col-span-4 mt-10 flex justify-center">
					<button class="btn btn-error mx-1" type="button" onclick={onCloseModal}>Annulla</button>
					<button class="btn btn-success mx-1" type="submit">
						<span class="flex items-center justify-center"> MODIFICA PRODOTTO </span>
					</button>
				</div>
			</section>
		</form>
	{/if}

	{#if currentDialog == 'delete'}
		<form action={postAction} method="POST" use:enhance>
			<input type="hidden" name="prodId" value={deleteId} />
			<div class="flex justify-center space-x-10 mt-4">
				<button class="btn btn-error btn-md" type="button" onclick={onCloseModal}>Annulla</button>
				<button class="btn btn-success btn-md text-white" type="submit"><Trash2 />Conferma</button>
			</div>
		</form>
	{/if}

	{#if currentDialog == 'filter'}
		<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
					<input
						class="input input-bordered join-item w-full"
						id="title"
						name="title"
						type="text"
						placeholder="Titolo"
						bind:value={title}
					/>
				</div>

				<!-- <div>
					<label for="price" class="block text-sm font-medium text-gray-700 mb-1">Prezzo</label>
					<input
						class="input input-bordered join-item w-full"
						id="meta"
						name="price"
						type="text"
						placeholder="Prezzo"
						bind:value={price}
					/>
				</div> -->

				<div>
					<label for="category" class="block text-sm font-medium text-gray-700 mb-1"
						>Categoria</label
					>
					<select
						class="input input-bordered join-item w-full"
						id="category"
						name="category"
						bind:value={category}
					>
						<option value="">Seleziona una categoria</option>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>
			</div>
			<section class="lg:col-span-4 mt-2">
				<div class="col-span-4 mt-10 flex justify-center">
					<button class="btn btn-error mx-1" type="button" onclick={onCloseModal}>Annulla</button>
					<button class="btn btn-success mx-1" type="submit">
						<span class="flex items-center justify-center">Applica Filtri</span>
					</button>
				</div>
			</section>
		</form>
	{/if}
</Modal>
