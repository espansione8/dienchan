import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {

	return {
		userData: locals.data,
		auth: locals.auth
	};
}

export const actions: Actions = {
	// onclick={() => {
	// 	discountApplied = true;
	// 	if (!discountCode) {
	// 		discountApplied = true;
	// 		discountError = true;
	// 		return;
	// 	}
	// 	discountList.push(discountCode);
	// 	discountList = discountList;
	// 	discountCode = '';
	// 	discountError = false;
	// }}
	applyDiscount: async ({ request, fetch, event }) => {
		const formData = await request.formData();
		const discountCode = formData.get('discountCode');
		const cart = formData.get('cart');
		const cartArray = JSON.parse(cart)

		// console.log({ cartArray })

		if (!discountCode) {
			return fail(400, { action: 'applyDiscount', success: false, message: 'Dati mancanti' });
		}

		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/check`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					discountCode
				})
			});
			const discount = await response.json();
			// console.log({ discount });
			if (response.status == 200) {
				let cartTotal: number = 0;    //0-190 1-705		   	  895
				let newCartTotal: number = 0;  //0-180 1-             875
				
				const newCart = cartArray.map((item: any, i ) => {
					const discountType = discount.selectedApplicability;
					cartTotal += item.layoutView.price;
					if (discountType === 'userId' || discountType === 'membershipLevel') {
						if (discount.type === 'amount') {
							newCartTotal = cartTotal - discount.value;
						}
						if (discount.type === 'percent') {
							newCartTotal = cartTotal - (cartTotal * discount.value) / 100;
						}
					} else if (item[discountType] === discount[discountType]) {
						console.log(item.layoutView.title, item.layoutView.price, discount.type, discount.value,i);
						if (discount.type == 'amount') {
							item.layoutView.price -= discount.value;
							console.log(cartTotal - (discount.value * item.orderQuantity), i)
							console.log((discount.value * item.orderQuantity), i)
							newCartTotal = cartTotal - (discount.value * item.orderQuantity);
						}
						if (discount.type == 'percent') {
							item.layoutView.price -= (item.layoutView.price * discount.value) / 100;
							newCartTotal = cartTotal - (((item.layoutView.price * discount.value) / 100) * item.orderQuantity);
						}
					} else {
						newCartTotal +=  item.layoutView.price
					}
					return item;
				});
				// console.log({ newCartTotal, cartTotal, newCart });
				// controllo i prezzi in log
				// newCart.forEach((item: any) => {
				// 	console.log(item.layoutView.price);
				// });

				return { action: 'applyDiscount', success: true, message: "sconto applicato", payload: { discount, newCart, newCartTotal, cartTotal } };
			} else {
				return { action: 'applyDiscount', success: false, message: discount.message };
			}
		} catch (error) {
			console.error('Error apply Discount:', error);
			return { action: 'applyDiscount', success: false, message: 'Errore sconto' };
		}
	},

	// modifyDiscount: async ({ request, fetch }) => {
	// 	const formData = await request.formData();
	// 	const discountId = formData.get('discountId');
	// 	const code = formData.get('code');
	// 	const type = formData.get('type');
	// 	const value = formData.get('value');
	// 	const selectedApplicability = formData.get('applicability');
	// 	const userId = formData.get('userId') || '';
	// 	const membershipLevel = formData.get('membershipLevel') || '';
	// 	const productId = formData.get('productId') || '';
	// 	const layoutId = formData.get('layoutId') || '';
	// 	const notes = formData.get('notes') || '';

	// 	if (!code || !type || !value || !discountId) {
	// 		return fail(400, { action: 'modifyDiscount', success: false, message: 'Dati mancanti' });
	// 	}

	// 	// console.log({ code, type, value, userId, membershipLevel, productId, layoutId, notes });
	// 	try {
	// 		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/modify`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json'
	// 			},
	// 			body: JSON.stringify({
	// 				discountId,
	// 				code,
	// 				type,
	// 				value,
	// 				selectedApplicability,
	// 				userId,
	// 				membershipLevel,
	// 				productId,
	// 				layoutId,
	// 				notes
	// 			})
	// 		});
	// 		const result = await response.json();
	// 		if (response.ok) {
	// 			return { action: 'modifyDiscount', success: true, message: result.message };
	// 		} else {
	// 			return { action: 'modifyDiscount', success: false, message: result.message };
	// 		}
	// 	} catch (error) {
	// 		console.error('Error creating new modifyDiscount:', error);
	// 		return { action: 'modifyDiscount', success: false, message: 'Errore creazione modifyDiscount' };
	// 	}
	// },

	// disableDiscount: async ({ request, fetch }) => {
	// 	const formData = await request.formData();
	// 	const discountId = formData.get('discountId');
	// 	const status = formData.get('status');
	// 	if (!discountId) {
	// 		return fail(400, { action: 'disableDiscount', success: false, message: 'Dati mancanti' });
	// 	}

	// 	// console.log({ code, type, value, userId, membershipLevel, productId, layoutId, notes });
	// 	try {
	// 		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/status`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json'
	// 			},
	// 			body: JSON.stringify({
	// 				discountId,
	// 				status
	// 			})
	// 		});
	// 		const result = await response.json();
	// 		if (response.status == 200) {
	// 			return { action: 'disableDiscount', success: true, message: result.message };
	// 		} else {
	// 			return { action: 'disableDiscount', success: false, message: result.message };
	// 		}
	// 	} catch (error) {
	// 		console.error('Error changing discount status:', error);
	// 		return { action: 'disableDiscount', success: false, message: 'Errore modifica Discount' };
	// 	}
	// },

	// deleteDiscount: async ({ request, fetch }) => {

	// 	const formData = await request.formData();
	// 	const discountId = formData.get('discountId');
	// 	try {
	// 		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/remove`, {
	// 			method: 'DELETE',
	// 			headers: {
	// 				'Content-Type': 'application/json'
	// 			},
	// 			body: JSON.stringify({
	// 				discountId
	// 			})
	// 		});
	// 		const result = await response.json();
	// 		if (response.ok) {
	// 			return { action: 'deleteDiscount', success: true, message: result.message };
	// 		} else {
	// 			return { action: 'deleteDiscount', success: false, message: result.message };
	// 		}
	// 	} catch (error) {
	// 		console.error('Error deleteDiscount:', error);
	// 		return { action: 'deleteDiscount', success: false, message: 'Errore deleteDiscount' };
	// 	}
	// }

} satisfies Actions;