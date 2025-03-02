<script lang="ts">
	import { page } from '$app/stores';
	import '../../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
	let { user, auth } = $derived($page.data);
</script>

<div data-theme="dienchan" class="flex-col flex min-h-screen">
	<Navbar {user} {auth} />

	<main class="grow">
		<!-- <slot /> -->
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	/*
	main {
	}
	*/
</style>
