import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {

	return {
		userData: locals.data,
		auth: locals.auth
	};
}

export const actions: Actions = {
	
	applyDiscount: async ({ request, fetch, event }) => {
		const formData = await request.formData();
		const discountCode = formData.get('discountCode');
		const grandTotal = formData.get('grandTotal');
		const originalTotal = Number(grandTotal)
		const cart = formData.get('cart');
		const cartArray = JSON.parse(cart)

		////// LOG cart, comment in production
		cartArray.forEach((item: any, i: number) => {
			if (i == 0) console.log('cart start');
			console.log(item.title, item.layoutView.price, i);
		});
		///////////////

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
				//let cartTotal: number = 0;
				let newCartTotal: number = 0;
				const newCart = cartArray.map((item: any, i) => {
					const discountType = discount.selectedApplicability;
					//cartTotal += item.layoutView.price;

					//console.log('parziali',newCartTotal, i);
					if (item[discountType] == discount[discountType]) {
						//console.log('OK sconto', item.layoutView.title, item.layoutView.price, discount.type, discount.value, i);
						if (discount.type == 'amount') {
							item.layoutView.price -= discount.value;
							newCartTotal += (item.layoutView.price * item.orderQuantity)
						}
						if (discount.type == 'percent') {
							item.layoutView.price -= (item.layoutView.price * discount.value) / 100;
							newCartTotal += (item.layoutView.price * item.orderQuantity)
						}
					} else {
						newCartTotal += item.layoutView.price
					}
					return item;
				});
				// apply final discount
				if (discount.selectedApplicability == 'userId' || discount.selectedApplicability == 'membershipLevel') {
					if (discount.type == 'amount') {
						const finalDiscount = discount.value;
						newCartTotal -= finalDiscount;
						console.log('discount amount', finalDiscount);
					}
					if (discount.type == 'percent') {
						const finalDiscount = originalTotal * discount.value / 100;
						newCartTotal -= finalDiscount
						console.log('discount percent', finalDiscount);
					}
				}
				////// LOG cart, comment in production
				cartArray.forEach((item: any, i: number) => {
					if (i == 0) console.log('newCart end');
					console.log(item.title, item.layoutView.price, i);
				});
				////////////////

				return { action: 'applyDiscount', success: true, message: "sconto applicato", payload: { discount, newCart, newCartTotal } };
			} else {
				return { action: 'applyDiscount', success: false, message: discount.message };
			}
		} catch (error) {
			console.error('Error apply Discount:', error);
			return { action: 'applyDiscount', success: false, message: 'Errore sconto' };
		}
	},

	confirmCart: async ({ request, fetch }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode') || '';
		const city = formData.get('city') || '';
		const countryState = formData.get('countryState') || '';
		const country = formData.get('country') || '';
		const phone = formData.get('phone') || '';
		const mobilePhone = formData.get('mobilePhone') || '';
		const password1 = formData.get('password1') || '';

		if (!name || !surname || !email || !address || !postalCode || !city || !countryState || !country || !phone || !mobilePhone || !password1) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, productId, layoutId, notes });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/sign-up-admin`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					surname,
					email,
					address,
					postalCode,
					city,
					countryState,
					country,
					phone,
					mobilePhone,
					password1
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'newUser', success: true, message: result.message };
			} else {
				return { action: 'newUser', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new newUser:', error);
			return { action: 'newUser', success: false, message: 'Errore creazione newUser' };
		}
	}

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