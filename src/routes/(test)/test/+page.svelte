<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms'; // `enhance` is the action directive
	import type { ActionResult } from '@sveltejs/kit'; // Import ActionResult type

	import {
		ListPlus,
		XCircle,
		Settings,
		Funnel,
		Pen,
		Calendar,
		Calculator,
		FileDown,
		RefreshCcw,
		Trash2,
		ShieldAlert,
		Eye,
		EyeOff
	} from 'lucide-svelte';

	let { data, form } = $props(); // `form` prop from server, contains action result
	const { getTable } = $derived(data);
	let tableList = $state(getTable);

	let prodId = $state(null);
	let status = $state('');
	let title = $state('');
	let descrShort = $state('');
	let price: number | null = $state(0);
	let renewalLength: number = $state(365);
	let resetActive = $state(false);

	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

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
		}, 3000);
	};

	const resetFields = () => {
		// Reset your client-side state for form inputs
		title = '';
		descrShort = '';
		price = 0;
		renewalLength = 365;
		prodId = null; // Assuming prodId is also part of the form fields to be reset
		status = ''; // Assuming status is also part of the form fields to be reset
		// Do not try to set `form = null;` here, as `form` is a prop.
	};

	// Define the callback for use:enhance
	const handleFormSubmissionResult = () => {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			// `result` is the ActionResult from your server action.
			// `result.data` contains the data your action returned (this is what populates $props().form).
			// `update` is a function to tell SvelteKit to update data, run load functions, etc.
			// `enhance` calls `update` by default.

			// Original logic from $effect, now using `result.data`
			if (result.type === 'success' || result.type === 'failure') {
				const actionResultData = result.data; // This is the content that will go into $props().form

				if (actionResultData) {
					// It's crucial to await invalidateAll() if subsequent logic depends on refreshed data.
					//await invalidateAll();

					// `actionResultData` should have the structure your server action returns,
					// e.g., { success: boolean, message: string, filterTableList?: any, action?: string }
					const { action, success, message, filterTableList } = actionResultData as any; // Cast if necessary, or define a type

					if (success) {
						currentModal = ''; // Close modal on success
						if (action === 'filter') {
							resetActive = true;
							tableList = filterTableList; // Ensure filterTableList is in actionResultData
						} else {
							resetActive = false;
							// `getTable` is derived from `$props().data`.
							// After `invalidateAll()`, `data` is fresh, so `getTable` will provide the updated list.
							tableList = getTable;
						}
						notificationError = false; // Ensure error is reset on success
					} else {
						// This case handles `success: false` explicitly returned by your action.
						notificationError = true;
					}

					resetFields(); // Reset the client-side input field values
					clearTimeout(startTimeout);
					closeNotification(); // Setup notification display
					toastClosed = false;
					notificationContent = message || (success ? 'Success!' : 'Operation failed.');
				} else if (result.type === 'success') {
					// Action was successful (e.g., HTTP 200) but returned no specific data payload.
					// This could be for actions that just need to trigger a refresh.
					await invalidateAll();
					resetFields();
					currentModal = ''; // Close modal if applicable
					tableList = getTable; // Refresh table

					clearTimeout(startTimeout);
					closeNotification();
					toastClosed = false;
					notificationContent = 'Operation completed successfully.'; // Generic success message
					notificationError = false;
				}
			} else if (result.type === 'error') {
				// This handles errors like network issues or unhandled exceptions in the action.
				await invalidateAll(); // You might still want to refresh data
				notificationError = true;
				resetFields(); // Reset form fields
				clearTimeout(startTimeout);
				closeNotification();
				toastClosed = false;
				notificationContent = result.error.message || 'An unexpected error occurred.';
			}

			// `enhance` calls `update()` by default after this callback, which ensures props are updated
			// and necessary `load` functions are re-run. If you called `invalidateAll()`, `update()`
			// will work with the already invalidated (and thus refetched) data.
			// You could call `await update()` explicitly if needed before further client-side logic not covered by Svelte's reactivity.
		};
	};

	// Remove the $effect block that was handling form submission
	/*
	$effect(() => {
		// console.log('form', form);
		if (form != null) {
			// (async () => await invalidateAll())(); // Corrected IIFE if you were to use it here
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
			// form = null; // This line was problematic as `form` is a prop and cannot be reassigned here.
		}
	});
	*/

	// Function to close modal (assuming you have this or similar)
	const onCloseModal = () => {
		openModal = false;
		currentModal = '';
		resetFields(); // Optionally reset fields when modal is manually closed
	};
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
	<button
		onclick={() => {
			currentModal = 'new';
			openModal = true;
			modalTitle = 'Create New Membership';
			postAction = '?/createNew';
		}}
		class="btn btn-primary">Add New Membership</button
	>
</div>

{#if currentModal == 'new'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
			>✕</button
		>
		<form
			method="POST"
			action={postAction}
			use:enhance={handleFormSubmissionResult}
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
					<button type="button" class="join-item bg-gray-300 px-3"><Pen /></button>
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
					<button type="button" class="join-item bg-gray-300 px-3"><Calculator /></button>
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
					<button type="button" class="join-item bg-gray-300 px-3"><Calendar /></button>
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
						<button type="button" class="join-item bg-gray-300 px-3"><Pen /></button>
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

{#if !toastClosed}
	<div class={`toast toast-end toast-top`} style="z-index: 9999;">
		<div class={`alert ${notificationError ? 'alert-error' : 'alert-success'}`}>
			<span>{notificationContent}</span>
			<button class="btn btn-sm btn-ghost" onclick={() => (toastClosed = true)}>✕</button>
		</div>
	</div>
{/if}
