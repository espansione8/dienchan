//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	//console.log('locals', locals);
	// if (!locals.auth) {
	// 	throw redirect(302, '/login');
	// }
	//console.log('locals.data', locals.data);

	let user = locals.data
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}

	return {
		//sessionAuth: session.auth,
		//userEmail: session.user.email,
		userData: user,
		auth: locals.auth
	};
}

primary #f50101
secondary #1a93dc
accent #292fa7

info 66d1ff
success 48c78e
warning ffb70f
danger ff6685
