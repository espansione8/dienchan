//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	//const { session } = await parent(); // get data from +layout.server.ts
	//console.log('params', params);
	//console.log('query', query);
	//////////////////

	const resUser = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/users/findUserId/${params.idUser}`
	);

	const getUser = await resUser.json();

	return {
		getUser,
		auth: locals.auth
	};
}
