# Svelte 5 / SvelteKit Coding Standard
## this is the sample code for the Backend coding page.server.ts, variable names, values and strings may vary for different files
 ```js
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'
import { customAlphabet } from 'nanoid'
import { pageAuth } from '$lib/pageAuth';

const apiKey = import.meta.env.VITE_APIKEY;
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	try {
		const query = { type: 'membership' }; //IF USE Products.model -> types: course / product / membership / event
		const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'product', //product | order | user | layout | discount
				query,
				projection,
				sort,
				limit,
				skip
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const response = await res.json();
		getTable = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

	} catch (error) {
		console.log('membershipfetch error:', error);
	}

	// const user = locals.user
	// if (locals.auth) {
	// 	user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
	// 	user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
	// 	user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	// }
	return {
		getTable,
		// auth: locals.auth,
		// userData: user,
	};
}

export const actions: Actions = {
	new: async ({ request, fetch, locals }) => {
		const userId = locals.user.userId
		const formData = await request.formData();
		const title = formData.get('title');
		const descrShort = formData.get('descrShort');
		const category = formData.get('category') || '';
		const price = formData.get('price');
		const prodImage = formData.get('image') || '';
		const renewalLength = formData.get('renewalLength');

		if (!title || !price || !renewalLength || !userId) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}
		//console.log('new', title, descrShort, price, renewalLength, userId);
		try {

			const prodId = nanoid() // OLD stringHash(crypto.randomUUID());
			const returnObj = false
			const newDoc = {
				prodId,
				title,
				descrShort,
				stockQty: 1,
				category: [category],
				price,
				uploadfiles: [
					{
						_id: false,
						type: 'membership', //'product-primary', 'product-gallery', 'membership', 'course'
						filetype: prodImage.type,
						filename: prodImage.name,
						fileUrl: `product/${prodId}/${prodImage.name}`
					}
				],
				type: 'membership',
				renewalLength,
				userId,
			};
			const uploadImg = await fetch(`${import.meta.env.VITE_BASE_URL}/api/uploads/files`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-file-name': prodImage.name,
					'x-folder-name': `product/${prodId}`
				},
				body: prodImage
			});
			if (uploadImg.status != 200) return { action: 'new', success: fail, message: 'errore file upload' };

			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					newDoc,
					returnObj
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();

			if (res.status == 200) {
				return { action: 'new', success: true, message: response.message };
			} else {
				return { action: 'new', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error creating new membership:', error);
			return { action: 'new', success: false, message: 'Errore creazione membership' };
		}
	},

	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const title = formData.get('title') || '';
		const price = formData.get('price');
		const renewalLength = formData.get('renewalLength');
		const descrShort = formData.get('descrShort') || '';

		if (!prodId || !title || !price || !renewalLength) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		try {
			const query = { prodId, type: 'membership' }; // 'course', 'product', 'membership', 'event'
			const update = {
				$set: {
					prodId,
					title,
					descrShort,
					price,
				}
			};
			const options = { upsert: false }
			const multi = false

			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();
			//console.log('response.message', response);

			if (res.status == 200) {
				return { action: 'modify', success: true, message: response.message };
			} else {
				return { action: 'modify', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error modify:', error);
			return { action: 'modify', success: false, message: 'Errore modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');

		try {
			const query = { prodId: prodId, type: 'membership' };
			const multi = false

			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/remove`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					query,
					multi,
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();
			//console.log('response', response);

			if (res.status == 200) {
				return { action: 'delete', success: true, message: response.message };
			} else {
				return { action: 'delete', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Errore delete' };
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		//const prodId = formData.get('prodId');
		const status = formData.get('status');
		const title = formData.get('title');
		//const price = formData.get('price');

		if (!status && !title) {
			return fail(400, { action: 'filter', success: false, message: 'Dati mancanti' });
		}

		try {
			const query = {
				type: 'membership',
				//...(prodId && { prodId }),
				...(status && { status }),
				...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
				//...(price && { price }),
			};

			const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
			const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
			const limit = 1000;
			const skip = 0;
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					query,
					projection,
					sort,
					limit,
					skip
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();

			if (res.status == 200) {
				const filterTableList = response.map((obj: any) => ({
					...obj,
					createdAt: obj.createdAt.substring(0, 10)
				}));
				//console.log('response', response);
				return { action: 'filter', success: true, message: 'filtro attivato', filterTableList };
			} else {
				return { action: 'filter', success: false, message: 'errore filtro' };
			}
		} catch (error) {
			console.error('Error filter membership:', error);
			return { action: 'filter', success: false, message: 'Errore filtro membership' };
		}
	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const status = formData.get('status');
		if (!prodId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';
		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			const query = { prodId: prodId, type: 'membership' };
			const update = {
				$set: {
					status: newStatus,
				}
			};
			const options = { upsert: false }
			const multi = false
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();
			//console.log('res', res);
			if (res.status == 200) {
				return { action: 'changeStatus', success: true, message: response.message };
			} else {
				return { action: 'changeStatus', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error changing status:', error);
			return { action: 'changeStatus', success: false, message: 'Errore changeStatus' };
		}
	},
} satisfies Actions;
```

## this is the sample code for the Frontend coding for page.svelte, variable names, values and strings may vary for different files
 ```js
<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import Papa from 'papaparse';
	import {
		ListPlus,
		XCircle,
		Check,
		Funnel,
		Pen,
		Calendar,
		Calculator,
		FileDown,
		RefreshCcw,
		Trash2,
		X
	} from 'lucide-svelte';

	let { data, form } = $props(); // pull data from server
	const { getTable } = $derived(data); // deconstruct data from server
	let tableList = $state(getTable);

	let prodId = $state(null);
	let status = $state('');
	let title = $state('');
	let descrShort = $state('');
	let price: number | null = $state(0);
	let renewalLength: number = $state(365);
	let resetActive = $state(false);
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');


	const resetFields = () => {
		openModal = false;
		prodId = null;
		status = '';
		title = '';
		descrShort = '';
		price = null;
		renewalLength = 365;
		modalTitle = '';
		postAction = '?/';
	};

	const resetData = () => {
		invalidateAll();
		resetFields();
		resetActive = false;
		tableList = getTable;
	};

	const changeStatus = (event: any) => {
		if (event.target.form) {
			event.preventDefault();
			event.target.form.requestSubmit();
		}
	};

	const onClickModal = (type: string, item: any) => {
		currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo';
		}
		if (type == 'modify') {
			postAction = `?/modify`;
			modalTitle = 'Modifica';
			prodId = item.prodId;
			title = item.title;
			price = item.price;
			renewalLength = item.renewalLength;
			descrShort = item.descrShort;
		}
		if (type == 'delete') {
			postAction = `?/delete`;
			modalTitle = 'Elimina';
			prodId = item.prodId;
		}
		if (type == 'filter') {
			postAction = `?/filter`;
			modalTitle = 'Filtra';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		currentModal = '';
		//invalidateAll();
	};

	$effect(() => {
		//console.log('form', form);
		if (form != null) {
			//console.log('form triggered');
			async () => await invalidateAll(); // MUST be async/await or tableList = getTable will trigger infinite loop
			const { action, success, message, filterTableList } = form;
			if (success) {
				//console.log('filterTableList effect', filterTableList);
				currentModal = '';
				if (action == 'filter') {
					resetActive = true;
					tableList = filterTableList;
				} else {
					resetActive = false;
					tableList = getTable;
				}
			} else {
				notificationError = true;
			}
			resetFields();
			clearTimeout(startTimeout);
			closeNotification();
			toastClosed = false;
			notificationContent = message;
			form = null; // reset form TESTING
		}
	}); // end effect

	//notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
			notificationContent = '';
			notificationError = false;
		}, 3000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer
</script>

<svelte:head>
	<title>Lista Membership</title>
</svelte:head>

<noscript>
	<h1 style="font-weight:700; text-align: center;">Please enable Javascript to continue.</h1>
	<style type="text/css">
		#main-content {
			display: none;
		}
	</style>
</noscript>

<div class="overflow-x-auto table-zebra mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Lista Membership</h1>
		<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
			<button class="btn btn-info text-white w-full sm:w-auto" onclick={resetData}>
				<RefreshCcw />
			</button>
			{#if resetActive}
				<button class="btn btn-error text-white w-full sm:w-auto" onclick={resetData}>
					<XCircle /> Reset Filtro
				</button>
			{:else}
				<button
					class="btn btn-info text-white w-full sm:w-auto"
					onclick={() => onClickModal('filter', null)}
				>
					<Funnel /> Filtra
				</button>
			{/if}
			<button
				class="btn btn-info text-white w-full sm:w-auto"
				onclick={() => onClickModal('new', null)}
			>
				<ListPlus />Nuovo
			</button>
			<button class="btn btn-info text-white w-full sm:w-auto">
				<FileDown />CSV
			</button>
		</div>
	</div>

	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-blue-200 border-b border-blue-200 text-blue-600">
			<tr class="">
				<th>Status</th>
				<th>Titolo</th>
				<th>Prezzo</th>
				<th>Rinnovo</th>
				<th>Descrizione</th>
				<th>Azioni</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<!-- row -->
			{#if tableList.length == 0}
				<tr class="hover:bg-gray-300"><td> no data</td></tr>
			{/if}
			{#each tableList as row}
				<tr class="hover:bg-gray-300">
					<td class="">
						<form method="POST" action="?/changeStatus" use:enhance>
							<div>
								<input type="hidden" name="prodId" value={row.prodId} />
								<input type="hidden" name="status" value={row.status} />
								<input
									type="checkbox"
									id="setting"
									checked={row.status == 'enabled'}
									onchange={changeStatus}
									class="toggle toggle-success"
								/>
							</div>
						</form>
					</td>
					<td>{row.title}</td>
					<td>{row.price} €</td>
					<td>{row.renewalLength} giorni</td>
					<td>{row.descrShort}</td>
					<td class="space-4">
						<button onclick={() => onClickModal('modify', row)} class="btn btn-sm">
							Modifica
						</button>
						<button onclick={() => onClickModal('delete', row)} class="btn btn-error btn-sm">
							<Trash2 />
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Notification {toastClosed} {notificationContent} {notificationError} />

{#if currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Nuovo membership
			</header>

			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Nome</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<input
						class="input input-bordered join-item w-full"
						id="titolo"
						name="title"
						type="text"
						placeholder="Titolo"
						aria-label="Titolo"
						aria-describedby="basic-titolo"
						bind:value={title}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="price" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="price"
						type="number"
						name="price"
						placeholder="€"
						aria-label="price"
						aria-describedby="basic-price"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">Durata giorni</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calendar /></button>
					<input
						class="input input-bordered join-item w-full"
						id="renewalLength"
						type="number"
						name="renewalLength"
						aria-label="renewalLength"
						aria-describedby="renewalLength"
						min="1"
						max="36500"
						bind:value={renewalLength}
						required
					/>
				</div>
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">(max 36500 = 100 anni)</p>
				</label>
			</section>

			<section class="col-span-4">
				<div class="mt-6">
					<label for="descrShortN" class="form-label">
						<p class="font-bold mb-2">Descrizione (opzionale)</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShortN"
							name="descrShort"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={descrShort}
						></textarea>
					</div>
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}
						>Annulla</button
					>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Registra</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'modify'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
			class=" grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="prodId" value={prodId} />
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Modifica membership
			</header>

			<section class="col-span-4">
				<label for="titolo" class="form-label">
					<p class="font-bold mb-2">Nome</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Pen /></button>
					<input
						class="input input-bordered join-item w-full"
						id="titolo"
						name="title"
						type="text"
						placeholder="Titolo"
						aria-label="Titolo"
						aria-describedby="basic-titolo"
						bind:value={title}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="price" class="form-label">
					<p class="font-bold mb-2">Prezzo</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calculator /></button>
					<input
						class="input input-bordered join-item w-full"
						id="price"
						type="number"
						name="price"
						placeholder="€"
						aria-label="price"
						aria-describedby="basic-price"
						bind:value={price}
						required
					/>
				</div>
			</section>

			<section class="col-span-2 md:col-span-2">
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">Durata giorni</p>
				</label>
				<div class="join join-horizontal w-full">
					<button class="join-item bg-gray-300 px-3"><Calendar /></button>
					<input
						class="input input-bordered join-item w-full"
						id="renewalLength"
						type="number"
						name="renewalLength"
						aria-label="renewalLength"
						aria-describedby="renewalLength"
						min="1"
						max="36500"
						bind:value={renewalLength}
						required
					/>
				</div>
				<label for="renewalLength" class="form-label">
					<p class="font-bold mb-2">(max 36500 = 100 anni)</p>
				</label>
			</section>

			<section class="col-span-4">
				<div class="mt-6">
					<label for="descrShort" class="form-label">
						<p class="font-bold mb-2">Descrizione (opzionale)</p>
					</label>
					<div class="join join-horizontal rounded-md w-full">
						<button class="join-item bg-gray-300 px-3"><Pen /></button>
						<textarea
							class="textarea textarea-bordered h-24 join-item w-full"
							id="descrShort"
							name="descrShort"
							placeholder="Descrizione"
							aria-label="descrizione"
							aria-describedby="basic-descrizione"
							bind:value={descrShort}
						></textarea>
					</div>
				</div>
			</section>

			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-error btn-sm mx-2" onclick={onCloseModal}>
						Annulla
					</button>
					<button type="submit" class="btn btn-success btn-sm mx-2 text-white">Modifica</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'delete'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance
			class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
		>
			<input type="hidden" name="prodId" value={prodId} />
			<header class="col-span-4 text-center text-2xl font-bold text-green-800">
				Conferma rimozione
			</header>
			<div class="col-span-4 mt-5 flex justify-center">
				<div class="bg-gray-50 flex justify-center">
					<button type="button" class="btn btn-sm mx-2" onclick={onCloseModal}>Annulla</button>
					<button type="submit" class="btn btn-error btn-sm mx-2 text-white">Elimina</button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if currentModal == 'filter'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">
			<!-- <input type="hidden" name="prodId" value={prodId} /> -->
			<div class="space-y-4">
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
					<select
						id="status"
						name="status"
						bind:value={status}
						class="select select-bordered w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					>
						<option value="enabled">attivo</option>
						<option value="disabled">inattivo</option>
					</select>
				</div>

				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
					<input
						type="text"
						id="title"
						name="title"
						bind:value={title}
						placeholder="titolo"
						class="w-full bg-blue-50 border border-blue-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>
			</div>

			<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
				<button type="button" class="btn btn-error btn-sm hover:bg-red-300" onclick={onCloseModal}>
					Annulla
				</button>
				<button type="submit" class="btn btn-success btn-sm hover:bg-green-400"> Filtra </button>
			</div>
		</form>
	</Modal>
{/if}
 ```

 ## NPM packages used
- daisyui
- drizzle-kit
- drizzle-orm
- better-sqlite3
- lucide-svelte
- tailwindcss
- basic-ftp
- jszip
- mongoose
- nanoid
- nodemailer
- papaparse
- qrcode
- stripe
- tesseract.js

