<script lang="ts">
	import '../../app.css';
	import Nav from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { children } = $props();
</script>

<div data-theme="dienchan" class="flex-col flex min-h-screen">
	<Nav />

	<main class="flex-grow">
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
