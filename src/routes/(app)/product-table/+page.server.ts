import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	let getTable = [];
	//let getTableUser = [];

	try {
		// const userData = session.user;
		//console.log('MY DOCS userData', userData);

		// GET PRODUCTS
		const res = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/products/all-enabled/0/0`
		);
		const resGetTable = await res.json();
		getTable = resGetTable.map((obj) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

		// GET USERS
		// const res = await fetch(
		// 	`${import.meta.env.VITE_BASE_URL}/api/users/all-active/0/0`
		// );
		// const resGetTableUser = await res.json();
		// //console.log('MY DOCS res.ok', res.ok);
		// //console.log('res getTableData', resGetTableData)
		// getTableUser = resGetTableUser.map((obj) => ({
		// 	...obj,
		// 	createdAt: obj.createdAt.substring(0, 10)
		// }));

	} catch (error) {
		console.log('products-corso fetch error:', error);
	}

	return {
		getTable,
		auth: locals.auth
		//getTableUser,
		//userData
	};
}
