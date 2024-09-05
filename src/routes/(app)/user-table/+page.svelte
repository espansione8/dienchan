<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { UserPlus } from 'lucide-svelte';

	// export let data;
	// let { getTableUser } = data;
	// $: ({ getTableUser } = data); // so it stays in sync when `data` changes
	// let { checkUpdates } = data;
	// $: ({ checkUpdates } = data); // so it stays in sync when `data` changes

	let { data } = $props();
	let { getTableUser, checkUpdates } = $derived(data);

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
	<span class="flex justify-between">
		<button
			class="btn btn-success rounded-md text-white border-green-500 hover:bg-gray-200 hover:text-success hover:border-success"
			onclick={() => onGotoNewUser()}><UserPlus /> Nuovo utente</button
		>
		<header class="text-center text-2xl font-bold text-gray-700">Lista utenti</header>
		<button class="btn btn-success invisible"><UserPlus /> Scarica CSV</button>
	</span>
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
			{#if getTableUser.length == 0}
				<tr class="hover:bg-gray-300"><td> no data</td></tr>
			{/if}
			{#each getTableUser as row, i}
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
						<span>Scadenza:</span> <strong>{row.createdAt}</strong>
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
</div>
