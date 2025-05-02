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
		const orderId = formData.get('orderId');
		const email = formData.get('email');
		const name = formData.get('name');
		const surname = formData.get('surname');
		const city = formData.get('city');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode');
		const county = formData.get('county');
		const country = formData.get('country');
		const phone = formData.get('phone');
		const mobile = formData.get('mobile');
		const paymentMethod = formData.get('paymentMethod');
		const status = formData.get('status');
		const statusPayment = formData.get('statusPayment');

		if (!orderId) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		try {
			const query = { orderId: orderId };
			const update = {
				$set: {
					...(email && { 'shipping.email': email }),
					...(name && { 'shipping.name': name }),
					...(surname && { 'shipping.surname': surname }),
					...(city && { 'shipping.city': city }),
					...(address && { 'shipping.address': address }),
					...(postalCode && { 'shipping.postalCode': postalCode }),
					...(county && { 'shipping.county': county }),
					...(country && { 'shipping.country': country }),
					...(phone && { 'shipping.phone': phone }),
					...(mobile && { 'shipping.mobile': mobile }),
					...(status && { status }),
					...(paymentMethod && { 'payment.method': paymentMethod }),
					...(statusPayment && { 'payment.statusPayment': statusPayment }),
				}
			};
			const options = { upsert: false }
			const multi = false
			//console.log('update', update);

			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'order',
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
		const surname = formData.get('surname');
		const email = formData.get('email');
		const paymentMethod = formData.get('paymentMethod');
		const status = formData.get('status');
		const statusPayment = formData.get('statusPayment');

		if (!orderId && !userId && !surname && !email && !paymentMethod && !status && !statusPayment) {
			return fail(400, { action: 'filter', success: false, message: 'Dati mancanti' });
		}

		try {
			const query = {
				...(orderId && { orderId }),
				...(userId && { userId }),
				...(surname && { 'shipping.surname': { $regex: `.*${surname}.*`, $options: 'i' } }),
				...(email && { 'shipping.email': { $regex: `.*${email}.*`, $options: 'i' } }),
				...(paymentMethod && { 'payment.method': paymentMethod }),
				...(status && { status }),
				...(statusPayment && { 'payment.statusPayment': statusPayment }),
			};

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
			//console.log('response', response);
			const result = await res.json();

			if (res.status == 200) {
				const filterTableList = result.map((obj: any) => ({
					...obj,
					orderDate: obj.createdAt.substring(0, 10),
					totalCart: obj.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(0)
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
