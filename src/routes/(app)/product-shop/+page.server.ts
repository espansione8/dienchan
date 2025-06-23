import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	const getCategories = {};
	let itemCount = 0;
	//const user = locals.user

	try {
		// Count
		// const resCount = await fetch(`${BASE_URL}/api/mongo/count`, {
		// 	method: 'POST',
		// 	body: JSON.stringify({
		// 		apiKey: APIKEY,
		// 		schema: 'product', //product | order | user | layout | discount
		// 		query: { type: 'product', status: 'enabled' },
		// 		option: { hint: { prodId: 1 } },// optional:use index            
		// 	}),
		// 	headers: {
		// 		'Content-Type': 'application/json'
		// 	}
		// });
		// if (!resCount.ok) {
		// 	// return fail(400, { action: 'renew', success: false, message: `res: ${await res.text()}` });
		// 	throw error(400, 'count fetch failed');
		// }
		// itemCount = await resCount.json()

		// get product
		const res = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product',
				query: {
					status: 'enabled',
					type: 'product'
				},
				projection: { _id: 0 },
				//sort: { createdAt: -1 },
				limit: 100000,
				skip: 0
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
		getTable.forEach((item) => {
			item.category.forEach((cat) => {
				getCategories[cat] = (getCategories[cat] || 0) + 1;
			});
		});
		itemCount = getTable.length

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
		getCategories,
		itemCount,
		auth: locals.auth
	};
}

export const actions: Actions = {
	changePage: async ({ request, fetch }) => {
		const formData = await request.formData();
		const itemsPerPage = formData.get('itemsPerPage');
		const currentPage = formData.get('currentPage');
		const skipItems = (Number(currentPage) - 1) * Number(itemsPerPage);

		try {
			const res = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: {
						status: 'enabled',
						type: 'product'
					},
					projection: { _id: 0 },
					//sort: { createdAt: -1 },
					limit: itemsPerPage,
					skip: skipItems
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!res.ok) {
				const errorText = await res.text();
				console.error('discount delete failed', res.status, errorText);
				return fail(400, { action: 'changePage', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'changePage', success: true, message: result.message, payload: result };

		} catch (error) {
			console.error('Error changePage:', error);
			return { action: 'changePage', success: false, message: 'Error changePage' };
		}
	},
} satisfies Actions;