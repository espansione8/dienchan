import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}

	// const res = await fetch(
	// 	`${import.meta.env.VITE_BASE_URL}/api/document-page/page-content/${params.idUser}/${
	// 		params.idPage
	// 	}`
	// );
	// const getPage = await res.json();

	// if (getPage.status == 'disabled') throw redirect(302, `/expired?ssn=${params.idPage}`);
	// const resSessionUser = await fetch(
	// 	`${import.meta.env.VITE_BASE_URL}/api/orders/findId/${session.user.userId}`
	// );
	// const sessionUserData = await resSessionUser.json();
	// console.log('sessionUserData', sessionUserData.level);

	const resUser = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/user/findUserId/${params.idUser}`
	);

	const userData = await resUser.json();

	const resOrder = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/orders/findId/${userData._id}`
	);
	const getOrderData = await resOrder.json();

	// const getUserSession = await resUser.json();
	// const ownerSession = getUserSession[0].cookieId;
	// /////////////////
	// // console.log('res.ok', res.ok);
	// //console.log('server getUserSession', getUserSession[0].cookieId);
	// if (ownerSession == localSession) {
	// 	modifyAuth = true;
	// }
	return {
		userData,
		orderData: getOrderData,
		sessionUserData: locals.data,
		auth: locals.auth
	};
}
