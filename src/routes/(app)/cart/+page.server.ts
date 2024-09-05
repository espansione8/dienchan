//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	// if (!locals.auth) {
	// 	throw redirect(302, '/login');
	// }

	let getTableNames = [];

	const resName = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/user/all-active-names/0/0`
	);
	getTableNames = await resName.json();


	// let getTableUser = [];

	// const res = await fetch(
	// 	`${import.meta.env.VITE_BASE_URL}/api/user/all-active/0/0`
	// );
	// const resGetTableUser = await res.json();
	//console.log('MY DOCS res.ok', res.ok);
	//console.log('res getTableData', resGetTableData)
	// getTableUser = resGetTableUser.map((obj) => ({
	// 	...obj,
	// 	createdAt: obj.createdAt.substring(0, 10)
	// }));

	return {
		//sessionAuth: session.auth,
		//userEmail: session.user.email,
		userData: locals.data,
		getTableNames,
		auth: locals.auth
		// getTableUser
	};
}
