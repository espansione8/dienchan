//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

const apiKey = import.meta.env.VITE_APIKEY;

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	let getTableNames = [];
	let getLayout = [];
	const user = locals.user

	try {
		// get courses
		const queryCourses = {
			status: 'enabled',
			type: 'course'
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

		// user list
		const queryUsers = {
			status: 'enabled',
			level: 'superadmin'
		};
		const projectionUsers = { _id: 0 };
		const sortUsers = { surname: 1 };
		const limitUsers = 1000;
		const skipUsers = 0;

		const resName = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'user',
				query: queryUsers,
				projection: projectionUsers,
				sort: sortUsers,
				limit: limitUsers,
				skip: skipUsers
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		getTableNames = await resName.json();

		// get layout
		const queryLayout = {};
		const projectionLayout = { _id: 0 };
		const sortLayout = { createdAt: -1 };
		const limitLayout = 1000;
		const skipLayout = 0;

		const resLayout = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'layout',
				query: queryLayout,
				projection: projectionLayout,
				sort: sortLayout,
				limit: limitLayout,
				skip: skipLayout
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		getLayout = await resLayout.json();

	} catch (error) {
		console.log('course filter fetch error:', error);
	}
	return {
		getTable,
		getTableNames,
		getLayout,
		auth: locals.auth,
		userData: user
	};
}
