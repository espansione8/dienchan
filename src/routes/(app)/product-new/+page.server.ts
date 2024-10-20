import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}

	return {
		//sessionAuth: session.auth,
		//userEmail: session.user.email,
		userData: locals.user,
		auth: locals.auth
	};
}
