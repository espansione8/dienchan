import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	//const { session } = await parent(); // get data from +layout.server.ts
	//console.log('params', params);
	console.log('locals', locals.auth);

	if (!locals?.auth) {
		throw redirect(302, '/course-shop');
	} else {
		throw redirect(302, '/profile-modify');
	}
	// if (session?.auth) {
	// 	throw redirect(302, '/profile');
	// }
	// 	return {
	// 		auth: locals.auth
	// 	};
}
