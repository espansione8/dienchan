import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	const res = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/orders/findId/${locals.data.userId}`
	);
	const getOrderData = await res.json();
	return {
		//sessionAuth: session.auth,
		//userEmail: session.user.email,
		userData: locals.data,
		auth: locals.auth,
		orderData: getOrderData
	};
}
