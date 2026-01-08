<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import Papa from 'papaparse';
	import { notification } from '$lib/stores/notifications';
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms';
	import Loader from '$lib/components/Loader.svelte';
	import { RefreshCcw, FileDown, Trash2, FileCog, Plus } from 'lucide-svelte';
	import type { Video } from '$lib/types';
	import { form } from '$app/server';

	let { data } = $props();
	let { getTable } = $derived(data);
	let tableList = $state<Video[]>(getTable || []);
	// modal
	let currentModal = $state('');
	let openModal = $state(false);
	let modalTitle = $state('');
	let postAction = $state('?/');

	let loading = $state(false);

	// form fields
	let videoId = $state('');
	let title = $state('');
	let url = $state('');
	let status = $state('enabled');
	let visibility = $state<string[]>([]);

	const levelOptions = ['user', 'riflessologo', 'formatore base', 'master', 'formatore avanzato', 'admin', 'superadmin'];

	const csvCreate = (content: Video[]) => {
		const dataToExport = content.map((video) => ({
			videoId: video.videoId,
			title: video.title,
			url: video.url,
			status: video.status,
			visibility: video.visibility.join(', '),
			createdAt: new Date(video.createdAt).toLocaleDateString('it-IT')
		}));

		const csv = Papa.unparse(dataToExport, {
			quotes: false,
			quoteChar: '"',
			escapeChar: '"',
			delimiter: ';',
			header: true,
			skipEmptyLines: false
		});

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `Export_videos_${new Date().toLocaleDateString()}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	};

	const resetFields = () => {
		modalTitle = '';
		postAction = '?/';
		videoId = '';
		title = '';
		url = '';
		status = 'enabled';
		visibility = [];
	};

	const refresh = () => {
		invalidateAll();
		resetFields();
		tableList = getTable;
		notification.info('Pagina ricaricata');
	};

	const onClickModal = (type: string, item?: Video) => {
		currentModal = type;
		openModal = true;
		if (type === 'new') {
			postAction = `?/new`;
			modalTitle = 'Nuovo Video';
		}
		if (type === 'modify' && item) {
			postAction = `?/modify`;
			modalTitle = `Modifica Video (ID: ${item.videoId})`;
			videoId = item.videoId;
			title = item.title;
			url = item.url;
			status = item.status;
			visibility = [...item.visibility];
		}
		if (type === 'delete' && item) {
			postAction = `?/delete`;
			modalTitle = 'Elimina Video';
			videoId = item.videoId;
		}
	};

	const onCloseModal = () => {
		resetFields();
		openModal = false;
		currentModal = '';
	};

	const formSubmit = () => {
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { action, message } = result.data;
				tableList = getTable;  
 
				if (action === 'toggleStatus') {
					notification.success(message);
				} else {
					notification.info(message);
					onCloseModal();  
				}
			}
			if (result.type === 'failure') {
				notification.error(result.data.message);
			}
			if (result.type === 'error') {
				notification.error(result.error.message);
			}
			resetFields();
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>Video Tutorial</title>
</svelte:head>

{#if loading}
	<Loader />
{:else}
	<div class="overflow-x-auto mt-5 px-4 mb-5">
		<div class="flex flex-col gap-4 mb-4">
			<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Video Tutorial</h1>
			<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:justify-start items-center">
				<button class="btn btn-info text-white w-full sm:w-auto" onclick={refresh}>
					<RefreshCcw />
				</button>
				<button class="btn btn-success text-white w-full sm:w-auto" onclick={() => onClickModal('new')}>
					<Plus /> Nuovo
				</button>
				<button class="btn btn-info text-white w-full sm:w-auto" onclick={() => csvCreate(tableList)}>
					<FileDown />CSV
				</button>
			</div>
		</div>

		<table class="table mt-5 bg-white border-2">
			<thead class="text-base italic bg-info text-accent">
				<tr>
					<th>ID</th>
					<th>Titolo</th>
					<th>URL</th>
					<th>Visibilità</th>
					<th>Stato</th>
					<th>Data Creazione</th>
					<th>Azioni</th>
				</tr>
			</thead>
			<tbody>
				{#if tableList?.length === 0}
					<tr class="hover:bg-gray-100">
						<td colspan="7" class="text-center">Nessun record</td>
					</tr>
				{/if}

				{#each tableList as row}
					<tr class="hover:bg-gray-100">
						<td>{row.videoId}</td>
						<td>{row.title}</td>
						<td>
							<a href={row.url} target="_blank" rel="noopener noreferrer" class="link link-primary">
								{row.url.length > 50 ? row.url.substring(0, 50) + '...' : row.url}
							</a>
						</td>
						<td>
							<div class="flex flex-wrap gap-1">
								{#each row.visibility as level}
									<span class="badge badge-sm badge-primary">{level}</span>
								{/each}
							</div>
						</td>
						<td> 
							<form method="POST" action="?/toggleStatus" use:enhance={formSubmit}  >
								<input type="hidden" name="videoId" value={row.videoId} />
								<div class="flex items-center gap-2">
									<label class="label cursor-pointer gap-2">
										<input
											type="radio"
											name="status"
											value="enabled"
											checked={row.status === 'enabled'}
											class="radio radio-success radio-sm"
											onchange={(e) => e.currentTarget.form?.requestSubmit()}
										/>
										<span class="label-text text-xs">Attivo</span>
									</label>
									<label class="label cursor-pointer gap-2">
										<input
											type="radio"
											name="status"
											value="disabled"
											checked={row.status === 'disabled'}
											class="radio radio-error radio-sm"
											onchange={(e) => e.currentTarget.form?.requestSubmit()}
										/>
										<span class="label-text text-xs">Inattivo</span>
									</label>
								</div>
							</form>
						</td>
						<td>{new Date(row.createdAt).toLocaleDateString('it-IT')}</td>
						<td class="flex space-x-2">
							<button onclick={() => onClickModal('modify', row)} class="btn btn-sm">
								<FileCog />
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
{/if}
 
{#if currentModal === 'new' || currentModal === 'modify'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6 space-y-6">
			{#if currentModal === 'modify'}
				<input type="hidden" name="videoId" value={videoId} />
			{/if}

			<div class="form-control">
				<label for="title" class="label">
					<span class="label-text font-medium">Titolo *</span>
				</label>
				<input
					type="text"
					id="title"
					name="title"
					bind:value={title}
					required
					class="input input-bordered w-full"
					placeholder="Inserisci il titolo del video"
				/>
			</div>

			<div class="form-control">
				<label for="url" class="label">
					<span class="label-text font-medium">URL *</span>
				</label>
				<input type="url" id="url" name="url" bind:value={url} required class="input input-bordered w-full" placeholder="https://vimeo.com/..." />
			</div>

			{#if currentModal === 'modify'}
				<div class="form-control">
					<label for="status" class="label">
						<span class="label-text font-medium">Stato</span>
					</label>
					<select id="status" name="status" bind:value={status} class="select select-bordered w-full">
						<option value="enabled">Attivo</option>
						<option value="disabled">Disattivo</option>
					</select>
				</div>
			{/if}

			<div class="form-control">
				<label class="label">
					<span class="label-text font-medium">Visibilità (seleziona uno o più livelli) *</span>
				</label>
				<div class="grid grid-cols-2 gap-2">
					{#each levelOptions as level}
						<label class="label cursor-pointer justify-start gap-2">
							<input
								type="checkbox"
								name="visibility"
								value={level}
								checked={visibility.includes(level)}
								onchange={(e) => {
									if (e.currentTarget.checked) {
										visibility = [...visibility, level];
									} else {
										visibility = visibility.filter((v) => v !== level);
									}
								}}
								class="checkbox checkbox-primary"
							/>
							<span class="label-text">{level}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="flex justify-end space-x-2 pt-4">
				<button type="button" class="btn btn-error" onclick={onCloseModal}>Annulla</button>
				<button type="submit" class="btn btn-success">
					{currentModal === 'new' ? 'Crea' : 'Modifica'}
				</button>
			</div>
		</form>
	</Modal>
{/if}
 
{#if currentModal === 'delete'}
	<Modal isOpen={openModal} header={modalTitle}>
		<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}>✕</button>
		<form method="POST" action={postAction} use:enhance={formSubmit} class="p-6">
			<input type="hidden" name="videoId" value={videoId} />
			<p class="text-center text-lg mb-6">Confermi la rimozione di questo video?</p>
			<div class="flex justify-center space-x-4">
				<button type="button" class="btn btn-sm" onclick={onCloseModal}>Annulla</button>
				<button type="submit" class="btn btn-error btn-sm text-white">Elimina</button>
			</div>
		</form>
	</Modal>
{/if}
