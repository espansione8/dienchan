//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
const apiKey = APIKEY;
const baseURL = BASE_URL;

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	let getTableNames = [];
	let getLayout = [];
	//const user = locals.user

	try {
		// get courses
		const resProductsCorso = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'product',
				query: {
					status: 'enabled',
					type: 'course'
				},
				sort: { eventStartDate: 1 },
				projection: { _id: 0 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!resProductsCorso.ok) throw error(400, `resProductsCorso: ${await resProductsCorso.text()}`);

		const resGetTable = await resProductsCorso.json();

		getTable = resGetTable
			.filter((obj: any) => obj.layoutView)
			.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt ? obj.createdAt.substring(0, 10) : undefined,
				eventStartDate: obj.eventStartDate ? obj.eventStartDate.substring(0, 10) : undefined,
				timeStartDate: obj.eventStartDate ? obj.eventStartDate.substring(11, 16) : undefined,
			}));

		// user list
		const resName = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'user',
				query: {
					status: 'enabled',
					$or: [
						{ level: 'superadmin' },
						{ level: 'formatore' }
					]
				},
				projection: { _id: 0, name: 1, surname: 1, userId: 1 },
				sort: { surname: 1 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!resName.ok) throw error(400, `resName: ${await resName.text()}`);
		getTableNames = await resName.json();

		// get layout
		const resLayout = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'layout',
				query: {},
				projection: { _id: 0 },
				sort: { title: 1 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!resLayout.ok) throw error(400, `resLayout: ${await resLayout.text()}`);
		getLayout = await resLayout.json();

	} catch (error) {
		console.log('layout find error:', error);
	}
	//console.log('getTable', typeof getTable[0].eventStartDate, getTable[0].eventStartDate);

	return {
		getTable,
		getTableNames,
		getLayout,
		auth: locals.auth,
		userData: locals.user
	};
}
