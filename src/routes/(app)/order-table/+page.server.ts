import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'
import { customAlphabet } from 'nanoid'
import { pageAuth } from '$lib/pageAuth';

const apiKey = import.meta.env.VITE_APIKEY;
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');
	// if (!locals.auth) { // OLD manual mode
	// 	throw redirect(302, '/login');
	// }
	let getTable = [];
	let getTableNames = [];
	try {
		const query = {}; //IF USE Products.model -> types: course / product / membership / event
		const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'order', //product | order | user | layout | discount
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
		getTable = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			orderDate: obj.orderDate.substring(0, 10),
			totalCart: obj.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(2)
		}));
		//console.log('getTable', getTable);

	} catch (error) {
		console.log('orders fetch error:', error);
	}
	try {
		// LISTA NOMI RIFLESSOLOGI
		const query = { status: 'enabled' }; //IF USE Products.model -> types: course / product / membership / event
		const projection = { _id: 0, userId: 1, surname: 1, name: 1 } // 0: exclude | 1: include
		const sort = { surname: 1 } // 1:Sort ascending | -1:Sort descending
		const limit = 0; // 0 no limit
		const skip = 0;
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'user', //product | order | user | layout | discount
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
		getTableNames = await res.json();
		//console.log('getTableNames', getTableNames);

	} catch (error) {
		console.log('orders fetch error:', error);
	}
	return {
		getTable,
		getTableNames,
		auth: locals.auth
	};
}


export const actions: Actions = {

	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const title = formData.get('title') || '';
		const price = formData.get('price');
		const renewalLength = formData.get('renewalLength');
		const descrShort = formData.get('descrShort') || '';

		if (!prodId || !title || !price || !renewalLength) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		try {
			const query = { prodId, type: 'membership' }; // 'course', 'product', 'membership', 'event'
			const update = {
				$set: {
					prodId,
					title,
					descrShort,
					price,
				}
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
			//console.log('response.message', response);

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
		const orderId = formData.get('orderId');

		try {
			const query = { orderId: orderId };
			const multi = false

			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/remove`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'order', //product | order | user | layout | discount
					query,
					multi,
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();
			//console.log('response', response);

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
		const orderId = formData.get('orderId');
		const userId = formData.get('userId');
		const paymentMethod = formData.get('paymentMethod');
		const status = formData.get('status');

		// console.log('orderId', orderId);

		// const arrayField = ['orderId', 'userId', 'payment.method', 'status'];
		// const arrayValue = [orderId, userId, paymentMethod, status];
		try {
			// const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
			// 	method: 'POST',
			// 	body: JSON.stringify({
			// 		schema: 'order',
			// 		arrayField,
			// 		arrayValue
			// 	}),
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	}
			// });
			const query = {
				type: 'membership',
				...(orderId && { orderId }),
				...(userId && { userId }),
				...(paymentMethod && { 'payment.method': paymentMethod }),
				...(status && { status }),
				//...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
				//...(price && { price }),
			};

			const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
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
			//console.log('response', response);
			const result = await res.json();

			if (res.status == 200) {
				const filterTableList = result.map((obj: any) => ({
					...obj,
					orderDate: obj.createdAt.substring(0, 10),
					totalCart: obj.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(0)
					// eventStartDate: obj.eventStartDate.substring(0, 10),
					// timeStartDate: obj.eventStartDate.substring(11, 16)
				}));
				return { action: 'filter', success: true, message: 'Filtro attivato', filterTableList };

			} else {
				return { action: 'filter', success: false, message: 'Errore filtro' };
			}
		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error filtro 500' };
		}
	}
} satisfies Actions;