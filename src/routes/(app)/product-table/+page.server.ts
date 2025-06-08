import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid'
import { pageAuth } from '$lib/pageAuth';
import type { Product } from '$lib/types';
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable: Product[] = [];
	//let categories: string[] = [];
	const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'product', //product | order | user | layout | discount
			query: { type: 'product' },//types: course / product / membership / event
			projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1000,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	try {
		const res = await resFetch;
		if (!res.ok) {
			const errorText = await res.text();
			console.error('products-table fetch failed', res.status, errorText);
			throw error(400, { message: `Products fetch failed: ${errorText}` });
		}
		getTable = await res.json();
		//categories = [...new Set(getTable.flatMap((item: any) => item.category))] as string[];

	} catch (err) {
		console.log('products-table fetch error:', err);
		throw error(500, { message: `Products server failed: ${err}` });
	}

	return {
		getTable,
		//categories
	};
}

export const actions: Actions = {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = nanoid()
		//const prodId = stringHash(crypto.randomUUID());
		const title = formData.get('title') || '';
		const descrShort = formData.get('descrShort') || '';
		const stockQty = formData.get('stockQty');
		const category = formData.get('category') || '';
		const weight = formData.get('weight');
		const price = formData.get('price');

		const newDoc = {
			prodId,
			title,
			descrShort,
			stockQty,
			weight,
			category: [category],
			price,
		};

		if (!title || !descrShort || !stockQty || !price || !weight) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				newDoc,
				returnObj: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('user find failed', res.status, errorText);
				return fail(400, { action: 'new', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'new', success: true, message: result.message };

		} catch (error) {
			console.error('Error new :', error);
			return { action: 'new', success: false, message: 'Error new' };
		}
	},

	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const title = formData.get('title') || '';
		const descrShort = formData.get('descrShort') || '';
		const stockQty = formData.get('stockQty');
		const price = formData.get('price');
		const weight = formData.get('weight');
		const category = formData.get('category') || '';

		if (!prodId) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { prodId, type: 'product' },
				update: {
					$set: {
						title,
						descrShort,
						stockQty,
						price,
						weight,
						category,
					}
				},
				options: {
					upsert: false,
				},
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;

			if (!res.ok) {
				const errorText = await res.text();
				console.error('discount update failed', res.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const result = await res.json();
			console.log('result modify', result);
			return { action: 'modify', success: true, message: result.message };

		} catch (error) {
			console.error('Error creating new modify:', error);
			return { action: 'modify', success: false, message: 'Error modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');

		const resFetch = fetch(`${BASE_URL}/api/mongo/remove`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { prodId: prodId },
				multi: false,
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('discount delete failed', res.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'delete', success: true, message: result.message };

		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Error delete' };
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const title = formData.get('title');
		const category = formData.get('category');
		const status = formData.get('status');

		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: {
					type: 'product',
					...(prodId && { prodId }),
					...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
					...(category && { category }),
					...(status && { status }),
				},
				projection: { _id: 0 },
				sort: { createdAt: -1 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;

			if (!res.ok) {
				const errorText = await res.text();
				console.error('discount filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const payload = await res.json();

			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error filter' };
		}
	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const status = formData.get('status');
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';
		if (!prodId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { prodId: prodId },
				update: {
					$set: {
						status: newStatus,
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('changeStatus update failed', res.status, errorText);
				return fail(400, { action: 'changeStatus', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'changeStatus', success: true, message: result.message };

		} catch (error) {
			console.error('Error changeStatus:', error);
			return fail(400, { action: 'changeStatus', success: false, message: 'Error changeStatus' });
		}
	},

	setProdPic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const file = formData.get('fileUpload');

		if (!prodId || !file || !file.name) {
			return fail(400, { action: 'setProdPic', success: false, message: 'File mancante' });
		}

		try {
			const uploadImg = await fetch(`${BASE_URL}/api/uploads/files`, {
				method: 'POST',
				headers: {
					//'Content-Type': 'application/json',
					'Content-Type': file.type || 'application/octet-stream',
					'x-file-name': file.name,
					'x-folder-name': `product/${prodId}`
				},
				body: file
			});
			// const resImg = await uploadImg.json();

			const query = { prodId, type: 'product' }; // 'course', 'product', 'membership', 'event'
			const update = {
				$push: {
					uploadfiles: [
						{
							_id: false,
							type: 'product-primary', //'product-primary', 'product-gallery', 'membership', 'course'
							fileType: file.type,
							fileName: file.name,
							fileUrl: `/files/product/${prodId}/${file.name}`
						}
					],
				}
			};
			const options = {
				upsert: false
				// NOTES:
				// arrayFilters: [
				// 	{ "elem.type": "product-primary" } // Check array where 'type' === 'product-primary'
				// ]
			}
			const multi = false
			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			//const response = await res.json();

			const [resImg, response] = await Promise.all([
				await uploadImg.json(),
				await res.json()
			])

			if (!uploadImg.ok) return { action: 'setProdPic', success: false, message: resImg.message }

			if (!res.ok) return { action: 'setProdPic', success: false, message: response.message };

			return { action: 'setProdPic', success: true, message: response.message };

		} catch (err) {
			console.error('Error upload:', err);
			return { action: 'setProdPic', success: false, message: 'Errore server upload' };
		}
	},

	delProdPic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const fileName = formData.get('fileName');
		//console.log('prod filename', prodId, fileName);

		if (!prodId || !fileName) {
			return fail(400, { action: 'delProdPic', success: false, message: 'Dati mancanti' });
		}

		try {
			const responseDelete = await fetch(`${BASE_URL}/api/uploads/files`, {
				method: 'DELETE',
				body: JSON.stringify({
					dir: `product/${prodId}`,
					fileName
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const resDel = await responseDelete.json();
			if (responseDelete.status != 200) return { action: 'delProdPic', success: false, message: resDel.message };

			const query = { prodId, type: 'product' }; // 'course', 'product', 'membership', 'event'
			const update = {
				$pull:
					{ uploadfiles: { type: 'product-primary', fileName: fileName } }

			};
			const options = { upsert: false }
			const multi = false
			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!res.ok) return { action: 'delProdPic', success: false, message: `res: ${await res.text()}` };
			const response = await res.json();

			return { action: 'delProdPic', success: true, message: response.message };

		} catch (error) {
			console.error('Error delProdPic:', error);
			return { action: 'delProdPic', success: false, message: 'Errore rimozione' };
		}
	},
} satisfies Actions;
