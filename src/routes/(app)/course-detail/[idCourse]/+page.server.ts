//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	//const { session } = await parent(); // get data from +layout.server.ts
	//console.log('params', params);
	//console.log('query', query);
	//////////////////
	// let logged = false;
	// let localSession = '';
	// let modifyAuth = false;

	// if (locals?.auth) {
	// 	logged = true;
	// 	localSession = locals.session;
	// 	userMail = session.user.email;
	// 	userPoints = session.user.pointsBalance;
	// }

	const resCourse = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/courses/find/${params.idCourse}`
	);

	const getCourse = await resCourse.json();

	// getCourse.eventStartDate = getCourse.eventStartDate.toISOString().substring(0, 10);

	const resUser = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/users/findUserId/${getCourse.userId}`
	);

	const userData = await resUser.json();


	return {
		getCourse,
		userData,
		auth: locals.auth
	};

}
