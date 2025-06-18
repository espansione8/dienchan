<script lang="ts">
	// SETUP INSTRUCTIONS in src root +layout.svelte
	// import NotificationContainer from '$lib/components/NotificationContainer.svelte';

	// <NotificationContainer /> // at the bottom of the page

	// USAGE INSTRUCTIONS in src/routes/+page.svelte
	// NEED FILE $lib/stores/notification.ts

	// import { notification } from '$lib/stores/notifications';

	// notification.success('Hello, world!');

	// notification.error('Something went wrong!');

	// notification.info('This is an info message.');

	// notification.remove('unique-id');

	// notification.clear();
	import { X } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { notification } from '$lib/stores/notifications';
	import type { Notification } from '$lib/types';
	import { Info, CircleX, CircleCheckBig } from 'lucide-svelte';
	// <Info /> <CircleX /> <CircleCheckBig />

	let notificationList: Notification[] = $state([]);

	// Subscribe to notifications store
	$effect(() => {
		const unsubscribe = notification.subscribe((value) => {
			notificationList = value;
		});

		return unsubscribe;
	});

	const handleClose = (id: number) => {
		notification.remove(id);
	};

	const getAlertClass = (type: 'success' | 'error' | 'info') => {
		switch (type) {
			case 'success':
				return 'alert alert-success rounded-lg shadow-lg';
			case 'error':
				return 'alert alert-error rounded-lg shadow-lg';
			case 'info':
				return 'alert alert-info rounded-lg shadow-lg';
			default:
				return 'alert alert-info rounded-lg shadow-lg';
		}
	};
</script>

<div class="toast toast-top toast-center z-[9999] space-y-2">
	{#each notificationList as notification (notification.id)}
		<div
			class="w-full max-w-sm"
			in:fly={{ y: -50, duration: 400, opacity: 0 }}
			out:fly={{ y: -30, duration: 300, opacity: 0 }}
		>
			<div class={getAlertClass(notification.type)}>
				<div class="flex items-center justify-between w-full">
					<span class="text-white font-medium flex-1 mr-3">
						{#if notification.type === 'success'}
							<CircleCheckBig />
						{:else if notification.type === 'error'}
							<CircleX />
						{:else}
							<Info />
						{/if}
						{notification.content}
					</span>
					<button
						onclick={() => handleClose(notification.id)}
						class="btn btn-circle btn-sm btn-ghost hover:bg-white/20"
						aria-label="Close notification"
					>
						<X />
					</button>
				</div>
			</div>
		</div>
	{/each}
</div>
