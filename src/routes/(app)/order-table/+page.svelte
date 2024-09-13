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
	let { getOrders, getTableNames } = $derived(data);
	let tableList = $state(getOrders);

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
			console.log('res table', res);
			tableList = res;
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

		const flattenedArray = tableList.map((obj: any) => {
			
			return {
				...obj,
			};
		});
		//console.log('flattenedArray', flattenedArray);
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
				<button
					class="btn bg-orange-500 rounded-md text-white border-orange-500 hover:bg-orange-200 hover:text-orange-600 hover:border-orange-400"
					onclick={onOpenFilter}
				>
					<Filter class="mt-1" /> Filtra
				</button>
			{/if}
		</div>

		<header class="text-2xl font-bold text-gray-700 absolute left-1/2 transform -translate-x-1/2">
			Ordini
		</header>

		<button
			class="btn btn-success rounded-md text-white border-green-500 hover:bg-gray-200 hover:text-success hover:border-success"
			onclick={() => csvCreate()}
		>
			<ListPlus /> Scarica CSV
		</button>
	</div>

	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
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
					<td>{row.userView.email}</td>
					<!-- Nome-->
					<td>{row.userView.name} {row.userView.surname}</td>
					<!-- Ordine -->
					<td>
						<div class="flex flex-col space-y-1">
							{#each row.cart as item}
								<span> {item.title}</span>
							{/each}
						</div>
					</td>
					<!-- Totale -->
					<td>€{row.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(0)}</td>
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
		<div class="bg-gradient-to-r from-orange-500 to-red-600 p-5 rounded-t-lg">
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
						class="w-full bg-orange-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
					<!-- <select
						id="location"
						bind:value={selectedOrderId}
						class="select select-bordered w-full bg-orange-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
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
						class="select select-bordered w-full bg-orange-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
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
						class="select select-bordered w-full bg-orange-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
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
						class="select select-bordered w-full bg-orange-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
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
