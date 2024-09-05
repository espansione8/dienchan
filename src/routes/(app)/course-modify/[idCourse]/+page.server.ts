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

	const resCourse = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/courses/find/${params.idCourse}`
	);

	const getCourse = await resCourse.json();

	return {
		getCourse,
		userData: locals.data,
		auth: locals.auth
	};
}