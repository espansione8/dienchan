//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

const apiKey = import.meta.env.VITE_APIKEY;

export const load: PageServerLoad = async ({ fetch, locals, params }) => {

	let getCourse = [];
	let userData = [];
	try {
		const query = { prodId: params.idCourse, type: 'course' }; //IF USE Products.model -> types: course / product / membership / event
		const projection = { _id: 0 } // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'product', //product | order | user | layout | discount
				query,
				projection,
				sort,
				limit,
				skip
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const response = await res.json();
		getCourse = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

	} catch (error) {
		console.log('membershipfetch error:', error);
	}


	// getCourse.eventStartDate = getCourse.eventStartDate.toISOString().substring(0, 10);
	// TODO REFACTOR
	const resUser = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/users/findUserId/${getCourse.userId}`
	);

	userData = await resUser.json();

	// getCourse: getCourse.response,

	return {
		getCourse: getCourse[0],
		userData,
		auth: locals.auth
	};

}
