<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { LogIn, Mail, Lock } from 'lucide-svelte';
	const dispatch = createEventDispatcher();

	let loginEmail = '';
	let loginPassword = '';
	let error;

	const login = async () => {
		// Reset error from previous failed attempts
		error = undefined;

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

			if (res.ok) {
				//console.log('res.ok', res);
				dispatch('success');
			} else {
				//console.log('Errore res 1', res);
				error = `error, ${response.message}`;
			}
		} catch (err) {
			//console.log('Errore res 2', err);
			error = `Auth server error`;
		}
	};

	// let viewPassword = false;
	// const togglePassword = () => (viewPassword = !viewPassword);
</script>

<form class="">
	<!-- email -->
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
				placeholder="Insert Email"
				aria-label="Email"
				aria-describedby="basic-email"
				bind:value={loginEmail}
				required
			/>
		</div>
	</div>
	<!-- Password -->
	<div class="mb-2">
		<label for="password" class="label">
			<p class="font-bold">Password</p>
		</label>
		<div
			class="relative flex items-center space-x-2 rounded-r-md rounded-l-lg border border-gray-400 bg-white px-2 text-gray-900 shadow-xs"
		>
			<span class="flex items-center p-3 -m-2 rounded-l-md bg-gray-400">
				<Lock />
			</span>
			<input
				class="input rounded-md w-full"
				id="password"
				type="password"
				placeholder="Insert Password"
				aria-label="Password"
				aria-describedby="basic-password"
				bind:value={loginPassword}
				required
			/>
		</div>
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
			on:click|preventDefault={login}
			class="btn w-full -mb-14 btn-primary btn-md rounded-md hover:text-white"
		>
			LOGIN
			<LogIn />
		</button>
	</div>
</form>
