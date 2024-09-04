<script lang="ts">
	import '../../app.css';
	import NavbarLogin from '$lib/components/NavbarLogin.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { children } = $props();
</script>

<div data-theme="corporate" class="flex-col flex min-h-screen">
	<NavbarLogin />

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
