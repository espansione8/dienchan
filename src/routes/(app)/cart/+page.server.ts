import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'

type CartItem = {
	layoutView: { price: number };
	orderQuantity: number;
	[key: string]: any;
};

type DiscountResult = {
	//discountId: string;
	code: string;
	// type: string;
	// value: number;
	// selectedApplicability: string;
	totalDiscount: number;
};


export const load: PageServerLoad = async ({ locals }) => {

	return {
		userData: locals.user,
		auth: locals.auth
	};
}

export const actions: Actions = {

	applyDiscount: async ({ request, fetch, event }) => {
		const formData = await request.formData();
		const discountCode = formData.get('discountCode');  //base10 
		const grandTotal = formData.get('grandTotal');
		const originalTotal = Number(grandTotal)
		const cart = formData.get('cart');
		const cartArray = JSON.parse(cart)
		const discountList = formData.get('discountList');
		const discountArray = JSON.parse(discountList)  //[]   

		const checkCode = discountArray.some((item: any) => item == discountCode);
		discountArray.push(discountCode);

		console.log('discountArray', discountArray);

		if (!discountCode || checkCode) {
			return fail(400, { action: 'applyDiscount', success: false, message: checkCode ? 'Sconto già applicato' : 'Dati mancanti' });
		}

		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/check`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					discountArray
				})
			});
			const discountGroup = await response.json();
			//console.log('discountGroup response', discountGroup);

			const discountItem = discountGroup.find((item: any) => item.code == discountCode);

			if (discountItem && discountItem.status == "disabled") {
				return fail(400, { action: 'applyDiscount', success: false, message: 'Sconto disabilitato' });
			}

			if (!discountItem) {
				return fail(400, { action: 'applyDiscount', success: false, message: 'Sconto non trovato' });
			}

			if (response.status == 200) {
				const discountApplied: DiscountResult[] = []
				discountGroup.forEach((discount: any) => {
					const { discountId, code, type, value, selectedApplicability } = discount;
					let totalDiscount = 0;

					cartArray.forEach((item: CartItem) => {
						if (selectedApplicability == 'productId' || selectedApplicability == 'layoutId') {
							if (item[selectedApplicability] == discount[selectedApplicability]) {
								let itemDiscount = 0;
								if (type == 'amount') {
									itemDiscount = value * item.orderQuantity;
								} else if (type == 'percent') {
									const singleValue = (item.layoutView.price * value) / 100;
									itemDiscount = singleValue * item.orderQuantity;
								}
								totalDiscount += itemDiscount;
							}
						}
					});

					if (selectedApplicability == 'userId' || selectedApplicability == 'membershipLevel') {

						let itemDiscount = 0;
						if (type == 'amount') {
							itemDiscount = value
						} else if (type == 'percent') {
							itemDiscount = (originalTotal * value) / 100;
						}
						totalDiscount += itemDiscount;
					}

					discountApplied.push({
						//discountId,
						code,
						//type,
						//value,
						//selectedApplicability,
						totalDiscount
					});
				});
				//console.log({ discountApplied });

				return { action: 'applyDiscount', success: true, message: "sconto applicato", payload: { discountApplied, discountArray } };
			} else {
				return { action: 'applyDiscount', success: false, message: discountGroup.message };
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