<script lang="ts">
	//import { goto, invalidateAll } from '$app/navigation';
	import { browser } from '$app/environment';
	import { LogIn, UserPlus, Mail, KeyRound, RefreshCw } from 'lucide-svelte';
	import Notification from '$lib/components/Notification.svelte';
	// import LoginForm from '$lib/components/LoginForm.svelte';
	// import RegisterForm from '$lib/components/RegisterForm.svelte';
	import { page } from '$app/stores';
	console.log('page.data requestId', $page.data);

	// notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 5000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer

	let loginEmail: string = $state('');
	let loginPassword: string = $state('');
	let error: string = $state('');
	let password1 = $state('');
	let password2 = $state('');
	let registerEmail = $state('');
	let checkPass = $state(false);
	let checkSecondPass = $state(false);
	let inputRef: any = $state(null);

	const submitLogin = async () => {
		// Reset error from previous failed attempts
		error = '';
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
				console.log('login redirect');
				//goto('/profile-modify');
				window.location.href = '/profile-modify';
			} else {
				//console.log('Errore res 1', res);
				toastClosed = false;
				notificationContent = response.message;
				notificationError = true;
				error = `error, ${response.message}`;
			}
		} catch (err) {
			//console.log('Errore res 2', err);
			error = `Auth server error`;
		}
	};

	const submitRegistration = async () => {
		error = '';
		if (!checkPass || !checkSecondPass) {
			error = "PASSWORDS DON'T MATCH ";
			inputRef.focus();
			return;
		}
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
			//console.log('Errore res 2', err);
			error = `Auth server error`;
		}
	};

	// let viewPassword = false;
	// const togglePassword = () => (viewPassword = !viewPassword);

	// const testPass = () => {
	// 	checkPass = password1.length >= 8;
	// 	checkSecondPass = password1 === password2;
	// };
	// const testSecondPass = () => (checkSecondPass = password1 === password2);

	let isLogin = $state(true);

	// const switchForm = () => {
	// 	isLogin = !isLogin;
	// 	error = '';
	// };

	let isRecovery = true;
	const enableModal = () => (isRecovery = !isRecovery);

	let resetState = $state(false);
	const enableReset = () => (resetState = !resetState);

	let uploading = $state(false);
	let TransferStateContent = $state('');
	let resetNotification = $state('');

	let browserLanguage: string = $state('');
	if (browser) {
		const getStringBeforeDash = (inputString: string) => {
			const parts = inputString.split('-');
			return parts[0];
		};
		const lang = navigator.language || navigator.languages[0];
		browserLanguage = getStringBeforeDash(lang);
	}

	// RESET PASS
	// const onSendReset = async (newData: any) => {
	// 	//console.log('reser data', newData);
	// 	uploading = true;
	// 	const data = {
	// 		email: newData.userMail
	// 	};
	// 	const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/password-reset`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 			//'Content-Type': 'application/pdf'
	// 			//Accept: 'application/pdf'
	// 		},
	// 		body: JSON.stringify(data)
	// 	});
	// 	const response = await res.json();
	// 	if (res.ok) {
	// 		resetState = false;
	// 		//console.log('res.ok', response);
	// 		uploading = false;
	// 		//titleContent = 'Certification Launched';
	// 		TransferStateContent = `<br/>UPDATE:<br/> ${response.message}`;
	// 		resetNotification =
	// 			'temporary password have been sent to your email! Use it to login to your profile and set a new one';
	// 	} else {
	// 		//console.log('Errore res 1', res);
	// 		uploading = false;
	// 		TransferStateContent = `<br/>ERROR:<br/> [Error Reset, ${response.message}]`;
	// 	}
	// };
</script>

<!-- <div class="bg-linear-to-r from-cyan-500 to-blue-500 pt-2 pb-3"> -->
<div class="animate-color-fade pt-2 pb-3">
	<!-- Navbar -->
	<section class="container mx-auto text-center">
		<!-- Header -->
		<!-- <p>(browser language: {browserLanguage})</p> -->
		<h1 class="text-center text-white text-2xl font-semibold pb-2">
			{isLogin ? 'LOGIN' : 'REGISTRAZIONE'}
		</h1>
		<!-- Button Group -->
		<!-- <div class="flex justify-center">
			<button
				class="btn btn-md {isLogin
					? 'btn-primary hover:text-white'
					: ''} rounded-l-xl rounded-r-none"
				onclick={switchForm}
			>
	
				<LogIn />
				<h5 class={isLogin ? 'text-bold' : 'text-semibold'}>LOGIN</h5>
			</button>
			<button class="btn btn-md rounded-none" onclick={switchForm}>
				<RefreshCw class="animate-spin" />
			</button>
			<button
				class="btn btn-md {isLogin
					? ''
					: 'btn-primary hover:text-white'} rounded-r-xl rounded-l-none"
				onclick={switchForm}
			>
				<UserPlus />
				<h5 class={isLogin ? 'text-bold' : 'text-semibold'}>REGISTRAZIONE</h5>
			</button>
		</div> -->
		<!-- Separator -->
		<hr class="bg-white h-0.5 mt-3 opacity-100 mx-auto w-[385px]" />
		<!-- Info Text -->
		<p class="text-white my-1 text-md">
			<!-- {isLogin ? 'Fill data to Sign IN.' : 'New account? Sign UP in 10 seconds!'} -->
		</p>
		<!-- Card  -->
		<div class="mb-3 bg-base-100 p-4 md:p-6 lg:p-1 max-w-sm mx-auto rounded-lg">
			<div class="card p-6 max-w-sm w-full">
				<img
					class="img-fluid mb-4"
					src={isLogin
						? '/images/undraw_secure_login_pdn4.svg'
						: '/images/undraw_wall_post_re_y78d.svg'}
					alt="login"
				/>
				<div class="card-body text-left">
					{#if isLogin}
						<!-- <LoginForm on:success={redirectToCustomPage} /> -->
						<form class="">
							<!-- email -->
							<div class="mb-2">
								<label class="input validator">
									<Mail />
									<input
										id="email"
										type="email"
										placeholder="Insert Email"
										aria-label="Email"
										aria-describedby="basic-email"
										bind:value={loginEmail}
										required
									/>
								</label>
							</div>
							<!-- Password -->
							<div class="mb-2">
								<label class="input validator">
									<KeyRound />
									<input
										id="password"
										type="password"
										placeholder="Insert Password"
										aria-label="Password"
										aria-describedby="basic-password"
										bind:value={loginPassword}
										required
									/>
								</label>
							</div>
							<!-- error message -->
							{#if error}
								<p class="text-red-800">{error}</p>
							{/if}
							<!-- remember me -->
							<div class="mt-4 mb-4">
								<div class="form-check">
									<input class="form-checkbox" type="checkbox" value="" id="checkDefault" />
									<label class="form-check-label" for="checkDefault"> Remember me </label>
								</div>
							</div>
							<!-- button -->
							<div class="flex justify-center mb-3">
								<button
									onclick={submitLogin}
									class="btn w-full -mb-14 btn-primary btn-md rounded-md hover:text-white"
								>
									LOGIN
									<LogIn />
								</button>
							</div>
						</form>
						<!-- {:else}
						
						<form action="" onsubmit={submitRegistration}>
				
							<div class="mb-2">
								<label for="email" class="label">
									<p class="font-bold">Email</p>
								</label>
								<div
									class="relative flex items-center space-x-2 rounded-r-md rounded-l-lg border border-gray-400 bg-white px-2 text-gray-900 shadow-xs"
								>
									<span class="flex items-center p-3 -m-2 rounded-l-md bg-gray-400">
										<Mail />
									</span>
									<input
										class="input rounded-md w-full"
										id="email"
										type="email"
										placeholder="Inserisci email"
										aria-label="Email"
										aria-describedby="basic-email"
										bind:value={registerEmail}
										required
									/>
								</div>
							</div>
						
							<div class="mb-2">
								<label for="password" class="label">
									<p class="font-bold">
										Password <br />
										<span class="text-sm text-gray-600"
											>( Almeno 8 caratteri numeri e lettere )</span
										>
									</p>
								</label>
								<div
									class="relative flex items-center space-x-2 rounded-r-md rounded-l-lg border border-gray-400 bg-white px-2 text-gray-900 shadow-xs"
								>
									<span class="flex items-center p-3 -m-2 rounded-l-md bg-gray-400">
										<Lock color={checkPass ? 'green' : 'black'} />
									</span>
									<input
										class="input rounded-md w-full"
										id="password"
										type="password"
										placeholder="your password"
										aria-label="Password"
										aria-describedby="basic-password"
										bind:value={password1}
										oninput={testPass}
										required
									/>
								</div>
							</div>
					
							<div class="mb-2">
								<label for="password2" class="label">
									<p class="font-bold">
										Conferma password <br />
										{#if error}
											<span class="text-xs text-red-600">{error}</span>
										{/if}
									</p>
								</label>
								<div
									class="relative flex items-center space-x-2 rounded-r-md rounded-l-lg border border-gray-400 bg-white px-2 text-gray-900 shadow-xs"
								>
									<span class="flex items-center p-3 -m-2 rounded-l-md bg-gray-400">
										<Lock color={checkSecondPass && checkPass ? 'green' : 'black'} />
									</span>
									<input
										class="input rounded-md w-full"
										id="password2"
										type="password"
										placeholder="Repeat password"
										bind:value={password2}
										oninput={testSecondPass}
										bind:this={inputRef}
										required
									/>
								</div>
							</div>
					
							<div class="flex justify-center mt-8 mb-3">
								<button
									type="submit"
									class="btn w-full -mb-14 btn-primary btn-md rounded-md hover:text-white"
								>
									REGISTRATI
									<UserPlus />
								</button>
							</div>
						</form> -->
					{/if}
				</div>
			</div>
		</div>
	</section>
	<div class="flex justify-center">
		<button onclick={enableReset} class="btn btn-accent btn-sm rounded-md hover:text-white">
			Recupera Password
		</button>
	</div>
</div>
<Notification {toastClosed} {notificationContent} {notificationError} />

<style>
	/*css*/
	hr {
		background-color: #fff;
		opacity: 1;
		display: block;
		height: 3px;
	}
	/*
	.wrapper {
		background: #4c89bb;
		background: linear-gradient(to top left, #13a6ff 50%, #3c4096 100%);
		background: linear-gradient(to bottom right, #13a6ff 50%, #3c4096 100%);
		padding-top: 1.5rem;
		padding-bottom: 1.5rem;
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
		*/
</style>
