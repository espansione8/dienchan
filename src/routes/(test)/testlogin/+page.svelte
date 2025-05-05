<!-- src/routes/login/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { CircleAlert, CircleCheck } from 'lucide-svelte';

	let { form } = $props(); // Contains data returned from actions

	let var1 = $state('');
	let var2 = $state('');

	const positions = ['CEO', 'DIRECTOR', 'MANAGER'];
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Login to your account" />
</svelte:head>

<div class="flex justify-center items-center min-h-screen bg-base-200 p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title text-2xl justify-center mb-6">Login</h1>

			{#if form?.success}
				<div role="alert" class="alert alert-success mb-4">
					<CircleCheck class="stroke-current shrink-0 h-6 w-6" />
					<span>{form.message}</span>
				</div>
			{/if}

			{#if form?.missing || form?.apiError || form?.registering}
				<div role="alert" class="alert alert-error mb-4">
					<CircleAlert class="stroke-current shrink-0 h-6 w-6" />
					<span>{form.message}</span>
				</div>
			{/if}

			<form method="POST" use:enhance>
				<!-- Login Action is default unless overridden by formaction -->
				<input type="hidden" name="action" value="login" />

				<div class="form-control mb-4">
					<label class="label" for="username">
						<span class="label-text">Username</span>
					</label>
					<input
						type="text"
						id="username"
						name="username"
						placeholder="Enter your username"
						class="input input-bordered w-full"
						bind:value={var1}
						required
					/>
				</div>

				<div class="form-control mb-4">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						type="password"
						id="password"
						name="password"
						placeholder="Enter your password"
						class="input input-bordered w-full"
						required
					/>
					<!-- Note: We don't re-fill password for security -->
				</div>

				<div class="form-control mb-6">
					<label class="label" for="position">
						<span class="label-text">Position</span>
					</label>
					<select
						id="position"
						name="position"
						class="select select-bordered w-full"
						bind:value={var2}
						required
					>
						<option disabled selected value="">Select Position</option>
						{#each positions as pos}
							<option value={pos}>{pos}</option>
						{/each}
					</select>
				</div>

				<div class="card-actions justify-between items-center">
					<button type="submit" name="login" formaction="?/login" class="btn btn-primary"
						>Login</button
					>
					<button type="submit" name="register" formaction="?/register" class="btn btn-secondary"
						>Register</button
					>
				</div>
			</form>
		</div>
	</div>
</div>
