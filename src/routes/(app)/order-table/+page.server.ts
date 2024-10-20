import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	let getOrders = [];
	let getTableNames = [];
	try {
		//const userData = locals.data
		//console.log('MY DOCS userData', userData);
		const res = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/orders/all/0/0`
		);
		const resGetOrders = await res.json();
		//console.log('MY DOCS res.ok', res.ok);
		// console.log('res resGetOrders', resGetOrders)
		getOrders = resGetOrders.map((obj) => ({
			...obj,
			orderDate: obj.orderDate.substring(0, 10),
			totalCart: obj.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(0)
		}));

		// LISTA NOMI RIFLESSOLOGI
		const arrayField = ['status'];
		const arrayValue = ['enabled'];
		const resName = await fetch(`/api/finds/0/0`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'user',
				arrayField,
				arrayValue
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		getTableNames = await resName.json();


	} catch (error) {
		console.log('orders fetch error:', error);
	}
	const user = locals.user
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}
	//console.log('res getTableData', getTableData);
	return {
		userData: user,
		getOrders,
		getTableNames,
		auth: locals.auth
		//userData
	};
}


export const actions: Actions = {

	filterOrder: async ({ request, fetch }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId');
		const userId = formData.get('userId');
		const paymentMethod = formData.get('paymentMethod');
		const status = formData.get('status');

		// console.log('orderId', orderId);

		const arrayField = ['orderId', 'userId', 'payment.method', 'status'];
		const arrayValue = [orderId, userId, paymentMethod, status];
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
				method: 'POST',
				body: JSON.stringify({
					schema: 'order',
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
					orderDate: obj.createdAt.substring(0, 10),
					totalCart: obj.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(0)
					// eventStartDate: obj.eventStartDate.substring(0, 10),
					// timeStartDate: obj.eventStartDate.substring(11, 16)
				}));
				return { action: 'filterOrder', success: true, message: 'Filtro applicato', filterTableList };

			} else {
				return { action: 'filterOrder', success: false, message: 'Filtro NON applicato' };
			}
		} catch (error) {
			console.error('Error filterOrder:', error);
			return { action: 'filterOrder', success: false, message: 'Errore filterOrder' };
		}
	}
} satisfies Actions;