<script lang="ts">
	import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Music2 } from 'lucide-svelte';
</script>

<footer class="bg-gradient-to-r from-blue-900 to-blue-600 text-white">
	<!-- Main Footer Content -->
	<div class="container mx-auto px-4 py-8">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Logo and About -->
			<div class="space-y-4">
				<div class="flex items-center">
					<img
						alt="Logo Diện Chẩn"
						src="/images/logo-dien-chan-new.png"
						class="h-16 bg-white p-1 rounded-md"
					/>
				</div>
				<p class="text-sm text-blue-100">
					Associazione DIEN CHAN - BQC - ITALIA<br />
					Multi riflessologia facciale vietnamita
				</p>
			</div>

			<!-- Contact Information -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold border-b border-blue-700 pb-2">Contatti</h3>
				<ul class="space-y-3">
					<li class="flex items-start gap-2">
						<MapPin size={18} class="text-blue-300 mt-0.5 flex-shrink-0" />
						<span class="text-sm">Via Ticino, 12F 25015 Desenzano del Garda - Brescia</span>
					</li>
					<li class="flex items-center gap-2">
						<Phone size={18} class="text-blue-300 flex-shrink-0" />
						<a href="tel:+393929301751" class="text-sm hover:text-blue-300 transition-colors">
							+39 392 9301751
						</a>
					</li>
					<li class="flex items-center gap-2">
						<Mail size={18} class="text-blue-300 flex-shrink-0" />
						<a
							href="mailto:info@riflessologiadienchan.it"
							class="text-sm hover:text-blue-300 transition-colors"
						>
							info@riflessologiadienchan.it
						</a>
					</li>
				</ul>
			</div>

			<!-- Quick Links and Social -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold border-b border-blue-700 pb-2">Collegamenti</h3>
				<ul class="grid grid-cols-2 gap-2">
					<li>
						<a href="/membership-new" class="text-sm hover:text-blue-300 transition-colors"
							>Tesseramento</a
						>
					</li>
					<li>
						<a href="/course-shop" class="text-sm hover:text-blue-300 transition-colors">Corsi</a>
					</li>
					<li>
						<a href="/product-shop" class="text-sm hover:text-blue-300 transition-colors"
							>Prodotti</a
						>
					</li>
					<li>
						<a href="/login" class="text-sm hover:text-blue-300 transition-colors">Area Personale</a
						>
					</li>
					<li>
						<a href="/cart" class="text-sm hover:text-blue-300 transition-colors">Carrello</a>
					</li>
				</ul>

				<div class="pt-2">
					<h4 class="text-sm font-medium mb-2">Seguici sui social</h4>
					<div class="flex gap-4">
						<a
							href="https://www.facebook.com/AccademiaDienChanItalia/?locale=it_IT"
							target="_blank"
							rel="noopener noreferrer"
							class="bg-blue-700 p-2 rounded-full hover:bg-blue-600 transition-colors"
							aria-label="Facebook"
						>
							<Facebook size={18} />
						</a>
						<a
							href="https://www.instagram.com/dienchan_italia_ufficiale/?hl=it"
							target="_blank"
							rel="noopener noreferrer"
							class="bg-blue-700 p-2 rounded-full hover:bg-blue-600 transition-colors"
							aria-label="Instagram"
						>
							<Instagram size={18} />
						</a>
						<a
							href="https://www.youtube.com/@dienchanriflessologiafacciale"
							target="_blank"
							rel="noopener noreferrer"
							class="bg-blue-700 p-2 rounded-full hover:bg-blue-600 transition-colors"
							aria-label="YouTube"
						>
							<Youtube size={18} />
						</a>
						<a
							href="https://www.tiktok.com/@dien.chan.ufficia"
							target="_blank"
							rel="noopener noreferrer"
							class="bg-blue-700 p-2 rounded-full hover:bg-blue-600 transition-colors"
							aria-label="TikTok"
						>
							<Music2 size={18} />
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Copyright Bar -->
	<div class="bg-blue-950 py-3 px-4">
		<div class="container mx-auto flex flex-col sm:flex-row justify-between items-center">
			<p class="text-xs text-blue-200">
				© {new Date().getFullYear()} Associazione DIEN CHAN - BQC - ITALIA. Tutti i diritti riservati.
			</p>
			<div class="flex gap-4 mt-2 sm:mt-0">
				<a href="/" class="text-xs text-blue-200 hover:text-white transition-colors"
					>Privacy Policy</a
				>
				<a href="/" class="text-xs text-blue-200 hover:text-white transition-colors"
					>Termini e Condizioni</a
				>
				<a href="/" class="text-xs text-blue-200 hover:text-white transition-colors"
					>Cookie Policy</a
				>
			</div>
		</div>
	</div>
</footer>
