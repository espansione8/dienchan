//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	// if (!locals.auth) {
	// 	throw redirect(302, '/login');
	// }

	let getTable = [];
	let getTableNames = [];

	try {
		// const userData = session.user;
		//console.log('MY DOCS userData', userData);

		// CORSI
		// const resProductsCorso = await fetch(
		// 	`${import.meta.env.VITE_BASE_URL}/api/courses/all-enabled/0/0`
		// );
		// const resGetTableProductsCorso = await resProductsCorso.json();
		// getTable = resGetTableProductsCorso.map((obj) => ({
		// 	...obj,
		// 	createdAt: obj.createdAt.substring(0, 10)
		// }));

		const resProductsCorso = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/products/find/type/course/0/0`
		);

		const resGetTable = await resProductsCorso.json();

		getTable = resGetTable.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			eventStartDate: obj.eventStartDate.substring(0, 10),
			timeStartDate: obj.eventStartDate.substring(11, 16),
			//timeEndDate: obj.eventEndDate.substring(11, 16),
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
		getTable,
		getTableNames,
		auth: locals.auth
		//userData
	};
}
