<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { fly, fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { notification } from '$lib/stores/notifications';
	import Modal from '$lib/components/Modal.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import { UserPlus, Mail, KeyRound, Lock, Eye, EyeOff, ArrowRight } from 'lucide-svelte';

	// form
	let loginEmail = $state('');
	let loginPassword = $state('');
	let password1 = $state('');
	let password2 = $state('');
	let registerEmail = $state('');
	let rememberMe = $state(false);
	let showPassword = $state(false);
	let isLogin = $state(true);
	let resetEmail = $state('');
	let error = $state('');

	// animations states
	let heroVisible = $state(false);
	let cardWrapperVisible = $state(false);

	// Modal
	let openModal = $state(false);
	let postAction = $state('?/');
	let modalTitle = $state('');

	let loading = $state(false);

	// Floating elements animation (original)
	const floatingElements = [
		{ id: 1, x: 10, y: 20, delay: 0 },
		{ id: 2, x: 80, y: 10, delay: 2 },
		{ id: 3, x: 15, y: 70, delay: 4 },
		{ id: 4, x: 85, y: 80, delay: 1 },
		{ id: 5, x: 50, y: 5, delay: 3 }
	];

	$effect(() => {
		// initial animations
		heroVisible = true;
		const time1 = setTimeout(() => (cardWrapperVisible = true), 200);
		return () => {
			clearTimeout(time1);
		};
	});

	const togglePasswordVisibility = () => {
		showPassword = !showPassword;
	};

	const switchForm = () => {
		isLogin = !isLogin;
		resetFields();
	};

	const resetFields = () => {
		loginEmail = '';
		loginPassword = '';
		registerEmail = '';
		password1 = '';
		password2 = '';
		showPassword = false;
	};

	const onClickModal = (type: string, item: any) => {
		//currentModal = type;
		openModal = true;
		if (type == 'reset') {
			postAction = `?/resetPassword`;
			modalTitle = 'Recupera Password';
		}
	};

	const onCloseModal = () => {
		openModal = false;
		resetFields();
		//currentModal = '';
	};

	const formSubmit = () => {
		return async ({ result }: { result: ActionResult }) => {
			//return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			loading = true;
			await invalidateAll();
			if (result.type === 'success' && result.data) {
				const { payload, message } = result.data; // { action, success, message, payload }
				if (payload) {
					notification.success(message);
					try {
						await goto('/profile-modify');
					} catch (err) {
						notification.error('Errore durante la navigazione');
					}
				} else {
					notification.success(message);
				}
				onCloseModal();
			}
			if (result.type === 'failure') {
				notification.error(result.data.message);
			}
			if (result.type === 'error') {
				notification.error(
					result.error?.message || String(result.error) || 'Si è verificato un errore'
				);
			}
			// 'update()' is called by default by use:enhance
			// call 'await update()' if you need to ensure it completes before further client logic.

			loading = false;
		};
	};
</script>

<div class="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-50 to-emerald-300">
	<div class="absolute inset-0">
		<div
			class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"
		></div>
		<div
			class="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"
			style="animation-delay: 2s;"
		></div>
		<div
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl animate-pulse"
			style="animation-delay: 4s;"
		></div>
		{#each floatingElements as element}
			<div
				class="absolute w-4 h-4 bg-emerald-400/20 rounded-full animate-bounce"
				style="left: {element.x}%; top: {element.y}%; animation-delay: {element.delay}s; animation-duration: 3s;"
			></div>
		{/each}
	</div>

	<div class="relative z-10 min-h-screen flex items-center justify-center p-4">
		<div class="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
			{#if heroVisible}
				<div
					class="text-center lg:text-left space-y-8"
					in:fly|local={{ y: 30, duration: 800, easing: quintOut }}
				>
					<div class="relative">
						<img
							src="images/storia.jpg"
							alt="Storia Dien Chan"
							class="w-full max-w-lg mx-auto lg:mx-0 rounded-2xl shadow-2xl"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent rounded-2xl"
						></div>
					</div>
				</div>
			{/if}

			<div class="flex justify-center lg:justify-end">
				{#if cardWrapperVisible}
					<div
						class="w-full max-w-md"
						in:fly|local={{ x: 30, duration: 600, delay: 100, easing: quintOut }}
					>
						<div
							class="card bg-base-100/90 backdrop-blur-xl shadow-2xl border border-base-content/10"
						>
							<div class="card-body p-6 md:p-8">
								<div class="text-center mb-6">
									<h3 class="text-2xl font-bold mb-2 card-title justify-center">
										{isLogin ? 'Bentornato!' : 'Inizia Ora'}
									</h3>
									<p class="text-base-content/70">
										{isLogin ? 'Accedi al tuo account' : 'Crea il tuo account'}
									</p>
								</div>

								<div role="tablist" class="tabs tabs-boxed tabs-lg bg-base-200 p-1 mb-6">
									<button
										role="tab"
										class="tab flex-1 {isLogin
											? 'tab-active !bg-base-100 !text-primary font-semibold shadow-md'
											: 'hover:!bg-base-300/50'}"
										onclick={switchForm}
										disabled={isLogin}
									>
										Accedi
									</button>
									<a
										role="tab"
										class="tab flex-1 {!isLogin
											? 'tab-active !bg-base-100 !text-primary font-semibold shadow-md'
											: 'hover:!bg-base-300/50'}"
										href="/membership-new"
									>
										Registrati
									</a>
									<!-- <button
										role="tab"
										class="tab flex-1 {!isLogin
											? 'tab-active !bg-base-100 !text-primary font-semibold shadow-md'
											: 'hover:!bg-base-300/50'}"
										onclick={switchForm}
										disabled={!isLogin}
									>
										Registrati
									</button> -->
								</div>

								{#key isLogin}
									<div in:fade|local={{ duration: 300, delay: 50 }} class="space-y-6">
										{#if isLogin}
											<!-- Login form -->
											<form
												method="POST"
												action="?/login"
												use:enhance={formSubmit}
												class="space-y-6"
											>
												<!-- Email field -->
												<div class="space-y-2">
													<label for="login-email" class="block text-sm font-medium text-gray-700">
														Email
													</label>
													<div class="relative group">
														<div
															class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
														>
															<Mail
																class="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
															/>
														</div>
														<input
															id="login-email"
															type="email"
															name="loginEmail"
															class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
															placeholder="il.tuo@email.com"
															bind:value={loginEmail}
															required
														/>
													</div>
												</div>

												<!-- Password field -->
												<div class="space-y-2">
													<label
														for="login-password"
														class="block text-sm font-medium text-gray-700"
													>
														Password
													</label>
													<div class="relative group">
														<div
															class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
														>
															<KeyRound
																class="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
															/>
														</div>
														<input
															id="login-password"
															type={showPassword ? 'text' : 'password'}
															name="loginPassword"
															class="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
															placeholder="La tua password"
															bind:value={loginPassword}
															required
														/>
														<button
															type="button"
															class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-800 transition-colors"
															onclick={togglePasswordVisibility}
														>
															{#if showPassword}
																<EyeOff class="w-5 h-5" />
															{:else}
																<Eye class="w-5 h-5" />
															{/if}
														</button>
													</div>
												</div>

												<!-- Remember me and forgot password -->
												<div class="flex items-center justify-between">
													<label class="flex items-center gap-2 cursor-pointer group">
														<input
															type="checkbox"
															class="w-4 h-4 rounded border-white/20 bg-white/10 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
															bind:checked={rememberMe}
														/>
														<span
															class="text-sm text-gray-600 group-hover:text-gray-800 transition-colors"
															>Ricordami</span
														>
													</label>

													<button
														type="button"
														class="text-sm text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
														onclick={() => onClickModal('reset', null)}
													>
														Password dimenticata?
													</button>
												</div>

												<!-- Error message -->
												{#if error}
													<div
														class="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm"
													>
														{error}
													</div>
												{/if}

												<!-- Submit button -->
												<button
													type="submit"
													class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
													disabled={loading}
												>
													{#if loading}
														<div
															class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
														></div>
														Accesso in corso...
													{:else}
														Accedi
														<ArrowRight class="w-5 h-5" />
													{/if}
												</button>
											</form>
										{:else}
											<form
												method="POST"
												action="?/register"
												use:enhance={formSubmit}
												class="space-y-6"
											>
												<!-- Email field -->
												<div class="space-y-2">
													<label
														for="register-email"
														class="block text-sm font-medium text-gray-700"
													>
														Email
													</label>
													<div class="relative group">
														<div
															class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
														>
															<Mail
																class="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
															/>
														</div>
														<input
															id="register-email"
															type="email"
															class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
															placeholder="il.tuo@email.com"
															bind:value={registerEmail}
															required
														/>
													</div>
												</div>

												<!-- Password field -->
												<div class="space-y-2">
													<label
														for="register-password"
														class="block text-sm font-medium text-gray-700"
													>
														Password
													</label>
													<div class="relative group">
														<div
															class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
														>
															<Lock
																class="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
															/>
														</div>
														<input
															id="register-password"
															type={showPassword ? 'text' : 'password'}
															class="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
															placeholder="Crea una password sicura"
															bind:value={password1}
															required
														/>
														<button
															type="button"
															class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-800 transition-colors"
															onclick={togglePasswordVisibility}
														>
															{#if showPassword}
																<EyeOff class="w-5 h-5" />
															{:else}
																<Eye class="w-5 h-5" />
															{/if}
														</button>
													</div>
													<p class="text-xs text-purple-300">
														Almeno 8 caratteri con numeri e lettere
													</p>
												</div>

												<!-- Confirm Password field -->
												<div class="space-y-2">
													<label
														for="confirm-password"
														class="block text-sm font-medium text-gray-700"
													>
														Conferma Password
													</label>
													<div class="relative group">
														<div
															class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
														>
															<Lock
																class="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
															/>
														</div>
														<input
															id="confirm-password"
															type={showPassword ? 'text' : 'password'}
															class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
															placeholder="Conferma la password"
															bind:value={password2}
															required
														/>
													</div>
												</div>

												<!-- Error message -->
												{#if error}
													<div
														class="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm"
													>
														{error}
													</div>
												{/if}

												<!-- Submit button -->
												<button
													type="submit"
													class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
													disabled={loading}
												>
													{#if loading}
														<div
															class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
														></div>
														Registrazione in corso...
													{:else}
														Crea Account
														<UserPlus class="w-5 h-5" />
													{/if}
												</button>
											</form>
										{/if}
									</div>
								{/key}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<Modal isOpen={openModal} header={modalTitle}>
	<button
		class="btn btn-sm btn-circle absolute right-2 top-2 text-base-content"
		onclick={onCloseModal}>✕</button
	>
	<!-- <dialog class="modal modal-bottom sm:modal-middle {openModal ? 'modal-open' : ''}"> -->
	<div
		class="p-6 bg-base-100/95 backdrop-blur-xl border border-base-content/10 relative"
		in:scale|local={{ start: 0.95, duration: 300, easing: quintOut }}
		out:scale|local={{ start: 0.95, duration: 200, easing: quintOut }}
	>
		<!-- <button
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			onclick={() => onCloseModal}>✕</button
		> -->
		<!-- <h3 class="font-bold text-xl mb-4">{modalTitle}</h3> -->
		<p class="text-base-content/70 mb-6">
			Inserisci il tuo indirizzo email e ti invieremo un link per reimpostare la password.
		</p>

		<form method="POST" action={postAction} use:enhance={formSubmit} class="space-y-4">
			<label class="form-control w-full">
				<div class="label"><span class="label-text">Email</span></div>
				<div class="relative group">
					<span
						class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors"
					>
						<Mail class="w-5 h-5" />
					</span>
					<input
						name="resetEmail"
						type="email"
						placeholder="la.tua@email.com"
						class="input input-bordered w-full pl-10"
						bind:value={resetEmail}
						required
					/>
				</div>
			</label>

			<div class="modal-action mt-6">
				{#if loading}
					<Loader />
				{:else}
					<button type="button" class="btn flex-1" onclick={onCloseModal}>Annulla</button>
					<button type="submit" class="btn btn-primary flex-1"> Invia Link </button>
				{/if}
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop" onsubmit={onCloseModal}>
		<button type="submit">close</button>
	</form>
	<!-- </dialog> -->
</Modal>

<style>
</style>
