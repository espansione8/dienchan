import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	
	const resUser = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/users/findUserId/${params.idUser}`
	);

	const userData = await resUser.json();

	// console.log('userData', userData._id);

	const resOrder = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/orders/findId/${userData.userId}`
	);

	const getOrderData = await resOrder.json();

	const getOrder = getOrderData.map((obj) => ({
		...obj,
		createdAt: obj.createdAt.substring(0, 10)
	}));

	// console.log('getOrder', getOrder);

	return {
		userData,
		orderData: getOrder,
		auth: locals.auth
	};
}
