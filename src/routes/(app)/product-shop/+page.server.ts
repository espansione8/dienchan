import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

const apiKey = import.meta.env.VITE_APIKEY;
const baseURL = import.meta.env.VITE_BASE_URL;

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

		if (res.status != 200) {
			const errorText = await res.text();
			console.error('product find failed', res.status, errorText);
			return fail(400, { action: 'load', success: false, message: errorText });
		}
		const resGetTable = await res.json();

		getTable = resGetTable.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			eventStartDate: obj.eventStartDate.substring(0, 10),
			timeStartDate: obj.eventStartDate.substring(11, 16),
		}));
	} catch (error) {
		console.log('product find error:', error);
	}
	return {
		getTable,
		auth: locals.auth
	};
}
