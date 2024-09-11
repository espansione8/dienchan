import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	let getOrders = [];
	try {
		//const userData = locals.data
		//console.log('MY DOCS userData', userData);
		const res = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/orders/all/0/0`
		);
		const resGetOrders = await res.json();
		//console.log('MY DOCS res.ok', res.ok);
		//console.log('res resGetOrders', resGetOrders)
		getOrders = resGetOrders.map((obj) => ({
			...obj,
			orderDate: obj.orderDate.substring(0, 10)
		}));
	} catch (error) {
		console.log('orders fetch error:', error);
	}
	//console.log('res getTableData', getTableData);
	return {
		getOrders,
		auth: locals.auth
		//userData
	};
}
