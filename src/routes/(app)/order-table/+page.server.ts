import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	let getTableNames = [];

	const orderFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'order', //product | order | user | layout | discount
			query: {},
			projection: { _id: 0, password: 0 },
			sort: { createdAt: -1 },
			limit: 1000,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const userFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'user', //product | order | user | layout | discount
			query: { status: 'enabled' },
			projection: { _id: 0, userId: 1, surname: 1, name: 1 },
			sort: { surname: 1 },
			limit: 0,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});


	try {

		const [userRes, orderRes] = await Promise.all([
			userFetch,
			orderFetch
		])

		if (userRes.status !== 200 || orderRes.status !== 200) {
			const errorText = `${await userRes.text()} ${await orderRes.text()} `;
			console.error('Promise.all failed', userRes.status, orderRes.status, errorText);
			//return fail(400, { action: 'load', success: false, message: errorText });
			throw error(400, errorText);
		}


		const resGetOrder = await orderRes.json();
		if (resGetOrder.length > 0) {
			getTable = resGetOrder.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10),
				orderDate: obj.orderDate.substring(0, 10),
				totalCart: obj.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(2)
			}));
		}


		getTableNames = await userRes.json();

	} catch (error) {
		console.log('page fetch error:', error);
		throw error(500, 'Server error');
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
		console.log('status', status);

		if (!orderId) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'order',
				query: { orderId: orderId },
				update: {
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
			console.log('res', res);

			if (!res.ok) {
				const errorText = await res.text();
				console.error('order update failed', res.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const result = await res.json();
			console.log('result', result);

			return { action: 'modify', success: true, message: result.message };

		} catch (error) {
			console.error('Error order modify:', error);
			return { action: 'modify', success: false, message: 'Error order modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId');

		const resFetch = fetch(`${BASE_URL}/api/mongo/remove`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'order', //product | order | user | layout | discount
				query: { orderId: orderId },
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
				console.error('order delete failed', res.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'delete', success: true, message: result.message };

		} catch (error) {
			console.error('Error order delete:', error);
			return { action: 'delete', success: false, message: 'Error order delete' };
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

		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'order', //product | order | user | layout | discount
				query: {
					...(orderId && { orderId }),
					...(userId && { userId }),
					...(surname && { 'shipping.surname': { $regex: `.*${surname}.*`, $options: 'i' } }),
					...(email && { 'shipping.email': { $regex: `.*${email}.*`, $options: 'i' } }),
					...(paymentMethod && { 'payment.method': paymentMethod }),
					...(status && { status }),
					...(statusPayment && { 'payment.statusPayment': statusPayment }),
				},
				projection: { _id: 0, password: 0 },
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
				console.error('order filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const payload = await res.json();

			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error order filter' };
		}
	}
} satisfies Actions;
