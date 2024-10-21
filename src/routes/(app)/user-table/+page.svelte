<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Papa from 'papaparse';
	import {
		Filter,
		Trash2,
		Settings,
		UserRoundSearch,
		Eye,
		XCircle,
		EyeOff,
		Lock,
		ShieldAlert,
		RefreshCcw,
		FileDown,
		CopyPlus
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { country_list } from '$lib/stores/arrays.js';
	import { province } from '$lib/stores/arrays';

	let { data, form } = $props();
	let { getTable } = $derived(data);
	let tableList = $state(getTable);

	// remove online in province
	let provinceFilterate = $province.filter((p) => p.title !== 'Online');

	let userId = $state('');

	const onClickDetail = (id: number) => {
		// console.log('ID', id);
		goto(`/profile-public/${id}`);
	};

	let isModalFilterCourse = $state(false);
	let isModalConfirmDelete = $state(false);
	let isModalModify = $state(false);
	let resetActive = $state(false);

	const onCloseFilterSearch = () => {
		isModalFilterCourse = false;
		onFilterReset();
	};

	const onOpenFilter = () => {
		level = '';
		membershipLevel = '';
		email = '';
		postAction = `?/filterUser`;
		isModalFilterCourse = true;
	};

	const onFilterReset = () => {
		resetActive = false;
		tableList = getTable;
		invalidateAll();
	};

	const showLevel = (level: string) => {
		if (level == 'user') {
			return 'Utente base';
		} else if (level == 'formatore') {
			return 'Formatore';
		} else if (level == 'admin') {
			return 'Admin';
		} else if (level == 'superadmin') {
			return 'Superadmin';
		}
	};

	const onSwitchPublicProfile = async (type: string, value: boolean) => {
		if (type == 'namePublic') namePublic = !value;
		if (type == 'surnamePublic') surnamePublic = !value;
		if (type == 'emailPublic') emailPublic = !value;
		if (type == 'addressPublic') addressPublic = !value;
		if (type == 'cityPublic') cityPublic = !value;
		if (type == 'statePublic') statePublic = !value;
		if (type == 'postalCodePublic') postalCodePublic = !value;
		if (type == 'countryPublic') countryPublic = !value;
		if (type == 'phonePublic') phonePublic = !value;
		if (type == 'mobilePhonePublic') mobilePhonePublic = !value;
		//userData[type] = !value;
		// console.log('onSwitchPublicProfile', type, value, typeof namePublic, namePublic);
	};

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
			delete obj.businessData_businessName;
			delete obj.businessData_vatNumber;
			delete obj.businessData_businessCategory;
			delete obj.businessData_businessAddress;
			delete obj.businessData_businessPostalCode;
			delete obj.businessData_businessState;
			delete obj.businessData_businessCountry;
			delete obj.businessData_businessCounty;
			delete obj.businessData_numberEmployed;
			delete obj.businessData_grossIncome;
			delete obj.businessData_businessCity;
			delete obj.businessData_role;
			delete obj.businessData_grossIncome;
			delete obj.businessData_grossIncome;
			delete obj.businessData_grossIncome;
			delete obj.businessData_grossIncome;
			delete obj.businessData_grossIncome;
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
			delete obj.documentUpload;
			delete obj.photoUpload;
			delete obj.gender;
			delete obj.socialSecurityNumber;
			delete obj.username;
			delete obj.password;
			delete obj.pointsSpent;
			delete obj.pointsBalance;
			delete obj.pointsTotal;
			delete obj.pointsBalanceDate;
			delete obj.userAvatar;
			delete obj.privacyDate;
			delete obj.privacyAccept;
			delete obj.revenue;
			delete obj.target0;
			delete obj.target1;
			delete obj.target2;
			delete obj.target3;
			delete obj.target4;
			delete obj.target5;
			delete obj.target6;
			delete obj.target7;
			delete obj.target8;
			delete obj.target9;
			delete obj.target10;
			delete obj.target11;
			delete obj.target12;
			delete obj.lastAccess;
			delete obj.counterAccess;
			delete obj.remoteIP;
			delete obj.remoteHost;
			delete obj.remoteBrowser;
			delete obj.notesOnUser;
			delete obj.userCart;
			delete obj.userWishList;
			delete obj.documentPageArray;
			delete obj.storicoCorsiPartecipati;
			delete obj.storicoCorsiCreati;
			delete obj.docModifyArray;
			delete obj.uploadfiles;
			delete obj.codeSales;
			delete obj.codeManager;
			delete obj.codeSupervisor;
			delete obj.codeAgency;
			delete obj.codeSponsor;
			delete obj.codeAdmin;
			delete obj.codeSuperAdmin;
			delete obj.card_cardId;
			delete obj.card_cardCode;
			delete obj.card_cardActivation;
			delete obj.card_cardExpiry;
			delete obj.card_cardStatus;
			delete obj.userCode;
			delete obj.active;
			delete obj.token;
			delete obj.cookieId;
			delete obj.promotions;
			delete obj.codeSales;
			delete obj.codeManager;
			delete obj.codeSupervisor;
			delete obj.codeAgency;
			delete obj.codeSponsor;
			delete obj.codeAdmin;
			delete obj.codeSuperAdmin;
			delete obj.category;
			delete obj.region;
		});
		//console.log('newList user', newList);

		//CSV UNPARSE
		csv = Papa.unparse(newList, {
			quotes: false,
			quoteChar: '"',
			escapeChar: '"',
			delimiter: ';',
			header: true,
			skipEmptyLines: false
		});

		//DOWNLOAD file
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `TableExport_Utenti.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};
	
	let level = $state('');
	let membershipLevel = $state('');
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
	let namePublic = $state(false);
	let surnamePublic = $state(false);
	let emailPublic = $state(false);
	let addressPublic = $state(false);
	let cityPublic = $state(false);
	let statePublic = $state(false);
	let postalCodePublic = $state(false);
	let countryPublic = $state(false);
	let phonePublic = $state(false);
	let mobilePhonePublic = $state(false);
	let error = $state();
	let inputRef = $state();
	const testPass = () => {
		checkPass = password1.length >= 8;
		checkSecondPass = password1 === password2;
	};
	const testSecondPass = () => (checkSecondPass = password1 === password2);

	let deleteId = $state('');

	const onOpenConfirmDelete = (id: string) => {
		isModalConfirmDelete = true;
		isModalModify = false;
		deleteId = id;
	};

	const onCloseConfirmDelete = () => {
		isModalConfirmDelete = false;
		resetFields();
	};

	const resetFields = () => {
		invalidateAll();
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
		level = '';
		namePublic = false;
		surnamePublic = false;
		emailPublic = false;
		addressPublic = false;
		cityPublic = false;
		statePublic = false;
		postalCodePublic = false;
		countryPublic = false;
		phonePublic = false;
		mobilePhonePublic = false;
		tableList = getTable;
	};

	let currentDialog = $state('');
	let isModal = $state(false);
	let postAction = $state('');
	let modalTitle = $state('');

	const onClickDialog = (type: string, item: any) => {
		currentDialog = type;
		isModal = true;
		if (type == 'new') {
			postAction = `?/newUser`;
			modalTitle = 'Nuovo utente';
		}
		if (type == 'modify') {
			modalTitle = 'Modifica utente';
			userId = item.userId;
			name = item.name;
			surname = item.surname;
			email = item.email;
			address = item.address;
			postalCode = item.postalCode;
			city = item.city;
			countryState = item.countryState;
			country = item.country;
			phone = item.phone;
			mobilePhone = item.mobilePhone;
			password1 = item.password1;
			level = item.level;
			namePublic = item.namePublic;
			surnamePublic = item.surnamePublic;
			emailPublic = item.emailPublic;
			addressPublic = item.addressPublic;
			cityPublic = item.cityPublic;
			statePublic = item.statePublic;
			postalCodePublic = item.postalCodePublic;
			countryPublic = item.countryPublic;
			phonePublic = item.phonePublic;
			mobilePhonePublic = item.mobilePhonePublic;
			postAction = `?/modifyUser`;
		}
	};

	$effect(() => {
		if (form != null) {
			async () => await invalidateAll();
			const { action, success, message, filterTableList } = form;
			if (success) {
				closeNotification();
				isModal = false;
				isModalConfirmDelete = false;
				isModalFilterCourse = false;
				tableList = getTable;
				if (action == 'filterUser') {
					resetActive = true;
					tableList = filterTableList;
				}
			} else {
				notificationError = true;
			}
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
		}, 5000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer
</script>

<svelte:head>
	<title>Lista utenti</title>
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
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista utenti</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={onFilterReset}>
				<RefreshCcw />
			</button>
			{#if resetActive == true}
				<button class="btn btn-error rounded-md text-white" onclick={onFilterReset}>
					<XCircle class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button class="btn btn-info rounded-md text-white" onclick={onOpenFilter}>
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

	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr class="">
				<th>Data registrazione</th>
				<th>Email</th>
				<th>Status</th>
				<th>Nome Cognome</th>
				<th>Livello</th>
				<th>Dati utente</th>
				<th>Azione</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row -->
			{#if tableList.length == 0}
				<tr class="hover:bg-gray-300"><td> </td></tr>
			{/if}
			{#each tableList as row, i}
				<tr class="hover:bg-gray-300">
					<!-- Data registrazione -->
					<td>{row.createdAt}</td>
					<!-- Email -->
					<td>{row.email}</td>
					<!-- Status -->
					<td class="">
						<!-- <span class="flex items-center">
							<input
								type="checkbox"
								class=" mr-2 border-gray-500 bg-gray-500 hover:bg-black toggle toggle-md"
								checked={row.active}
								onclick={() => {
									onChangeStatus(row.userId, row.active, row.email);
								}}
							/>
							{#if row.active == true}
								<span class="text-green-600 font-semibold">ATTIVO</span>
							{:else}
								<span class="text-red-600 font-semibold">DISATTIVO</span>
							{/if}
						</span> -->
						<form method="POST" action={`?/disableUser`} use:enhance>
							<input type="hidden" name="userId" value={row.userId} />
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
					<!-- Name and Surname -->
					<td>{row.name} {row.surname}</td>
					<!-- Level, MembreshipLevel, Expire Date -->
					<td>
						{showLevel(row.level)}
						<br /><br />
						{row.membership.membershipLevel}
						<br /><br />
						<span>Scadenza:</span>
						<strong>{row.membership.membershipExpiry.substring(0, 10)}</strong>
					</td>
					<!-- Addres  -->
					<td>
						<ul class="">
							<li>
								<strong>Indirizzo:</strong>
								{row.address}
							</li>
							<li>
								<strong>Città:</strong>
								{row.city}
							</li>
							<li>
								<strong>CAP:</strong>
								{row.postalCode}
							</li>
							<li>
								<strong>Provincia:</strong>
								{row.countryState}
							</li>
							<li>
								<strong>Nazione:</strong>
								{row.country}
							</li>
							<li>
								<strong>Telefono:</strong>
								{row.phone}
							</li>
							<li>
								<strong>Cellulare:</strong>
								{row.mobilePhone}
							</li>
						</ul>
					</td>
					<!-- Action -->
					<td class="flex items-center justify-center space-x-4">
						<button
							onclick={() => onClickDialog('modify', row)}
							class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800"
							><Settings />
						</button>
						<button
							onclick={() => onClickDetail(row.userId)}
							class="btn btn-sm bg-green-200 btn-green-400 rounded-md text-green-800 hover:bg-green-300 hover:text-green-800"
							><UserRoundSearch />
						</button>
						<button class="btn btn-error btn-sm" onclick={() => onOpenConfirmDelete(row.userId)}
							><Trash2 /></button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	{#if tableList.length == 0}
		<div
			class="alert alert-warning shadow-lg flex item-center text-center justify-center mt-3 mx-auto w-full max-w-lg"
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

<!--Modal New and Modify  -->
<Modal isOpen={isModal} header={modalTitle} cssClass="max-w-4xl">
	<form
		method="POST"
		action={postAction}
		use:enhance
		class=" grid grid-cols-12 gap-x-4 gap-y-8 p-4"
	>
		{#if currentDialog == 'modify'}
			<div class="form-control col-span-12 md:col-span-12">
				<label for="userId" class="form-label">
					<div class="flex flex-col gap-4">
						<span class="label-text font-bold">ID utente</span>
						<input
							class="input input-bordered join-item w-full"
							id="userId"
							name="userId"
							type="text"
							bind:value={userId}
							readonly
						/>
					</div>
				</label>
			</div>
		{/if}

		<!-- Nome -->
		<div class="form-control col-span-12 md:col-span-6">
			<label for="name" class="form-label">
				<div class="flex items-center justify-between gap-4">
					<span class="label-text font-bold">Nome</span>
					{#if currentDialog == 'modify'}
						<input
							type="checkbox"
							class="hidden"
							id="btn-check8"
							name="namePublic"
							autocomplete="off"
							checked={namePublic}
							onclick={() => onSwitchPublicProfile('namePublic', namePublic)}
						/>
						<label
							class={namePublic
								? 'btn btn-success btn-sm rounded-md'
								: 'btn btn-secondary btn-sm rounded-md'}
							for="btn-check8"
						>
							{#if namePublic}
								<Eye size="20" color="white" strokeWidth={2.5} />
							{:else}
								<EyeOff size="20" color="white" strokeWidth={2.5} />
							{/if}
							<span class="text-white">{namePublic ? 'Pubblico' : 'Privato'}</span>
						</label>
					{/if}
				</div>
				<input
					id="name"
					name="name"
					type="text"
					class="input input-bordered w-full rounded-md mt-2"
					placeholder="Nome..."
					required
					bind:value={name}
				/>
			</label>
		</div>
		<!-- Cognome -->
		<div class="form-control col-span-12 md:col-span-6">
			<label for="surname" class="form-label">
				<div class="flex items-center justify-between gap-4">
					<span class="label-text font-bold">Cognome</span>
					{#if currentDialog == 'modify'}
						<input
							type="checkbox"
							class="hidden"
							id="btn-check9"
							name="surnamePublic"
							autocomplete="off"
							checked={surnamePublic}
							onclick={() => onSwitchPublicProfile('surnamePublic', surnamePublic)}
						/>
						<label
							class={surnamePublic
								? 'btn btn-success btn-sm rounded-md'
								: 'btn btn-secondary btn-sm rounded-md'}
							for="btn-check9"
						>
							{#if surnamePublic}
								<Eye size="20" color="white" strokeWidth={2.5} />
							{:else}
								<EyeOff size="20" color="white" strokeWidth={2.5} />
							{/if}
							<span class="text-white">{surnamePublic ? 'Pubblico' : 'Privato'}</span>
						</label>
					{/if}
				</div>
				<input
					id="surname"
					name="surname"
					type="text"
					class="input input-bordered w-full rounded-md mt-2"
					placeholder="Cognome..."
					required
					bind:value={surname}
				/>
			</label>
		</div>
		<!-- Email -->
		<div class="form-control col-span-12">
			<label for="email" class="form-label">
				<div class="flex items-center justify-between gap-4">
					<span class="label-text font-bold">Email</span>
					{#if currentDialog == 'modify'}
						<input
							type="checkbox"
							class="hidden"
							id="btn-check10"
							name="emailPublic"
							autocomplete="off"
							checked={emailPublic}
							onclick={() => onSwitchPublicProfile('emailPublic', emailPublic)}
						/>
						<label
							class={emailPublic
								? 'btn btn-success btn-sm rounded-md'
								: 'btn btn-secondary btn-sm rounded-md'}
							for="btn-check10"
						>
							{#if emailPublic}
								<Eye size="20" color="white" strokeWidth={2.5} />
							{:else}
								<EyeOff size="20" color="white" strokeWidth={2.5} />
							{/if}
							<span class="text-white">{emailPublic ? 'Pubblico' : 'Privato'}</span>
						</label>
					{/if}
				</div>
				<input
					id="email"
					name="email"
					type="email"
					class="input input-bordered w-full rounded-md mt-2"
					placeholder="Email..."
					required
					bind:value={email}
				/>
			</label>
		</div>
		<!-- Indirizzo -->
		<div class="form-control col-span-12">
			<label for="address" class="form-label">
				<div class="flex items-center justify-between gap-4">
					<span class="label-text font-bold">Indirizzo</span>
					{#if currentDialog == 'modify'}
						<input
							type="checkbox"
							class="hidden"
							id="btn-check1"
							name="addressPublic"
							autocomplete="off"
							checked={addressPublic}
							onclick={() => onSwitchPublicProfile('addressPublic', addressPublic)}
						/>
						<label
							class={addressPublic
								? 'btn btn-success btn-sm rounded-md'
								: 'btn btn-secondary btn-sm rounded-md'}
							for="btn-check1"
						>
							{#if addressPublic}
								<Eye size="20" color="white" strokeWidth={2.5} />
							{:else}
								<EyeOff size="20" color="white" strokeWidth={2.5} />
							{/if}
							<span class="text-white">{addressPublic ? 'Pubblico' : 'Privato'}</span>
						</label>
					{/if}
				</div>
				<input
					id="address"
					name="address"
					type="text"
					class="input input-bordered w-full rounded-md mt-2"
					placeholder="Indirizzo..."
					required
					bind:value={address}
				/>
			</label>
		</div>
		<!-- Città -->
		<div class="form-control col-span-12 md:col-span-6">
			<label for="city" class="form-label">
				<div class="flex items-center gap-4 justify-between">
					<span class="label-text font-bold">Città</span>
					{#if currentDialog == 'modify'}
						<input
							type="checkbox"
							class="hidden"
							id="btn-check2"
							name="cityPublic"
							autocomplete="off"
							checked={cityPublic}
							onclick={() => onSwitchPublicProfile('cityPublic', cityPublic)}
						/>
						<label
							class={cityPublic
								? 'btn btn-success btn-sm rounded-md'
								: 'btn btn-secondary btn-sm rounded-md'}
							for="btn-check2"
						>
							{#if cityPublic}
								<Eye size="20" color="white" strokeWidth={2.5} />
							{:else}
								<EyeOff size="20" color="white" strokeWidth={2.5} />
							{/if}
							<span class="text-white">{cityPublic ? 'Pubblico' : 'Privato'}</span>
						</label>
					{/if}
				</div>
				<input
					id="city"
					name="city"
					type="text"
					class="input input-bordered w-full rounded-md mt-2"
					placeholder="Città..."
					required
					bind:value={city}
				/>
			</label>
		</div>
		<!-- Provincia -->
		<div class="form-control col-span-12 md:col-span-6">
			<label for="state" class="form-label">
				<div class="flex items-center gap-4 justify-between">
					<span class="label-text font-bold">Provincia</span>
					{#if currentDialog == 'modify'}
						<input
							type="checkbox"
							class="hidden"
							id="btn-check3"
							name="statePublic"
							autocomplete="off"
							checked={statePublic}
							onclick={() => onSwitchPublicProfile('statePublic', statePublic)}
						/>
						<label
							class={statePublic
								? 'btn btn-success btn-sm rounded-md'
								: 'btn btn-secondary btn-sm rounded-md'}
							for="btn-check3"
						>
							{#if statePublic}
								<Eye size="20" color="white" strokeWidth={2.5} />
							{:else}
								<EyeOff size="20" color="white" strokeWidth={2.5} />
							{/if}
							<span class="text-white">{statePublic ? 'Pubblico' : 'Privato'}</span>
						</label>
					{/if}
				</div>
				<select
					id="countryState"
					class="select select-bordered w-full rounded-md mt-2"
					name="countryState"
					placeholder="Scegli"
					required
					bind:value={countryState}
				>
					<option value='' selected disabled>Scegli</option>
					{#each provinceFilterate as provincia, i}
						<option value={provincia.title}>
							{provincia.title} ({provincia.region})
						</option>
					{/each}
				</select>
			</label>
		</div>
		<!-- CAP -->
		<div class="form-control col-span-12 md:col-span-6">
			<label for="postalcode" class="form-label">
				<div class="flex items-center gap-4 justify-between">
					<span class="label-text font-bold">CAP</span>
					{#if currentDialog == 'modify'}
						<input
							type="checkbox"
							class="hidden"
							id="btn-check4"
							name="postalCodePublic"
							autocomplete="off"
							checked={postalCodePublic}
							onclick={() => onSwitchPublicProfile('postalCodePublic', postalCodePublic)}
						/>
						<label
							class={postalCodePublic
								? 'btn btn-success btn-sm rounded-md'
								: 'btn btn-secondary btn-sm rounded-md'}
							for="btn-check4"
						>
							{#if postalCodePublic}
								<Eye size="20" color="white" strokeWidth={2.5} />
							{:else}
								<EyeOff size="20" color="white" strokeWidth={2.5} />
							{/if}
							<span class="text-white">{postalCodePublic ? 'Pubblico' : 'Privato'}</span>
						</label>
					{/if}
				</div>
				<input
					id="postalCode"
					name="postalCode"
					type="text"
					class="input input-bordered w-full rounded-md mt-2"
					placeholder="CAP..."
					required
					bind:value={postalCode}
				/>
			</label>
		</div>
		<!-- Nazione -->
		<div class="form-control col-span-12 md:col-span-6">
			<label for="country" class="form-label">
				<div class="flex items-center gap-4 justify-between">
					<span class="label-text font-bold">Nazione</span>
					{#if currentDialog == 'modify'}
						<input
							type="checkbox"
							class="hidden"
							id="btn-check5"
							name="countryPublic"
							autocomplete="off"
							checked={countryPublic}
							onclick={() => onSwitchPublicProfile('countryPublic', countryPublic)}
						/>
						<label
							class={countryPublic
								? 'btn btn-success btn-sm rounded-md'
								: 'btn btn-secondary btn-sm rounded-md'}
							for="btn-check5"
						>
							{#if countryPublic}
								<Eye size="20" color="white" strokeWidth={2.5} />
							{:else}
								<EyeOff size="20" color="white" strokeWidth={2.5} />
							{/if}
							<span class="text-white">{countryPublic ? 'Pubblico' : 'Privato'}</span>
						</label>
					{/if}
				</div>
				<select
					id="country"
					class="select select-bordered w-full rounded-md mt-2"
					name="country"
					placeholder="Scegli"
					required
					bind:value={country}
				>
					<option value='' selected disabled>Scegli</option>
					{#each $country_list as country}
						<option value={country}>
							{country}
						</option>
					{/each}
				</select>
			</label>
		</div>
		<!-- Telefono -->
		<div class="form-control col-span-12 md:col-span-6">
			<label for="telefono" class="form-label">
				<div class="flex items-center gap-4 justify-between">
					<span class="label-text font-bold">Telefono</span>
					{#if currentDialog == 'modify'}
						<input
							type="checkbox"
							class="hidden"
							id="btn-check6"
							name="phonePublic"
							autocomplete="off"
							checked={phonePublic}
							onclick={() => onSwitchPublicProfile('phonePublic', phonePublic)}
						/>
						<label
							class={phonePublic
								? 'btn btn-success btn-sm rounded-md'
								: 'btn btn-secondary btn-sm rounded-md'}
							for="btn-check6"
						>
							{#if phonePublic}
								<Eye size="20" color="white" strokeWidth={2.5} />
							{:else}
								<EyeOff size="20" color="white" strokeWidth={2.5} />
							{/if}
							<span class="text-white">{phonePublic ? 'Pubblico' : 'Privato'}</span>
						</label>
					{/if}
				</div>
				<input
					id="telefono"
					name="phone"
					type="text"
					class="input input-bordered w-full rounded-md mt-2"
					placeholder="Telefono..."
					required
					bind:value={phone}
				/>
			</label>
		</div>
		<!-- Cellulare -->
		<div class="form-control col-span-12 md:col-span-6">
			<label for="cellulare" class="form-label">
				<div class="flex items-center gap-4 justify-between">
					<span class="label-text font-bold">Cellulare</span>
					{#if currentDialog == 'modify'}
						<input
							type="checkbox"
							class="hidden"
							id="btn-check7"
							name="mobilePhonePublic"
							autocomplete="off"
							checked={mobilePhonePublic}
							onclick={() => onSwitchPublicProfile('mobilePhonePublic', mobilePhonePublic)}
						/>
						<label
							class={mobilePhonePublic
								? 'btn btn-success btn-sm rounded-md'
								: 'btn btn-secondary btn-sm rounded-md'}
							for="btn-check7"
						>
							{#if mobilePhonePublic}
								<Eye size="20" color="white" strokeWidth={2.5} />
							{:else}
								<EyeOff size="20" color="white" strokeWidth={2.5} />
							{/if}
							<span class="text-white">{mobilePhonePublic ? 'Pubblico' : 'Privato'}</span>
						</label>
					{/if}
				</div>
				<input
					id="cellulare"
					name="mobilePhone"
					type="text"
					class="input input-bordered w-full rounded-md mt-2"
					placeholder="Telefono..."
					required
					bind:value={mobilePhone}
				/>
			</label>
		</div>
		{#if currentDialog == 'new'}
			<!-- Password -->
			<div class="form-control col-span-12">
				<label for="password1" class="form-label">
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
						id="password1"
						type="password"
						name="password1"
						placeholder="Inserisci password"
						bind:value={password1}
						oninput={testPass}
						required
					/>
				</div>
			</div>
			<!-- Conferma password -->
			<div class="form-control col-span-12">
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
			</div>
		{/if}
		<!-- Level -->
		<div class="form-control col-span-12">
			<label for="level" class="form-label">
				<p class="font-bold mb-2">Livello di permesso (solo per SuperAdmin)</p>
			</label>
			<select
				id="level"
				class="select select-bordered w-full rounded-md mt-2"
				name="level"
				placeholder="Scegli"
				required
				bind:value={level}
			>
				<option value='' selected disabled >Seleziona livello</option>
				<option value="user">Utente base</option>
				<option value="formatore">Formatore</option>
				<option value="admin">Admin</option>
				<option value="superadmin">Superadmin</option>
			</select>
		</div>

		<!-- button -->
		<div class="col-span-12 mt-5 flex justify-center gap-4">
			<div class="bg-gray-50 flex justify-center">
				<button
					class="btn btn-error btn-sm mx-2"
					onclick={() => {
						(isModal = false), resetFields();
					}}
				>
					Annulla
				</button>
				<button type="submit" class="btn btn-success btn-sm mx-2 text-white">
					{#if currentDialog == 'new'}
						Registra
					{:else if currentDialog == 'modify'}
						Modifica
					{/if}
				</button>
			</div>
		</div>
	</form>
</Modal>

<!-- Modal confirm delete -->
<Modal isOpen={isModalConfirmDelete} header="Conferma l'eliminazione?" cssClass="max-w-2xl">
	<form action="?/deleteUser" method="POST" use:enhance>
		<input type="hidden" name="userId" value={deleteId} />
		<div class="flex justify-center space-x-10 mt-4">
			<button class="btn btn-error btn-md" type="button" onclick={onCloseConfirmDelete}
				>Annulla</button
			>
			<button class="btn btn-success btn-md text-white" type="submit"><Trash2 />Conferma</button>
		</div>
	</form>
</Modal>

<!-- Modal filter  -->
<Modal isOpen={isModalFilterCourse} header="Filtri di Ricerca">
	<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">
		<div class="space-y-4">
			<div>
				<label for="level" class="block text-sm font-medium text-gray-700 mb-1"
					>Livello utente</label
				>
				<select
					id="level"
					name="level"
					bind:value={level}
					class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
				>
					<option value="">Seleziona il livello utente</option>
					<option value="user">Utente base</option>
					<option value="formatore">Formatore</option>
					<option value="admin">Admin</option>
					<option value="superadmin">Superadmin</option>
				</select>
			</div>

			<div>
				<label for="membershipLevel" class="block text-sm font-medium text-gray-700 mb-1"
					>Livello associato</label
				>
				<select
					id="membershipLevel"
					name="membershipLevel"
					bind:value={membershipLevel}
					class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
				>
					<option value="">Seleziona il livello associato</option>
					<option value="Socio inattivo">Socio inattivo</option>
					<option value="Socio ordinario">Socio ordinario</option>
					<option value="Socio sostenitore">Socio sostenitore</option>
					<option value="Socio vitalizio">Socio vitalizio</option>
					<option value="Socio contributore">Socio contributore</option>
					<option value="Master Dien Chan">Master Dien Chan</option>
				</select>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
				<input
					type="text"
					id="email"
					name="email"
					bind:value={email}
					placeholder="Scrivi un email"
					class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
				/>
			</div>
		</div>

		<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
			<button
				class="btn btn-error btn-sm hover:bg-red-300"
				onclick={onCloseFilterSearch}
				type="button"
			>
				Annulla
			</button>
			<button class="btn btn-success btn-sm hover:bg-green-400" type="submit">
				Applica Filtri
			</button>
		</div>
	</form>
</Modal>
