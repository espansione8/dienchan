import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}

	let getTable = [];
	let getTableNames = [];
	const userId = locals.data.userId || ''

	try {
		let path = `${import.meta.env.VITE_BASE_URL}/api/products/find/type/course/0/0`
		if (locals.data.level == 'formatore') path = `${import.meta.env.VITE_BASE_URL}/api/courses/user-id/${userId}`

		// ADMIN course
		const res = await fetch(path);
		const resGetTable = await res.json();
		getTable = resGetTable.map((obj) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			eventStartDate: obj.eventStartDate.substring(0, 10)
		}));

		// LISTA NOMI RIFLESSOLOGI
		const resName = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/users/all-active-names/0/0`
		);
		getTableNames = await resName.json();

	} catch (error) {
		console.log('products-corso fetch error:', error);
	}

	return {
		getTable,
		getTableNames,
		auth: locals.auth
		//userData
	};
}