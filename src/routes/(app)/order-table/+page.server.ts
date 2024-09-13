import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

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
		const resName = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/users/all-active-names/0/0`
		);
		getTableNames = await resName.json();


	} catch (error) {
		console.log('orders fetch error:', error);
	}
	const user = locals.data
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
