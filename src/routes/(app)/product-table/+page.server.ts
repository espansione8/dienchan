import type { PageServerLoad, Actions } from './$types'
import { fail } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid'
import { pageAuth } from '$lib/pageAuth';
import type { Product } from '$lib/types';
/// test
// import dbConnect from '$lib/database';
// import { Product } from '$lib/models/Products.model';

const apiKey = import.meta.env.VITE_APIKEY;
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable: Product[] = [];
	//let categories: string[] = [];
	try {
		// NEW GET PROD
		const query: any = { type: 'product' }; //types: course / product / membership / event
		const projection: any = { _id: 0, password: 0 } // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
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
		//categories = [...new Set(getTable.flatMap((item: any) => item.category))] as string[];

	} catch (error) {
		console.log('products-table fetch error:', error);
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

		const returnObj = false
		const newDoc = {
			prodId,
			title,
			descrShort,
			stockQty,
			weight,
			category: [category],
			price,
		};
		//console.log('newDoc', newDoc);

		if (!title || !descrShort || !stockQty || !price || !weight) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
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

		const query = { prodId, type: 'product' };
		const update = {
			$set: {
				title,
				descrShort,
				stockQty,
				price,
				weight,
				category,
			}
		};
		const options = {
			upsert: false,
		};
		const multi = false

		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
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
			const response = await res.json();
			if (res.status == 200) {
				return { action: 'modify', success: true, message: response.message };
			} else {
				return { action: 'modify', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error modify:', error);
			return { action: 'modify', success: false, message: 'Errore modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');

		const apiKey = import.meta.env.VITE_APIKEY;
		const query = { prodId: prodId };
		const multi = false

		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/remove`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					query,
					multi,
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();
			if (res.status == 200) {
				return { action: 'delete', success: true, message: response.message };
			} else {
				return { action: 'delete', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Errore delete' };
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const title = formData.get('title');
		const category = formData.get('category');
		const status = formData.get('status');

		try {
			const query = {
				type: 'product',
				...(prodId && { prodId }),
				...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
				...(category && { category }),
				...(status && { status }),
			};
			const projection = { _id: 0 } // 0: exclude | 1: include
			const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
			const limit = 100;
			const skip = 0;
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
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
				return { action: 'filter', success: false, message: 'Errore filtro' };
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
		const query = { prodId: prodId };
		const update = {
			$set: {
				status: status,
			}
		};
		const options = { upsert: false }
		const multi = false
		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			// await dbConnect();
			// const res = await Product.updateOne(query, update, options).lean().exec();
			// if (res.matchedCount > 0) {
			// 	return { action: 'changeStatus', success: true, message: 'update ok' };
			// } else {
			// 	return { action: 'changeStatus', success: false, message: 'update error' };
			// }
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
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
			const response = await res.json();
			if (res.status == 200) {
				return { action: 'changeStatus', success: true, message: response.message };
			} else {
				return { action: 'changeStatus', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error changing status:', error);
			return { action: 'changeStatus', success: false, message: 'Errore changeStatus' };
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
			const uploadImg = await fetch(`${import.meta.env.VITE_BASE_URL}/api/uploads/files`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
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
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
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

			if (uploadImg.status != 200) return { action: 'setProdPic', success: false, message: resImg.message }

			if (res.status == 200) {
				return { action: 'setProdPic', success: true, message: response.message };
			} else {
				return { action: 'setProdPic', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error upload:', error);
			return { action: 'setProdPic', success: false, message: 'Errore upload' };
		}
	},

	delProdPic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const fileName = formData.get('fileName');
		console.log('prod filename', prodId, fileName);

		if (!prodId || !fileName) {
			return fail(400, { action: 'delProdPic', success: false, message: 'Dati mancanti' });
		}

		try {
			const responseDelete = await fetch(`${import.meta.env.VITE_BASE_URL}/api/uploads/files`, {
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
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
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

			const response = await res.json();

			if (res.status == 200) {
				return { action: 'delProdPic', success: true, message: response.message };
			} else {
				return { action: 'delProdPic', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error delProdPic:', error);
			return { action: 'delProdPic', success: false, message: 'Errore rimozione' };
		}
	},
} satisfies Actions;
