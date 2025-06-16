<script lang="ts">
	import { page } from '$app/state';
	import { enhance, applyAction } from '$app/forms';
	import { cartProducts, emptyCart, cdata } from '$lib/stores/cart';
	import {
		LogOut,
		ChevronDown,
		Menu,
		X,
		Megaphone,
		LogIn,
		IdCard,
		ShoppingCart,
		User,
		Layers,
		BookOpen,
		Package,
		CreditCard
	} from 'lucide-svelte';

	const { user, auth } = $props();

	let pointsBalance = user?.pointsBalance || 0;
	let level = user?.level || '';
	let menuActive = $state(false);
	let userName = user?.name || '';
	let userSurname = user?.surname || '';

	const toggleMenu = () => {
		menuActive = !menuActive;
	};

	const isActive = (path: string) => {
		return page.url.pathname === path;
	};

	const handleLogout = () => {
		return async ({ result }) => {
			if (result.type === 'redirect') {
				emptyCart();
				await applyAction(result);
			}
		};
	};
</script>

<header class="sticky top-0 z-50 w-full bg-base-100 shadow-sm">
	<div class="container mx-auto px-4">
		<nav class="navbar py-2">
			<!-- Logo and brand -->
			<div class="flex flex-1 items-center justify-between">
				<a href="/" class="flex items-center">
					<img src="/images/logo-dien-chan-new.png" alt="Logo Diện Chẩn" class="h-12 md:h-16" />
				</a>

				<!-- Desktop  -->
				<div class="hidden md:flex md:items-center md:gap-1">
					<a
						href="/membership-new"
						class={`btn btn-sm ${isActive('/membership-new') ? 'btn-primary' : 'btn-ghost'}`}
					>
						<Megaphone size={16} />
						<span>Tesseramento</span>
					</a>

					<a
						href="/course-shop"
						class={`btn btn-sm ${isActive('/course-shop') ? 'btn-primary' : 'btn-ghost'}`}
					>
						<BookOpen size={16} />
						<span>Corsi</span>
					</a>

					<a
						href="/product-shop"
						class={`btn btn-sm ${isActive('/product-shop') ? 'btn-primary' : 'btn-ghost'}`}
					>
						<Package size={16} />
						<span>Prodotti</span>
					</a>

					<a
						href="/user-list"
						class={`btn btn-sm ${isActive('/user-list') ? 'btn-primary' : 'btn-ghost'}`}
					>
						<IdCard size={16} />
						<span>Albo Riflessologi</span>
					</a>

					<a
						href="/cart"
						class={`btn btn-sm ${isActive('/cart') ? 'btn-primary' : 'btn-ghost'} relative`}
					>
						<ShoppingCart size={16} />
						<span>Carrello</span>
						{#if $cartProducts.length > 0}
							<span class="absolute -top-2 -right-2 badge badge-sm badge-primary">{$cdata.q1}</span>
						{/if}
					</a>

					{#if auth}
						<a
							href="/profile-modify"
							class={`btn btn-sm ${isActive('/profile-modify') ? 'btn-primary' : 'btn-ghost'}`}
						>
							<User size={16} />
							<span>Area personale</span>
						</a>

						{#if auth && (level === 'superadmin' || level === 'formatore')}
							<div class="dropdown dropdown-end">
								<button class="btn btn-sm btn-ghost">
									<Layers size={16} />
									<span>Gestione</span>
									<ChevronDown size={14} />
								</button>

								<ul
									class="dropdown-content z-[100] menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-2"
								>
									<li>
										<a href="/course-table" class={isActive('/course-table') ? 'active' : ''}>
											<BookOpen size={16} />
											Corsi
										</a>
									</li>

									{#if level === 'superadmin'}
										<li>
											<a href="/product-table" class={isActive('/product-table') ? 'active' : ''}>
												<Package size={16} />
												Prodotti
											</a>
										</li>

										<li>
											<a
												href="/membership-table"
												class={isActive('/membership-table') ? 'active' : ''}
											>
												<CreditCard size={16} />
												Membership
											</a>
										</li>

										<li>
											<a href="/layout-table" class={isActive('/layout-table') ? 'active' : ''}>
												<Layers size={16} />
												Modelli corsi
											</a>
										</li>

										<li>
											<a href="/user-table" class={isActive('/user-table') ? 'active' : ''}>
												<User size={16} />
												Utenti
											</a>
										</li>

										<li>
											<a href="/order-table" class={isActive('/order-table') ? 'active' : ''}>
												<ShoppingCart size={16} />
												Ordini
											</a>
										</li>

										<li>
											<a href="/discount-table" class={isActive('/discount-table') ? 'active' : ''}>
												<Megaphone size={16} />
												Sconti
											</a>
										</li>
									{/if}
								</ul>
							</div>
						{/if}
						<form method="POST" action="/formAction/logout/" use:enhance={handleLogout}>
							<button type="submit" class="btn btn-sm btn-outline btn-error">
								<LogOut size={16} />
								<span>Logout</span>
							</button>
						</form>
					{:else}
						<a href="/login" class="btn btn-sm btn-primary">
							<LogIn size={16} />
							<span>Login</span>
						</a>
					{/if}
				</div>

				<!-- Mobile menu button -->
				<div class="flex md:hidden">
					<button
						class="btn btn-sm btn-ghost"
						onclick={toggleMenu}
						aria-label={menuActive ? 'Chiudi menu' : 'Apri menu'}
						aria-expanded={menuActive}
					>
						{#if menuActive}
							<X size={20} />
						{:else}
							<Menu size={20} />
						{/if}
					</button>
				</div>
			</div>
		</nav>
	</div>

	<!-- User info bar (when authenticated) -->
	{#if auth}
		<div class="bg-base-200 py-2 px-4">
			<div class="container mx-auto flex flex-wrap items-center gap-2 text-sm">
				<div class="flex items-center gap-2">
					<User size={16} class="text-primary" />
					<span>Buongiorno <strong>{userName} {userSurname}</strong></span>
				</div>

				<div class="flex items-center gap-2">
					<CreditCard size={16} class="text-success" />
					<span>Crediti: <strong class="text-success">{pointsBalance}</strong></span>
				</div>
			</div>
		</div>
	{/if}

	<!-- Notification area -->
	<!-- {#if notification}
		<div class="bg-error/10 py-2">
			<div class="container mx-auto px-4">
				<div class="flex items-center gap-2 text-error">
					<TriangleAlert size={16} />
					<p><strong>{notification}</strong></p>
				</div>
			</div>
		</div>
	{/if} -->

	<!-- Mobile -->
	{#if menuActive}
		<div class="md:hidden bg-base-100 border-t border-base-200">
			<div class="container mx-auto px-4 py-4">
				<ul class="menu w-full gap-2">
					<li>
						<!-- class={`btn btn-sm ${isActive('/membership-new') ? 'btn-primary' : 'btn-ghost'}`} -->
						<a
							href="/membership-new"
							class={`btn btn-sm ${isActive('/membership-new') ? 'btn-primary' : 'btn-ghost'}`}
							onclick={toggleMenu}
						>
							<Megaphone size={18} />
							Tesseramento
						</a>
					</li>

					<li>
						<a
							href="/course-shop"
							class={`btn btn-sm ${isActive('/course-shop') ? 'btn-primary' : 'btn-ghost'}`}
							onclick={toggleMenu}
						>
							<BookOpen size={18} />
							Corsi
						</a>
					</li>

					<li>
						<a
							href="/product-shop"
							class={`btn btn-sm ${isActive('/product-shop') ? 'btn-primary' : 'btn-ghost'}`}
							onclick={toggleMenu}
						>
							<Package size={18} />
							Prodotti
						</a>
					</li>

					<li>
						<a
							href="/user-list"
							class={`btn btn-sm ${isActive('/user-list') ? 'btn-primary' : 'btn-ghost'}`}
							onclick={toggleMenu}
						>
							<IdCard size={16} />
							<span>Albo Riflessologi</span>
						</a>
					</li>

					<li>
						<a
							href="/cart"
							class={`btn btn-sm ${isActive('/cart') ? 'btn-primary' : 'btn-ghost'}`}
							onclick={toggleMenu}
						>
							<div class="flex items-center gap-2">
								<ShoppingCart size={18} />
								<span>Carrello</span>
								{#if $cartProducts.length > 0}
									<span class="badge badge-sm badge-primary">{$cdata.q1}</span>
								{/if}
							</div>
						</a>
					</li>

					{#if auth}
						<li>
							<a
								href="/profile-modify"
								class={`btn btn-sm ${isActive('/profile-modify') ? 'btn-primary' : 'btn-ghost'}`}
								onclick={toggleMenu}
							>
								<User size={18} />
								Area personale
							</a>
						</li>

						{#if auth && (level === 'superadmin' || level === 'formatore')}
							<li class="menu-title mt-4">
								<span>Gestione</span>
							</li>

							<li>
								<a
									href="/course-table"
									class={`btn btn-sm ${isActive('/course-table') ? 'btn-primary' : 'btn-ghost'}`}
									onclick={toggleMenu}
								>
									<BookOpen size={18} />
									Corsi
								</a>
							</li>

							{#if level === 'superadmin'}
								<li>
									<a
										href="/product-table"
										class={`btn btn-sm ${isActive('/product-table') ? 'btn-primary' : 'btn-ghost'}`}
										onclick={toggleMenu}
									>
										<Package size={18} />
										Prodotti
									</a>
								</li>

								<li>
									<a
										href="/membership-table"
										class={`btn btn-sm ${isActive('/membership-table') ? 'btn-primary' : 'btn-ghost'}`}
										onclick={toggleMenu}
									>
										<CreditCard size={18} />
										Membership
									</a>
								</li>

								<li>
									<a
										href="/layout-table"
										class={`btn btn-sm ${isActive('/layout-table') ? 'btn-primary' : 'btn-ghost'}`}
										onclick={toggleMenu}
									>
										<Layers size={18} />
										Modelli corsi
									</a>
								</li>

								<li>
									<a
										href="/user-table"
										class={`btn btn-sm ${isActive('/user-table') ? 'btn-primary' : 'btn-ghost'}`}
										onclick={toggleMenu}
									>
										<User size={18} />
										Utenti
									</a>
								</li>

								<li>
									<a
										href="/order-table"
										class={`btn btn-sm ${isActive('/order-table') ? 'btn-primary' : 'btn-ghost'}`}
										onclick={toggleMenu}
									>
										<ShoppingCart size={18} />
										Ordini
									</a>
								</li>

								<li>
									<a
										href="/discount-table"
										class={`btn btn-sm ${isActive('/discount-table') ? 'btn-primary' : 'btn-ghost'}`}
										onclick={toggleMenu}
									>
										<Megaphone size={18} />
										Sconti
									</a>
								</li>
							{/if}

							<div class="divider"></div>
						{/if}

						<li>
							<form method="POST" action="/api/logout/" use:enhance={handleLogout}>
								<button type="submit" class="btn btn-outline btn-error justify-start">
									<LogOut size={18} />
									Logout
								</button>
							</form>
						</li>
					{:else}
						<li>
							<a href="/login" class="btn btn-primary justify-start" onclick={toggleMenu}>
								<LogIn size={18} />
								Login
							</a>
						</li>
					{/if}
				</ul>
			</div>
		</div>
	{/if}
</header>
