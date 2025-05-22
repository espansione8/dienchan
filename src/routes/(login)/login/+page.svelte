<script lang="ts">
	import { browser } from '$app/environment';
	import {
		LogIn,
		UserPlus,
		Mail,
		KeyRound,
		RefreshCw,
		Lock,
		Eye,
		EyeOff,
		ArrowRight
	} from 'lucide-svelte';
	import Notification from '$lib/components/Notification.svelte';
	import { page } from '$app/state';

	// Notification state
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;

	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 5000);
	};

	// Form state
	let loginEmail: string = $state('');
	let loginPassword: string = $state('');
	let error: string = $state('');
	let password1 = $state('');
	let password2 = $state('');
	let registerEmail = $state('');
	let checkPass = $state(false);
	let checkSecondPass = $state(false);
	let inputRef: any = $state(null);
	let rememberMe: boolean = $state(false);
	let isLoading: boolean = $state(false);
	let showPassword: boolean = $state(false);

	// Toggle password visibility
	const togglePasswordVisibility = () => {
		showPassword = !showPassword;
	};

	// Form submission handlers
	const submitLogin = async () => {
		// Reset error from previous failed attempts
		error = '';
		isLoading = true;

		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/sign-in`, {
				method: 'POST',
				body: JSON.stringify({
					loginEmail,
					loginPassword
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();

			if (res.status == 200) {
				window.location.href = '/profile-modify';
			} else {
				toastClosed = false;
				notificationContent = response.message;
				notificationError = true;
				error = `${response.message}`;
			}
		} catch (err) {
			error = `Auth server error`;
		} finally {
			isLoading = false;
		}
	};

	const submitRegistration = async () => {
		error = '';
		if (!checkPass || !checkSecondPass) {
			error = "PASSWORDS DON'T MATCH ";
			inputRef.focus();
			return;
		}

		isLoading = true;

		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/sign-up`, {
				method: 'POST',
				body: JSON.stringify({ registerEmail, password1 }),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.status == 200) {
				window.location.href = '/profile-modify';
			} else {
				toastClosed = false;
				notificationContent = (await response.json()).message;
				notificationError = true;
				error = (await response.json()).message;
			}
		} catch (err) {
			error = `Auth server error`;
		} finally {
			isLoading = false;
		}
	};

	// Form switching
	let isLogin = $state(true);
	const switchForm = () => {
		isLogin = !isLogin;
		error = '';
	};

	// Password reset
	let isRecoveryModalOpen = $state(false);
	let resetEmail = $state('');

	const openRecoveryModal = () => {
		isRecoveryModalOpen = true;
	};

	const closeRecoveryModal = () => {
		isRecoveryModalOpen = false;
	};

	const submitPasswordReset = async () => {
		error = '';
		isLoading = true;

		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/password-reset`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email: resetEmail })
			});

			const response = await res.json();

			if (res.ok) {
				isRecoveryModalOpen = false;
				toastClosed = false;
				notificationContent = 'Password reset link sent to your email';
				notificationError = false;
			} else {
				toastClosed = false;
				notificationContent = response.message;
				notificationError = true;
			}
		} catch (err) {
			toastClosed = false;
			notificationContent = 'Server error. Please try again later.';
			notificationError = true;
		} finally {
			isLoading = false;
		}
	};

	// Browser language detection
	let browserLanguage: string = $state('');
	if (browser) {
		const getStringBeforeDash = (inputString: string) => {
			const parts = inputString.split('-');
			return parts[0];
		};
		const lang = navigator.language || navigator.languages[0];
		browserLanguage = getStringBeforeDash(lang);
	}
</script>

<!-- Main container with gradient background -->
<div
	class="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-300 flex flex-col items-center justify-center p-4"
>
	<div class="w-full max-w-md">
		<!-- Card container -->
		<div class="bg-base-100 rounded-xl shadow-2xl overflow-hidden">
			<!-- Form header with tabs -->
			<div class="flex border-b border-base-200">
				<button
					class={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all ${isLogin ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'hover:bg-base-200'}`}
					on:click={() => (isLogin = true)}
				>
					<LogIn size={18} />
					<span>Accedi</span>
				</button>
				<!-- <button
					class={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all ${!isLogin ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'hover:bg-base-200'}`}
					on:click={() => (isLogin = false)}
				>
					<UserPlus size={18} />
					<span>Registrati</span>
				</button> -->
			</div>

			<!-- Form content -->
			<div class="p-6">
				<!-- Login illustration -->
				<div class="flex justify-center mb-6">
					<img
						class="h-40 object-contain"
						src={isLogin
							? '/images/undraw_secure_login_pdn4.svg'
							: '/images/undraw_wall_post_re_y78d.svg' || '/placeholder.svg'}
						alt={isLogin ? 'Login illustration' : 'Registration illustration'}
					/>
				</div>

				{#if isLogin}
					<!-- Login form -->
					<form on:submit|preventDefault={submitLogin} class="space-y-4">
						<!-- Email field -->
						<div class="form-control">
							<label for="login-email" class="label">
								<span class="label-text font-medium">Email</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<Mail size={18} class="text-base-content/70" />
								<input
									id="login-email"
									type="email"
									class="flex-1 bg-transparent outline-none"
									placeholder="Il tuo indirizzo email"
									bind:value={loginEmail}
									required
								/>
							</div>
						</div>

						<!-- Password field -->
						<div class="form-control">
							<label for="login-password" class="label">
								<span class="label-text font-medium">Password</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<KeyRound size={18} class="text-base-content/70" />
								<input
									id="login-password"
									type={showPassword ? 'text' : 'password'}
									class="flex-1 bg-transparent outline-none"
									placeholder="La tua password"
									bind:value={loginPassword}
									required
								/>
								<button
									type="button"
									class="text-base-content/70 hover:text-primary"
									on:click={togglePasswordVisibility}
								>
									{#if showPassword}
										<EyeOff size={18} />
									{:else}
										<Eye size={18} />
									{/if}
								</button>
							</div>
						</div>

						<!-- Error message -->
						{#if error}
							<div class="bg-error/10 text-error px-4 py-2 rounded-lg text-sm">
								{error}
							</div>
						{/if}

						<!-- Remember me checkbox -->
						<div class="flex items-center justify-between">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									class="checkbox checkbox-sm checkbox-primary"
									bind:checked={rememberMe}
								/>
								<span class="label-text">Ricordami</span>
							</label>

							<button
								type="button"
								class="text-sm text-primary hover:underline"
								on:click={openRecoveryModal}
							>
								Password dimenticata?
							</button>
						</div>

						<!-- Submit button -->
						<button type="submit" class="btn btn-primary w-full" disabled={isLoading}>
							{#if isLoading}
								<span class="loading loading-spinner loading-sm"></span>
								Accesso in corso...
							{:else}
								Accedi
								<ArrowRight size={18} />
							{/if}
						</button>
					</form>
				{:else}
					<!-- Registration form -->
					<form on:submit|preventDefault={submitRegistration} class="space-y-4">
						<!-- Email field -->
						<div class="form-control">
							<label for="register-email" class="label">
								<span class="label-text font-medium">Email</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<Mail size={18} class="text-base-content/70" />
								<input
									id="register-email"
									type="email"
									class="flex-1 bg-transparent outline-none"
									placeholder="Il tuo indirizzo email"
									bind:value={registerEmail}
									required
								/>
							</div>
						</div>

						<!-- Password field -->
						<div class="form-control">
							<label for="register-password" class="label">
								<div class="flex flex-col">
									<span class="label-text font-medium">Password</span>
									<span class="text-xs text-base-content/70"
										>Almeno 8 caratteri con numeri e lettere</span
									>
								</div>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<Lock size={18} class={checkPass ? 'text-success' : 'text-base-content/70'} />
								<input
									id="register-password"
									type={showPassword ? 'text' : 'password'}
									class="flex-1 bg-transparent outline-none"
									placeholder="Crea una password"
									bind:value={password1}
									required
								/>
								<button
									type="button"
									class="text-base-content/70 hover:text-primary"
									on:click={togglePasswordVisibility}
								>
									{#if showPassword}
										<EyeOff size={18} />
									{:else}
										<Eye size={18} />
									{/if}
								</button>
							</div>
						</div>

						<!-- Confirm Password field -->
						<div class="form-control">
							<label for="confirm-password" class="label">
								<span class="label-text font-medium">Conferma Password</span>
							</label>
							<div class="input input-bordered flex items-center gap-2">
								<Lock
									size={18}
									class={checkSecondPass && checkPass ? 'text-success' : 'text-base-content/70'}
								/>
								<input
									id="confirm-password"
									type={showPassword ? 'text' : 'password'}
									class="flex-1 bg-transparent outline-none"
									placeholder="Conferma la password"
									bind:value={password2}
									bind:this={inputRef}
									required
								/>
							</div>
						</div>

						<!-- Error message -->
						{#if error}
							<div class="bg-error/10 text-error px-4 py-2 rounded-lg text-sm">
								{error}
							</div>
						{/if}

						<!-- Submit button -->
						<button type="submit" class="btn btn-primary w-full" disabled={isLoading}>
							{#if isLoading}
								<span class="loading loading-spinner loading-sm"></span>
								Registrazione in corso...
							{:else}
								Registrati
								<UserPlus size={18} />
							{/if}
						</button>
					</form>
				{/if}
			</div>
		</div>

		<!-- Footer text -->
		<div class="text-center mt-4 text-white/80 text-sm">
			{isLogin ? 'Non hai un account?' : 'Hai già un account?'}
			<button class="font-medium text-white hover:underline" on:click={switchForm}>
				{isLogin ? 'Registrati' : 'Accedi'}
			</button>
		</div>
	</div>
</div>

<!-- Password recovery modal -->
{#if isRecoveryModalOpen}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div class="bg-base-100 rounded-lg shadow-xl max-w-md w-full p-6">
			<h3 class="text-lg font-bold mb-4">Recupera Password</h3>

			<p class="text-base-content/80 mb-4">
				Inserisci il tuo indirizzo email e ti invieremo un link per reimpostare la password.
			</p>

			<div class="form-control mb-4">
				<label for="reset-email" class="label">
					<span class="label-text font-medium">Email</span>
				</label>
				<div class="input input-bordered flex items-center gap-2">
					<Mail size={18} class="text-base-content/70" />
					<input
						id="reset-email"
						type="email"
						class="flex-1 bg-transparent outline-none"
						placeholder="Il tuo indirizzo email"
						bind:value={resetEmail}
						required
					/>
				</div>
			</div>

			<div class="flex justify-end gap-2">
				<button class="btn btn-outline" on:click={closeRecoveryModal}> Annulla </button>
				<button class="btn btn-primary" on:click={submitPasswordReset} disabled={isLoading}>
					{#if isLoading}
						<span class="loading loading-spinner loading-sm"></span>
						Invio in corso...
					{:else}
						Invia Link
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<Notification {toastClosed} {notificationContent} {notificationError} />
