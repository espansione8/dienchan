<script lang="ts">
	let { data } = $props();
	let { getUser } = $derived(data);
	import {
		Mail,
		MapPin,
		Globe,
		Phone,
		Smartphone,
		Printer,
		Building2,
		Landmark,
		MapPinned,
		Leaf,
		Heart
	} from 'lucide-svelte';

	let picFilter = $derived(
		getUser.uploadfiles.filter((item: any) => {
			return item.type == 'profile';
		})
	);

	let userfiles = $derived(getUser.uploadfiles);
	let findAvatar = $derived(userfiles.filter((file: any) => file.type === 'profile'));

	// Get first letter of name and surname for avatar fallback
	const getInitials = () => {
		let initials = '';
		if (getUser.namePublic && getUser.name) {
			initials += getUser.name.charAt(0);
		}
		if (getUser.surnamePublic && getUser.surname) {
			initials += getUser.surname.charAt(0);
		}
		return initials || '?';
	};
</script>

<svelte:head>
	<title
		>{getUser.namePublic ? getUser.name : ''}
		{getUser.surnamePublic ? getUser.surname : ''} | Dienchan</title
	>
</svelte:head>

<noscript>
	<h1 style="font-weight:700; text-align: center;">Please enable Javascript to continue.</h1>
	<style type="text/css">
		#main-content {
			display: none;
		}
	</style>
</noscript>

<div
	class="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-teal-50 to-emerald-50"
>
	<div class="max-w-2xl w-full perspective">
		<!-- Business Card -->
		<div class="card-container relative">
			<div
				class="business-card bg-white rounded-lg shadow-lg overflow-hidden border border-teal-100 transform transition-all duration-500"
			>
				<!-- Card Content with proper business card ratio -->
				<div class="flex flex-col md:flex-row h-full">
					<!-- Left Side - Photo and Name -->
					<div
						class="md:w-1/3 bg-gradient-to-br from-teal-500 to-emerald-500 p-6 relative flex flex-col items-center justify-center text-white h-full"
					>
						<div class="absolute top-0 right-0">
							<Leaf class="text-white/20 h-24 w-24 -mr-6 -mt-6 rotate-45" />
						</div>
						<div class="absolute bottom-0 left-0">
							<Heart class="text-white/20 h-16 w-16 -ml-6 -mb-6" />
						</div>

						<!-- Avatar -->
						<div class="avatar mb-4">
							<div
								class="w-24 h-24 rounded-full ring ring-white ring-offset-teal-500 ring-offset-2 bg-teal-100 flex items-center justify-center overflow-hidden"
							>
								<img
									src={`/images/dienchan_logo.jpg`}
									alt="Profile"
									class="w-full h-full object-contain"
								/>
							</div>
						</div>

						<!-- Name and Title -->
						<div class="text-center">
							<h1 class="text-xl font-bold mb-1">
								{#if getUser.namePublic === true || getUser.surnamePublic === true}
									{#if getUser.namePublic === true}
										{getUser.name}
									{/if}
									{#if getUser.surnamePublic === true}
										{getUser.surname}
									{/if}
								{:else}
									<span class="italic">Nome riservato</span>
								{/if}
							</h1>
							<div class="font-medium text-teal-50">Operatore del Benessere</div>

							<div class="flex justify-center mt-3 flex-wrap gap-2">
								<div class="badge badge-xl bg-teal-700 border-none text-teal-50">Diện Chẩn</div>
							</div>
							<div class="avatar mt-4">
								<div
									class="w-24 h-24 rounded-full ring ring-white ring-offset-teal-500 ring-offset-2 bg-teal-100 flex items-center justify-center overflow-hidden"
								>
									{#if findAvatar.length > 0}
										<!-- <img
										src={`/files/${getUser.userId}/${picFilter[0].fileName}`}
										alt="Profile"
										class="w-full h-full object-contain"
									/> -->
										<img
											src={picFilter.length > 0
												? `/files/user/${getUser.userId}/${picFilter[0].fileName}`
												: '/images/placeholder.jpg'}
											alt="Profile"
											class="object-cover w-full h-full"
										/>
									{:else}
										<!-- <span class="text-3xl font-bold text-teal-600">{getInitials()}</span> -->
										<img
											src={`/images/dienchan.jpg`}
											alt="Profile"
											class="w-full h-full object-contain"
										/>
									{/if}
								</div>
							</div>
						</div>
					</div>

					<!-- Right Side - Contact Information -->
					<div class="md:w-2/3 p-4 flex flex-col h-full">
						<h2 class="text-lg font-semibold text-teal-600 mb-3">Informazioni di Contatto</h2>

						<!-- Contact Information Grid -->
						<div class="grid grid-cols-1 gap-3 text-sm flex-grow">
							{#if getUser.emailPublic === true}
								<div class="flex items-center">
									<div class="bg-teal-100 p-2 rounded-full mr-3">
										<Mail size={16} class="text-teal-600" />
									</div>
									<div>
										<div class="text-gray-500 text-xs">Email</div>
										<div class="text-gray-700">{getUser.email}</div>
									</div>
								</div>
							{/if}

							{#if getUser.phonePublic === true}
								<div class="flex items-center">
									<div class="bg-teal-100 p-2 rounded-full mr-3">
										<Phone size={16} class="text-teal-600" />
									</div>
									<div>
										<div class="text-gray-500 text-xs">Telefono</div>
										<div class="text-gray-700">{getUser.phone}</div>
									</div>
								</div>
							{/if}

							{#if getUser.mobilePhonePublic === true}
								<div class="flex items-center">
									<div class="bg-teal-100 p-2 rounded-full mr-3">
										<Smartphone size={16} class="text-teal-600" />
									</div>
									<div>
										<div class="text-gray-500 text-xs">Cellulare</div>
										<div class="text-gray-700">{getUser.mobilePhone}</div>
									</div>
								</div>
							{/if}

							{#if getUser.addressPublic === true && getUser.cityPublic === true}
								<div class="flex items-center">
									<div class="bg-teal-100 p-2 rounded-full mr-3">
										<MapPin size={16} class="text-teal-600" />
									</div>
									<div>
										<div class="text-gray-500 text-xs">Indirizzo</div>
										<div class="text-gray-700">{getUser.address}, {getUser.city}</div>
									</div>
								</div>
							{/if}

							{#if getUser.postalCodePublic === true && getUser.countyPublic === true}
								<div class="flex items-center">
									<div class="bg-teal-100 p-2 rounded-full mr-3">
										<MapPinned size={16} class="text-teal-600" />
									</div>
									<div>
										<div class="text-gray-500 text-xs">CAP / Provincia</div>
										<div class="text-gray-700">{getUser.postalCode}, {getUser.county}</div>
									</div>
								</div>
							{/if}

							{#if getUser.countryPublic === true}
								<div class="flex items-center">
									<div class="bg-teal-100 p-2 rounded-full mr-3">
										<Globe size={16} class="text-teal-600" />
									</div>
									<div>
										<div class="text-gray-500 text-xs">Nazione</div>
										<div class="text-gray-700">{getUser.country}</div>
									</div>
								</div>
							{/if}
						</div>

						<!-- Card Footer -->
						<div class="mt-2 pt-2 border-t border-gray-200">
							<div class="text-xs text-gray-500 text-center">
								Professionista certificato Diện Chẩn Bùi Quốc Châu ®
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Print Button -->
		<!-- <div class="mt-6 text-center">
			<button class="btn btn-sm btn-outline btn-primary gap-2" onclick={() => window.print()}>
				<Printer />
				Stampa contatto
			</button>
		</div> -->
	</div>
</div>

<style>
	.perspective {
		perspective: 1000px;
	}

	.business-card {
		transform-style: preserve-3d;
		box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
		/* Standard business card ratio approximately 3.5:2 */
		aspect-ratio: 1.75 / 1;
		display: flex;
	}

	.business-card:hover {
		box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.15);
		transform: translateY(-5px) rotateX(2deg);
	}

	@media print {
		.btn {
			display: none !important;
		}

		body {
			background: white !important;
		}

		.business-card {
			box-shadow: none !important;
			border: 1px solid #ddd !important;
			transform: none !important;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.business-card {
			aspect-ratio: auto;
		}
	}
</style>
