import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	let getTableUser = [];
	try {
		//const userData = session.user;
		//console.log('MY DOCS userData', userData);
		const res = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/users/all/0/0`
		);
		const resGetTableUser = await res.json();
		//console.log('MY DOCS res.ok', res.ok);
		//console.log('res getTableData', resGetTableData)
		getTableUser = resGetTableUser.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			// membershipExpiry = membership.membershipExpiry.toISOString().substring(0, 10)
		}));
	} catch (error) {
		console.log('fetch error:', error);
	}
	const user = locals.data
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}
	//console.log('res getTableData', getTableData);
	return {
		getTableUser,
		userData: user,
		auth: locals.auth,
		//userData
	};
}
