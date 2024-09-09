<script lang="ts">
	import { X, Info } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

<div class="toast toast-top toast-center z-[9999]" class:hidden={toastClosed}>
	<div class={notificationError ? 'alert alert-error rounded-lg' : 'alert alert-info rounded-lg'}>
		<span>
			<button
				onclick={() => (toastClosed = !toastClosed)}
				class={notificationError
					? 'btn btn-error inline btn-circle btn-sm'
					: 'btn btn-info inline btn-circle btn-sm '}><X /></button
			>
			{notificationContent}
		</span>
	</div>
</div>
