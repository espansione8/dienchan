<script lang="ts">
	import { page } from '$app/stores';
	import { cartProducts } from '$lib/stores/cart';
	import { ShoppingCart } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	// TODO check https://www.youtube.com/watch?v=tErKyuUTzsM 13.30 Shared state/ bidable 18:11

	//////// INSTRUCTIONS
	// import CartFloat from '$lib/components/CartFloat.svelte';
	// import { cartProducts } from '$lib/stores/cart';
	//
	// at the end of HTML
	// {#if $cartProducts.length > 0}
	// <CartFloat />
	// {/if}
	////////
</script>

<div class="toast toast-end toast-middle" transition:slide={{ axis: 'x', duration: 300 }}>
	<div class="w-14">
		<div>
			<a
				class="btn btn-sm btn-primary rounded-t-lg rounded-b-none w-14 py-0"
				class:active={$page.url.pathname === '/cart/'}
				href="/cart"
				aria-current="page"
			>
				{#if $cartProducts.length > 0}
					<h3
						class="badge badge-sm p-2 indicator-item rounded-full bg-blue-200 text-green-600 border-green-500"
					>
						<strong>{$cartProducts.length}</strong>
					</h3>
				{/if}
			</a>
		</div>
		<div>
			<a
				class="btn btn-sm btn-primary rounded-b-lg rounded-t-none w-14 py-0"
				class:active={$page.url.pathname === '/cart/'}
				href="/cart"
				aria-current="page"
			>
				<ShoppingCart />
			</a>
		</div>
	</div>
	<!-- </div> -->
</div>
