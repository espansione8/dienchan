import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	let getTable = [];

	try {
		const path = `${import.meta.env.VITE_BASE_URL}/api/products/find/type/membership/0/0`

		// ADMIN course
		const resProductsCorso = await fetch(path);
		const resGetTableProductsCorso = await resProductsCorso.json();
		getTable = resGetTableProductsCorso.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

	} catch (error) {
		console.log('membershipfetch error:', error);
	}

	return {
		getTable,
		auth: locals.auth
		//userData
	};
}