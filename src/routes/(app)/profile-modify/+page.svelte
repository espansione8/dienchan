<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { enhance } from '$app/forms';
	import { cubicOut } from 'svelte/easing';
	import { create_upload } from '$lib/stores/upload';
	import Notification from '$lib/components/Notification.svelte';
	import { Settings, X, Check, Eye, EyeOff, Trash2, Award } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import { province } from '$lib/stores/arrays.js';
	import { country_list } from '$lib/stores/arrays.js';
	import { coursesInfo } from '$lib/stores/arrays.js';

	let { data, form } = $props();
	let { userData, orderData } = $derived(data);

	// remove online in province
	let provinceFilterate = $province.filter((p) => p.title !== 'Online');

	let picFilter = $derived(
		userData.uploadfiles.filter((item: any) => {
			return item.type == 'avatar';
		})
	);

	let closedInput = $state(true);
	const openInput = () => (closedInput = false);
	const closeInput = () => {
		closedInput = true;
	};

	let name = $state(userData.name || '');
	let surname = $state(userData.surname || '');
	let email = $state(userData.email || '');
	let address = $state(userData.address || '');
	let city = $state(userData.city || '');
	let countryState = $state(userData.countryState || ''); // provincia
	let postalCode = $state(userData.postalCode || '');
	let country = $state(userData.country || '');
	let phone = $state(userData.phone || '');
	let mobilePhone = $state(userData.mobilePhone || '');
	let membershipLevel = $state(userData.membership.membershipLevel || '');
	let membershipStatus = $state(userData.membership.membershipStatus || '');
	let membershipExpiry = $state(userData.membership.membershipExpiry || '');
	// let businessName = $state(userData.businessData.businessName || '');
	// let vatNumber = $state(userData.businessData.vatNumber || '');
	// let businessAddress = $state(userData.businessData.businessAddress || '');
	// let businessCity = $state(userData.businessData.businessCity || '');
	// let businessCounty = $state(userData.businessData.businessCounty || '');
	// let businessPostalCode = $state(userData.businessData.businessPostalCode || '');
	// let businessCountry = $state(userData.businessData.businessCountry || '');
	// let membershipArray = $state(userData.membership || []);
	let max = $state(new Date().getFullYear());
	let min = $derived(max - 90);
	let years = $state([]);
	let addressPublic = $state(userData.addressPublic || false);
	let cityPublic = $state(userData.cityPublic || false);
	let statePublic = $state(userData.statePublic || false);
	let postalCodePublic = $state(userData.postalCodePublic || false);
	// let regionPublic = userData.regionPublic || false;
	let countryPublic = $state(userData.countryPublic || false);
	let phonePublic = $state(userData.phonePublic || false);
	let mobilePhonePublic = $state(userData.mobilePhonePublic || false);
	let namePublic = $state(userData.namePublic || false);
	let surnamePublic = $state(userData.surnamePublic || false);
	let emailPublic = $state(userData.emailPublic || false);
	let level = $state(userData.level || '');

	for (let i = max; i >= min; i--) {
		years.push(i);
	}

	let resetState = $state(false);

	const enableReset = () => (resetState = !resetState);

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

	// profile pic upload
	const upload = create_upload();
	let is_upload_submitting = $state(false);
	const progress = $state(
		tweened(0, {
			duration: 400,
			easing: cubicOut
		})
	);
	progress.set($upload.progress / 100);

	/** @param {SubmitEvent} event */

	const onFileUpload = async (event: SubmitEvent, inputId: string): Promise<void> => {
		event.preventDefault();
		is_upload_submitting = true;

		const target: any = /** @type {EventTarget & HTMLFormElement} */ (event.target);
		const file = /** @type {any} */ (target.elements)[inputId].files[0]; // NOTE: (target.elements).{INPUT ID}.files[0]
		const headers = { 'x-file-name': file.name, 'x-folder-name': userData.userId }; // NOTE: change folder name to userid

		// await upload.start({ url: '/api/uploads/files', file, headers });
		const response: any = await upload.start({ url: '/api/uploads/files', file, headers });
		// console.log('response up file', response);
		// console.log('response.status:', typeof response.status, response.status);
		if (response.status == 200) {
			//// update DB with file path
			const responseUpdate = await fetch(
				`${import.meta.env.VITE_BASE_URL}/api/users/update-photo`,
				{
					method: 'POST',
					body: JSON.stringify({
						fileName: file.name,
						email, // filter in DB
						type: inputId,
						action: 'new'
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
			const res = await responseUpdate.json();
			// console.log('responseUpdate up db', responseUpdate);
			// console.log('responseUpdate.status:', typeof responseUpdate.status, responseUpdate.status);
			if (responseUpdate.status == 200) {
				let content = res.message;
				toastClosed = false;
				notificationContent = content;
				invalidateAll();
				progress.set(0);
				// Reset file input
				target.reset();
				is_upload_submitting = false;
				closeNotification();
			} else {
				let error = res.message;
				toastClosed = false;
				notificationContent = error;
				notificationError = true;
				invalidateAll();
				progress.set(0);
				// Reset file input
				target.reset();
				is_upload_submitting = false;
			}
		}

		invalidateAll();
		progress.set(0);
		// Reset file input
		target.reset();
		is_upload_submitting = false;
	};
	// end profile pic upload

	// pic delete
	const onPicDelete = async (fileName: any, inputId: any) => {
		// remove from DB
		const responseUpdate = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/update-photo`, {
			method: 'POST',
			body: JSON.stringify({
				fileName,
				email, // filter in DB
				type: inputId,
				action: 'delete'
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (responseUpdate.status == 200) {
			let content = (await responseUpdate.json()).message;
			toastClosed = false;
			notificationContent = content;
			closeNotification();
			invalidateAll();
			is_upload_submitting = false;
		} else {
			let error = (await responseUpdate.json()).message;
			toastClosed = false;
			notificationContent = error;
			notificationError = true;
			invalidateAll();
			is_upload_submitting = false;
		}
		// remove from disk
		const responseDelete = await fetch(`${import.meta.env.VITE_BASE_URL}/api/uploads/files`, {
			method: 'DELETE',
			body: JSON.stringify({
				userId: userData.userId,
				fileName: fileName
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (responseDelete.status != 200) {
			let error = (await responseDelete.json()).message;
			toastClosed = false;
			notificationContent = error;
			notificationError = true;
		}
	};

	// notification
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
	if (!userData.name && !userData.surname) {
		toastClosed = false;
		notificationContent = 'Registrazione effettuta, completare il profilo';
	}

	const imgSrc = (value: string) => {
		const src = $coursesInfo.filter((item: any) => item.id == value);
		return src[0]?.urlPic || '/images/picture.png';
	};

	$effect(() => {
		if (form != null) {
			async () => await invalidateAll();
			const { action, success, message } = form;
			if (success) {
				closeNotification();
				closedInput = true;
				// console.log('userData', userData);
			} else {
				notificationError = true;
			}
			toastClosed = false;
			notificationContent = message;
		}
	}); // end effect
</script>

<svelte:head>
	<title>Area personale</title>
</svelte:head>

<div class="grid grid-cols-12 bg-gray-200 lg:gap-x-12 p-4 lg:p-8">
	<!--section 1: profilo + dettagli fatturazione-->
	<section class="card col-span-12 xl:col-span-6 gap-y-8 rounded-lg bg-white">
		<!-- PROFILO -->
		<form class="card-body pt-1" action="?/modifyUser" method="POST" use:enhance>
			<div class="card-title bg-gray-400 glass font-bold flex justify-between p-3 my-4 rounded-lg">
				<span> Profilo</span>

				{#if closedInput}
					<button
						class="btn btn-outline btn-sm btn-neutral rounded-lg border-2"
						onclick={openInput}
					>
						<Settings size="24" />Modifica
					</button>
				{:else}
					<div class="flex space-x-4">
						<button
							class="btn btn-outline btn-sm btn-error rounded-lg flex-1 min-w-[110px] border-2"
							onclick={closeInput}
							type="button"
						>
							<X size="24" />Annulla
						</button>
						<button
							class="btn btn-outline btn-sm btn-success rounded-lg flex-1 min-w-[110px] border-2"
							type="submit"
						>
							<Check size="24" />Salva
						</button>
					</div>
				{/if}
			</div>

			<fieldset disabled={closedInput} class="grid grid-cols-12 gap-x-4 gap-y-8">
				<!-- UserId -->
				<div class="form-control col-span-12 md:col-span-12">
					<label for="userId" class="form-label">
						<div class="flex flex-col gap-4">
							<span class="label-text font-bold">ID utente</span>
							<input
								class="input input-bordered join-item w-full"
								id="userId"
								name="userId"
								type="text"
								bind:value={userData.userId}
								readonly
							/>
						</div>
					</label>
				</div>

				<!-- <input type="hidden" name="userId" value={userData.userId} /> -->
				<!-- Nome -->
				<div class="form-control col-span-12 md:col-span-6">
					<label for="name" class="form-label">
						<div class="flex items-center justify-between gap-4">
							<span class="label-text font-bold">Nome</span>
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
						</div>
						<input
							id="name"
							name="name"
							type="text"
							class="input input-bordered w-full rounded-md mt-2"
							placeholder="Nome..."
							required
							readonly={closedInput}
							class:is-static={closedInput}
							bind:value={userData.name}
						/>
					</label>
				</div>
				<!-- Cognome -->
				<div class="form-control col-span-12 md:col-span-6">
					<label for="surname" class="form-label">
						<div class="flex items-center justify-between gap-4">
							<span class="label-text font-bold">Cognome</span>
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
						</div>
						<input
							id="surname"
							name="surname"
							type="text"
							class="input input-bordered w-full rounded-md mt-2"
							placeholder="Cognome..."
							required
							readonly={closedInput}
							class:is-static={closedInput}
							bind:value={userData.surname}
						/>
					</label>
				</div>
				<!-- Email -->
				<div class="form-control col-span-12">
					<label for="email" class="form-label">
						<div class="flex items-center justify-between gap-4">
							<span class="label-text font-bold">Email</span>
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
						</div>
						<input
							id="email"
							name="email"
							type="email"
							class="input input-bordered w-full rounded-md mt-2"
							placeholder="Email..."
							required
							readonly={closedInput}
							class:is-static={closedInput}
							bind:value={userData.email}
						/>
					</label>
				</div>
				<!-- Indirizzo -->
				<div class="form-control col-span-12">
					<label for="address" class="form-label">
						<div class="flex items-center justify-between gap-4">
							<span class="label-text font-bold">Indirizzo</span>
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
						</div>
						<input
							id="address"
							name="address"
							type="text"
							class="input input-bordered w-full rounded-md mt-2"
							placeholder="Indirizzo..."
							required
							readonly={closedInput}
							class:is-static={closedInput}
							bind:value={userData.address}
						/>
					</label>
				</div>
				<!-- Città -->
				<div class="form-control col-span-12 md:col-span-6">
					<label for="city" class="form-label">
						<div class="flex items-center gap-4 justify-between">
							<span class="label-text font-bold">Città</span>
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
						</div>
						<input
							id="city"
							name="city"
							type="text"
							class="input input-bordered w-full rounded-md mt-2"
							placeholder="Città..."
							required
							readonly={closedInput}
							class:is-static={closedInput}
							bind:value={userData.city}
						/>
					</label>
				</div>
				<!-- Provincia -->
				<div class="form-control col-span-12 md:col-span-6">
					<label for="state" class="form-label">
						<div class="flex items-center gap-4 justify-between">
							<span class="label-text font-bold">Provincia</span>
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
						</div>
						<!-- name="state" -->
						<select
							id="countryState"
							class="select select-bordered w-full rounded-md mt-2"
							name="countryState"
							placeholder="Scegli"
							required
							disabled={closedInput}
							bind:value={userData.countryState}
						>
							<option selected disabled>Scegli</option>
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
						</div>
						<input
							id="postalCode"
							name="postalCode"
							type="text"
							class="input input-bordered w-full rounded-md mt-2"
							placeholder="CAP..."
							required
							readonly={closedInput}
							class:is-static={closedInput}
							bind:value={userData.postalCode}
						/>
					</label>
				</div>
				<!-- Nazione -->
				<div class="form-control col-span-12 md:col-span-6">
					<label for="country" class="form-label">
						<div class="flex items-center gap-4 justify-between">
							<span class="label-text font-bold">Nazione</span>
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
						</div>
						<select
							id="country"
							class="select select-bordered w-full rounded-md mt-2"
							name="country"
							placeholder="Scegli"
							required
							disabled={closedInput}
							bind:value={userData.country}
						>
							<option selected disabled>Scegli</option>
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
						</div>
						<input
							id="telefono"
							name="phone"
							type="text"
							class="input input-bordered w-full rounded-md mt-2"
							placeholder="Telefono..."
							required
							readonly={closedInput}
							bind:value={userData.phone}
						/>
					</label>
				</div>
				<!-- Cellulare -->
				<div class="form-control col-span-12 md:col-span-6">
					<label for="cellulare" class="form-label">
						<div class="flex items-center gap-4 justify-between">
							<span class="label-text font-bold">Cellulare</span>
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
						</div>
						<input
							id="cellulare"
							name="mobilePhone"
							type="text"
							class="input input-bordered w-full rounded-md mt-2"
							placeholder="Telefono..."
							required
							readonly={closedInput}
							class:is-static={closedInput}
							bind:value={userData.mobilePhone}
						/>
					</label>
				</div>
				<!-- level -->
				<div class="form-control col-span-12 md:col-span-12">
					<label for="userId" class="form-label">
						<div class="flex flex-col gap-4">
							<span class="label-text font-bold">Livello</span>
							<input
								class="input input-bordered join-item w-full"
								id="level"
								name="level"
								type="text"
								bind:value={userData.level}
								readonly
							/>
						</div>
					</label>
				</div>
			</fieldset>
		</form>
		<!-- end PROFILO -->

		<div class="card-footer bg-transparent flex justify-center p-2">
			<button class="btn btn-outline btn-sm btn-info rounded-lg border-2" onclick={enableReset}
				><span>Reset password</span>
			</button>
		</div>
	</section>
	<!-- section 2: immagine ecc -->
	<section class="card col-span-12 xl:col-span-6 gap-y-4 rounded-lg bg-white">
		<div
			class="card-title bg-gray-400 glass font-bold flex justify-between p-3 mx-4 mt-4 rounded-lg"
		>
			<span> Immagine Profilo</span>
			{#if picFilter.length > 0}
				<button
					class="btn btn-outline btn-sm btn-neutral rounded-lg border-2"
					onclick={() => onPicDelete(picFilter[0].filename, 'avatar')}
				>
					<Trash2 size="24" />Elimina
				</button>
			{/if}
		</div>
		<div class="card-body pt-1">
			<form class="card-body" onsubmit={(e) => onFileUpload(e, 'avatar')}>
				{#if picFilter.length == 0}
					<div class="form-control mx-auto">
						<label class="form-control">
							<div class="join">
								<input
									type="file"
									id="avatar"
									name="avatar"
									placeholder="logo"
									accept=".jpg, .jpeg, .png, .webp"
									class="file-input file-input-bordered w-full max-w-xs join-item"
									required
								/>
								<button class="btn join-item rounded-r-full bg-blue-600 text-white" type="submit"
									>{#if is_upload_submitting}
										Uploading... {$upload.progress}%
									{:else}
										Upload
									{/if}
								</button>
							</div>
						</label>
					</div>
				{/if}

				<figure>
					{#if picFilter[0]?.type == 'avatar'}
						<img
							src={`/files/${userData.userId}/${picFilter[0].filename}`}
							alt="avatar"
							class="object-cover rounded-md"
						/>
					{/if}
				</figure>
			</form>
			<hr />
			<div class="card-body">
				<span class=" py-2 text-xl">
					<strong>Associato:</strong> <br />
				</span>
				<span class="flex items-center space-x-2 mb-4">
					<button class="btn btn-md bg-indigo-200 rounded-full hover:bg-yellow-400">
						<Award size="30" color="orange" strokeWidth={2.5} />
					</button>
					<span class="ml-4">
						Livello: <b>{membershipLevel}</b> | Status:
						<b>{membershipStatus ? 'Attivo' : 'Inattivo'}</b>
						{#if userData.membership.membershipLevel == 'Socio ordinario'}
							| Scadenza:
							<b>{membershipExpiry}</b>
						{/if}
					</span>
				</span>
			</div>
			<hr />
			<div class="card-body">
				<p class="font-bold text-xl">Storico ordini:</p>
				{#each orderData as order}
					<div class="bg-indigo-200 my-4 p-6 rounded-lg shadow-lg">
						<div class="flex justify-between items-center mb-4">
							<div class="text-orange-600 text-lg font-bold">
								<span class="block"
									>Data: <span class="text-gray-800">{order.createdAt.substring(0, 10)}</span></span
								>
							</div>
							<div class="text-orange-600 text-sm font-medium">
								<span class="block"
									>Ordine ID: <span class="text-gray-900">{order.orderId}</span></span
								>
							</div>
						</div>
						{#each order.cart as course}
							<div class="flex items-center space-x-4 mb-3">
								<img
									src={imgSrc(course.category[0])}
									alt="Immagine corso"
									class="w-16 h-16 object-cover rounded-md"
								/>
								<div class="font-semibold">
									<b>{course.title}</b> <br />
									<span class="text-gray-600 text-sm">
										{course.eventStartDate.substring(0, 10)} - {course.countryState} -
										{course.name}
										{course.surname}
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</section>
</div>
<Notification {toastClosed} {notificationContent} {notificationError} />

<style>
	/* CSS */
</style>
