import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {



	return {
		userData: locals.data,
		auth: locals.auth
	};
}
