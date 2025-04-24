<script lang="ts">
	import { onMount } from 'svelte';

	let currentStep = 1;
	let formData = {
		name: '',
		email: '',
		password: ''
	};
	let errors: { [key: string]: string } = {};
	let isSubmitting = false;

	const steps = [
		{ title: 'Account Information', fields: ['name', 'email'] },
		{ title: 'Password', fields: ['password'] }
	];

	$: isFormValid = Object.keys(errors).length === 0 && currentStep === steps.length;

	async function submitForm() {
		isSubmitting = true;
		try {
			const response = await fetch('/api/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				// Success!
				alert('Form submitted successfully!');
			} else {
				// Handle errors from the server
				const data = await response.json();
				errors = data.errors || {};
			}
		} catch (error) {
			console.error('Error submitting form:', error);
			alert('An error occurred while submitting the form.');
		} finally {
			isSubmitting = false;
		}
	}

	function validateField(key: string) {
		let error = '';
		if (key === 'name' && !formData.name) {
			error = 'Name is required.';
		} else if (key === 'email' && !formData.email) {
			error = 'Email is required.';
		} else if (key === 'password' && !formData.password) {
			error = 'Password is required.';
		}
		return error;
	}

	$: {
		for (const key in formData) {
			errors[key] = validateField(key);
		}
	}

	function nextStep() {
		if (currentStep < steps.length) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	onMount(() => {
		// Initial focus
		document.getElementById('name')?.focus();
	});
</script>

<div class="min-h-screen bg-gray-900 text-white py-12">
	<div class="container mx-auto px-4">
		<div class="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden">
			<div class="bg-gray-900 py-6 px-8">
				<h1 class="text-2xl font-bold mb-4">Create Account</h1>

				<div class="flex justify-between items-center">
					<div class="flex items-center">
						{#each steps as step, index}
							<div class="flex items-center">
								<span
									class="text-sm font-medium {index + 1 === currentStep
										? 'text-blue-500'
										: 'text-gray-400'}">{index + 1}</span
								>
								<span class="ml-2">{step.title}</span>
							</div>
							{#if index < steps.length - 1}
								<span class="mx-2 text-gray-400">→</span>
							{/if}
						{/each}
					</div>

					<button
						on:click={submitForm}
						class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Submitting...' : 'Submit'}</button
					>
				</div>
			</div>

			<div class="p-8">
				<form>
					{#each steps[currentStep - 1].fields as field}
						<div class="mb-4">
							<label for={field} class="block text-sm font-medium text-gray-300">
								{field.charAt(0).toUpperCase() + field.slice(1)}
							</label>
							<input
								type="text"
								id={field}
								bind:value={formData[field as keyof typeof formData]}
								class="mt-1 block w-full rounded-md shadow-sm bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white"
								placeholder={field}
								on:input={() => (errors[field] = validateField(field))}
							/>
							{#if errors[field]}
								<p class="text-sm text-red-500 mt-1">{errors[field]}</p>
							{/if}
						</div>
					{/each}
				</form>

				<div class="flex justify-between items-center mt-6">
					{#if currentStep > 1}
						<button
							on:click={prevStep}
							class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
						>
							Previous
						</button>
					{/if}
					{#if currentStep < steps.length}
						<button
							on:click={nextStep}
							class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
						>
							Next
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
