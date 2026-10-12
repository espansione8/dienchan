<script lang="ts">
	import { CircleAlert, ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Pagamento annullato</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-blue-50 to-teal-50">
	<div class="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
		<div class="flex justify-center mb-6">
			<div class="bg-amber-100 p-4 rounded-full">
				<CircleAlert class="text-amber-600 h-12 w-12" />
			</div>
		</div>
		<h1 class="text-2xl md:text-3xl font-bold text-blue-900 mb-4">Pagamento annullato</h1>
		<p class="text-blue-800 mb-6">
			Non è stato addebitato nulla. Puoi riprovare quando vuoi: il tuo carrello e i tuoi dati sono ancora disponibili.
		</p>
		<a class="btn btn-primary" href="/membership-new">
			<ArrowLeft size={16} />
			Riprova
		</a>
	</div>
</section>
