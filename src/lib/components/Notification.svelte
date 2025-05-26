<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	let {
		toastClosed = $bindable(true),
		notificationContent = $bindable(''),
		notificationError = $bindable(false),
		duration = 3000 // 1000 milliseconds = 1 second
	} = $props();

	let startTimeout: any;

	$effect(() => {
		if (startTimeout) {
			clearTimeout(startTimeout);
			startTimeout = undefined;
		}
		if (!toastClosed && notificationContent) {
			startTimeout = setTimeout(() => {
				toastClosed = true;
				notificationContent = '';
				notificationError = false;
				startTimeout = undefined;
			}, duration);
		}

		// timeout cleanup when component is destroyed
		return () => {
			if (startTimeout) {
				clearTimeout(startTimeout);
				toastClosed = true;
				notificationContent = '';
				notificationError = false;
				startTimeout = undefined;
			}
		};
	});

	const manualClose = () => {
		if (startTimeout) {
			clearTimeout(startTimeout);
		}
		toastClosed = true;
		notificationContent = '';
		notificationError = false;
		startTimeout = undefined;
	};
	//////// INSTRUCTIONS

	// import Notification from '$lib/components/Notification.svelte';

	// notification
	// let toastClosed: boolean = $state(true);
	// let notificationContent: string = $state('');
	// let notificationError: boolean = $state(false);

	// <Notification bind:toastClosed bind:notificationContent bind:notificationError /> // optional duration={3000}
	////////
</script>

{#if !toastClosed}
	<!-- <div class="toast toast-top toast-center z-9999" transition:slide={{ axis: 'x', duration: 300 }}> -->
	<div
		class="toast toast-top toast-center z-9999"
		in:fly={{ y: -50, duration: 400, opacity: 0 }}
		out:fly={{ y: -30, duration: 300, opacity: 0 }}
	>
		<div class={notificationError ? 'alert alert-error rounded-lg' : 'alert alert-info rounded-lg'}>
			<span>
				<button onclick={manualClose} class="btn inline btn-circle btn-sm mx-1"><X /> </button>
				<span class="text-bold text-lg text-white mx-1"> {notificationContent}</span>
			</span>
		</div>
	</div>
{/if}
