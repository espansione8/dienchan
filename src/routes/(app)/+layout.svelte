<script lang="ts">
	import '../../app.css';
	import { page } from '$app/state';
	// import { navigating } from '$app/state';
	// import { expoOut } from 'svelte/easing';
	// import { slide } from 'svelte/transition';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
	let { user, auth } = $derived(page.data);
</script>

<!-- {#if navigating} -->
<!-- 
    Loading animation for next page since svelte doesn't show any indicator. 
     - delay 100ms because most page loads are instant, and we don't want to flash 
     - long 12s duration because we don't actually know how long it will take
     - exponential easing so fast loads (>100ms and <1s) still see enough progress,
       while slow networks see it moving for a full 12 seconds
  -->
<!-- <div
		class="fixed w-full top-0 right-0 left-0 h-1 z-50 bg-primary"
		in:slide={{ delay: 100, duration: 12000, axis: 'x', easing: expoOut }}
	></div>
{/if} -->

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
