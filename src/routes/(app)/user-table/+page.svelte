<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import { notification } from '$lib/stores/notifications';
	import Modal from '$lib/components/Modal.svelte';
	import Papa from 'papaparse';
	import Loader from '$lib/components/Loader.svelte';
	import { orderKeysToDelete } from '$lib/stores/arrays';
	import {
		Funnel,
		Trash2,
		Settings,
		UserRoundSearch,
		Eye,
		XCircle,
		ToggleLeft,
		ToggleRight,
		EyeOff,
		Lock,
		ShieldAlert,
		RefreshCcw,
		FileDown,
		CopyPlus,
		FileUp
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { country_list } from '$lib/stores/arrays.js';
	import { province } from '$lib/stores/arrays';

	const { data } = $props();
	const { getTable } = $derived(data);
	let tableList = $state(getTable);

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
	let county = $state('');
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
	let resetActive = $state(false);

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');
	let loading = $state(false);

	// remove online in province
	let provinceFilterate = $province.filter((p) => p.title !== 'Online');

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
			$orderKeysToDelete.forEach((key: string) => delete (obj as any)[key]);
		});

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

	const testPass = () => {
		checkPass = password1.length >= 8;
		checkSecondPass = password1 === password2;
	};

	const testSecondPass = () => (checkSecondPass = password1 === password2);

	const refresh = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getTable;
		notification.info('Pagina ricaricata');
	};

	const resetFields = () => {
		name = '';
		surname = '';
		email = '';
		address = '';
		postalCode = '';
		city = '';
		county = '';
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
	};

	const onClickModal = (type: string, item: any) => {
		resetFields();
		currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo Utente';
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
			county = item.county;
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
			statePublic = item.countyPublic;
			postalCodePublic = item.postalCodePublic;
			countryPublic = item.countryPublic;
			phonePublic = item.phonePublic;
			mobilePhonePublic = item.mobilePhonePublic;
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			userId = item.userId;
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtra';
		}
		if (type == 'uploadCsv') {
			postAction = `?/uploadCsv`;
			modalTitle = 'Carica CSV';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		currentModal = '';
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
				onCloseModal();
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
			<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista utenti</h1>
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
				<form method="POST" action={`?/downloadCsv`}>
					<button type="submit" class="btn btn-info text-white w-full sm:w-auto">
						<FileDown />FULL CSV TEST
					</button>
				</form>

				<button
					aria-label="uploadCSV image"
					class="btn btn-info text-white w-full sm:w-auto"
					onclick={() => onClickModal('uploadCsv', null)}
				>
					<FileUp />CSV
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
						<td>
							<form method="POST" action={`?/changeStatus`} use:enhance={formSubmit}>
								<input type="hidden" name="userId" value={row.userId} />
								<input type="hidden" name="status" value={row.status} />
								<span class="flex items-center">
									{#if row.status == 'enabled'}
										<button type="submit" class="btn btn-ghost btn-sm font-semibold"
											><ToggleRight color="darkgreen" />
										</button>
									{:else}
										<button type="submit" class="btn btn-ghost btn-sm font-semibold"
											><ToggleLeft color="darkred" /></button
										>
									{/if}
								</span>
							</form>
						</td>
						<!-- Name and Surname -->
						<td>{row.name} {row.surname}</td>
						<!-- Level, MembreshipLevel, Expire Date -->
						<td>
							{row.level}
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
									{row.county}
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
								onclick={() => onClickModal('modify', row)}
								class="btn btn-sm bg-gray-200 btn-neutral rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-800"
								><Settings />
							</button>
							<a
								href="/profile-public/{row.userId}"
								class="btn btn-sm bg-green-200 btn-green-400 rounded-md text-green-800 hover:bg-green-300 hover:text-green-800"
								><UserRoundSearch /></a
							>
							<!-- <button
							onclick={() => onClickDetail(row.userId)}
							class="btn btn-sm bg-green-200 btn-green-400 rounded-md text-green-800 hover:bg-green-300 hover:text-green-800"
							><UserRoundSearch />
						</button> -->
							<button class="btn btn-error btn-sm" onclick={() => onClickModal('delete', row)}
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
{/if}
<!--Modal New and Modify  -->

{#if currentModal == 'new' || currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-4xl">
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
				class=" grid grid-cols-12 gap-x-4 gap-y-8 p-4"
			>
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
								<input
									type="checkbox"
									class="hidden"
									id="btn-check8"
									name="namePublic"
									bind:checked={namePublic}
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
								<input
									type="checkbox"
									class="hidden"
									id="btn-check9"
									name="surnamePublic"
									bind:checked={surnamePublic}
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
							id="county"
							class="select select-bordered w-full rounded-md mt-2"
							name="county"
							placeholder="Scegli"
							required
							bind:value={county}
						>
							<option value="" selected disabled>Scegli</option>
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
							<option value="" selected disabled>Scegli</option>
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
							placeholder="Telefono"
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
							placeholder="Telefono"
							required
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
						<option value="" selected disabled>Seleziona livello</option>
						<option value="user">Utente base</option>
						<option value="formatore">Formatore</option>
						<option value="admin">Admin</option>
						<option value="superadmin">Superadmin</option>
					</select>
				</div>

				<!-- button -->
				<div class="col-span-12 mt-5 flex justify-center gap-4">
					<div class="bg-gray-50 flex justify-center">
						<button class="btn btn-error btn-sm mx-2" onclick={onCloseModal}> Annulla </button>
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
		{/if}
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<!-- Modal confirm delete -->
	<Modal isOpen={openModal} header={modalTitle} cssClass="max-w-2xl">
		{#if loading}
			<Loader />
		{:else}
			<form action={postAction} method="POST" use:enhance={formSubmit}>
				<input type="hidden" name="userId" value={userId} />
				<div class="flex justify-center space-x-10 my-4">
					<button class="btn btn-error btn-md" type="button" onclick={onCloseModal}>Annulla</button>
					<button class="btn btn-success btn-md text-white" type="submit"><Trash2 />Conferma</button
					>
				</div>
			</form>
		{/if}
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<!-- Modal filter  -->
	<Modal isOpen={openModal} header={modalTitle}>
		{#if loading}
			<Loader />
		{:else}
			<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
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
						onclick={onCloseModal}
						type="button"
					>
						Annulla
					</button>
					<button class="btn btn-success btn-sm hover:bg-green-400" type="submit">
						Applica Filtri
					</button>
				</div>
			</form>
		{/if}
	</Modal>
{/if}

{#if currentModal == 'uploadCsv'}
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
				enctype="multipart/form-data"
				use:enhance={formSubmit}
				class="grid grid-cols-2 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
			>
				<section class="col-span-2">
					<label for="price" class="form-label">
						<p class="font-bold mb-2 label">Solo file CSV</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<input
							type="file"
							id="fileUpload"
							name="fileUpload"
							accept=".csv, text/csv"
							class="file-input"
						/>
					</div>
				</section>

				<div class="col-span-4 mt-5 flex justify-center">
					<div class="bg-gray-50 flex justify-center">
						<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}>Annulla</button>
						<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Carica</button>
					</div>
				</div>
			</form>
		{/if}
	</Modal>
{/if}
