//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

const apiKey = import.meta.env.VITE_APIKEY;

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	//const user = locals.user

	try {
		// get product
		const queryCourses = {
			status: 'enabled',
			type: 'product'
		};
		const projectionCourses = { _id: 0 };
		const sortCourses = { createdAt: -1 };
		const limitCourses = 1000;
		const skipCourses = 0;

		const resProductsCorso = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'product',
				query: queryCourses,
				projection: projectionCourses,
				sort: sortCourses,
				limit: limitCourses,
				skip: skipCourses
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const resGetTable = await resProductsCorso.json();

		getTable = resGetTable.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			eventStartDate: obj.eventStartDate.substring(0, 10),
			timeStartDate: obj.eventStartDate.substring(11, 16),
		}));
	} catch (error) {
		console.log('course filter fetch error:', error);
	}
	return {
		getTable,
		auth: locals.auth
	};
}
