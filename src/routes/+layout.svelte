<script lang="ts">
	import NotificationContainer from '$lib/components/NotificationContainer.svelte';
	import '../app.css';
	let { children } = $props();
</script>

{@render children()}

<NotificationContainer />
