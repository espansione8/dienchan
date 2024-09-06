<script lang="ts">
	let { data } = $props();
	let { getUser } = $derived(data);
	import { Mail, House, Earth, Phone, Smartphone, Hash, Building2, Landmark } from 'lucide-svelte';

	let picFilter = $derived(
		getUser.uploadfiles.filter((item: any) => {
			return item.type == 'avatar';
		})
	);

	let userfiles = $derived(getUser.uploadfiles);
	let findAvatar = $derived(userfiles.filter((file: any) => file.type === 'avatar'));
</script>

<svelte:head>
	<title>{getUser.name} {getUser.surname}</title>
</svelte:head>

<noscript>
	<h1 style="font-weight:700; text-align: center;">Please enable Javascript to continue.</h1>
	<style type="text/css">
		#main-content {
			display: none;
		}
	</style>
</noscript>

<div class="flex justify-center items-center py-20 px-4 sm:px-6 lg:px-8">
	<div class="card bg-indigo-50 shadow-lg rounded-2xl border border-gray-200 max-w-4xl w-full">
		<div class="flex flex-col sm:flex-row">
			<figure class="flex-shrink-0 sm:w-1/3 p-4">
				{#if findAvatar.length > 0}
					<img
						src={`/files/${getUser.userId}/${picFilter[0].filename}`}
						alt="avatar"
						class="rounded-lg object-cover h-full"
					/>
				{/if}
			</figure>
			<div class="card-body p-6 flex-grow">
				<h1 class="text-2xl font-bold text-gray-800 mb-4">
					{#if getUser.namePublic === true}
						{getUser.name}
					{/if}
					{#if getUser.surnamePublic === true}
						{getUser.surname}
					{/if}
					{#if getUser.surnamePublic === false && getUser.namePublic === false}
						nome privato
					{/if}
				</h1>
				<hr class="border-t-2 border-gray-300 my-4" />
				<div class="space-y-2">
					{#if getUser.emailPublic === true}
						<div class="flex items-center">
							<Mail class="mr-2" color="gray" />
							<h5 class="text-gray-600"><b>Email:</b> {getUser.email}</h5>
						</div>
					{/if}
					{#if getUser.addressPublic === true}
						<div class="flex items-center">
							<House class="mr-2" color="gray" />
							<h5 class="text-gray-600"><b>Indirizzo:</b> {getUser.address}</h5>
						</div>
					{/if}
					{#if getUser.cityPublic === true}
						<div class="flex items-center">
							<Landmark class="mr-2" color="gray" />
							<h5 class="text-gray-600"><b>Città:</b> {getUser.city}</h5>
						</div>
					{/if}
					{#if getUser.postalCodePublic === true}
						<div class="flex items-center">
							<Hash class="mr-2" color="gray" />
							<h5 class="text-gray-600"><b>CAP:</b> {getUser.postalCode}</h5>
						</div>
					{/if}
					{#if getUser.statePublic === true}
						<div class="flex items-center">
							<Building2 class="mr-2" color="gray" />
							<h5 class="text-gray-600"><b>Provincia:</b> {getUser.countryState}</h5>
						</div>
					{/if}
					{#if getUser.countryPublic === true}
						<div class="flex items-center">
							<Earth class="mr-2" color="gray" />
							<h5 class="text-gray-600"><b>Nazione:</b> {getUser.country}</h5>
						</div>
					{/if}
					{#if getUser.phonePublic === true}
						<div class="flex items-center">
							<Phone class="mr-2" color="gray" />
							<h5 class="text-gray-600"><b>Telefono:</b> {getUser.phone}</h5>
						</div>
					{/if}
					{#if getUser.mobilePhonePublic === true}
						<div class="flex items-center">
							<Smartphone class="mr-2" color="gray" />
							<h5 class="text-gray-600"><b>Cellulare:</b> {getUser.mobilePhone}</h5>
						</div>
					{/if}
				</div>
				<!-- Pulsante di stampa, se necessario -->
				<!-- <div class="card-actions justify-end mt-6">
			<button class="btn btn-primary rounded-lg">Stampa biglietto da visita</button>
		  </div> -->
			</div>
		</div>
	</div>
</div>

<style>
</style>
