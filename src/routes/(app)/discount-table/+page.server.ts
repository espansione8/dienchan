import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	let getTable = [];
	//let getTableUser = [];

	try {
		// const userData = session.user;
		//console.log('MY DOCS userData', userData);

		// GET PRODUCTS
		const arrayField = [];
		const arrayValue = [];
		const res = await fetch(`/api/finds/0/0`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'discount',
				arrayField,
				arrayValue
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const resGetTable = await res.json();
		getTable = resGetTable.map((obj) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

		// GET USERS
		// const res = await fetch(
		// 	`${import.meta.env.VITE_BASE_URL}/api/users/all-active/0/0`
		// );
		// const resGetTableUser = await res.json();
		// //console.log('MY DOCS res.ok', res.ok);
		// //console.log('res getTableData', resGetTableData)
		// getTableUser = resGetTableUser.map((obj) => ({
		// 	...obj,
		// 	createdAt: obj.createdAt.substring(0, 10)
		// }));

	} catch (error) {
		console.log('products-corso fetch error:', error);
	}
	const user = locals.data
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}
	return {
		getTable,
		auth: locals.auth,
		userData: user,
	};
}

export const actions: Actions = {
	newDiscount: async ({ request, fetch }) => {
		const formData = await request.formData();
		const code = formData.get('code');
		const type = formData.get('type');
		const value = formData.get('value');
		const userId = formData.get('userId') || '';
		const membershipLevel = formData.get('membershipLevel') || '';
		const productId = formData.get('productId') || '';
		const layoutId = formData.get('layoutId') || '';
		const notes = formData.get('notes') || '';

		if (!code || !type || !value) {
			return fail(400, { action: 'newDiscount', success: false, message: 'Dati mancanti' });
		}

		if (!code || !type || !value) {
			return fail(400, { action: 'newDiscount', success: false, message: 'Dati mancanti' });
		}
		console.log({ code, type, value, userId, membershipLevel, productId, layoutId, notes });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					code,
					type,
					value,
					userId,
					membershipLevel,
					productId,
					layoutId,
					notes
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'newDiscount', success: true, message: result.message };
			} else {
				return { action: 'newDiscount', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new newDiscount:', error);
			return { action: 'newDiscount', success: false, message: 'Errore creazione newDiscount' };
		}
	},

} satisfies Actions;