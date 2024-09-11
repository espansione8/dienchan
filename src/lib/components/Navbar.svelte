<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { LogOut, ChevronDown, Menu, Megaphone, LogIn } from 'lucide-svelte';
	//import { cart } from '$lib/stores/cart';
	import { cartProducts, emptyCart } from '$lib/stores/cart';
	let logged = false;
	let sessionAuth = $page?.data?.auth;
	//console.log('Nav', $page?.data?.userData?.level);
	//console.log('cartProducts navbar', $cartProducts);

	let pointsBalance = 0;

	if (sessionAuth) {
		logged = true;
		pointsBalance = $page?.data?.userData?.pointsBalance;
	} else {
		logged = false;
	}
	const userLevel = $page?.data?.userData?.level || '';
	const userName = $page?.data?.userData?.name || '';
	const userurname = $page?.data?.userData?.surname || '';
	const userId = $page?.data?.userData?.userId || '';

	let menuActive = false;
	const onBurgerclick = () => {
		menuActive = !menuActive;
	};

	const redirectToLogin = () => {
		//goto('/login');
		//goto('/', { invalidateAll: true });
		window.location.href = '/login';
	};

	const logOutNow = async () => {
		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/sign-out`);
			//const response = await res.json();
			if (res.ok) {
				emptyCart();
				redirectToLogin();
			}
		} catch (err) {
			console.log('Error logout', err);
		}
	};
</script>

<!-- Navbar -->
<nav class="navbar bg-gray-300 {logged ? 'justify-between' : 'justify-center'}">
	<!-- Logo e titolo-->
	<div class="flex flex-col items-center">
		<span class="">
			<img alt="Logo" src="/images/logo-dien-chan-new.png" class="w-52" />
		</span>
		<!-- <strong> Diện Chẩn Bùi Quốc Châu ® </strong> -->
		{#if logged}
			<span class="text-gray-400 mx-1">
				<strong>Buongiorno {`${userName} ${userurname}`}</strong>
			</span>
			<span class="text-green-800 mx-1">
				<strong>Punti: {pointsBalance}</strong>
			</span>
		{/if}
	</div>

	<!-- Menu for mobile -->
	<div class="dropdown dropdown-end sm:hidden">
		<button class="btn btn-ghost">
			<Menu />
		</button>

		<ul
			tabindex="-1"
			class="dropdown-content menu z-[1] bg-base-200 p-2 rounded-box shadow w-max gap-2"
		>
			{#if logged}
				<li>
					<a
						class="bg-transparent text-gray-600 flex justify-center"
						class:active={$page.url.pathname === '/course-table/'}
						href="/course-table"
						aria-current="page"
						onclick={onBurgerclick}
					>
						<strong>Corsi</strong>
					</a>
				</li>
				<li>
					<a
						class="bg-transparent text-gray-600 flex justify-center"
						class:active={$page.url.pathname === '/order/'}
						href="/order"
						aria-current="page"
						onclick={onBurgerclick}
					>
						<strong>Storico</strong>
					</a>
				</li>
				<li>
					<a
						class="bg-transparent text-gray-600 flex justify-center"
						class:active={$page.url.pathname === '/cart/'}
						href="/cart"
						aria-current="page"
						onclick={onBurgerclick}
					>
						{#if $cartProducts.length > 0}
							<span
								class="badge badge-sm p-2 indicator-item rounded-full bg-blue-400 text-green-500 border-green-500"
								><strong>{$cartProducts.length}</strong></span
							>
						{/if}
						<strong>Carrello</strong>
					</a>
				</li>
				<li>
					<a
						class="bg-transparent text-gray-600 flex justify-center"
						class:active={$page.url.pathname === '/profile-modify/'}
						href="/profile-modify"
						aria-current="page"
						onclick={onBurgerclick}
					>
						<strong>Impostazioni</strong>
					</a>
				</li>
				<li>
					<a
						class="bg-transparent text-gray-600 flex justify-center"
						class:active={$page.url.pathname === `/profile-public/${userId}`}
						href={`/profile-public/${userId}`}
						aria-current="page"
						onclick={onBurgerclick}
					>
						<strong>Profilo pubblico</strong>
					</a>
				</li>

				{#if logged && userLevel == 'superadmin'}
					<li>
						<a
							class="bg-transparent text-green-800 flex justify-center"
							class:active={$page.url.pathname === '/course-new/'}
							href="/course-new"
							aria-current="page"
							onclick={onBurgerclick}
						>
							<strong>Nuovo Corso</strong>
						</a>
					</li>
					<li>
						<h2 class="menu-title text-green-900">Gestione Inventario</h2>
						<ul>
							<li>
								<a
									class="bg-transparent text-green-800 flex justify-center"
									href="/product-new"
									aria-current="page"><strong>Nuovo prodotto</strong></a
								>
							</li>
							<li>
								<a
									class="bg-transparent text-green-800 flex justify-center"
									href="/new-membership"
									aria-current="page"><strong>Nuova quota</strong></a
								>
							</li>
							<li>
								<a
									class="bg-transparent text-green-800 flex justify-center"
									href="/product-table"
									aria-current="page"><strong>Lista prodotti</strong></a
								>
							</li>
						</ul>
					</li>
					<li>
						<h2 class="menu-title text-green-900">Gestione Utenti</h2>
						<ul>
							<li>
								<a
									class="bg-transparent text-green-800 flex justify-center"
									href="/user-new"
									aria-current="page"><strong>Nuovo utente</strong></a
								>
							</li>
							<li>
								<a
									class="bg-transparent text-green-800 flex justify-center"
									href="/user-table"
									aria-current="page"><strong>Lista Utenti</strong></a
								>
							</li>
						</ul>
					</li>
				{/if}

				<button
					onclick={logOutNow}
					class="btn btn-sm bg-transparent rounded-md flex border-red-900 text-red-900 mx-2"
				>
					<span class="flex justify-center">
						<LogOut size="16" strokeWidth={2.5} />
						<strong>Logout</strong>
					</span>
				</button>
			{/if}
		</ul>
	</div>

	<!-- Menu for desktop -->
	<div class="hidden sm:flex gap-2">
		<ul class="hidden menu sm:menu-horizontal gap-3">
			<a
				class="btn btn-sm bg-transparent border-orange-500 rounded-full text-orange-500 hover:text-red-400 hover:bg-orange-300"
				class:active={$page.url.pathname === '/membership-new/'}
				href="/membership-new"
				aria-current="page"
				onclick={onBurgerclick}
			>
				<Megaphone /><strong>Tesseramento</strong>
			</a>
			<a
				class="btn btn-sm bg-transparent border-gray-500 text-gray-500 px-3 py-2 hover:text-blue-900"
				class:active={$page.url.pathname === '/course-filter/'}
				href="/course-filter"
				aria-current="page"
				onclick={onBurgerclick}
			>
				<strong>Corsi</strong>
			</a>

			<a
				class="btn btn-sm bg-transparent border-gray-500 text-gray-500 px-3 py-2 hover:text-blue-900"
				class:active={$page.url.pathname === '/cart/'}
				href="/cart"
				aria-current="page"
				onclick={onBurgerclick}
			>
				{#if $cartProducts.length > 0}
					<span
						class="badge badge-sm p-2 indicator-item rounded-full bg-blue-200 text-green-600 border-green-500 hover:bg-yellow-500"
						><strong>{$cartProducts.length}</strong></span
					>
				{/if}

				<strong>Carrello</strong>
			</a>
			{#if logged}
				<a
					class="btn btn-sm bg-transparent border-gray-500 text-gray-500 px-3 py-2 hover:text-blue-900"
					class:active={$page.url.pathname === '/profile-modify/'}
					href="/profile-modify"
					aria-current="page"
					onclick={onBurgerclick}
				>
					<strong>Impostazioni</strong>
				</a>
				<a
					class="btn btn-sm bg-transparent border-gray-500 text-gray-500 px-3 py-2 hover:text-blue-900"
					class:active={$page.url.pathname === `/profile-public/${userId}`}
					href={`/profile-public/${userId}`}
					aria-current="page"
					onclick={onBurgerclick}
				>
					<strong>Profilo pubblico</strong>
				</a>
				{#if logged && userLevel == 'superadmin'}
					<div class="dropdown dropdown-end">
						<button
							class="btn btn-sm bg-transparent border-green-500 text-green-500 px-3 py-2 hover:border-red-500 hover:text-orange-500"
						>
							<span class="flex justify-between"
								><strong>Gestione</strong>
								<ChevronDown class="-mt-1" /></span
							>
						</button>
						<ul class="dropdown-content menu z-[1] bg-gray-200 p-2 rounded-lg shadow w-max gap-2">
							<li>
								<a
									class="btn btn-sm bg-transparent border-green-500 text-green-500 px-3 py-2 hover:border-red-500 hover:text-orange-500"
									href="/course-table"
									aria-current="page"><strong>Corsi</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm bg-transparent border-green-500 text-green-500 px-3 py-2 hover:border-red-500 hover:text-orange-500"
									href="/product-table"
									aria-current="page"><strong>Prodotti</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm bg-transparent border-green-500 text-green-500 px-3 py-2 hover:border-red-500 hover:text-orange-500"
									href="/membership-table"
									aria-current="page"><strong>Membership</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm bg-transparent border-green-500 text-green-500 px-3 py-2 hover:border-red-500 hover:text-orange-500"
									href="/user-table"
									aria-current="page"><strong>Utenti</strong></a
								>
							</li>

							<li>
								<a
									class="btn btn-sm bg-transparent border-green-500 text-green-500 px-3 py-2 hover:border-red-500 hover:text-orange-500"
									href="/order-table"
									aria-current="page"><strong>Ordini</strong></a
								>
							</li>
						</ul>
					</div>
				{/if}
				{#if logged && userLevel == 'formatore'}
					<div class="dropdown dropdown-end">
						<button
							class="btn btn-sm bg-transparent border-green-500 text-green-500 px-3 py-2 hover:border-red-500 hover:text-orange-500"
						>
							<span class="flex justify-between"
								><strong>Gestione</strong>
								<ChevronDown class="-mt-1" /></span
							>
						</button>
						<ul class="dropdown-content menu z-[1] bg-gray-200 p-2 rounded-lg shadow w-max gap-2">
							<li>
								<a
									class="btn btn-sm bg-transparent border-green-500 text-green-500 px-3 py-2 hover:border-red-500 hover:text-orange-500"
									href="/course-table"
									aria-current="page"><strong>Corsi</strong></a
								>
							</li>
						</ul>
					</div>
				{/if}
			{/if}
			{#if logged}
				<button
					onclick={logOutNow}
					class="btn btn-sm bg-transparent border-red-900 text-red-900 hover:text-red-900 hover:border-red-900 hover:bg-red-500"
				>
					<span class="flex justify-center gap-1">
						<LogOut size="16" strokeWidth={2.5} />
						<strong>Logout</strong>
					</span>
				</button>
			{:else}
				<a
					href="/login"
					class="btn btn-sm bg-transparent border-green-700 text-green-700 hover:text-green-700 hover:border-green-700 hover:bg-green-500"
				>
					<span class="flex justify-center gap-1">
						<LogIn size="16" strokeWidth={2.5} />
						<strong>Login</strong>
					</span>
				</a>
			{/if}
		</ul>
	</div>
</nav>

<style>
</style>
