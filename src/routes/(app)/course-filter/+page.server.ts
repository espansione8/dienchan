//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	// if (!locals.auth) {
	// 	throw redirect(302, '/login');
	// }

	let getTableCourses = [];
	let getTableNames = [];

	try {
		// const userData = session.user;
		//console.log('MY DOCS userData', userData);

		// CORSI
		const resProductsCorso = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/courses/all-enabled/0/0`
		);
		const resGetTableProductsCorso = await resProductsCorso.json();
		getTableCourses = resGetTableProductsCorso.map((obj) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

		// LISTA NOMI RIFLESSOLOGI
		const resName = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/users/all-active-names/0/0`
		);
		getTableNames = await resName.json();


	} catch (error) {
		console.log('products-corso fetch error:', error);
	}
	//console.log('getTableCorsi', getTableCorsi);
	return {
		getTableCourses,
		getTableNames,
		auth: locals.auth
		//userData
	};
}
