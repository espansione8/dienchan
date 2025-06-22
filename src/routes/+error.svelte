<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.status}</title>
</svelte:head>

<div>
	<h1>{$page.status}</h1>

	<p>{$page.error.message}</p>
</div>

<!-- <Image
	layout="constrained"
	aspectRatio={1}
	src="https://assets.materialup.com/uploads/9070caa6-cc00-44be-8e7a-f136c2fc58bd/preview.gif"
	alt="404"
/> -->

<!-- {#if dev && error.stack}
  <pre>{error.stack}</pre>
{/if} -->
<style>
	h1,
	p {
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	p {
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>
