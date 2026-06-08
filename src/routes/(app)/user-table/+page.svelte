<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { goto, invalidateAll } from '$app/navigation';
	import { notification } from '$lib/stores/notifications';
	import { tick } from 'svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Papa from 'papaparse';
	import Loader from '$lib/components/Loader.svelte';
	import { userKeysToDelete, country_list, province } from '$lib/stores/arrays';
	import { enhance } from '$app/forms';
	// import { country_list } from '$lib/stores/arrays.js';
	// import { province } from '$lib/stores/arrays';
	import DragDrop from '$lib/components/DragDrop.svelte';
	import { Image } from '@unpic/svelte';
	import { imgCheck } from '$lib/tools/tools.js';
	import {
		Funnel,
		Trash2,
		Settings,
		UserRoundSearch,
		Eye,
		CircleX,
		ToggleLeft,
		ToggleRight,
		EyeOff,
		Lock,
		ShieldAlert,
		RefreshCcw,
		FileDown,
		CopyPlus,
		FileUp,
		ExternalLink,
		House,
		Coins,
		BookText,
		RotateCcwKey
	} from 'lucide-svelte';

	const { data } = $props();
	const { getTable, getUser, itemCount, pendingApprovalsList, totalPendingApprovals } = $derived(data);
	let tableList = $state(getTable);
	let pendingApprovalsCount = $state(totalPendingApprovals);
	let pendingList = $state(pendingApprovalsList);
	let loading = $state(false);

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
	let countyArray = $state([]); // provincia
	let county = $state(''); // provincia input
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
	let userId = $state('');
	let note = $state('');
	let pointsHistory = $state([]);
	let pointsType = $state('add');
	let resetActive = $state(false);
	let membershipExpiry = $state('');
	let membershipStatus = $state(false);
	let trainingHistory = $state<any[]>([]);
	let insuranceExpiry = $state('');
	let insuranceStatus = $state(false);

	// Pagination
	let currentPage = $state(1);
	const itemsPerPage = 50;

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

	// remove online in province
	let provinceFilterate = $province.filter((p) => p.title !== 'Online');

	// // Pagination
	// const goToPage = (newPage: number) => {
	// 	loading = true;
	// 	currentPage = newPage;
	// 	const maxPageAfterFilter = Math.max(1, Math.ceil(getTable.length / itemsPerPage));
	// 	if (currentPage > maxPageAfterFilter) {
	// 		currentPage = maxPageAfterFilter;
	// 	}

	// 	// Pagination
	// 	const skipItems = (currentPage - 1) * itemsPerPage;
	// 	tableList = getTable.slice(skipItems, skipItems + itemsPerPage);

	// 	loading = false;
	// };
	// goToPage(currentPage);

	const addItem = (item: any, type: string) => {
		if (type == 'county') {
			if (county != '') {
				if (!countyArray.includes(item)) {
					countyArray.push(item);
					county = '';
				} else {
					notification.error('Provincia già inserita');
				}
			} else {
				notification.error('Provincia NON valida');
			}
		}

		county = '';
	};

	const removeItem = (index: number, type: string) => {
		if (index !== -1) {
			if (type == 'county') countyArray.splice(index, 1); /// PROVINCE
		}
	};

	const onSwitchPublicProfile = async (type: string, value: boolean) => {
		//console.log('switch public profile', type, value);
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
		//userData[type] = !value;  const userdata = {type: value}  userdata.namePublic =  | value = namePublic
		// console.log('onSwitchPublicProfile', type, value, typeof namePublic, namePublic);
	};

	const csvCreate = (content) => {
		const flattenObject = (obj: any, prefix = '') => {
			return Object.keys(obj).reduce((acc, k) => {
				const pre = prefix.length ? prefix + '.' : '';
				if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
					Object.assign(acc, flattenObject(obj[k], pre + k));
				} else {
					acc[pre + k] = obj[k];
				}
				return acc;
			}, {});
		};

		const dataToExport = content.map((order) => {
			const flatOrder: any = flattenObject(order);

			if (flatOrder.createdAt) flatOrder.createdAt = (flatOrder.createdAt as string).substring(0, 10);
			if (flatOrder.birthdate) flatOrder.birthdate = (flatOrder.birthdate as string).substring(0, 10);

			$userKeysToDelete.forEach((key: string) => delete (flatOrder as any)[key]);
			return flatOrder;
		});

		//CSV UNPARSE
		const csv = Papa.unparse(dataToExport, {
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
		link.download = `export_Utenti_${new Date().toISOString()}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Release the URL object
		URL.revokeObjectURL(link.href);
	};

	const testPass = () => {
		checkPass = password1.length >= 8;
		checkSecondPass = password1 === password2;
	};

	const testSecondPass = () => (checkSecondPass = password1 === password2);

	const refresh = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		currentPage = 1;
		tableList = getTable;
		notification.info('Pagina ricaricata');
		level = '';
		membershipLevel = '';
	};

	const resetFields = () => {
		name = '';
		surname = '';
		email = '';
		address = '';
		postalCode = '';
		city = '';
		county = '';
		countyArray = [];
		country = '';
		phone = '';
		mobilePhone = '';
		password1 = '';
		password2 = '';
		// level = '';
		// membershipLevel = '';
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
		userId = '';
		note = '';
		pointsHistory = [];
		pointsType = 'add';
		membershipStatus = false;
		insuranceExpiry = '';
		insuranceStatus = false;
	};

	const onClickModal = (type: string, item: any) => {
		resetFields();
		currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo Utente';
			membershipLevel = '';
			level = '';
			membershipExpiry = '';
			country = 'Italy';
		}
		if (type == 'modify') {
			postAction = `?/modify`;
			modalTitle = 'Modifica utente';
			userId = item.userId;
			name = item.name;
			surname = item.surname;
			email = item.email;
			address = item.address;
			postalCode = item.postalCode;
			city = item.city;
			countyArray = item.county;
			// membershipExpiry = item.membership.membershipExpiry;
			membershipExpiry = new Date(item.membership.membershipExpiry).toISOString().split('T')[0];
			membershipLevel = item.membership.membershipLevel;
			country = item.country;
			phone = item.phone;
			mobilePhone = item.mobilePhone;
			password1 = item.password1;
			level = item.level;
			membershipStatus = item.membership.membershipStatus;
			namePublic = item.namePublic;
			surnamePublic = item.surnamePublic;
			emailPublic = item.emailPublic;
			addressPublic = item.addressPublic;
			cityPublic = item.cityPublic;
			statePublic = item.countyPublic;
			postalCodePublic = item.postalCodePublic;
			countryPublic = item.countryPublic;
			phonePublic = item.phonePublic;
			mobilePhonePublic = item.mobilePhonePublic;

			insuranceExpiry = item.insurance.insuranceExpiry ? new Date(item.insurance.insuranceExpiry).toISOString().split('T')[0] : '';
			insuranceStatus = item.insurance.insuranceStatus;
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			userId = item.userId;
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtra';

			level = '';
			membershipLevel = '';
			email = '';
			name = '';
			surname = '';
			county = '';
			mobilePhone = '';
		}
		if (type == 'uploadCsv') {
			postAction = `?/uploadCsv`;
			modalTitle = 'Carica CSV';
		}
		if (type == 'points') {
			postAction = `?/modifyPoints`;
			modalTitle = `Punti Utente: ${item.pointsBalance}`;
			userId = item.userId;
			pointsHistory = item.pointsHistory;
		}
		if (type == 'trainingHistory') {
			modalTitle = 'Storico formazione';
			userId = item.userId;
			trainingHistory = item.trainingHistory || [];
			postAction = `?/approveTraining`;
		}
		if (type == 'pendingApprovals') {
			modalTitle = 'Utenti in attesa di approvazione';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		currentModal = '';
	};

	const formSubmit = () => {
		loading = true;
		let shouldResetFields = true;
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await invalidateAll();
			try {
				if (result.type === 'success' && result.data) {
					const { action, message, payload, totalPending, approved } = result.data; // { action, success, message, payload }
					if (action == 'filter') {
						resetActive = true;
						currentPage = 1;
						tableList = payload;
						notification.info(message);
						onCloseModal();
					} else if (action == 'downloadCsv') {
						csvCreate(payload);
						notification.success(message);
					} else if (action == 'changePage') {
						tableList = payload.result;
						currentPage = payload.currentPage;
					} else if (action == 'logUser') {
						goto('/profile-area');
						notification.success(message);
						// window.location.href = '/profile-area';
					} else if (action == 'changeStatus') {
						notification.success(message);
						if (resetActive) {
							tableList = payload;
							//console.log('tableList', tableList);
						} else {
							tableList = getTable;
						}
					} else if (action == 'modify' || action == 'delete') {
						onCloseModal();
						notification.info(message);
						if (resetActive) {
							// Aggiorna solo l'utente modificato nella lista filtrata esistente
							const index = tableList.findIndex((u) => u.userId === payload[0].userId);
							if (index !== -1) {
								tableList[index] = payload[0];
								tableList = [...tableList]; // forza reattività Svelte
							}
						} else {
							tableList = getTable;
						}
					} else if (action === 'approveTraining' || action === 'delTraining') {
						//alert(action);
						shouldResetFields = false;
						await invalidateAll();
						await tick();
						tableList = getTable;
						pendingList = pendingApprovalsList;
						resetActive = false;
						notification.info(message);

						if (payload && payload[0]) {
							trainingHistory = payload[0].trainingHistory?.filter((t) => t.approved === false) || [];
						}

						if (approved === true && pendingApprovalsCount > 0) {
							pendingApprovalsCount -= 1;
						} else if (approved === false) {
							pendingApprovalsCount += 1;
						}

						if (trainingHistory.length === 0 && action === 'approveTraining') {
							onCloseModal();
						}
					} else {
						tableList = getTable;
						resetActive = false;
						notification.info(message);
					}

					//onCloseModal();
				}
				if (result.type === 'failure') {
					notification.error(result.data.message);
				}
				if (result.type === 'error') {
					notification.error(result.error.message);
				}
				// 'update()' is called by default by use:enhance
				//await update(); // if you need to ensure it completes before further client logic.
			} finally {
				if (shouldResetFields) {
					resetFields();
				}
				loading = false;
			}
		};
	};

	$effect(() => {
		if (currentPage) {
			tick().then(() => {
				const element = document.getElementById('top');
				if (element) {
					element.scrollIntoView({ behavior: 'instant' }); // smooth , instant
				}
			});
		}
	});
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

{#if !getTable}
	<Loader />
{:else}
	<div class="overflow-x-auto mt-5 px-4 mb-5">
		<div class="flex flex-col gap-4 mb-4">
			<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista utenti ({itemCount})</h1>
			<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
				<button class="btn btn-info text-white w-full sm:w-auto" onclick={refresh}>
					<RefreshCcw />
				</button>
				{#if resetActive == true}
					<button class="btn btn-error rounded-md text-white" onclick={refresh}>
						<CircleX class="mt-1" /> Reset Filtro
					</button>
				{:else}
					<button class="btn btn-info rounded-md text-white" onclick={() => onClickModal('filter', null)}>
						<Funnel class="mt-1" /> Filtra
					</button>
				{/if}
				<button class="btn btn-info rounded-md text-white" onclick={() => onClickModal('new', null)}>
					<CopyPlus /> Nuovo
				</button>
				<form method="POST" action={`?/downloadCsv`} use:enhance={formSubmit}>
					<button type="submit" class="btn btn-info text-white w-full sm:w-auto">
						<FileDown />CSV Report
						{#if loading}
							<Loader />
						{/if}
					</button>
				</form>
				<button aria-label="uploadCSV" class="btn btn-info text-white w-full sm:w-auto" onclick={() => onClickModal('uploadCsv', null)}>
					<FileUp />CSV Update
				</button>
				{#if pendingApprovalsCount > 0}
					<button class="btn btn-warning rounded-md text-white relative" onclick={() => onClickModal('pendingApprovals', null)}>
						<BookText />

						<span
							class="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full"
						>
							{pendingApprovalsCount}
						</span>
					</button>
				{/if}
			</div>
		</div>

		<table class="table mt-5 bg-white border-2">
			<!-- head -->
			<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
				<tr class="">
					<th>Data registrazione</th>
					<th>Email</th>
					<th>Nome Cognome</th>
					<th>Livello</th>
					<th>Dati utente</th>
					<th>Punti</th>
					<th>Formazione</th>
					<th>Status</th>
					<th>Assicurazione</th>
					<th>Azione</th>
				</tr>
			</thead>
			<!-- body -->
			<tbody>
				<!-- row -->
				{#if tableList.length == 0}
					<tr class="hover:bg-gray-300"><td> </td></tr>
				{/if}
				<!-- {#each tableList as row, i (i)} -->
				{#each tableList as row (`${row.userId}-${row.email}`)}
					<tr class="hover:bg-gray-300">
						<td>
							<!-- img start -->
							{#if row?.uploadfiles.some((file) => file.type === 'profile')}
								<div class="card-body p-4">
									<div class="relative flex items-center gap-5">
										<figure class="flex-shrink-0">
											<Image
												layout="constrained"
												aspectRatio={1}
												src={imgCheck?.single(row?.uploadfiles, 'profile')}
												alt="Profile pic"
												class="object-cover rounded-md max-w-16 max-h-16 h-auto"
											/>
										</figure>

										<form method="POST" action="?/delProfilePic" use:enhance={formSubmit}>
											<input type="hidden" name="userId" value={row.userId} />
											<input type="hidden" name="fileName" value={imgCheck.fileName(row.uploadfiles, 'profile')} />
											<button class="absolute bottom-0 right-0 btn btn-circle btn-lg btn-error" type="submit" aria-label="Delete image">
												<Trash2 size="18" />
											</button>
										</form>
									</div>
								</div>
							{:else}
								<form action="?/setProfilePic" method="POST" enctype="multipart/form-data" use:enhance={formSubmit} class="card-body max-w-48">
									<input type="hidden" name="userId" value={row.userId} />
									<DragDrop />
									<button class="btn btn-sm btn-info rounded-lg border-2" type="submit"> Aggiungi foto </button>
								</form>
							{/if}
							<!-- img end -->
						</td>
						<!-- Data registrazione -->
						<td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString('it-IT') : '-'}</td>

						<!-- Email -->
						<td>{row.email}</td>
						<!-- Name and Surname -->
						<td>{row.name} {row.surname}</td>
						<!-- Level, MembreshipLevel, Expire Date -->
						<td>
							{row.level}
							<br />
							{row.membership.membershipLevel}
							<br />
							<span>Scadenza:</span>
							<strong>{row.membership.membershipExpiry.substring(0, 10)}</strong>
							<br />
							<span>Status tessera:</span>
							<span class="badge badge-xs {row.membership.membershipStatus === true ? 'badge-success' : 'badge-error'}"></span></td
						>
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
									{#if Array.isArray(row.county) && row.county.length > 0}
										{row.county.join(', ')}
									{:else if row.county}
										{row.county}
									{:else}
										Non specificato
									{/if}
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
						<!-- Points -->
						<td>
							<button onclick={() => onClickModal('points', row)} class="btn btn-info font-bold">{row.pointsBalance} <Coins /> </button>
						</td>
						<!-- Formazione -->
						<td>
							<button
								type="button"
								class="btn btn-info font-bold"
								onclick={() => onClickModal('trainingHistory', row)}
								disabled={!row.trainingHistory || row.trainingHistory.length === 0}
								aria-label="Storico formazione"
							>
								<BookText />
							</button>
						</td>

						<!-- Status -->
						<td>
							<form method="POST" action={`?/changeStatus`} use:enhance={formSubmit}>
								<input type="hidden" name="userId" value={row.userId} />
								<input type="hidden" name="status" value={row.status} />
								<span class="flex items-center">
									{#if row.status == 'enabled'}
										<button type="submit" class="btn btn-ghost btn-sm font-semibold"><ToggleRight color="darkgreen" /> </button>
									{:else}
										<button type="submit" class="btn btn-ghost btn-sm font-semibold"><ToggleLeft color="darkred" /></button>
									{/if}
								</span>
							</form>
						</td>
						<!-- Insurance -->
						<td>
							<div class="flex flex-col gap-1">
								{#if row.insurance.insuranceStatus}
									<!-- Attiva - Bollino Verde -->
									<div class="badge badge-success badge-sm gap-1">
										<div class="w-2 h-2 rounded-full bg-white"></div>
										Attiva
									</div>
									<!-- {#if row.insurance.insuranceExpiry}
										<span class="text-xs text-gray-600">
											Scad: {new Date(row.insurance.insuranceExpiry).toLocaleDateString('it-IT')}
										</span>
									{/if} -->
								{:else}
									<!-- Inattiva - Bollino Rosso -->
									<div class="badge badge-error badge-sm gap-1">
										<div class="w-2 h-2 rounded-full bg-white"></div>
										Inattiva
									</div>
								{/if}
							</div>
						</td>
						<!-- Action -->
						<td class="flex items-center justify-center space-x-4">
							<button
								onclick={() => onClickModal('modify', row)}
								class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800"
								><Settings />
							</button>
							<a
								href="/profile-public/{row.userId}"
								class="btn btn-sm bg-green-200 btn-green-400 rounded-md text-green-800 hover:bg-green-300 hover:text-green-800"><UserRoundSearch /></a
							>
							{#if getUser.level == 'superadmin'}
								<form method="POST" action={`?/logUser`} use:enhance={formSubmit}>
									<input type="hidden" name="userId" value={row.userId} />
									<button type="submit" class="btn btn-sm btn-info"><ExternalLink /></button>
								</form>
							{/if}

							{#if getUser.level == 'superadmin'}
								<!-- <form method="POST" action={`?/resetPassword`} use:enhance={formSubmit}> -->
								<form
									method="POST"
									action={`?/resetPassword`}
									use:enhance={formSubmit}
									onsubmit={(e) => {
										if (!confirm('Sei sicuro di voler resettare la password per questo utente?')) e.preventDefault();
									}}
								>
									<input type="hidden" name="resetEmail" value={row.email} />
									<button type="submit" class="btn btn-sm btn-warning"><RotateCcwKey /></button>
								</form>
							{/if}

							<button class="btn btn-error btn-sm" onclick={() => onClickModal('delete', row)}><Trash2 /></button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if tableList.length == 0}
			<div class="alert alert-warning shadow-lg flex item-center text-center justify-center mt-3 mx-auto w-full max-w-lg">
				<div>
					<ShieldAlert />
					<br />
					<span class="mt-2 text-semibold"> Nessun Utente trovato. Cambia parametri o resetta il filtro. </span>
				</div>
			</div>
		{/if}
		<div class="join flex justify-center mt-5">
			<form method="POST" action="?/changePage" use:enhance={formSubmit}>
				{#if currentPage > 1}
					<button type="submit" id="reset" class="join-item btn" name="navigation" value="reset">
						<House />
					</button>
				{/if}

				<button type="submit" id="prev" class="join-item btn" name="navigation" value="prev" disabled={currentPage <= 1}> « </button>
				<button type="button" class="join-item btn">Pagina {currentPage}</button>
				<button type="submit" id="next" class="join-item btn" name="navigation" value="next" disabled={tableList.length < itemsPerPage}>» </button>
				<input type="hidden" name="itemsPerPage" value={itemsPerPage} />
				<input type="hidden" name="currentPage" value={currentPage} />
				<input type="hidden" name="level" value={level} />
				<input type="hidden" name="membershipLevel" value={membershipLevel} />
			</form>
		</div>
	</div>
{/if}

<!--Modal New and Modify  -->
{#if currentModal == 'new' || currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-4xl">
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}

		<form method="POST" action={postAction} use:enhance={formSubmit} class=" grid grid-cols-12 gap-x-4 gap-y-8 p-4">
			{#if currentModal == 'modify'}
				<div class="form-control col-span-12 md:col-span-12">
					<label for="userId" class="form-label">
						<div class="flex flex-col gap-4">
							<span class="label-text font-bold">ID utente</span>
							<input
								class="input input-bordered join-item w-full"
								id="userId"
								name="userId"
								placeholder="userId"
								aria-label="userId"
								aria-describedby="basic-userId"
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
						{#if currentModal == 'modify'}
							<input type="checkbox" class="hidden" id="btn-check8" name="namePublic" bind:checked={namePublic} />
							<label class={namePublic ? 'btn btn-success btn-sm rounded-md' : 'btn btn-secondary btn-sm rounded-md'} for="btn-check8">
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
						placeholder="Nome"
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
						{#if currentModal == 'modify'}
							<input type="checkbox" class="hidden" id="btn-check9" name="surnamePublic" bind:checked={surnamePublic} />
							<label class={surnamePublic ? 'btn btn-success btn-sm rounded-md' : 'btn btn-secondary btn-sm rounded-md'} for="btn-check9">
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
						placeholder="Cognome"
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
						{#if currentModal == 'modify'}
							<input
								type="checkbox"
								class="hidden"
								id="btn-check10"
								name="emailPublic"
								autocomplete="off"
								checked={emailPublic}
								onclick={() => onSwitchPublicProfile('emailPublic', emailPublic)}
							/>
							<label class={emailPublic ? 'btn btn-success btn-sm rounded-md' : 'btn btn-secondary btn-sm rounded-md'} for="btn-check10">
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
						placeholder="Email"
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
						{#if currentModal == 'modify'}
							<input
								type="checkbox"
								class="hidden"
								id="btn-check1"
								name="addressPublic"
								autocomplete="off"
								checked={addressPublic}
								onclick={() => onSwitchPublicProfile('addressPublic', addressPublic)}
							/>
							<label class={addressPublic ? 'btn btn-success btn-sm rounded-md' : 'btn btn-secondary btn-sm rounded-md'} for="btn-check1">
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
						placeholder="Indirizzo"
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
						{#if currentModal == 'modify'}
							<input
								type="checkbox"
								class="hidden"
								id="btn-check2"
								name="cityPublic"
								autocomplete="off"
								checked={cityPublic}
								onclick={() => onSwitchPublicProfile('cityPublic', cityPublic)}
							/>
							<label class={cityPublic ? 'btn btn-success btn-sm rounded-md' : 'btn btn-secondary btn-sm rounded-md'} for="btn-check2">
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
						placeholder="Città"
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
						{#if currentModal == 'modify'}
							<input
								type="checkbox"
								class="hidden"
								id="btn-check3"
								name="statePublic"
								autocomplete="off"
								checked={statePublic}
								onclick={() => onSwitchPublicProfile('statePublic', statePublic)}
							/>
							<label class={statePublic ? 'btn btn-success btn-sm rounded-md' : 'btn btn-secondary btn-sm rounded-md'} for="btn-check3">
								{#if statePublic}
									<Eye size="20" color="white" strokeWidth={2.5} />
								{:else}
									<EyeOff size="20" color="white" strokeWidth={2.5} />
								{/if}
								<span class="text-white">{statePublic ? 'Pubblico' : 'Privato'}</span>
							</label>
						{/if}
					</div>
					<div class="join join-horizontal rounded-md w-full mb-2">
						<!-- <button type="button" class="join-item bg-gray-300 px-3">AA</button> -->
						<input type="hidden" name="countyArray" bind:value={countyArray} />
						<select
							class="select select-bordered w-full rounded-md mt-2"
							id="county"
							name="county"
							bind:value={county}
							onchange={() => addItem(county, 'county')}
						>
							<option disabled value="">Scegli provincia</option>
							{#each $province as provincia (provincia.title)}
								<option value={provincia.title}>
									{provincia.title} ({provincia.region})
								</option>
							{/each}
						</select>
					</div>
					{#if countyArray?.length > 0}
						{#each countyArray as county (county)}
							<div class="btn btn-primary btn-sm m-1 rounded-md">
								{county}
								<button type="button" class="badge badge-error ml-2" onclick={() => removeItem(i, 'county')}> X </button>
							</div>
						{/each}
					{/if}
				</label>
			</div>
			<!-- CAP -->
			<div class="form-control col-span-12 md:col-span-6">
				<label for="postalcode" class="form-label">
					<div class="flex items-center gap-4 justify-between">
						<span class="label-text font-bold">CAP</span>
						{#if currentModal == 'modify'}
							<input
								type="checkbox"
								class="hidden"
								id="btn-check4"
								name="postalCodePublic"
								autocomplete="off"
								checked={postalCodePublic}
								onclick={() => onSwitchPublicProfile('postalCodePublic', postalCodePublic)}
							/>
							<label class={postalCodePublic ? 'btn btn-success btn-sm rounded-md' : 'btn btn-secondary btn-sm rounded-md'} for="btn-check4">
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
						placeholder="CAP"
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
						{#if currentModal == 'modify'}
							<input
								type="checkbox"
								class="hidden"
								id="btn-check5"
								name="countryPublic"
								autocomplete="off"
								checked={countryPublic}
								onclick={() => onSwitchPublicProfile('countryPublic', countryPublic)}
							/>
							<label class={countryPublic ? 'btn btn-success btn-sm rounded-md' : 'btn btn-secondary btn-sm rounded-md'} for="btn-check5">
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
						<option value="" selected disabled>Scegli</option>
						{#each $country_list as country (country)}
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
						{#if currentModal == 'modify'}
							<input
								type="checkbox"
								class="hidden"
								id="btn-check6"
								name="phonePublic"
								autocomplete="off"
								checked={phonePublic}
								onclick={() => onSwitchPublicProfile('phonePublic', phonePublic)}
							/>
							<label class={phonePublic ? 'btn btn-success btn-sm rounded-md' : 'btn btn-secondary btn-sm rounded-md'} for="btn-check6">
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
						placeholder="Telefono"
						bind:value={phone}
					/>
				</label>
			</div>
			<!-- Cellulare -->
			<div class="form-control col-span-12 md:col-span-6">
				<label for="cellulare" class="form-label">
					<div class="flex items-center gap-4 justify-between">
						<span class="label-text font-bold">Cellulare</span>
						{#if currentModal == 'modify'}
							<input
								type="checkbox"
								class="hidden"
								id="btn-check7"
								name="mobilePhonePublic"
								autocomplete="off"
								checked={mobilePhonePublic}
								onclick={() => onSwitchPublicProfile('mobilePhonePublic', mobilePhonePublic)}
							/>
							<label class={mobilePhonePublic ? 'btn btn-success btn-sm rounded-md' : 'btn btn-secondary btn-sm rounded-md'} for="btn-check7">
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
						placeholder="Telefono"
						bind:value={mobilePhone}
					/>
				</label>
			</div>
			{#if currentModal == 'new'}
				<!-- Password -->
				<div class="form-control col-span-12">
					<label for="password1" class="form-label">
						<p class="font-bold mb-2">
							Password <br />
							<span class="text-sm text-gray-600">( Almeno 8 caratteri numeri e lettere )</span>
						</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Lock color={checkPass ? 'green' : 'black'} /></button>
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
						<button class="join-item bg-gray-300 px-3"><Lock color={checkSecondPass && checkPass ? 'green' : 'black'} /></button>
						<input
							class="input input-bordered join-item w-full"
							id="password2"
							type="password"
							placeholder="Repeat password"
							bind:value={password2}
							oninput={testSecondPass}
							required
						/>
					</div>
				</div>
			{/if}
			<!-- Level -->
			<div class="form-control col-span-12 md:col-span-6">
				<label for="level" class="form-label">
					<p class="font-bold">Livello di permesso (solo per SuperAdmin)</p>
				</label>
				<select id="level" name="level" class="select select-bordered w-full rounded-md mt-2" placeholder="Scegli" required bind:value={level}>
					<option value="" selected disabled>Seleziona livello</option>
					<option value="user">Utente base</option>
					<option value="riflessologo">Riflessologo</option>
					<option value="formatore base">Formatore base</option>
					<option value="master">Master</option>
					<option value="formatore avanzato">Formatore avanzato</option>
					<option value="admin">Admin</option>
					<option value="superadmin">Superadmin</option>
				</select>
			</div>

			<!-- expire -->
			<div class="form-control col-span-12 md:col-span-6">
				<label for="membershipExpiry" class="form-label">
					<p class="font-bold mb-2">Scadenza iscrizione Membership</p>
				</label>

				<input type="date" id="membershipExpiry" name="membershipExpiry" class="input input-bordered w-full" bind:value={membershipExpiry} required />
			</div>

			<!-- livello membership -->
			<div class="form-control col-span-12 md:col-span-6">
				<label for="membershipLevel" class="form-label">
					<p class="font-bold">Livello Membership</p>
				</label>
				<select
					id="membershipLevel"
					name="membershipLevel"
					class="select select-bordered w-full rounded-md mt-2"
					placeholder="Scegli"
					required
					bind:value={membershipLevel}
				>
					<option value="" selected disabled>Seleziona livello Membership</option>
					<option value="Socio inattivo">Socio inattivo</option>
					<option value="Socio ordinario">Socio ordinario</option>
					<option value="Socio vitalizio">Socio vitalizio</option>
				</select>
			</div>

			<div class="form-control col-span-12 md:col-span-6 mx-auto">
				<label class="form-label">
					<div class="flex items-center justify-between gap-4">
						<span class="label-text font-bold">Status Tessera</span>
					</div>
				</label>
				<div class="flex gap-4 mt-2">
					<label class="flex items-center cursor-pointer">
						<input
							type="radio"
							name="membershipStatus"
							value="true"
							class="radio radio-success mr-2"
							checked={membershipStatus === true}
							onchange={() => (membershipStatus = true)}
						/>
						<span class="text-sm">Attiva</span>
					</label>
					<label class="flex items-center cursor-pointer">
						<input
							type="radio"
							name="membershipStatus"
							value="false"
							class="radio radio-error mr-2"
							checked={membershipStatus === false}
							onchange={() => (membershipStatus = false)}
						/>
						<span class="text-sm">Inattiva</span>
					</label>
				</div>
			</div>

			<!-- Scadenza Assicurazione -->
			<div class="form-control col-span-12 md:col-span-6">
				<label for="insuranceExpiry" class="form-label">
					<p class="font-bold mb-2">Scadenza Assicurazione</p>
				</label>
				<input type="date" id="insuranceExpiry" name="insuranceExpiry" class="input input-bordered w-full" bind:value={insuranceExpiry} />
			</div>

			<!-- Status Assicurazione -->
			<div class="form-control col-span-12 md:col-span-6 mx-auto">
				<label class="form-label">
					<div class="flex items-center justify-between gap-4">
						<span class="label-text font-bold">Status Assicurazione</span>
					</div>
				</label>
				<div class="flex gap-4 mt-2">
					<label class="flex items-center cursor-pointer">
						<input
							type="radio"
							name="insuranceStatus"
							value="true"
							class="radio radio-success mr-2"
							checked={insuranceStatus === true}
							onchange={() => (insuranceStatus = true)}
						/>
						<span class="text-sm">Attiva</span>
					</label>
					<label class="flex items-center cursor-pointer">
						<input
							type="radio"
							name="insuranceStatus"
							value="false"
							class="radio radio-error mr-2"
							checked={insuranceStatus === false}
							onchange={() => (insuranceStatus = false)}
						/>
						<span class="text-sm">Inattiva</span>
					</label>
				</div>
			</div>

			<!-- button -->
			<div class="col-span-12 mt-5 flex justify-center gap-4">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">
						{#if currentModal == 'new'}
							Registra
						{:else if currentModal == 'modify'}
							Modifica
						{/if}
					</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<!-- Modal confirm delete -->
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-2xl">
		{#if loading}
			<Loader />
		{/if}
		<form action={postAction} method="POST" use:enhance={formSubmit}>
			<input type="hidden" name="userId" value={userId} />
			<div class="flex justify-center space-x-10 my-4">
				<button class="btn btn-error btn-md" type="button" onclick={onCloseModal}>Annulla</button>
				<button class="btn btn-success btn-md text-white" type="submit"><Trash2 />Conferma</button>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<!-- Modal filter  -->
	<Modal isOpen={openModal} header={modalTitle}>
		{#if loading}
			<Loader />
		{/if}
		<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="level" class="block text-sm font-medium text-gray-700 mb-1">Livello utente</label>
					<select
						id="level"
						name="level"
						bind:value={level}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Seleziona il livello utente</option>
						<option value="user">Utente base</option>
						<option value="riflessologo">Riflessologo</option>
						<option value="formatore base">Formatore base</option>
						<option value="master">Master</option>
						<option value="formatore avanzato">Formatore avanzato</option>
						<option value="admin">Admin</option>
						<option value="superadmin">Superadmin</option>
					</select>
				</div>

				<div>
					<label for="membershipLevel" class="block text-sm font-medium text-gray-700 mb-1">Livello associato</label>
					<select
						id="membershipLevel"
						name="membershipLevel"
						bind:value={membershipLevel}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="">Seleziona il livello associato</option>
						<option value="Socio inattivo">Socio inattivo</option>
						<option value="Socio ordinario">Socio ordinario</option>
						<option value="Socio vitalizio">Socio vitalizio</option>
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
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
					<input
						type="text"
						id="name"
						name="name"
						bind:value={name}
						placeholder="Scrivi un nome"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div>
					<label for="surname" class="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
					<input
						type="text"
						id="surname"
						name="surname"
						bind:value={surname}
						placeholder="Scrivi un cognome"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div>
					<label for="county" class="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
					<input
						type="text"
						id="county"
						name="county"
						bind:value={county}
						placeholder="Scrivi un cognome"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
				<div>
					<label for="mobilePhone" class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
					<input
						type="tel"
						id="mobilePhone"
						name="mobilePhone"
						bind:value={mobilePhone}
						placeholder="Scrivi un cognome"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
			</div>

			<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
				<button class="btn btn-error btn-sm hover:bg-red-300" onclick={onCloseModal} type="button"> Annulla </button>
				<button class="btn btn-success btn-sm hover:bg-green-400" type="submit"> Applica Filtri </button>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'uploadCsv'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<form
			method="POST"
			action={postAction}
			enctype="multipart/form-data"
			use:enhance={formSubmit}
			class="grid grid-cols-2 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<section class="col-span-2">
				<label for="price" class="form-label">
					<p class="font-bold mb-2 label">Solo file CSV</p>
				</label>
				<div class="join join-horizontal rounded-md w-full">
					<input type="file" id="fileUpload" name="fileUpload" accept=".csv, text/csv" class="file-input" />
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}>Annulla</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Carica</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'points'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<form method="POST" action={postAction} use:enhance={formSubmit} class="grid grid-cols-4 gap-4 px-4 py-4">
			<section class="col-span-4 flex justify-center gap-4">
				<div class="form-control">
					<label for="pointsType" class="form-label">
						<p class="font-bold mb-2 label">Aggiungi Punti</p>
						<input type="radio" name="pointsType" class="radio" value="add" bind:group={pointsType} />
					</label>
				</div>
				<div class="form-control">
					<label for="pointsType" class="form-label">
						<p class="font-bold mb-2 label">Rimuovi Punti</p>
						<input type="radio" name="pointsType" class="radio" value="remove" bind:group={pointsType} />
					</label>
				</div>
			</section>

			<section class="col-span-4 flex flex-col items-center">
				<label for="points" class="form-control max-w-md mx-auto">
					<!-- <div class="label">
						<span class="label-text font-bold">Punti utente</span>
					</div> -->
					<div class="join join-horizontal rounded-md w-full">
						<input
							type="number"
							id="points"
							name="points"
							class="input input-bordered w-full"
							value="0"
							placeholder="0"
							aria-label="points"
							min="0"
							max="9999"
						/>
					</div>
				</label>
			</section>
			<section class="col-span-4 flex flex-col items-center">
				<label for="note" class="form-control max-w-xl mx-auto">
					<div class="label">
						<span class="label-text font-bold">Note</span>
					</div>
					<div class="join join-horizontal rounded-md w-full">
						<textarea class="textarea w-full" id="note" name="note" placeholder="Note" aria-label="note" bind:value={note}> </textarea>
					</div>
				</label>
			</section>

			<input type="hidden" name="userId" value={userId} aria-label="userId" />

			<section class="col-span-4 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}>Annulla</button>
					<button type="submit" class="btn btn-sm mx-2" class:btn-success={pointsType === 'add'} class:btn-error={pointsType === 'remove'}>
						{#if pointsType === 'add'}
							Aggiungi
						{:else}
							Rimuovi
						{/if}
					</button>
				</div>
			</section>
		</form>

		<div class="grid grid-cols-4 bg-base-100 grid-col gap-y-3 p-4 lg:gap-x-4 lg:p-4">
			<!-- {#each pointsHistory || [] as item} -->
			{#each [...(pointsHistory || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as item, i (i)}
				<div
					class="col-span-4
                           p-3
                           rounded-box
                           shadow-md
                           bg-base-200
                           flex flex-wrap
                           gap-x-1 gap-y-1
                           items-center
                           justify-between
                           "
				>
					<span class="font-bold text-lg text-primary"> punti: {item.points}</span>
					<span class="text-sm text-base-content">{item.note}</span>
					<div class="w-full"><span class="text-sm text-base-content">{new Date(item.date).toLocaleString()}</span></div>
				</div>
			{/each}
		</div>
	</Modal>
{/if}

{#if currentModal == 'trainingHistory'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button type="button" class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		{#if loading}
			<Loader />
		{/if}
		<div class="p-4 lg:p-8">
			{#if trainingHistory && trainingHistory.length > 0}
				<div class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-4">
					{#each trainingHistory as training (`${training.date}-${training.fileName}`)}
						<!-- {#each trainingHistory as training, i (i)} -->
						<div class="col-span-4 p-4 rounded-box shadow-md bg-base-200 flex flex-col gap-y-4">
							<!-- Header -->
							<div class="flex items-start justify-between gap-4 flex-wrap lg:flex-nowrap">
								<span class="font-bold text-lg text-primary flex-1 break-words">
									{training.description || 'N/A'}
								</span>

								<div class="flex items-center gap-2 flex-shrink-0">
									<!-- Badge Status -->
									<div class="badge badge-lg" class:badge-success={training.approved} class:badge-warning={!training.approved}>
										{training.approved ? 'Approvato' : 'In attesa'}
									</div>

									{#if !training.approved}
										<form method="POST" action={`?/approveTraining`} use:enhance={formSubmit}>
											<input type="hidden" name="userId" value={userId} />
											<input type="hidden" name="trainingDate" value={training.date} />
											<input type="hidden" name="trainingDescription" value={training.description || ''} />
											<input type="hidden" name="trainingFileName" value={training.fileName} />
											<input type="hidden" name="approved" value="true" />

											<button type="submit" class="btn btn-xs btn-success whitespace-nowrap" aria-label="Approva training"> ✓ Approva </button>
										</form>
									{/if}

									<form method="POST" action={`?/delTraining`} use:enhance={formSubmit}>
										<input type="hidden" name="userId" value={userId} />
										<input type="hidden" name="fileName" value={training.fileName} />
										<input type="hidden" name="trainingDate" value={training.date} />
										<input type="hidden" name="trainingDescription" value={training.description || ''} />

										<button type="submit" class="btn btn-xs btn-error" aria-label="Elimina training">
											<Trash2 size={16} />
										</button>
									</form>
								</div>
							</div>

							<!-- Info -->
							<div class="flex flex-wrap gap-x-6 gap-y-2">
								<div class="flex items-center gap-2">
									<span class="text-sm font-semibold">Ore:</span>
									<span class="text-info-content">{training.hours}h</span>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-sm font-semibold">Data:</span>
									<span class="text-info-content">
										{new Date(training.date).toLocaleDateString('it-IT', {
											day: '2-digit',
											month: '2-digit',
											year: 'numeric'
										})}
									</span>
								</div>
							</div>

							{#if training.fileUrl}
								<div class="flex items-center gap-2 mt-2">
									<span class="text-sm font-semibold">File:</span>
									<a href={training.fileUrl} target="_blank" rel="noopener noreferrer" class="link link-primary truncate">
										{training.fileName}
									</a>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<p class="text-base-content/70">Nessuna formazione registrata</p>
				</div>
			{/if}
		</div>
	</Modal>
{/if}

{#if currentModal == 'pendingApprovals'}
	<Modal isOpen={openModal} header="Utenti in attesa di approvazione" cssClass="max-w-5xl">
		<button type="button" class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		<div class="p-4 lg:p-8">
			{#if pendingApprovalsList && pendingApprovalsList.length > 0}
				<div class="space-y-3">
					{#each pendingApprovalsList as row (row.userId)}
						<button
							type="button"
							onclick={() => onClickModal('trainingHistory', row)}
							class="w-full p-4 rounded-box shadow-md bg-warning/20 border-l-4 border-warning hover:bg-warning/30 transition-colors text-left cursor-pointer"
						>
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-2">
										<p class="font-bold text-lg">{row.name} {row.surname}</p>
										<span class="badge badge-warning badge-sm">In attesa</span>
										{#if row.pendingCount > 0}
											<span class="badge bg-blue-400 badge-sm ml-1 text-md text-bold">{row.pendingCount}</span>
										{/if}
									</div>
									<div class="space-y-1 text-sm">
										<p class="text-gray-700"><strong>Email:</strong> {row.email}</p>
										{#if row.phone}<p class="text-gray-700"><strong>Tel:</strong> {row.phone}</p>{/if}
										{#if row.mobilePhone}<p class="text-gray-700"><strong>Cell:</strong> {row.mobilePhone}</p>{/if}
									</div>
								</div>
								<div class="flex flex-col items-end gap-2">
									<p class="text-xs text-gray-500 mt-2">Clicca per dettagli →</p>
								</div>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<p class="text-base-content/70">Nessuna approvazione in sospeso</p>
				</div>
			{/if}
		</div>
	</Modal>
{/if}
