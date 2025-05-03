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

<div class="bg-stone-900 text-white py-8">
	<!-- Sfondo scuro e testo bianco -->

	<!-- Header (simulato) -->
	<div class="flex justify-between items-center px-4">
		<h1 class="text-2xl font-bold text-primary">VaporDex</h1>
		<div class="flex gap-2">
			<button class="btn btn-ghost">Connect Wallet</button>
			<span class="badge badge-secondary">0.0 VAPD</span>
		</div>
	</div>

	<!-- Sezione principale -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 mt-8">
		<!-- Sidebar (simulato) -->
		<aside class="bg-nbeutral-950 rounded-lg p-4 shadow-md w-full md:w-auto border border-gray-700">
			<!-- Sfondo sidebar scuro e bordo grigio -->
			<h2 class="font-bold mb-2 text-primary">Earn</h2>
			<ul>
				<li>Liquidity Pools</li>
				<li>Earn VAPD</li>
				<li>Earn USDG</li>
			</ul>

			<h2 class="font-bold mt-4 mb-2 text-primary">Trade</h2>
			<ul>
				<li>Swap</li>
				<li>Bridge</li>
				<li>Fiat</li>
				<li>Gas Station</li>
			</ul>

			<h2 class="font-bold mt-4 mb-2 text-primary">Services</h2>
			<ul>
				<li>Token Registry</li>
			</ul>

			<!-- Altre sezioni (abbreviate) -->
			<h2 class="font-bold mt-4 mb-2 text-primary">Rewards & Stats</h2>
			<h2 class="font-bold mt-4 mb-2 text-primary">Biosphere</h2>
			<h2 class="font-bold mt-4 mb-2 text-primary">Partners</h2>
		</aside>

		<!-- Contenuto principale -->
		<main class="bg-base-950 rounded-lg p-4 shadow-md w-full border border-gray-700">
			<!-- Sfondo main scuro e bordo grigio -->
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-bold text-primary">VAPE LIQUID MINING</h2>
				<span class="badge badge-info">Lock your VPND to earn VAPE</span>
			</div>

			<p>
				We will be emitting a set amount of VAPE rewards each season. Your percent of the total
				mining points earned at the end of the season will be the percent you receive of the total
				VAPE emitted that season.
			</p>

			<h3 class="font-bold mt-4">How to earn points</h3>

			<!-- Card 1 -->
			<div
				class="card card-hover bg-base-950 shadow-md rounded-lg p-4 mb-4 w-full md:w-1/2 lg:w-1/3 border border-gray-700"
			>
				<h4 class="text-lg font-bold text-primary">1. Get a Mining Pass</h4>
				<p>
					Use the free Mining Pass, which is automatically unlocked or upgrade it for the current
					season to be able to lock more VPND.
				</p>
				<img
					src="https://via.placeholder.com/100"
					alt="Mining Pass Icon"
					class="w-16 mx-auto mt-2"
				/>
				<!-- Sostituisci con l'icona reale -->
			</div>

			<!-- Card 2 -->
			<div
				class="card card-hover bg-base-950 shadow-md rounded-lg p-4 mb-4 w-full md:w-1/2 lg:w-1/3 border border-gray-700"
			>
				<h4 class="text-lg font-bold text-primary">2. Lock your VPND and Earn Points</h4>
				<p>
					Once locked, you will earn a total of points equivalent to the number of locked VPND
					multiplied by the total of remaining days in the current season
				</p>
			</div>

			<!-- Card 3 -->
			<div
				class="card card-hover bg-base-950 shadow-md rounded-lg p-4 mb-4 w-full md:w-1/2 lg:w-1/3 border border-gray-700"
			>
				<h4 class="text-lg font-bold text-primary">3. Boost your Score</h4>
				<p>
					Boost your points once every 24 hours. Boosts increase the number of points you get for
					each VPND you have locked. You can boost for free or pay for a more powerful boost.
				</p>
			</div>

			<!-- Card 4 -->
			<div
				class="card card-hover bg-base-950 shadow-md rounded-lg p-4 mb-4 w-full md:w-1/2 lg:w-1/3 border border-gray-700"
			>
				<h4 class="text-lg font-bold text-primary">4. Receive VAPE</h4>
				<p>
					At the end of the season, you automatically receive your VAPE and VPND. No action needed
					from you.
				</p>
			</div>

			<!-- Statistiche (simulato) -->
			<div class="flex justify-between items-center mt-4">
				<span>230 miners currently participating</span>
				<div>
					<span class="badge badge-success">86,631 VPND</span>
					<p>Total VPND locked this season</p>
				</div>
			</div>
		</main>
	</div>

	<!-- Footer (simulato) -->
	<footer class="text-center py-2 mt-8 text-gray-500">&copy; Copyright 2023 VaporDex</footer>
</div>

<style>
</style>
