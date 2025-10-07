<script lang="ts">
	import NotificationContainer from '$lib/components/NotificationContainer.svelte';
	import UpdateBrowserAlert from '$lib/components/UpdateBrowserAlert.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<UpdateBrowserAlert />
{@render children()}

<NotificationContainer />
