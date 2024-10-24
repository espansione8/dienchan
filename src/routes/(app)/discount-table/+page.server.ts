import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	let getTable = [];
	let getLayout = [];

	let arrayField = [];
	let arrayValue = [];

	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	//let getTableUser = [];

	try {
		// const userData = session.user;
		//console.log('MY DOCS userData', userData);

		// GET PRODUCTS
		arrayField = [];
		arrayValue = [];
		const res = await fetch(`/api/finds/0/0`, { // URL:app/dashboard
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
		if (resGetTable.length > 0) {
			getTable = resGetTable.map((obj) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10)
			}));
		}

		// Layout list
		arrayField = [];
		arrayValue = [];
		const resLayout = await fetch(`/api/finds/0/0`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'layout',
				arrayField,
				arrayValue
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		getLayout = await resLayout.json();

	} catch (error) {
		console.log('discount fetch error:', error);
	}
	const user = locals.user
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}
	return {
		getTable,
		getLayout,
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
		const selectedApplicability = formData.get('applicability');
		const selectId = formData.get('selectId')
		const notes = formData.get('notes') || '';

		if (!code || !type || !value || !selectedApplicability || !selectId) {
			return fail(400, { action: 'newDiscount', success: false, message: 'Dati mancanti' });
		}

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
					selectedApplicability,
					selectId,
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

	modifyDiscount: async ({ request, fetch }) => {
		const formData = await request.formData();
		const discountId = formData.get('discountId');
		const code = formData.get('code');
		const type = formData.get('type');
		const value = formData.get('value');
		const selectedApplicability = formData.get('applicability');
		const selectId = formData.get('selectId');
		const notes = formData.get('notes') || '';
		// const code = formData.get('code');
		// const type = formData.get('type');
		// const value = formData.get('value');
		// const selectedApplicability = formData.get('applicability');
		// const userId = formData.get('userId') || '';
		// const membershipLevel = formData.get('membershipLevel') || '';
		// const prodId = formData.get('prodId') || '';
		// const layoutId = formData.get('layoutId') || '';
		// const notes = formData.get('notes') || '';

		if (!discountId || !code || !type || !value || !selectedApplicability || !selectId) {
			return fail(400, { action: 'modifyDiscount', success: false, message: 'Dati mancanti' });
		}

		// discountId,
		// 			code,
		// 			type,
		// 			value,
		// 			selectedApplicability,
		// 			userId,
		// 			membershipLevel,
		// 			prodId,
		// 			layoutId,
		// 			notes
		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/modify`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					discountId,
					code,
					type,
					value,
					selectedApplicability,
					selectId,
					notes
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'modifyDiscount', success: true, message: result.message };
			} else {
				return { action: 'modifyDiscount', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new modifyDiscount:', error);
			return { action: 'modifyDiscount', success: false, message: 'Errore creazione modifyDiscount' };
		}
	},

	disableDiscount: async ({ request, fetch }) => {
		const formData = await request.formData();
		const discountId = formData.get('discountId');
		const status = formData.get('status');
		if (!discountId) {
			return fail(400, { action: 'disableDiscount', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/status`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					discountId,
					status
				})
			});
			const result = await response.json();
			if (response.status == 200) {
				return { action: 'disableDiscount', success: true, message: result.message };
			} else {
				return { action: 'disableDiscount', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error changing discount status:', error);
			return { action: 'disableDiscount', success: false, message: 'Errore modifica Discount' };
		}
	},

	deleteDiscount: async ({ request, fetch }) => {

		const formData = await request.formData();
		const discountId = formData.get('discountId');
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/remove`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					discountId
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'deleteDiscount', success: true, message: result.message };
			} else {
				return { action: 'deleteDiscount', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error deleteDiscount:', error);
			return { action: 'deleteDiscount', success: false, message: 'Errore deleteDiscount' };
		}
	},

	filterDiscount: async ({ request, fetch }) => {
		const formData = await request.formData();
		const code = formData.get('code');
		const selectedApplicability = formData.get('selectedApplicability');
		const status = formData.get('status');

		// console.log('level', level);

		const arrayField = ['code', 'selectedApplicability', 'status'];
		const arrayValue = [code, selectedApplicability, status];

		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
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
			//console.log('response', response);
			const result = await response.json();

			if (response.status == 200) {
				const filterTableList = result.map((obj: any) => ({
					...obj,
					createdAt: obj.createdAt.substring(0, 10)
				}));
				return { action: 'filterDiscount', success: true, message: 'Filtro applicato', filterTableList };

			} else {
				return { action: 'filterDiscount', success: false, message: 'Sconto non trovato' };
			}
		} catch (error) {
			console.error('Error filterDiscount:', error);
			return { action: 'filterDiscount', success: false, message: 'Errore filterDiscount' };
		}
	}

} satisfies Actions;