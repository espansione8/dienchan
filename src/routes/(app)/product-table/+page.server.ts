import { fail } from '@sveltejs/kit';
import stringHash from 'string-hash';
import { checkAuth } from '$lib/auth';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	checkAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	try {
		// NEW GET PROD
		const query = { type: 'product' };
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'product', //product | order | user | layout | discount
				query,
				limit,
				skip
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		getTable = await res.json();

	} catch (error) {
		console.log('products-table fetch error:', error);
	}

	return {
		getTable,
	};
}

export const actions: Actions = {
	//sampleAction: async ({ request, fetch, locals }) => {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = stringHash(crypto.randomUUID());
		const title = formData.get('title') || '';
		const descrShort = formData.get('descrShort') || '';
		const stockQty = formData.get('stockQty');
		const category = formData.get('category') || '';
		const price = formData.get('price');
		const prodImage = formData.get('product-primary') || '';
		// const headers = { 'x-file-name': prodImage.name, 'x-folder-name': prodId }; // NOTE: change folder name to userid
		console.log('prodImage', prodImage);

		if (!title || !descrShort || !stockQty || !price) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		try {
			const uploadImg = await fetch(`${import.meta.env.VITE_BASE_URL}/api/uploads/files`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-file-name': prodImage.name,
					'x-folder-name': `product/${prodId}`
				},
				body: prodImage
			});
			if (uploadImg.status == 200) return { action: 'new', success: true, message: 'file OK' };

			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/products/new`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prodId,
					title,
					descrShort,
					stockQty,
					category,
					price,
				})
			});
			const result = await response.json();



			if (response.status == 200) {
				return { action: 'new', success: true, message: result.message };
			} else {
				return { action: 'new', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new prod:', error);
			return { action: 'new', success: false, message: 'Errore creazione' };
		}
	},

	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const title = formData.get('title') || '';
		const descrShort = formData.get('descrShort') || '';
		const stockQty = formData.get('stockQty');
		const category = formData.get('category') || '';
		const price = formData.get('price');

		if (!prodId || !title || !descrShort || !stockQty || !category || !price) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/products/modify`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prodId,
					title,
					descrShort,
					stockQty,
					category,
					price,
				})
			});
			const result = await response.json();
			if (response.status == 200) {
				return { action: 'modify', success: true, message: result.message };
			} else {
				return { action: 'modify', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error modify:', error);
			return { action: 'modify', success: false, message: 'Errore modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/products/remove`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prodId
				})
			});
			const result = await response.json();
			if (response.status == 200) {
				return { action: 'delete', success: true, message: result.message };
			} else {
				return { action: 'delete', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Errore delete' };
		}
	},
	//TODO
	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const countryState = formData.get('countryState');
		const layoutId = formData.get('layoutId');
		const userId = formData.get('userId');
		// console.log('layoutId', layoutId);

		const arrayField = ['countryState', 'layoutId', 'userId', 'type'];
		const arrayValue = [countryState, layoutId, userId, 'course'];
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
				method: 'POST',
				body: JSON.stringify({
					schema: 'product',
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
					createdAt: obj.createdAt.substring(0, 10),
					eventStartDate: obj.eventStartDate.substring(0, 10),
					timeStartDate: obj.eventStartDate.substring(11, 16)
				}));
				return { action: 'filter', success: true, message: 'Filtro applicato', filterTableList };

			} else {
				return { action: 'filter', success: false, message: 'nessun risultato' };
			}
		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Errore filter' };
		}
	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		let status = formData.get('status');
		if (!prodId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}
		status = status == 'enabled' ? 'disabled' : 'enabled';

		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/products/changeStatus`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prodId,
					status
				})
			});
			const result = await response.json();
			if (response.status == 200) {
				return { action: 'changeStatus', success: true, message: result.message };
			} else {
				return { action: 'changeStatus', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error changing status:', error);
			return { action: 'changeStatus', success: false, message: 'Errore changeStatus' };
		}
	},
} satisfies Actions;