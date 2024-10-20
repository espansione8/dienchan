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

	const resProduct = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/products/findId/${params.value_Id}`
	);

	const getProduct = await resProduct.json();
	// const getUserSession = await resUser.json();
	// const ownerSession = getUserSession[0].cookieId;
	// /////////////////
	// // console.log('res.ok', res.ok);
	// //console.log('server getUserSession', getUserSession[0].cookieId);
	// if (ownerSession == localSession) {
	// 	modifyAuth = true;
	// }
	return {
		getProduct,
		userData: locals.user,
		auth: locals.auth
	};
	// }
	// return {
	// 	status: res.status,
	// 	error: new Error('Could not fetch the prod')
	// };
}
