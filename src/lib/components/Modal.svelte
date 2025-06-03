<script lang="ts">
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	let {
		isOpen = $bindable(false), // custom Dienchan, default use $bindable(false)
		header = '',
		headerBg = 'bg-primary',
		children,
		footer = '',
		footerColor = 'text-error',
		cssClass = ''
	} = $props();
	let modalCSS = `modal-box bg-white p-0 ${cssClass}`;
	let headerCSS = `${headerBg} p-5 rounded-t-lg`;
	let footerCSS = `${footerColor} pb-3 px-3`;

	//////// INSTRUCTIONS

	// import Modal from '$lib/components/Modal.svelte';

	// SHORT version
	// <Modal isOpen={isModal}> HTML HERE </Modal>

	// LONG version
	// <Modal
	// isOpen={isModal}
	// header="modal title"     // optional / default ''
	// headerBg=""              // optional / default bg-primary
	// footer="modal footer"    // optional / default ''
	// footerColor=""           // optional / default text-error
	// cssClass = ''=""         // optional / default ''
	// >
	// <button
	// 	class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
	// 	onclick={() => (isModal = false)}>✕</button
	// >
	// CONTENT HERE
	// </Modal>

	////////
</script>

<dialog id="modal" class="modal" class:modal-open={isOpen}>
	<div
		class={modalCSS}
		in:scale|local={{ start: 0.9, duration: 400, easing: quintOut }}
		out:scale|local={{ start: 0.9, duration: 200, easing: quintOut }}
	>
		<!-- <button
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			onclick={() => (isOpen = false)}>✕</button
		> -->
		<!-- header -->
		<div class={headerCSS}>
			<h2 class="text-2xl font-semibold text-white mb-1">
				{header}
			</h2>
		</div>
		<div class="container mx-auto">
			{@render children()}
		</div>
		<!-- <div class="divider divider-primary"></div>
		<div class={footerCSS}>
			{footer}
		</div> -->
	</div>
</dialog>
