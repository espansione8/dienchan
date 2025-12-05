<script lang="ts">
	import { onMount } from 'svelte';

	const MIN_VERSIONS = {
		Edge: 111,
		Chrome: 111,
		Safari: 16.4,
		Firefox: 128
	};

	const getBrowser = (): { name: string; version: number } => {
		if (typeof window === 'undefined' || typeof navigator === 'undefined') {
			return { name: 'Server/Unknown', version: 0 };
		}

		const userAgent = navigator.userAgent;
		const isEdge = userAgent.includes('Edg/');
		const isChrome = userAgent.includes('Chrome');
		const isSafari = userAgent.includes('Safari') && !isChrome;
		const isFirefox = userAgent.includes('Firefox');

		if (isEdge) {
			const match = userAgent.match(/Edg\/(\d+)/);
			return { name: 'Edge', version: match ? parseInt(match[1]) : 0 };
		} else if (isChrome && !userAgent.includes('OPR/') && !userAgent.includes('Edg/')) {
			const match = userAgent.match(/Chrome\/(\d+)/);
			return { name: 'Chrome', version: match ? parseInt(match[1]) : 0 };
		} else if (isFirefox) {
			const match = userAgent.match(/Firefox\/(\d+)/);
			return { name: 'Firefox', version: match ? parseInt(match[1]) : 0 };
		} else if (isSafari) {
			const match = userAgent.match(/Version\/(\d+\.\d+).*Safari/);
			return { name: 'Safari', version: match ? parseFloat(match[1]) : 0 };
		}

		return { name: 'Other/Unsupported', version: 0 };
	};

	let showAlert = $state(false);
	let currentBrowser = $state(getBrowser());

	const checkBrowserSupport = (): boolean => {
		const browser = getBrowser();

		switch (browser.name) {
			case 'Edge':
				return browser.version >= MIN_VERSIONS.Edge;
			case 'Chrome':
				return browser.version >= MIN_VERSIONS.Chrome;
			case 'Safari':
				return browser.version >= MIN_VERSIONS.Safari;
			case 'Firefox':
				return browser.version >= MIN_VERSIONS.Firefox;
			default:
				return false;
		}
	};

	onMount(() => {
		const isSupported = checkBrowserSupport();

		if (!isSupported) {
			showAlert = true;
			currentBrowser = getBrowser();
		}
	});

	const handleClose = () => {
		showAlert = false;
	};
</script>

{#if showAlert}
	<div class="browser-alert-overlay">
		<div class="browser-alert-box">
			<h3 class="browser-alert-title">Aggiornamento Browser Richiesto!</h3>
			<p>
				Stai usando <strong>{currentBrowser.name} v{currentBrowser.version}</strong>.
				<br />
				Per una visualizzazione ottimale e la sicurezza, ti preghiamo di aggiornare il tuo browser ad almeno una delle seguenti versioni:
			</p>
			<ul>
				<li>Chrome: <strong>v{MIN_VERSIONS.Chrome}+</strong></li>
				<li>Safari: <strong>v{MIN_VERSIONS.Safari}+</strong></li>
				<li>Firefox: <strong>v{MIN_VERSIONS.Firefox}+</strong></li>
			</ul>
			<button class="browser-alert-button" onclick={handleClose}>Chiudi Avviso</button>
		</div>
	</div>
{/if}

<style>
	.browser-alert-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
		box-sizing: border-box;
	}

	.browser-alert-box {
		background-color: #fff;
		color: #333;
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 8px;
		max-width: 400px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		font-family: Arial, sans-serif;
		box-sizing: border-box;
	}

	.browser-alert-title {
		color: #cc0000;
		font-size: 1.2em;
		margin-top: 0;
		margin-bottom: 10px;
	}

	.browser-alert-box ul {
		margin: 10px 0 15px 20px;
		padding: 0;
	}

	.browser-alert-box strong {
		font-weight: bold;
	}

	.browser-alert-button {
		display: block;
		width: 100%;
		padding: 10px;
		background-color: #dc3545;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1em;
		transition: background-color 0.2s;
	}

	.browser-alert-button:hover {
		background-color: #c82333;
	}
</style>
