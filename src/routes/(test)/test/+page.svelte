<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Notification from '$lib/components/Notification.svelte';
	import DragDrop from '$lib/components/DragDrop.svelte';
	import { province, country_list } from '$lib/stores/arrays.js';
	import {
		Settings,
		X,
		Check,
		Eye,
		EyeOff,
		Trash2,
		Award,
		Mail,
		House,
		Landmark,
		Earth,
		Phone,
		Smartphone,
		Hash,
		Building2,
		FolderOpen
	} from 'lucide-svelte';

	let { data, form } = $props();
	let { orderData } = $derived(data);

	const userData = {
		membership: {
			senior: '',
			membershipStatus: true,
			membershipSignUp: {
				$date: '2025-02-19T23:54:10.922Z'
			},
			membershipActivation: {
				$date: '2025-02-19T23:54:10.922Z'
			},
			membershipExpiry: {
				$date: '2026-02-19T23:54:10.922Z'
			},
			membershipLevel: 'Socio inattivo'
		},
		businessData: {
			businessName: '',
			vatNumber: '',
			businessCategory: '',
			businessAddress: '',
			businessCity: '',
			businessPostalCode: '',
			businessState: '',
			businessCountry: '',
			businessCounty: '',
			numberEmployed: 0,
			grossIncome: '',
			role: ''
		},
		card: {
			cardId: '',
			cardCode: '',
			cardActivation: null,
			cardExpiry: null,
			cardStatus: false
		},
		userId: '4184122015',
		userCode: '',
		status: 'enabled',
		token: '',
		cookieId: '0b054097-09cb-40f6-9ea5-e32a0357e7d7',
		promotions: [],
		codeSales: '',
		codeManager: '',
		codeSupervisor: '',
		codeAgency: '',
		codeSponsor: '',
		codeAdmin: '',
		codeSuperAdmin: '',
		name: 'Jon3',
		namePublic: true,
		surname: 'Doe',
		surnamePublic: true,
		category: '',
		address: '1600 Fake Street, 40',
		addressPublic: true,
		city: 'Mountain View',
		cityPublic: true,
		postalCode: '80732',
		postalCodePublic: true,
		statePublic: true,
		region: '',
		regionPublic: false,
		country: 'Italy',
		countryPublic: true,
		language: '',
		mobilePhone: '13131313',
		mobilePhonePublic: true,
		phone: '13131313',
		phonePublic: true,
		email: 'admin@admin.admin',
		emailPublic: true,
		documentUpload: '',
		photoUpload: '',
		gender: '',
		birthdate: '',
		socialSecurityNumber: '',
		username: '',
		password: '5079ead932f0ad7d27bc050d1f5a276bc18580d708b514d83e6f6594661268d3',
		pointsSpent: 0,
		pointsBalance: 0,
		pointsTotal: 0,
		pointsBalanceDate: null,
		userAvatar: '',
		privacyDate: null,
		privacyAccept: '',
		revenue: 0,
		target0: 0,
		target1: 0,
		target2: 0,
		target3: 0,
		target4: 0,
		target5: 0,
		target6: 0,
		target7: 0,
		target8: 0,
		target9: 0,
		target10: 0,
		target11: 0,
		target12: 0,
		extra0: '',
		extra1: '',
		extra2: '',
		extra3: '',
		extra4: '',
		extra5: '',
		extra6: '',
		extra7: '',
		extra8: '',
		extra9: '',
		extra10: '',
		extra11: '',
		extra12: '',
		extraFieldNumber1: 0,
		extraFieldNumber2: 0,
		extraFieldNumber3: 0,
		extraFieldNumber4: 0,
		extraFieldNumber5: 0,
		extraFieldNumber6: 0,
		extraFieldNumber7: 0,
		extraFieldNumber8: 0,
		extraFieldNumber9: 0,
		extraFieldNumber10: 0,
		extraFieldNumber11: 0,
		extraFieldNumber12: 0,
		extraFieldNumber13: 0,
		extraFieldNumber14: 0,
		extraFieldNumber15: 0,
		extraFieldNumber16: 0,
		extraFieldNumber17: 0,
		extraFieldNumber18: 0,
		extraFieldNumber19: 0,
		extraFieldNumber20: 0,
		extraFieldNumber21: 0,
		extraFieldNumber22: 0,
		extraFieldNumber23: 0,
		extraFieldNumber24: 0,
		extraFieldText1: '"21"',
		extraFieldText2: '',
		extraFieldText3: '',
		extraFieldText4: '',
		extraFieldText5: '',
		extraFieldText6: '',
		extraFieldText7: '',
		extraFieldText8: '',
		extraFieldText9: '',
		extraFieldText10: '',
		extraFieldText11: '',
		extraFieldText12: '',
		extraFieldText13: '',
		extraFieldText14: '',
		extraFieldText15: '',
		extraFieldText16: '',
		extraFieldText17: '',
		extraFieldText18: '',
		extraFieldText19: '',
		extraFieldText20: '',
		extraFieldText21: '',
		extraFieldText22: '',
		extraFieldText23: '',
		extraFieldText24: '',
		lastAccess: null,
		counterAccess: 0,
		remoteIP: '',
		remoteHost: '',
		remoteBrowser: '',
		notesOnUser: '',
		userCart: [],
		userWishList: [],
		documentPageArray: [],
		storicoCorsiPartecipati: [],
		storicoCorsiCreati: [],
		docModifyArray: [],
		uploadfiles: [],
		createdAt: {
			$date: '2025-02-19T23:54:10.792Z'
		},
		updatedAt: {
			$date: '2025-05-21T13:53:45.168Z'
		},
		__v: 0,
		level: 'superadmin',
		county: 'Brescia'
	};

	// remove online in province
	let provinceFilterate = $province.filter((p) => p.title !== 'Online');

	let closedInput = $state(true);
	const picFilter = $derived(userData.uploadfiles.filter((item: any) => item.type == 'avatar'));
	const openInput = () => (closedInput = false);
	const closeInput = () => {
		closedInput = true;
		refreshFields();
		invalidateAll();
	};

	let name = $state(userData.name || '');
	let surname = $state(userData.surname || '');
	let address = $state(userData.address || '');
	let city = $state(userData.city || '');
	let countryState = $state(userData.county || ''); // provincia
	let postalCode = $state(userData.postalCode || '');
	let country = $state(userData.country || '');
	let phone = $state(userData.phone || '');
	let mobilePhone = $state(userData.mobilePhone || '');
	let email = $state(userData.email || '');
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
	let statePublic = $state(userData.countyPublic || false);
	let postalCodePublic = $state(userData.postalCodePublic || false);
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
			// is_upload_submitting = false;
		} else {
			let error = (await responseUpdate.json()).message;
			toastClosed = false;
			notificationContent = error;
			notificationError = true;
			invalidateAll();
			// is_upload_submitting = false;
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

	const refreshFields = () => {
		namePublic = userData.namePublic;
		surnamePublic = userData.surnamePublic;
		emailPublic = userData.emailPublic;
		addressPublic = userData.addressPublic;
		cityPublic = userData.cityPublic;
		statePublic = userData.countyPublic;
		postalCodePublic = userData.postalCodePublic;
		countryPublic = userData.countryPublic;
		phonePublic = userData.phonePublic;
		mobilePhonePublic = userData.mobilePhonePublic;
	};

	$effect(() => {
		if (form != null) {
			async () => await invalidateAll();
			const { action, success, message } = form;
			if (success) {
				closedInput = true;
				// console.log('userData', userData);
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
		}, 3000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer
	if (!userData.name && !userData.surname) {
		toastClosed = false;
		notificationContent = 'Registrazione effettuta, completare il profilo';
	}

	// DRAG & DROP FILE UPLOAD
	// import { FolderOpen } from "lucide-svelte";
	let fileInput = $state();
	let previewUrl: string | null = $state(null);
	let isDragging = $state(false);
	let dragCounter = $state(0);

	const handleDragEnter = (e) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter++;
		isDragging = true;
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter--;
		if (dragCounter === 0) {
			isDragging = false;
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging = true;
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;
		dragCounter = 0;

		const files = e.dataTransfer.files;
		if (files.length) {
			const file = files[0];
			// Check file type
			if (file.type.match(/^image\/(jpg|jpeg|png|webp)$/)) {
				fileInput.files = files; // Update the input's files
				previewUrl = URL.createObjectURL(file);
			}
		}
	};
</script>

<svelte:head>
	<title>Area personale</title>
</svelte:head>

<div class="grid grid-cols-12 bg-gray-200 lg:gap-x-12 p-4 lg:p-8">
	<!--section 1: profilo + dettagli fatturazione-->
	<section class="card col-span-12 xl:col-span-6 gap-y-8 rounded-lg bg-white">
		<div class="p-5">
			<div class="flex flex-col sm:flex-row border-2 border-gray-300 rounded-lg">
				<div class="card-body w-1/2 p-4 flex flex-col items-center">
					<!-- img -->
					{#if picFilter.length > 0 && picFilter[0]?.type == 'avatar'}
						<figure class="mt-4">
							<img
								src={`/files/user/${userData.userId}/${picFilter[0].filename}`}
								alt="avatar"
								class="object-cover rounded-md"
							/>
						</figure>
						<form class="card-body w-full" method="POST" action={`?/delProfilePic`} use:enhance>
							<input type="hidden" name="userId" value={userData.userId} />
							<input type="hidden" name="fileName" value={picFilter[0].filename} />
							<button
								class="btn btn-sm btn-error rounded-lg border-2"
								type="submit"
								onclick={() => {
									if (previewUrl) URL.revokeObjectURL(previewUrl); // Clean up the object URL
									previewUrl = null;
									fileInput.value = ''; // Reset the file input
								}}
							>
								<Trash2 size="24" />Elimina foto
							</button>
						</form>
					{:else}
						<form
							action={`?/setProfilePic`}
							method="POST"
							enctype="multipart/form-data"
							use:enhance
							class="card-body w-full"
						>
							<input type="hidden" name="userId" value={userData.userId} />
							<DragDrop />
							<button class="btn btn-sm btn-info rounded-lg border-2" type="submit">
								Upload foto
							</button>
						</form>
					{/if}
					<!-- img end -->
				</div>
				<div class="card-body p-6 w-1/2">
					<h1 class="text-2xl font-bold text-gray-800 mb-4">
						{#if userData.namePublic === true}
							{userData.name}
						{/if}
						{#if userData.surnamePublic === true}
							{userData.surname}
						{/if}
						{#if userData.surnamePublic === false && userData.namePublic === false}
							nome privato
						{/if}
					</h1>
					<a href={`/profile-public/${userData.userId}`} class="btn btn-sm w-1/2 mb-4">
						Anteprima profilo
					</a>
					<hr class="border-t-2 border-gray-300 my-4" />
					<div class="space-y-2">
						{#if userData.emailPublic === true}
							<div class="flex items-center">
								<Mail class="mr-2" color="gray" />
								<h5 class="text-gray-600"><b>Email:</b> {userData.email}</h5>
							</div>
						{/if}
						{#if userData.addressPublic === true}
							<div class="flex items-center">
								<House class="mr-2" color="gray" />
								<h5 class="text-gray-600"><b>Indirizzo:</b> {userData.address}</h5>
							</div>
						{/if}
						{#if userData.cityPublic === true}
							<div class="flex items-center">
								<Landmark class="mr-2" color="gray" />
								<h5 class="text-gray-600"><b>Città:</b> {userData.city}</h5>
							</div>
						{/if}
						{#if userData.postalCodePublic === true}
							<div class="flex items-center">
								<Hash class="mr-2" color="gray" />
								<h5 class="text-gray-600"><b>CAP:</b> {userData.postalCode}</h5>
							</div>
						{/if}
						{#if userData.countyPublic === true}
							<div class="flex items-center">
								<Building2 class="mr-2" color="gray" />
								<h5 class="text-gray-600"><b>Provincia:</b> {userData.county}</h5>
							</div>
						{/if}
						{#if userData.countryPublic === true}
							<div class="flex items-center">
								<Earth class="mr-2" color="gray" />
								<h5 class="text-gray-600"><b>Nazione:</b> {userData.country}</h5>
							</div>
						{/if}
						{#if userData.phonePublic === true}
							<div class="flex items-center">
								<Phone class="mr-2" color="gray" />
								<h5 class="text-gray-600"><b>Telefono:</b> {userData.phone}</h5>
							</div>
						{/if}
						{#if userData.mobilePhonePublic === true}
							<div class="flex items-center">
								<Smartphone class="mr-2" color="gray" />
								<h5 class="text-gray-600"><b>Cellulare:</b> {userData.mobilePhone}</h5>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
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
							bind:value={userData.county}
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
	<!-- section 2 -->
	<section class="card col-span-12 xl:col-span-6 gap-y-4 rounded-lg bg-white">
		<div class="card-body pt-1">
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
									src={course.layoutView.urlPic || '/images/placeholder.jpg'}
									alt="Immagine corso"
									class="w-16 h-16 object-cover rounded-md"
								/>
								<div class="font-semibold">
									<b>{course.title}</b> <br />
									<span class="text-gray-600 text-sm">
										{course.eventStartDate.substring(0, 10)} - {course.county} -
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
