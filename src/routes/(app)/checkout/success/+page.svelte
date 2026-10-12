<script lang="ts">
	import { onMount } from 'svelte';
	import { CircleCheckBig, CircleAlert, Clock, ArrowRight } from 'lucide-svelte';
	import { emptyCart } from '$lib/stores/cart';

	const { data } = $props();
	const { state, flow, paid } = data;

	const isMembership = $derived(
		flow === 'membership-new' || flow === 'membership-renew' || flow === 'membership-insurance'
	);

	/**
	 * The customer paid on Stripe's own page, so the local cart must not keep the items that were
	 * just bought. The cart page can no longer do this itself: on a card payment it hands the
	 * browser to Stripe and never sees a success result.
	 *
	 * Only the cart flow owns this store — the membership, insurance and course flows check out
	 * from their own modals, so a cart they did not use must be left untouched. And never clear
	 * for a checkout we know was not paid: that would throw away the customer's basket.
	 */
	onMount(() => {
		const settled = state === 'done' || (state === 'processing' && paid !== false);
		if (flow === 'cart' && settled) emptyCart();
	});
</script>

<svelte:head>
	<title>Pagamento completato</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-blue-50 to-teal-50">
	<div class="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
		{#if state === 'done'}
			<div class="flex justify-center mb-6">
				<div class="bg-green-100 p-4 rounded-full">
					<CircleCheckBig class="text-green-600 h-12 w-12" />
				</div>
			</div>
			<h1 class="text-2xl md:text-3xl font-bold text-blue-900 mb-4">Pagamento completato</h1>
			<p class="text-blue-800 mb-2">
				Grazie! Il pagamento è andato a buon fine e il tuo ordine è stato registrato.
			</p>
			{#if isMembership}
				<p class="text-blue-800 mb-6">La tua iscrizione è attiva. Trovi la tessera e lo storico nel tuo profilo.</p>
			{:else}
				<p class="text-blue-800 mb-6">Trovi i dettagli nel tuo profilo.</p>
			{/if}
			<a class="btn btn-primary" href="/profile-area">
				Vai al tuo profilo
				<ArrowRight size={16} />
			</a>
		{:else if paid === false}
			<!-- Stripe reports this session as unpaid, so nothing was charged and nothing was
			     recorded. Claiming the payment was received here would simply be untrue. -->
			<div class="flex justify-center mb-6">
				<div class="bg-amber-100 p-4 rounded-full">
					<CircleAlert class="text-amber-600 h-12 w-12" />
				</div>
			</div>
			<h1 class="text-2xl md:text-3xl font-bold text-blue-900 mb-4">Pagamento non completato</h1>
			<p class="text-blue-800 mb-6">
				Per questo ordine non risulta alcun pagamento: non è stato registrato nulla e non è stato addebitato alcun importo. Puoi
				riprovare quando vuoi.
			</p>
			<a class="btn btn-primary" href="/cart">
				Torna al carrello
				<ArrowRight size={16} />
			</a>
		{:else if state === 'processing'}
			<div class="flex justify-center mb-6">
				<div class="bg-blue-100 p-4 rounded-full">
					<Clock class="text-blue-600 h-12 w-12" />
				</div>
			</div>
			<h1 class="text-2xl md:text-3xl font-bold text-blue-900 mb-4">Pagamento ricevuto</h1>
			<p class="text-blue-800 mb-6">
				Il pagamento è stato accettato. Stiamo registrando il tuo ordine — riceverai una email di conferma a breve. Puoi
				controllare lo storico nel tuo profilo tra qualche minuto.
			</p>
			<a class="btn btn-primary" href="/profile-area">
				Vai al tuo profilo
				<ArrowRight size={16} />
			</a>
		{:else}
			<h1 class="text-2xl md:text-3xl font-bold text-blue-900 mb-4">Pagamento completato</h1>
			<p class="text-blue-800 mb-6">
				Se hai completato il pagamento, l'ordine sarà registrato a breve e riceverai una email di conferma.
			</p>
			<a class="btn btn-primary" href="/profile-area">
				Vai al tuo profilo
				<ArrowRight size={16} />
			</a>
		{/if}
	</div>
</section>
