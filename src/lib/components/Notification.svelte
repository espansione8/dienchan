<script lang="ts">
	import { X } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	let {
		toastClosed = $bindable(true),
		notificationContent = '',
		notificationError = false
	} = $props();
	// TODO check https://www.youtube.com/watch?v=tErKyuUTzsM 13.30 Shared state/ bidable 18:11

	//////// INSTRUCTIONS
	// import Notification from '$lib/components/Notification.svelte';
	//
	// notification
	// let toastClosed: boolean = $state(true);
	// let notificationContent: string = $state('');
	// let notificationError: boolean = $state(false);
	// let startTimeout: any;
	// const closeNotification = () => {
	// 	startTimeout = setTimeout(() => {
	// 		toastClosed = true;
	// 	}, 5000); // 1000 milliseconds = 1 second
	// };
	//clearTimeout(startTimeout); // reset timer
	//
	// <Notification {toastClosed} {notificationContent} {notificationError} />
	////////
</script>

{#if !toastClosed}
	<div
		class="toast toast-top toast-center z-9999"
		transition:slide={{ axis: 'x', duration: 300 }}
	>
		<div class={notificationError ? 'alert alert-error rounded-lg' : 'alert alert-info rounded-lg'}>
			<span>
				<button
					onclick={() => (toastClosed = true)}
					class={notificationError
						? 'btn btn-error inline btn-circle btn-sm'
						: 'btn btn-info inline btn-circle btn-sm '}><X /></button
				>
				{notificationContent}
			</span>
		</div>
	</div>
{/if}
