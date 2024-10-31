<script lang="ts">
	import { FolderOpen } from 'lucide-svelte';

	//let {children, fileInput = $bindable([]), previewUrl = $bindable(null) } = $props();
	let { inputName = 'fileUpload' } = $props();

	// DRAG & DROP FILE UPLOAD
	let fileInput = $state();
	let previewUrl: string | null = $state(null);
	let isDragging = $state(false);
	let dragCounter = $state(0);

	const handleDragEnter = (e) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter++;
		isDragging = true;
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter--;
		if (dragCounter === 0) {
			isDragging = false;
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging = true;
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;
		dragCounter = 0;

		const files = e.dataTransfer.files;
		if (files.length) {
			const file = files[0];
			// Check file type
			if (file.type.match(/^image\/(jpg|jpeg|png|webp)$/)) {
				fileInput.files = files;
				previewUrl = URL.createObjectURL(file);
			}
		}
	};

	// INSTRUCTION server action
	// const formData = await request.formData();
	// const userId = formData.get('userId');
	// const file = formData.get('setProfilePic') || '';

	// const uploadImg = await fetch(`${import.meta.env.VITE_BASE_URL}/api/uploads/files`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				'x-file-name': file.name,
	// 				'x-folder-name': `user/${userId}`
	// 			},
	// 			body: file
	// 		});
	// if (uploadImg.status == 200) return { action: 'new', success: true, message: 'file OK' };

	// INSTRUCTION frontend
	// <DragDrop inputName="setProfilePic">
</script>

<div class="form-control w-full cursor-pointer">
	<div
		role="region"
		class="form-control w-full relative h-48 rounded-lg border-2 transition-colors duration-200 {isDragging
			? 'border-green-500 bg-green-50'
			: 'border-dashed border-blue-700 bg-gray-100 hover:border-blue-500 hover:bg-gray-50'} flex justify-center items-center"
		ondragenter={handleDragEnter}
		ondragleave={handleDragLeave}
		ondragover={handleDragOver}
		ondrop={handleDrop}
	>
		<label class="form-control w-full h-full" for={inputName}>
			{#if previewUrl}
				<div class="flex flex-col items-center justify-center">
					<img src={previewUrl} alt="Upload Preview" class="mt-2 max-h-32" />
					<button
						class="btn btn-error btn-sm mt-4 z-index-10"
						type="button"
						onclick={() => {
							previewUrl = null;
							fileInput.value = ''; // Reset the file input
							URL.revokeObjectURL(previewUrl); // Clean up the object URL
						}}
					>
						cancella
					</button>
				</div>
			{:else}
				<div class="flex flex-col items-center absolute inset-0 justify-center pointer-events-none">
					<FolderOpen size={64} class={isDragging ? 'text-green-500' : 'text-blue-700'} />
					<span class="block text-gray-600 font-normal text-center px-4">
						{isDragging
							? 'Rilascia il file qui'
							: 'Drag & Drop oppure clicca per scegliere un file'}
					</span>
				</div>
			{/if}
			<input
				type="file"
				id={inputName}
				name={inputName}
				placeholder="image"
				accept=".jpg, .jpeg, .png, .webp"
				class="h-full w-full opacity-0 absolute top-0 left-0"
				bind:this={fileInput}
				onchange={(event) => {
					const file = event.target.files[0];
					if (file) {
						previewUrl = URL.createObjectURL(file);
					}
				}}
			/>
		</label>
	</div>
</div>
