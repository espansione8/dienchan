import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	let getTableUser = [];
	try {
		//const userData = locals.data;
		//console.log('MY DOCS userData', userData);
		const res = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/user/all/0/0`
		);
		const resGetTableUser = await res.json();
		//console.log('MY DOCS res.ok', res.ok);
		//console.log('res getTableData', resGetTableData)
		getTableUser = resGetTableUser.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));
	} catch (error) {
		console.log('my-docs fetch error:', error);
	}
	//console.log('res getTableData', getTableData);
	return {
		getTableUser,
		auth: locals.auth
		//userData
	};
}
