<script lang="ts">
	//import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { LogOut, ChevronDown, Menu, Megaphone, LogIn } from 'lucide-svelte';
	import { cartProducts, emptyCart } from '$lib/stores/cart';

	let { user, auth } = $props();

	let pointsBalance = $state(user.pointsBalance || 0);
	//if (auth) pointsBalance = user.pointsBalance;
	let userLevel = $state(user.level || '');
	let menuActive = $state(false);
	let userName = $state(user.name || '');
	let userSurname = $state(user.surname || '');
	let userId = $state(user.userId || '');

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
<nav class="navbar animate-color-fade {auth ? 'justify-between' : 'justify-center'}">
	<!-- Logo e titolo-->
	<div class="flex flex-col items-center">
		<span class="">
			<img alt="Logo" src="/images/logo-dien-chan-new.png" class="w-52" />
		</span>
		<!-- <strong> Diện Chẩn Bùi Quốc Châu ® </strong> -->
		{#if auth}
			<span class="text-gray-700 mx-1">
				<strong>Buongiorno {`${userName} ${userSurname}`}</strong>
			</span>
			<span class="text-success mx-1">
				<strong>Crediti: {pointsBalance}</strong>
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
			class=" dropdown-content menu z-[99] bg-indigo-200 p-2 rounded-box shadow w-max gap-2"
		>
			<li>
				<a
					class="btn btn-sm h-12 mt-1 btn-outline btn-accent rounded-full"
					class:active={$page.url.pathname === '/membership-new/'}
					href="/membership-new"
					aria-current="page"
					onclick={onBurgerclick}
				>
					<Megaphone /><strong>Tesseramento</strong>
				</a>
			</li>
			<li>
				<a
					class="btn btn-sm btn-primary border-black"
					class:active={$page.url.pathname === '/course-filter/'}
					href="/course-filter"
					aria-current="page"
					onclick={onBurgerclick}
				>
					<strong>Corsi</strong>
				</a>
			</li>
			<li>
				<a
					class="btn btn-sm btn-primary border-black"
					class:active={$page.url.pathname === '/cart/'}
					href="/cart"
					aria-current="page"
					onclick={onBurgerclick}
				>
					{#if $cartProducts.length > 0}
						<span
							class="badge badge-sm p-2 indicator-item rounded-full bg-blue-200 text-green-600 border-green-500"
							><strong>{$cartProducts.length}</strong></span
						>
					{/if}

					<strong>Carrello</strong>
				</a>
			</li>
			{#if auth}
				<a
					class="btn btn-sm btn-primary border-black"
					class:active={$page.url.pathname === '/profile-modify/'}
					href="/profile-modify"
					aria-current="page"
					onclick={onBurgerclick}
				>
					<strong>Area personale</strong>
				</a>
				<a
					class="btn btn-sm btn-primary border-black"
					class:active={$page.url.pathname === `/profile-public/${userId}`}
					href={`/profile-public/${userId}`}
					aria-current="page"
					onclick={onBurgerclick}
				>
					<strong>Profilo pubblico</strong>
				</a>

				{#if auth && userLevel == 'superadmin'}
					<li>
						<h2 class="menu-title text-lg text-blue-900">Gestione ADMIN:</h2>
						<ul class="border-2 p-2 border-blue-900 rounded-md">
							<li>
								<a
									class=" btn btn-sm btn-primary btn-outline"
									href="/course-table"
									aria-current="page"><strong>Corsi</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm btn-primary btn-outline mt-2"
									href="/product-table"
									aria-current="page"><strong>Prodotti</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm btn-primary btn-outline mt-2"
									href="/membership-table"
									aria-current="page"><strong>Membership</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm btn-accent btn-outline"
									href="/layout-table"
									aria-current="page"><strong>Modelli</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm btn-primary btn-outline mt-2"
									href="/user-table"
									aria-current="page"><strong>Utenti</strong></a
								>
							</li>

							<li>
								<a
									class="btn btn-sm btn-primary btn-outline mt-2"
									href="/order-table"
									aria-current="page"><strong>Ordini</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm btn-primary btn-outline mt-2"
									href="/discount-table"
									aria-current="page"><strong>Sconti</strong></a
								>
							</li>
						</ul>
					</li>
				{/if}
				{#if auth && userLevel == 'formatore'}
					<li>
						<h2 class="menu-title text-blue-900">Gestione</h2>
						<ul>
							<li>
								<a
									class="btn btn-sm btn-primary btn-outline"
									href="/course-table"
									aria-current="page"><strong>Corsi</strong></a
								>
							</li>
						</ul>
					</li>
				{/if}
			{/if}
			{#if auth}
				<button
					onclick={logOutNow}
					class="btn btn-sm bg-transparent rounded-md flex border-red-900 text-red-900 mx-2"
				>
					<span class="flex justify-center gap-1">
						<LogOut size="16" strokeWidth={2.5} />
						<strong>Logout</strong>
					</span>
				</button>
			{:else}
				<a
					href="/login"
					class="btn btn-sm bg-transparent rounded-md flex border-green-900 text-green-900 mx-2"
				>
					<span class="flex justify-center gap-1">
						<LogIn size="16" strokeWidth={2.5} />
						<strong>Login</strong>
					</span>
				</a>
			{/if}
		</ul>
	</div>

	<!-- Menu for desktop -->
	<div class="hidden sm:flex gap-2">
		<ul class="hidden menu sm:menu-horizontal gap-3">
			<a
				class="btn btn-sm btn-outline btn-accent"
				class:active={$page.url.pathname === '/membership-new/'}
				href="/membership-new"
				aria-current="page"
				onclick={onBurgerclick}
			>
				<Megaphone /><strong>Tesseramento</strong>
			</a>
			<a
				class="btn btn-sm btn-outline btn-accent"
				class:active={$page.url.pathname === '/course-filter/'}
				href="/course-filter"
				aria-current="page"
				onclick={onBurgerclick}
			>
				<strong>Corsi</strong>
			</a>

			<a
				class="btn btn-sm btn-outline btn-accent"
				class:active={$page.url.pathname === '/cart/'}
				href="/cart"
				aria-current="page"
				onclick={onBurgerclick}
			>
				{#if $cartProducts.length > 0}
					<span class="badge badge-sm"><strong>{$cartProducts.length}</strong></span>
				{/if}

				<strong>Carrello</strong>
			</a>
			{#if auth}
				<a
					class="btn btn-sm btn-outline btn-accent"
					class:active={$page.url.pathname === '/profile-modify/'}
					href="/profile-modify"
					aria-current="page"
					onclick={onBurgerclick}
				>
					<strong>Area personale</strong>
				</a>
				<a
					class="btn btn-sm btn-outline btn-accent"
					class:active={$page.url.pathname === `/profile-public/${userId}`}
					href={`/profile-public/${userId}`}
					aria-current="page"
					onclick={onBurgerclick}
				>
					<strong>Profilo pubblico</strong>
				</a>
				{#if auth && userLevel == 'superadmin'}
					<div class="dropdown dropdown-end">
						<button class="btn btn-sm btn-accent btn-outline py-2">
							<span class="flex justify-between"
								><strong>Gestione</strong>
								<ChevronDown class="-mt-1" /></span
							>
						</button>
						<ul class="dropdown-content menu z-[1] bg-base-100 p-2 rounded-lg shadow w-max gap-2">
							<li>
								<a
									class="btn btn-sm btn-accent btn-outline"
									href="/course-table"
									aria-current="page"><strong>Corsi</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm btn-accent btn-outline"
									href="/product-table"
									aria-current="page"><strong>Prodotti</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm btn-accent btn-outline"
									href="/membership-table"
									aria-current="page"><strong>Membership</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm btn-accent btn-outline"
									href="/layout-table"
									aria-current="page"><strong>Modelli</strong></a
								>
							</li>
							<li>
								<a class="btn btn-sm btn-accent btn-outline" href="/user-table" aria-current="page"
									><strong>Utenti</strong></a
								>
							</li>

							<li>
								<a class="btn btn-sm btn-accent btn-outline" href="/order-table" aria-current="page"
									><strong>Ordini</strong></a
								>
							</li>
							<li>
								<a
									class="btn btn-sm btn-accent btn-outline"
									href="/discount-table"
									aria-current="page"><strong>Sconti</strong></a
								>
							</li>
						</ul>
					</div>
				{/if}
				{#if auth && userLevel == 'formatore'}
					<div class="dropdown dropdown-end">
						<button class="btn btn-sm btn-accent btn-outline py-2">
							<span class="flex justify-between"
								><strong>Gestione</strong>
								<ChevronDown class="-mt-1" /></span
							>
						</button>
						<ul class="dropdown-content menu z-[1] bg-gray-200 p-2 rounded-lg shadow w-max gap-2">
							<li>
								<a
									class="btn btn-sm btn-primary btn-outline"
									href="/course-table"
									aria-current="page"><strong>Corsi</strong></a
								>
							</li>
						</ul>
					</div>
				{/if}
			{/if}
			{#if auth}
				<button onclick={logOutNow} class="btn btn-sm btn-outline btn-accent">
					<span class="flex justify-center gap-1">
						<LogOut size="16" strokeWidth={2.5} />
						<strong>Logout</strong>
					</span>
				</button>
			{:else}
				<a href="/login" class="btn btn-sm btn-outline btn-accent">
					<span class="flex justify-center gap-1 group-hover:text-white">
						<LogIn size="16" strokeWidth={2.5} />
						<strong>Login</strong>
					</span>
				</a>
			{/if}
		</ul>
	</div>
</nav>
<hr />

<style>
</style>
