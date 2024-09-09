import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	let getOrderData = [];
	let getOrder = [];
	const res = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/orders/findId/${locals.data.userId}`
	);
	getOrderData = await res.json();

	getOrder = getOrderData.map((obj) => ({
		...obj,
		createdAt: obj.createdAt.substring(0, 10)
	}));

	let user = locals.data
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}
	//console.log('locals.data', typeof locals.data, locals.data);
	return {
		//sessionAuth: session.auth,
		//userEmail: session.user.email,
		userData: user,
		orderData: getOrder,
		auth: locals.auth
	};
}
