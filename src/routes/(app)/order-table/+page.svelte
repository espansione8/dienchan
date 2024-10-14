<script lang="ts">
	import { coursesInfo, province } from '$lib/stores/arrays';
	import { goto, invalidateAll } from '$app/navigation';
	import Papa from 'papaparse';
	import Notification from '$lib/components/Notification.svelte';
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

	let { data } = $props();
	let { getOrders, getTableNames, auth } = $derived(data);
	let tableList = $state(getOrders || []);

	tableList
		.filter((element) => element.userView != null)
		.forEach((element) => {
			console.log('element', element.orderId, element.userId);
		});

	const imgSrc = (value: string) => {
		const src = $coursesInfo.filter((item: any) => item.id == value);
		return src[0]?.urlPic || '/images/no-image.png';
	};

	let isModalFilterOrder = $state(false);
	let resetActive = $state(false);
	let quickSearch = $state('data'); // radio button
	let quickSearchInput = $state('');
	//filter
	let selectedOrderId = $state('');
	let selectedPaymentMethod = $state('');
	let selectedAssociate = $state('');
	let selectedStatus = $state('');

	const onCloseFilterSearch = () => {
		isModalFilterOrder = false;
		resetFieldsModalFilter();
		onFilterReset();
	};

	const onSubmitFilterSearch = async () => {
		resetActive = true;
		let orderId = '';
		let userId = '';
		let paymentMethod = '';
		let status = '';
		if (selectedOrderId) orderId = selectedOrderId;
		if (selectedAssociate) userId = selectedAssociate;
		if (selectedPaymentMethod) paymentMethod = selectedPaymentMethod;
		if (selectedStatus) status = selectedStatus;
		const arrayField = ['orderId', 'userId', 'payment.method', 'status'];
		const arrayValue = [orderId, userId, paymentMethod, status];
		const response = await fetch(`/api/finds/0/0`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'order',
				arrayField,
				arrayValue
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const res = await response.json();
		if (response.status == 200) {
			//console.log('res table', res);
			const getTable = res.map((obj: any) => ({
				...obj,
				orderDate: obj.orderDate.substring(0, 10),
				totalCart: obj.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(0)
			}));
			tableList = getTable;
			clearTimeout(startTimeout);
			isModalFilterOrder = false;
			toastClosed = false;
			notificationContent = 'Ordini filtrati';
			resetFieldsModalFilter();
			closeNotification();
		}
		if (response.status != 200) {
			console.log('KO', response);
			toastClosed = false;
			notificationContent = 'Errore filtro';
			notificationError = true;
			closeNotification();
		}
	};

	const onOpenFilter = () => {
		isModalFilterOrder = true;
		quickSearch = 'location';
	};

	const resetFieldsModalFilter = () => {
		selectedOrderId = '';
		selectedPaymentMethod = '';
		selectedAssociate = '';
	};

	const onFilterReset = () => {
		resetActive = false;
		tableList = getOrders;

		invalidateAll();
		quickSearchInput = '';
	};

	//modal detail
	let isModalDetail = $state(false);
	let orderDetail = $state(tableList[0]);
	const onModalDetail = (order: any) => {
		orderDetail = order;
		isModalDetail = true;
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
		//console.log('flattenedArray', flattenedArray);
		newList = flattenedArray.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt?.substring(0, 10),
			birthdate: obj.birthdate?.substring(0, 10)
		}));
		console.log('newList', newList);
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
			delete obj.invoicing_name;
			delete obj.invoicing_name;
			delete obj.invoicing_surname;
			delete obj.invoicing_businessName;
			delete obj.invoicing_vatNumber;
			delete obj.invoicing_address;
			delete obj.invoicing_city;
			delete obj.invoicing_postalCode;
			delete obj.invoicing_state;
			delete obj.invoicing_region;
			delete obj.invoicing_country;
			delete obj.invoicing_county;
			delete obj.invoicing_invoiceNotes;
			delete obj.invoicing_email;
			delete obj.invoicing_phone;
			delete obj.shipping_tracking_company;
			delete obj.shipping_tracking_trackingNumber;
			delete obj.shipping_tracking_trackingLink;
			delete obj.shipping_tracking_status;
			delete obj.shipping_tracking_estimatedDelivery;
			delete obj.shipping_name;
			delete obj.shipping_surname;
			delete obj.shipping_address;
			delete obj.shipping_city;
			delete obj.shipping_postalCode;
			delete obj.shipping_state;
			delete obj.shipping_region;
			delete obj.shipping_country;
			delete obj.shipping_deliveryNotes;
			delete obj.shipping_email;
			delete obj.shipping_phone;
			delete obj.payment_transactionId;
			delete obj.payment_points;
			delete obj.payment_value;
			delete obj.browser;
			delete obj.orderIp;
			delete obj.orderNotes;
			delete obj.promotionId;
			delete obj.promotionName;
			delete obj.promoterId;
			delete obj.agencyId;
			delete obj.cardId;
			delete obj.totalPoints;
			delete obj.totalValue;
			delete obj.totalVAT;
			delete obj.createdAt;
		});

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
		link.download = `TableExport_Ordini.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};
</script>

<svelte:head>
	<title>Ordini</title>
</svelte:head>

<div class="overflow-x-auto mt-5 px-4 mb-5">
	<div class="flex justify-between items-center w-full">
		<div class="flex space-x-4">
			{#if resetActive == true}
				<button
					class="btn btn-error rounded-md text-white border-orange-500 hover:bg-red-200 hover:text-red-600 hover:border-red-400"
					onclick={onFilterReset}
				>
					<XCircle class="mt-1" /> Reset Filtro
				</button>
			{:else}
				<button class="btn rounded-md text-white btn-info" onclick={onOpenFilter}>
					<Filter class="mt-1" /> Filtra
				</button>
			{/if}
		</div>

		<header class="text-2xl font-bold text-gray-700 absolute left-1/2 transform -translate-x-1/2">
			Ordini
		</header>

		<button class="btn btn-info rounded-md text-white" onclick={() => csvCreate()}>
			<ListPlus /> Scarica CSV
		</button>
	</div>

	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-info text-accent">
			<tr class="">
				<th>Data</th>
				<th>ID ordine</th>
				<th>Email</th>
				<th>Associato</th>
				<th>Ordine</th>
				<th>Totale</th>
				<th>Tipo pagamento</th>
				<th>Stato</th>
				<th>Azione</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row -->
			{#if tableList.length == 0}
				<tr class="hover:bg-gray-100">
					<td></td>
				</tr>
			{/if}

			{#each tableList as row}
				<tr class="hover:bg-gray-100">
					<!-- Data -->
					<td>{row.orderDate}</td>
					<!-- ID ordine-->
					<td>{row.orderId}</td>
					<!-- Email-->
					<td>{row.userView?.email}</td>
					<!-- Nome-->
					<td>{row.userView?.name} {row.userView?.surname}</td>
					<!-- Ordine -->
					<td>
						<div class="flex flex-col space-y-1">
							{#each row.cart as item}
								<span> {item.title}</span>
							{/each}
						</div>
					</td>
					<!-- Totale -->
					<td>€ {row.totalCart}</td>
					<!-- Tipo pagamento -->
					<td>
						{row.payment.method}
					</td>
					<!-- Status -->
					<td>
						{row.status}
					</td>
					<!-- Azione -->
					<td class=" space-4">
						<button
							onclick={() => onModalDetail(row)}
							class="btn btn-sm bg-green-200 btn-success rounded-md text-green-700 hover:bg-green-300 hover:text-green-800"
							>Dettagli</button
						>
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
<!-- modal filter  -->
<dialog id="modal_filter" class="modal" class:modal-open={isModalFilterOrder}>
	<div class="modal-box bg-white p-0 rounded-lg shadow-xl max-w-2xl">
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-t-lg">
			<h2 class="text-2xl font-bold text-white mb-1">Filtri di Ricerca</h2>
			<p class="text-blue-100">Personalizza la tua ricerca selezionando i criteri desiderati</p>
		</div>

		<div class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="orderId" class="block text-sm font-medium text-gray-700 mb-1">ID ordine</label
					>
					<input
						type="text"
						id="orderId"
						bind:value={selectedOrderId}
						placeholder="Inserisci l'ID dell'ordine"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
					<!-- <select
						id="location"
						bind:value={selectedOrderId}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli un luogo</option>
						{#each $province as item}
							<option value={item.sigla}>{item.nome}</option>
						{/each}
					</select> -->
				</div>
				<div>
					<label for="associate" class="block text-sm font-medium text-gray-700 mb-1"
						>Associato</label
					>
					<select
						id="associate"
						bind:value={selectedAssociate}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli un associato</option>
						{#each getTableNames as item}
							<option value={item.userId}>{item.surname} {item.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="payment" class="block text-sm font-medium text-gray-700 mb-1"
						>Metodo di pagamento</label
					>
					<select
						id="payment"
						bind:value={selectedPaymentMethod}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli un metodo</option>
						<option value="bonifico">Bonifico</option>
						<option value="paypal">Paypal</option>
						<option value="contanti">Contanti</option>
					</select>
				</div>
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
					<select
						id="status"
						bind:value={selectedStatus}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Scegli uno status</option>
						<option value="requested">Richiesta in corso</option>
						<option value="confirmed">Confermato</option>
						<option value="cancelled">Cancellato</option>
						<option value="exported">Esportato</option>
						<option value="processed">Processato</option>
					</select>
				</div>
			</div>
		</div>
		<Notification {toastClosed} {notificationContent} {notificationError} />

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

<!-- modal DETAIL -->
<dialog id="my_modal_2" class="modal" class:modal-open={isModalDetail}>
	<div class="modal-box grid grid-cols-2">
		<h3 class="col-span-2 font-bold text-xl text-center mb-4">
			Dettagli ordine (ID: {orderDetail.orderId})
		</h3>
		<div class="col-span-2 grid grid-cols-2 gap-2 mb-4">
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Nome/Cognome</p>
				<p class="font-bold text-center mt-1">
					{orderDetail.userView?.name}
					{orderDetail.userView?.surname}
				</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Email</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.email}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Città</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.city}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Indirizzo</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.address}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Codice Postale - Provincia</p>
				<p class="font-bold text-center mt-1">
					{orderDetail.userView?.postalCode} - {orderDetail.userView?.countryState}
				</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Paese</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.country}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Telefono</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.phone}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">Cellulare</p>
				<p class="font-bold text-center mt-1">{orderDetail.userView?.mobile}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-sm text-gray-600">metodo di pagamento:</p>
				<p class="font-bold text-center mt-1">{orderDetail.orderId}</p>
			</div>
		</div>
		<div class="col-span-2 flex flex-col items-center w-full gap-3 my-4">
			{#each orderDetail?.cart as item}
				<div
					class="flex items-center w-full max-w-96 bg-indigo-100 rounded-lg shadow-md overflow-hidden"
				>
					<div class="w-1/3 p-3">
						<img
							src={imgSrc(item.category[0])}
							alt="Immagine corso"
							class="w-full h-full object-cover"
						/>
					</div>
					<div class="w-2/3 p-4 flex items-center justify-center">
						<h2 class="text-center text-md font-semibold">
							{item.title} <br /><br />
							{item.price}€
						</h2>
					</div>
				</div>
			{/each}
		</div>
		<div class="col-span-2 text-center mt-3">
			<h2 class="text-lg font-bold">Totale Carrello:</h2>
			<p class="text-xl font-semibold text-black-800">{orderDetail.totalValue} €</p>
			{#if auth}
				<p class="text-gray-800 font-semibold">-25 € sconto tesserati</p>
			{/if}
		</div>
		<div class="col-span-2 text-center mt-5">
			<div class="flex justify-center space-x-8">
				<div>
					<h2 class="text-md font-bold">Metodo pagamento:</h2>
					<p class="text-md font-semibold text-black-800">{orderDetail.payment.method}</p>
				</div>
				<div>
					<h2 class="text-md font-bold">Status pagamento:</h2>
					<p class="text-md font-semibold text-black-800">{orderDetail.payment.statusPayment}</p>
				</div>
			</div>
		</div>

		<div class="modal-action col-span-2">
			<button
				class="btn btn-sm btn-error w-24 hover:bg-white hover:text-error rounded-lg"
				onclick={() => (isModalDetail = false)}>Chiudi</button
			>
		</div>
	</div>
</dialog>
<!-- /modal DETAIL -->
