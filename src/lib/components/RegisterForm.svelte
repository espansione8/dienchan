<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { UserPlus, Mail, Lock } from 'lucide-svelte';
	//import Notification from '$lib/components/Notification.svelte';
	let noteState = false;
	let noteContent = '';

	const dispatch = createEventDispatcher();

	let password1 = '';
	let password2 = '';
	let registerEmail = '';
	let checkPass = false;
	let checkSecondPass = false;
	let error;
	let inputRef = null;

	async function submitRegistration() {
		dispatch('submit', {
			registerEmail,
			password1
		});
		error = null;
		if (!checkPass || !checkSecondPass) {
			error = "PASSWORDS DON'T MATCH ";
			inputRef.focus();
			return;
		}
		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/sign-up`, {
			method: 'POST',
			body: JSON.stringify({ registerEmail, password1 }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			noteState = true;
			noteContent = (await response.json()).message;
			//dispatch('success');
			error = (await response.json()).message;
			return;
		}
		if (response.status != 200) {
			noteState = false;
			error = (await response.json()).message;
			return;
		}
	}

	// let viewPassword = false;
	// const togglePassword = () => (viewPassword = !viewPassword);

	const testPass = () => {
		checkPass = password1.length >= 8;
		checkSecondPass = password1 === password2;
	};
	const testSecondPass = () => (checkSecondPass = password1 === password2);

	// const changePass = (field, e) => {
	// 	if (field === 'pass1') {
	// 		password1 = e.target.value;
	// 		console.log('password1', password1, password1.length >= 8);
	// 	} else {
	// 		password2 = e.value;
	// 		console.log('password2', password2, password2.length >= 8);
	// 	}
	// };

	// const checkPassword = (password) => {
	//   console.log("check", regex.test(password));
	//   // return !!password.match(regex);
	// };
	const onPopupClose = (data, titleContent) => {
		noteState = false;
		console.log(data);
		// if (titleContent==='Upload Success') {
		// 	window.location = '/archive';
		// }
		redirectOnClose();
	};

	const redirectOnClose = () => {
		noteState = false;
		dispatch('success');
		//window.location = '/profile';
	};
</script>

<form action="" on:submit|preventDefault={submitRegistration}>
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
				placeholder="Inserisci email"
				aria-label="Email"
				aria-describedby="basic-email"
				bind:value={registerEmail}
				required
			/>
		</div>
	</div>
	<!-- Password -->
	<div class="mb-2">
		<label for="password" class="label">
			<p class="font-bold">
				Password <br />
				<span class="text-sm text-gray-600">( Almeno 8 caratteri numeri e lettere )</span>
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
				on:input={testPass}
				required
			/>
		</div>
	</div>
	<!-- Conferma Password -->
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
				on:input={testSecondPass}
				bind:this={inputRef}
				required
			/>
		</div>
	</div>
	<!-- button -->
	<div class="flex justify-center mt-8 mb-3">
		<button type="submit" class="btn w-full -mb-14 btn-primary btn-md rounded-md hover:text-white">
			REGISTRATI
			<UserPlus />
		</button>
	</div>
</form>
