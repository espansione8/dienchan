<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import Papa from 'papaparse';
	import { UserPlus } from 'lucide-svelte';
	import {
		ListPlus,
		Filter,
		ArrowUp,
		ArrowDown,
		FilterX,
		MapPin,
		XCircle,
		CircleAlert,
		Search,
		ShieldAlert
	} from 'lucide-svelte';
	import moment from 'moment';

	let { data } = $props();
	let { getTableUser } = $derived(data);
	let tableList = $state(getTableUser);

	const onClickModify = (id: number) => {
		// console.log('ID', id);
		goto(`/profile-modify-admin/${id}`);
	};

	const onClickDetail = (id: number) => {
		// console.log('ID', id);
		goto(`/profile-public/${id}`);
	};

	const onChangeStatus = async (userId: number, active: boolean, email: string) => {
		let status: boolean;
		active ? (status = false) : (status = true);
		const data = {
			userId,
			status,
			email
		};
		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/setactive`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
					//'Content-Type': 'application/pdf'
					//Accept: 'application/pdf'
				},
				body: JSON.stringify(data)
			});
			const response = await res.json();
			if (response.status == 200) {
				invalidateAll();
				//console.log('res.ok', response);
				//titleContent = 'Certification Launched';
				// alert('User status changed');
			} else {
				//console.log('Errore res 1', res);
				// alert(res.message);
				alert(`Error Status change, ${response.message}`);
			}
		} catch (err) {
			console.log('Error:', err);
		}
	};

	const toggleStatus = () => {
		getTableUser.active = !getTableUser.active;
		// console.log('getTableUser.active', getTableUser.active)
	};

	const onGotoNewUser = () => {
		goto(`/user-new`);
	};

	let isModalFilterCourse = $state(false);
	let resetActive = $state(false);
	//filter
	let selectedLevel = $state('');
	let selectedMembershipLevel = $state('');
	let selectedEmail = $state('');

	const onCloseFilterSearch = () => {
		isModalFilterCourse = false;
		resetFieldsModalFilter();
		onFilterReset();
	};

	const onSubmitFilterSearch = async () => {
		resetActive = true;
		let level = '';
		let membershipLevel = '';
		let email = '';
		if (selectedLevel) level = selectedLevel;
		if (selectedMembershipLevel) membershipLevel = selectedMembershipLevel;
		if (selectedEmail) email = selectedEmail;
		const arrayField = ['level', 'membership.membershipLevel', 'email'];
		const arrayValue = [level, membershipLevel, email];
		const response = await fetch(`/api/finds/0/0`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'user',
				arrayField,
				arrayValue
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const res = await response.json();
		if (response.status == 200) {
			const newTableList = res.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10)
			}));
			tableList = newTableList;
			clearTimeout(startTimeout);
			isModalFilterCourse = false;
			toastClosed = false;
			notificationContent = 'Utenti filtrati';
			resetFieldsModalFilter();
			closeNotification();
		}
		if (response.status != 200) {
			console.log('KO', response);
			toastClosed = false;
			notificationContent = 'errore filtro';
			notificationError = true;
			closeNotification();
		}
	};

	const onOpenFilter = () => {
		isModalFilterCourse = true;
	};

	const resetFieldsModalFilter = () => {
		selectedLevel = '';
		selectedMembershipLevel = '';
		selectedEmail = '';
	};

	const onFilterReset = () => {
		resetActive = false;
		tableList = getTableUser;

		invalidateAll();
	};

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
		console.log('newList user', newList);

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
</script>

<svelte:head>
	<title>Lista utenti</title>
</svelte:head>

<div class="overflow-x-auto mt-5 px-4 mb-5">
	<!-- <span class="flex justify-between">
		<button
			class="btn btn-success rounded-md text-white border-green-500 hover:bg-gray-200 hover:text-success hover:border-success"
			onclick={() => onGotoNewUser()}><UserPlus /> Nuovo utente</button
		>
		<header class="text-center text-2xl font-bold text-gray-700">Lista utenti</header>
		<button class="btn btn-success invisible"><UserPlus /> Scarica CSV</button>
	</span> -->

	<div class="flex justify-between items-center w-full">
		<div class="flex space-x-4">
			{#if resetActive == true}
				<button class="btn btn-error rounded-md text-white" onclick={onFilterReset}>
					<XCircle class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button class="btn btn-info rounded-md text-white" onclick={onOpenFilter}>
					<Filter class="mt-1" /> Filtra
				</button>
			{/if}
			<button class="btn btn-info rounded-md text-white" onclick={() => onGotoNewUser()}>
				<ListPlus /> Nuovo utente
			</button>
		</div>
		<header class="text-2xl font-bold text-gray-700 absolute left-1/2 transform -translate-x-1/2">
			Lista utenti
		</header>
		<button class="btn rounded-md text-white btn-info" onclick={() => csvCreate()}>
			<ListPlus /> Scarica CSV
		</button>
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
						<span class="flex items-center">
							<input
								type="checkbox"
								class=" mr-2 border-gray-500 bg-gray-500 hover:bg-black rounded-md toggle toggle-md"
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
						</span>
						<!-- {#if row.active == true}
							<span class="text-green-600 font-semibold">ATTIVO</span>
							<br />
							<button
								class="btn btn-outline btn-error btn-sm mt-2 rounded-md"
								onclick={() => onChangeStatus(row.userId, row.active, row.email)}
							>
								Disattiva
							</button>
						{:else}
							<span class="text-red-600 font-semibold">DISATTIVO</span>
							<br />
							<button
								class="btn btn-outline btn-success btn-sm mt-2 rounded-md"
								onclick={() => onChangeStatus(row.userId, row.active, row.email)}
							>
								Attiva
							</button>
						{/if} -->
					</td>
					<!-- Nome Cognome -->
					<td>{row.name} {row.surname}</td>
					<!-- Livello -->
					<td
						>{row.level}
						<br /><br />
						{row.membership.membershipLevel}
						<br /><br />
						<span>Scadenza:</span>
						<strong>{moment(row.membership.membershipExpiry).format('DD/MM/YYYY')}</strong>
					</td>
					<!-- Indirizzo completo -->
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
								{row.state}
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
					<!-- Azione -->
					<td class="space-4">
						<button
							onclick={() => onClickModify(row.userId)}
							class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800 mt-2"
						>
							Modifica
						</button>
						<button
							onclick={() => onClickDetail(row.userId)}
							class="btn btn-sm bg-green-200 btn-success rounded-md text-green-700 hover:bg-green-300 hover:text-green-800 mt-2"
						>
							Dettagli
						</button>
					</td>
				</tr>
			{/each}
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
<!-- modal filter  -->
<dialog id="modal_filter" class="modal" class:modal-open={isModalFilterCourse}>
	<div class="modal-box bg-white p-0 rounded-lg shadow-xl max-w-2xl">
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-t-lg glass">
			<h2 class="text-2xl font-bold text-white mb-1">Filtri di Ricerca</h2>
			<p class="text-blue-100">Personalizza la tua ricerca selezionando i criteri desiderati</p>
		</div>

		<div class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="level" class="block text-sm font-medium text-gray-700 mb-1"
						>Livello utente</label
					>
					<select
						id="level"
						bind:value={selectedLevel}
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
						bind:value={selectedMembershipLevel}
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
						bind:value={selectedEmail}
						placeholder="Scrivi un email"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
			</div>
		</div>

		<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
			<button
				class="btn btn-error btn-sm rounded-md hover:bg-red-300"
				onclick={onCloseFilterSearch}
			>
				Annulla
			</button>
			<button
				class="btn btn-success btn-sm rounded-md hover:bg-green-400"
				onclick={onSubmitFilterSearch}
			>
				Applica Filtri
			</button>
		</div>
	</div>
</dialog>
<!-- /modal filter  -->
