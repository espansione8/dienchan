import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}

	let getTableCourses = [];
	const userId = locals.data.userId || ''

	try {
		let path = `${import.meta.env.VITE_BASE_URL}/api/courses/all-enabled/0/0`
		if (userId) path = `${import.meta.env.VITE_BASE_URL}/api/courses/user-id/${userId}`

		// ADMIN course
		const resProductsCorso = await fetch(path);
		const resGetTableProductsCorso = await resProductsCorso.json();
		getTableCourses = resGetTableProductsCorso.map((obj) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

	} catch (error) {
		console.log('products-corso fetch error:', error);
	}

	return {
		getTableCourses,
		auth: locals.auth
		//userData
	};
}