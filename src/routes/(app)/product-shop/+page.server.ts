import type { PageServerLoad } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail } from '@sveltejs/kit';

const apiKey = APIKEY;
const baseURL = BASE_URL;

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	//const user = locals.user

	try {
		// get product
		const query = {
			status: 'enabled',
			type: 'product'
		};
		const projection = { _id: 0 };
		const sort = { createdAt: -1 };
		const limit = 1000;
		const skip = 0;

		const res = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'product',
				query: query,
				projection: projection,
				sort: sort,
				limit: limit,
				skip: skip
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!res.ok) {
			const errorText = await res.text();
			console.error('product find failed', res.status, errorText);
			return fail(400, { action: 'load', success: false, message: errorText });
		}
		getTable = await res.json();

		// getTable = resGetTable.map((obj: any) => ({
		// 	...obj,
		// 	createdAt: obj.createdAt.substring(0, 10),
		// 	eventStartDate: obj.eventStartDate.substring(0, 10),
		// 	timeStartDate: obj.eventStartDate.substring(11, 16),
		// }));
	} catch (error) {
		console.log('product find error:', error);
	}
	return {
		getTable,
		auth: locals.auth
	};
}
