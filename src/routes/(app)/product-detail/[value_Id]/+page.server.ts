import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	//const { session } = await parent(); // get data from +layout.server.ts
	//console.log('params', params);
	//console.log('query', query);
	//////////////////
	if (!locals.auth) {
		throw redirect(302, '/login');
	}

	return {

	};

}
