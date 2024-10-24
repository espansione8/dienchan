<script lang="ts">
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';

	//	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';
</script>

<ParaglideJS {i18n}>
	<slot />
</ParaglideJS>
