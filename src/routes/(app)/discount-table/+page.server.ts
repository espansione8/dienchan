import type { PageServerLoad, Actions } from './$types'
import { fail } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';

const apiKey = import.meta.env.VITE_APIKEY;
const baseURL = import.meta.env.VITE_BASE_URL;

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getDiscount
	let getLayout
	let getProduct
	let getUser

	const discountFetch = fetch(`${baseURL}/api/mongo/find`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			apiKey: apiKey,
			schema: 'discount', //product | order | user | layout | discount
			query: {}, //IF USE Products.model -> types: course / product / membership / event
			projection: { _id: 0 },// 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1000,
			skip: 0
		})
	});

	const layoutFetch = fetch(`${baseURL}/api/mongo/find`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			apiKey: apiKey,
			schema: 'layout', //product | order | user | layout | discount
			query: {}, //IF USE Products.model -> types: course / product / membership / event
			projection: { _id: 0, layoutId: 1, title: 1 },// 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1000,
			skip: 0
		})
	});

	const productFetch = fetch(`${baseURL}/api/mongo/find`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			apiKey: apiKey,
			schema: 'product', //product | order | user | layout | discount
			query: { type: 'product' }, //IF USE Products.model -> type: course / product / membership / event
			projection: { _id: 0, prodId: 1, title: 1 },// 0: exclude | 1: include
			sort: { title: 1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1000,
			skip: 0
		})
	});

	const userFetch = fetch(`${baseURL}/api/mongo/find`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			apiKey: apiKey,
			schema: 'user', //product | order | user | layout | discount
			query: {}, //IF USE Products.model -> types: course / product / membership / event
			projection: { userId: 1, email: 1 },// 0: exclude | 1: include
			sort: { email: 1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1000,
			skip: 0
		})
	});

	try {
		const [discountRes, layoutRes, productRes, userRes] = await Promise.all([
			discountFetch,
			layoutFetch,
			productFetch,
			userFetch
		]);

		// discount data
		if (discountRes.status !== 200) {
			const errorText = await discountRes.text();
			console.error('discount find failed', discountRes.status, errorText);
			return fail(400, { action: 'discount', success: false, message: errorText });
		}
		const resGetTable = await discountRes.json();
		if (resGetTable.length > 0) {
			getDiscount = resGetTable.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10)
			}));
		}

		// layout data
		if (layoutRes.status !== 200) {
			const errorText = await layoutRes.text();
			console.error('layout find failed', layoutRes.status, errorText);
			return fail(400, { action: 'layout', success: false, message: errorText });
		}
		getLayout = await layoutRes.json();

		// product data
		if (productRes.status !== 200) {
			const errorText = await productRes.text();
			console.error('product find failed', productRes.status, errorText);
			return fail(400, { action: 'product', success: false, message: errorText });
		}
		getProduct = await productRes.json();

		// user data
		if (userRes.status !== 200) {
			const errorText = await userRes.text();
			console.error('user find failed', userRes.status, errorText);
			return fail(400, { action: 'user', success: false, message: errorText });
		}
		getUser = await userRes.json();

	} catch (error) {
		console.log('page fetch error:', error);
	}

	return {
		getDiscount,
		getLayout,
		getProduct,
		getUser,
		//auth: locals.auth,
	};
}

export const actions: Actions = {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
		const code = formData.get('code');
		const type = formData.get('type');
		const value = formData.get('value');
		const selectedApplicability = formData.get('applicability');
		const selectId = formData.get('selectId')
		const notes = formData.get('notes') || '';

		if (!code || !type || !value || !selectedApplicability || !selectId) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
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
				return { action: 'new', success: true, message: result.message };
			} else {
				return { action: 'new', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error new :', error);
			return { action: 'new', success: false, message: 'Errore new' };
		}
	},

	modify: async ({ request, fetch }) => {
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
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
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
				return { action: 'modify', success: true, message: result.message };
			} else {
				return { action: 'modify', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new modify:', error);
			return { action: 'modify', success: false, message: 'Error modify' };
		}
	},

	delete: async ({ request, fetch }) => {

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
				return { action: 'delete', success: true, message: result.message };
			} else {
				return { action: 'delete', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Error delete' };
		}
	},

	filter: async ({ request, fetch }) => {
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
				return { action: 'filter', success: true, message: 'Filtro applicato', filterTableList };

			} else {
				return { action: 'filter', success: false, message: 'Sconto non trovato' };
			}
		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error filter' };
		}
	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const discountId = formData.get('discountId');
		const status = formData.get('status');
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';

		if (!discountId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}

		try {
			// const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/status`, {
			// 	method: 'POST',
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	},
			// 	body: JSON.stringify({
			// 		discountId,
			// 		status
			// 	})
			// });
			const query = { discountId };
			const update = {
				$set: {
					status: newStatus,
				}
			};
			const options = { upsert: false }
			const multi = false
			const res = await fetch(`${baseURL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'discount', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (res.status != 200) {
				const errorText = await res.text();
				console.error('discount update failed', res.status, errorText);
				return fail(400, { action: 'changeStatus', success: false, message: errorText });
			}
			const result = await res.json();
			return { action: 'changeStatus', success: true, message: result.message };

		} catch (error) {
			console.error('Error changeStatus:', error);
			return { action: 'changeStatus', success: false, message: 'Error changeStatus' };
		}
	},

} satisfies Actions;