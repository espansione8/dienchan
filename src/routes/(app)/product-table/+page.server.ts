import { fail } from '@sveltejs/kit';
import stringHash from 'string-hash';
import { pageAuth } from '$lib/pageAuth';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	try {
		// NEW GET PROD
		const query = { type: 'product' };
		const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'product', //product | order | user | layout | discount
				query,
				projection,
				sort,
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

		const returnObj = false
		const newDoc = {
			prodId,
			title,
			descrShort,
			stockQty,
			category: [category],
			price,
			uploadfiles: [
				{
					_id: false,
					type: 'product-primary',
					filetype: prodImage.type,
					filename: prodImage.name,
					fileUrl: `product/${prodId}/${prodImage.name}`
				}
			],
		};
		//console.log('newDoc', newDoc);

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
			if (uploadImg.status != 200) return { action: 'new', success: fail, message: 'errore file upload' };

			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					schema: 'product', //product | order | user | layout | discount
					newDoc,
					returnObj
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();
			// console.log('res', res);
			// console.log('response', response);

			if (res.status == 200) {
				return { action: 'new', success: true, message: response.message };
			} else {
				return { action: 'new', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error creating new prod:', error);
			return { action: 'new', success: false, message: 'Errore creazione' };
		}
	},
	// TODO
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
	// TODO
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
	// TODO
	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		//const price = formData.get('price');
		const category = formData.get('category');
		// console.log('layoutId', layoutId);

		try {
			const query = {
				...(title && { title }),
				...(category && { category }),
			};
			console.log('query', query);

			const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
			const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
			const limit = 100;
			const skip = 0;
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					schema: 'product', //product | order | user | layout | discount
					query,
					projection,
					sort,
					limit,
					skip
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();

			if (res.status == 200) {
				const filterTableList = response.map((obj: any) => ({
					...obj,
					createdAt: obj.createdAt.substring(0, 10)
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
	// TODO
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