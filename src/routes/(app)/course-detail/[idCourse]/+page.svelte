<script lang="ts">
	//import { cartProducts, addToCart, removeFromCart } from '$lib/stores/cart';
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import {
		ShoppingCart,
		Trash2,
		Calendar,
		MapPin,
		User,
		Users,
		DollarSign,
		CreditCard,
		Mail,
		Phone,
		Check
	} from 'lucide-svelte';

	let { data } = $props();
	const { getCourse, userData } = $derived(data);

	const userfiles = $derived(userData?.uploadfiles || []);
	const picFilter = $derived(userfiles.filter((file: any) => file.type == 'avatar'));

	// Purchase form state
	let showPurchaseForm = $state(false);
	let formData = $state({
		name: '',
		email: '',
		phone: '',
		paymentMethod: 'credit-card'
	});
	// Modal
	let openModal = $state(false);
	let postAction = $state('?/');
	let modalTitle = $state('');
	let currentModal = $state('');

	const onClickModal = (type: string, item: any) => {
		currentModal = type;
		openModal = true;
		if (type == 'new') {
			postAction = `?/new`;
			modalTitle = 'Acquista il Corso';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		currentModal = '';
		//resetFields();
	};
</script>

<svelte:head>
	<title>{getCourse.layoutView.title}</title>
</svelte:head>

<div class="container mx-auto p-4">
	<div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-xl overflow-hidden">
		<!-- Hero Section -->
		<div class="relative">
			<div class="absolute inset-0 bg-blue-900/20"></div>
			<div class="container mx-auto px-6 py-16 relative z-10">
				<div class="flex flex-col md:flex-row items-center gap-8">
					<!-- Course Image -->
					<div class="w-full md:w-1/3">
						<div
							class="relative rounded-xl overflow-hidden shadow-2xl transform transition-transform hover:scale-105"
						>
							<img
								src={getCourse.layoutView?.urlPic || '/images/placeholder.jpg'}
								alt="course type"
								class="h-80 w-full object-contain"
							/>
							<!-- <div
								class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 to-transparent p-4"
							>
								<div class="badge badge-lg bg-blue-600 text-white p-3 font-bold">
									{getCourse.layoutView.price} €
								</div>
							</div> -->
							<div class="absolute -top-1 -right-1 z-10 opacity-85">
								<div class="relative">
									<div
										class="bg-gradient-to-r from-primary to-primary/80 text-primary-content px-4 py-2 rounded-bl-lg rounded-tr-lg shadow-md"
									>
										<span class="text-xs font-semibold">PREZZO</span>
										<div class="flex items-baseline">
											<span class="text-2xl font-bold">€ {getCourse.layoutView.price}</span>
										</div>
									</div>
									<div
										class="absolute top-0 right-0 w-0 h-0 border-t-8 border-t-primary/80 border-r-8 border-r-transparent transform translate-x-full"
									></div>
								</div>
							</div>
						</div>
					</div>

					<!-- Course Details -->
					<div class="w-full md:w-2/3 space-y-6">
						<div class="flex items-center gap-3">
							<div class="badge badge-lg bg-blue-100 text-blue-800 p-3">
								<Calendar class="w-4 h-4 mr-1" />
								{getCourse.eventStartDate.substring(0, 10)} alle {getCourse.eventStartDate.substring(
									11,
									16
								)}
							</div>
							<div class="badge badge-lg bg-blue-100 text-blue-800 p-3">
								<MapPin class="w-4 h-4 mr-1" />
								{getCourse.county}
							</div>
						</div>

						<h1 class="text-4xl md:text-5xl font-bold text-blue-900 leading-tight">
							{getCourse.layoutView.title}
						</h1>

						<div class="flex items-center gap-4">
							<!-- Instructor Avatar -->
							<div class="avatar">
								<div class="w-24 rounded-full ring ring-blue-500 ring-offset-2">
									{#if findAvatar.length > 0}
										<img
											src={`/files/${userData.userId}/${picFilter[0].filename}`}
											alt="avatar"
											loading="lazy"
										/>
									{:else}
										<img src="/images/avatar.png" alt="avatar" loading="lazy" />
									{/if}
								</div>
							</div>
							<div>
								<p class="text-lg font-medium text-blue-800">
									<User class="w-4 h-4 inline mr-1" />
									Riflessologo: {getCourse.name}
									{getCourse.surname}
								</p>
								<p class="text-sm text-blue-600">
									<Users class="w-4 h-4 inline mr-1" />
									Posti disponibili: {getCourse.stockQty}
								</p>
							</div>
						</div>

						<!-- <div class="flex flex-wrap gap-3 mt-4"> -->
						<button class="btn btn-primary gap-2" onclick={() => onClickModal('new', null)}>
							<CreditCard class="w-5 h-5" /> Acquista Ora
						</button>
						<!-- </div> -->
					</div>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="container mx-auto px-6 py-12">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<!-- Course Description -->
				<div class="lg:col-span-2">
					<div class="tabs tabs-lift">
						<input
							type="radio"
							name="course_tabs"
							role="tab"
							class="tab text-lg font-medium"
							aria-label="Descrizione"
							checked={true}
						/>
						<div role="tabpanel" class="tab-content bg-white rounded-b-xl p-6 shadow-md max-w-none">
							<p class="text-lg text-gray-700 leading-relaxed">
								{getCourse.layoutView.descr}
							</p>
							<hr class="my-6" />
							<div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
								<p class="text-blue-800">
									Le attività dell'Associazione sono rivolte esclusivamente agli Associati con la
									quota associativa rinnovata nell'anno corrente.
								</p>
							</div>
							<p class="mt-6">
								Pertanto per qualunque attività è richiesta innanzitutto l'iscrizione e/o il rinnovo
								della Quota ordinaria di € 25,00 Questo da diritto di partecipare alle attività
								gratuite come, per esempio, il CORSO BASE DI AUTOTRATTAMENTO oppure al CORSO
								AVANZATO INTENSIVO DI APPROFONDIMENTO RISERVATI AI SOCI, L'ASSOCIAZIONE NON FA
								ATTIVITA' COMMERCIALI, distribuisce esclusivamente materiale didattico necessario ai
								suoi Associati al fine della pratica della Riflessologia facciale.
							</p>
							<p class="mt-4">
								Per i Soci che desiderano iscriversi a entrambi i corsi Base e Avanzato, è richiesto
								il possesso dei Kit Base e Plus, contenente strumenti e materiali didattici
								indispensabili. Il kit può essere acquistato presso il negozio online
								www.dienchan-online.com (con sede in Vietnam), attività completamente indipendente
								dall'Associazione. Il materiale verrà ritirato dai partecipanti all'inizio del
								corso.
							</p>
						</div>
					</div>

					{#if getCourse.tag.length > 0}
						<div class="mt-8">
							<h3 class="text-xl font-semibold text-gray-800 mb-4">Tag del corso:</h3>
							<div class="flex flex-wrap gap-3">
								{#each getCourse.tag as tag}
									<div
										class="badge badge-lg bg-blue-100 text-blue-800 p-4 font-medium hover:bg-blue-200 transition-colors cursor-pointer"
									>
										{tag}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Course Info and Extra Info -->
				<div class="lg:col-span-1">
					<div class="bg-white rounded-xl shadow-md p-6 space-y-6">
						<h3 class="text-2xl font-bold text-blue-900 border-b pb-4">Dettagli del Corso</h3>
						<div class="space-y-4">
							<div class="flex items-center gap-3">
								<div>
									<p class="text-sm text-gray-500">ID:{getCourse.prodId}</p>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<div class="bg-blue-100 p-2 rounded-full">
									<Calendar class="w-5 h-5 text-blue-700" />
								</div>
								<div>
									<p class="text-sm text-gray-500">Data e Ora</p>
									<p class="font-medium">
										{getCourse.eventStartDate.substring(0, 10)} alle {getCourse.eventStartDate.substring(
											11,
											16
										)}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="bg-blue-100 p-2 rounded-full">
									<MapPin class="w-5 h-5 text-blue-700" />
								</div>
								<div>
									<p class="text-sm text-gray-500">Luogo</p>
									<p class="font-medium">{getCourse.county}</p>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="bg-blue-100 p-2 rounded-full">
									<Users class="w-5 h-5 text-blue-700" />
								</div>
								<div>
									<p class="text-sm text-gray-500">Numero partecipanti</p>
									<p class="font-medium">{getCourse.stockQty}</p>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="bg-blue-100 p-2 rounded-full">
									<DollarSign class="w-5 h-5 text-blue-700" />
								</div>
								<div>
									<p class="text-sm text-gray-500">Prezzo</p>
									<p class="font-medium text-xl text-blue-900">{getCourse.layoutView.price} €</p>
								</div>
							</div>
						</div>

						{#if getCourse.infoExtra.length > 0}
							<div class="mt-8">
								<div class="collapse collapse-arrow bg-blue-50 rounded-lg">
									<input type="checkbox" checked />
									<div class="collapse-title text-lg font-medium text-blue-800">
										Informazioni Extra
									</div>
									<div class="collapse-content">
										<p class="text-gray-700">{getCourse.infoExtra}</p>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Purchase Form Modal -->
{#if showPurchaseForm}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
			<div class="bg-blue-600 p-4 text-white">
				<h3 class="text-xl font-bold">Acquista il Corso</h3>
				<p class="text-blue-100">{getCourse.layoutView.title}</p>
			</div>

			<form class="p-6 space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text font-medium">Nome Completo</span>
					</label>
					<div class="join join-horizontal w-full">
						<button class="join-item bg-gray-300 px-3"><User /></button>
						<input
							type="text"
							class="input input-bordered join-item w-full"
							bind:value={formData.name}
							required
							placeholder="Inserisci il tuo nome completo"
						/>
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text font-medium">Email</span>
					</label>
					<div class="join join-horizontal w-full">
						<button class="join-item bg-gray-300 px-3"><Mail /></button>
						<input
							type="email"
							class="input input-bordered join-item w-full"
							bind:value={formData.email}
							required
							placeholder="La tua email"
						/>
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text font-medium">Telefono</span>
					</label>
					<div class="join join-horizontal w-full">
						<button class="join-item bg-gray-300 px-3"><Phone /></button>
						<input
							type="tel"
							class="input input-bordered join-item w-full"
							bind:value={formData.phone}
							required
							placeholder="Numero di telefono"
						/>
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text font-medium">Metodo di Pagamento</span>
					</label>
					<div class="grid grid-cols-3 gap-3">
						<label
							class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary hover:text-primary-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
						>
							<input
								type="radio"
								name="payment"
								value="credit-card"
								class="sr-only"
								bind:group={formData.paymentMethod}
							/>
							<CreditCard class="mb-3 h-6 w-6" />
							Carta di Credito
						</label>
						<label
							class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary hover:text-primary-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
						>
							<input
								type="radio"
								name="payment"
								value="bank-transfer"
								class="sr-only"
								bind:group={formData.paymentMethod}
							/>
							<DollarSign class="mb-3 h-6 w-6" />
							Bonifico
						</label>
						<label
							class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary hover:text-primary-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
						>
							<input
								type="radio"
								name="payment"
								value="cash"
								class="sr-only"
								bind:group={formData.paymentMethod}
							/>
							<DollarSign class="mb-3 h-6 w-6" />
							Contanti (all'inizio corso)
						</label>
					</div>
				</div>

				<div class="bg-blue-50 p-4 rounded-lg mt-4">
					<div class="flex justify-between">
						<span class="font-medium">Totale:</span>
						<span class="font-bold text-blue-900">{getCourse.layoutView.price} €</span>
					</div>
				</div>

				<div class="flex gap-3 mt-6">
					<button type="button" class="btn btn-outline flex-1" onclick={togglePurchaseForm}>
						Annulla
					</button>
					<button type="submit" class="btn btn-success flex-1 gap-2">
						<Check class="w-4 h-4" /> Conferma Acquisto
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<Modal isOpen={openModal} header={modalTitle}>
	<button class="btn btn-sm btn-circle btn-error absolute right-2 top-2" onclick={onCloseModal}
		>✕</button
	>
	<form method="POST" action={postAction} use:enhance class="p-6 space-y-6">
		<div class="form-control">
			<label class="label">
				<span class="label-text font-medium">Nome Completo</span>
			</label>
			<div class="join join-horizontal w-full">
				<button class="join-item bg-gray-300 px-3"><User /></button>
				<input
					type="text"
					class="input input-bordered join-item w-full"
					bind:value={formData.name}
					required
					placeholder="Inserisci il tuo nome completo"
				/>
			</div>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text font-medium">Email</span>
			</label>
			<div class="join join-horizontal w-full">
				<button class="join-item bg-gray-300 px-3"><Mail /></button>
				<input
					type="email"
					class="input input-bordered join-item w-full"
					bind:value={formData.email}
					required
					placeholder="La tua email"
				/>
			</div>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text font-medium">Telefono</span>
			</label>
			<div class="join join-horizontal w-full">
				<button class="join-item bg-gray-300 px-3"><Phone /></button>
				<input
					type="tel"
					class="input input-bordered join-item w-full"
					bind:value={formData.phone}
					required
					placeholder="Numero di telefono"
				/>
			</div>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text font-medium">Metodo di Pagamento</span>
			</label>
			<div class="grid grid-cols-3 gap-3">
				<label
					class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary hover:text-primary-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
				>
					<input
						type="radio"
						name="payment"
						value="credit-card"
						bind:group={formData.paymentMethod}
					/>
					<CreditCard class="mb-3 h-6 w-6" />
					Carta di Credito
				</label>
				<label
					class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary hover:text-primary-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
				>
					<input
						type="radio"
						name="payment"
						value="bank-transfer"
						bind:group={formData.paymentMethod}
					/>
					<DollarSign class="mb-3 h-6 w-6" />
					Bonifico
				</label>
				<label
					class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary hover:text-primary-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
				>
					<input type="radio" name="payment" value="cash" bind:group={formData.paymentMethod} />
					<DollarSign class="mb-3 h-6 w-6" />
					Contanti (all'inizio corso)
				</label>
			</div>
		</div>

		<div class="bg-blue-50 p-4 rounded-lg mt-4">
			<div class="flex justify-between">
				<span class="font-medium">Totale:</span>
				<span class="font-bold text-blue-900">{getCourse.layoutView.price} €</span>
			</div>
		</div>
		<div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
			<button
				class="btn btn-error btn-sm rounded-md hover:bg-red-300"
				type="button"
				onclick={onCloseModal}
			>
				Annulla
			</button>
			<button class="btn btn-success btn-sm rounded-md hover:bg-green-400" type="submit">
				Conferma Acquisto
			</button>
		</div>
	</form>
</Modal>

<style>
</style>
