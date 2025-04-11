<script lang="ts">
	// import Tesseract from 'tesseract.js';
	// let parsedText = $state('');
	// let name = $state('');
	// const logTesseract = () => {
	// 	Tesseract.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png', 'eng', {
	// 		logger: (m) => console.log(m)
	// 	}).then(({ data: { text } }) => {
	// 		console.log(text);
	// 		parsedText = text;
	// 	});
	// };
	import { enhance } from '$app/forms';

	//import type { ActionData, PageData } from './$types';
	// export let form: ActionData;
	// export let data: PageData;
	let { data, form } = $props(); // pull data from server

	let processing = $state(false);
	let extractedText: string | null = $state(null);
	let extractedDate: string | null = $state(null);
	let errorMessage: string | null = $state(null);

	async function handleSubmit() {
		processing = true;
		extractedText = null;
		extractedDate = null;
		errorMessage = null;

		return async ({ result }) => {
			processing = false;
			if (result.type === 'success') {
				extractedText = result.data?.extractedText;
				extractedDate = result.data?.extractedDate;
			} else if (result.type === 'error') {
				errorMessage = result.error?.message || 'An error occurred during processing.';
			} else if (result.type === 'failure') {
				errorMessage = result.data?.message || 'File upload failed.';
			}
		};
	}
</script>

<!-- <div>
	<button class="btn btn-primary" onclick={logTesseract}>Log Tesseract</button>
	<p>parsedText:</p>
	<p>{parsedText}</p>
</div> -->

<form method="POST" enctype="multipart/form-data" use:enhance={handleSubmit}>
	<input type="file" name="receipt" accept="image/*" class="file-input" required />
	<button type="submit" disabled={processing} class="btn btn-primary">
		{#if processing}
			Processing...
		{:else}
			Upload and Process
		{/if}
	</button>
</form>

{#if extractedDate}
	<h2>extracted Date:</h2>
	<pre>{extractedDate}</pre>
{/if}

{#if extractedText}
	<h2>Extracted Text:</h2>
	<pre>{extractedText}</pre>
{/if}

{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}

<style>
</style>
