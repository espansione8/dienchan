import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	let getCategories = {};
	let itemCount = 0;
	//const user = locals.user

	try {
		//Count
		const countFetch = await fetch(`${BASE_URL}/api/mongo/count`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { type: 'product', status: 'enabled' },
				option: { hint: { prodId: 1 } },// optional:use index            
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});


		// get product
		const productFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product',
				query: {
					status: 'enabled',
					type: 'product'
				},
				projection: { _id: 0 },
				sort: { title: 1 },
				limit: 20,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});



		// Aggregate to get categories and count
		const AggregateFetch = fetch(`${BASE_URL}/api/mongo/aggregate`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product',
				pipeline: [
					{ "$match": { "status": "enabled", "type": "product", "category": { "$exists": true, "$ne": null } } },
					{ "$unwind": "$category" }, // Deconstructs the category array field from the input documents to output a document for each element.
					{ "$group": { "_id": "$category", "count": { "$sum": 1 } } }, // Group by category and count
					{ "$sort": { "_id": 1 } } // Sort by category name alphabetically
				]
			}),
			headers: { 'Content-Type': 'application/json' }
		});

		const [countRes, productRes, AggregateRes] = await Promise.all([
			countFetch,
			productFetch,
			AggregateFetch
		]);

		if (!countRes.ok) {
			throw error(400, 'Product count fetch failed');
		}
		itemCount = await countRes.json()

		if (!productRes.ok) {
			const errorText = await productRes.text();
			console.error('Product find failed', productRes.status, errorText);
			throw error(400, `Product find failed: ${errorText}`);
		}
		getTable = await productRes.json();

		if (!AggregateRes.ok) {
			const errorText = await AggregateRes.text();
			console.error('Categories aggregate fetch failed', AggregateRes.status, errorText);
			throw error(400, `Categories aggregate fetch failed: ${errorText}`);
		}
		const aggregateData = await AggregateRes.json();
		getCategories = aggregateData.reduce((acc: { [key: string]: number }, item: { _id: string, count: number }) => {
			acc[item._id] = item.count;
			return acc;
		}, {});

		// getTable = resGetTable.map((obj: any) => ({
		// 	...obj,
		// 	createdAt: obj.createdAt.substring(0, 10),
		// 	eventStartDate: obj.eventStartDate.substring(0, 10),
		// 	timeStartDate: obj.eventStartDate.substring(11, 16),
		// }));
	} catch (err) {
		console.log('product find error:', err);
		throw error(500, 'Server error during product load')
	}

	return {
		getTable,
		getCategories,
		itemCount,
		auth: locals.auth
	};
}

export const actions: Actions = {
	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const category = formData.get('category') as string;
		//console.log('category', category);

		try {
			// Count filtered items
			const countFetch = fetch(`${BASE_URL}/api/mongo/count`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: {
						status: 'enabled',
						type: 'product',
						category: category
					},
					option: { hint: { prodId: 1 } }, // optional: define index to use { hint: { prodId: 1 } }
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			// Get items (first page)
			const productFetch = fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: {
						status: 'enabled',
						type: 'product',
						category: category,
					},
					sort: { title: 1 },
					projection: { _id: 0 },
					limit: 20,
					skip: 0
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			const [countRes, productRes] = await Promise.all([countFetch, productFetch]);

			if (!countRes.ok) {
				const errorText = await countRes.text();
				console.error('Filtered product count fetch failed', countRes.status, errorText);
				return fail(400, { action: 'filter', success: false, message: `countRes: ${errorText}` });
			}
			const itemCount = await countRes.json();

			if (!productRes.ok) {
				const errorText = await productRes.text();
				console.error('Filtered product fetch failed', productRes.status, errorText);
				return fail(400, { action: 'filter', success: false, message: `productRes: ${errorText}` });
			}

			const getTable = await productRes.json();

			return {
				action: 'filter',
				success: true,
				payload: { getTable, itemCount, currentPage: 1, category }
			};
		} catch (e) {
			console.error('Error product filter:', e);
			return fail(500, { action: 'filter', success: false, message: 'Error product filter' });
		}
	},
	changePage: async ({ request, fetch }) => {
		const formData = await request.formData();
		const navigation = formData.get('navigation') as string;
		const itemsPerPage = Number(formData.get('itemsPerPage'));
		const category = formData.get('category') as string;
		let currentPage = Number(formData.get('currentPage'));

		if (navigation === 'prev') {
			currentPage = Math.max(1, currentPage - 1);
		} else if (navigation === 'next') {
			currentPage += 1;
		} else if (navigation === 'reset') {
			currentPage = 1;
		}
		const skipItems = (currentPage - 1) * itemsPerPage;

		try {
			const res = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: {
						status: 'enabled',
						type: 'product',
						...(category && { category: category })
					},
					sort: { title: 1 },
					projection: { _id: 0 },
					limit: itemsPerPage,
					skip: skipItems
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!res.ok) {
				const errorText = await res.text();
				console.error('changePage failed', res.status, errorText);
				return fail(400, { action: 'changePage', success: false, message: `changePage Error: ${errorText}` });
			}
			const getTable = await res.json();

			return { action: 'changePage', success: true, payload: { getTable, currentPage, category } };

		} catch (error) {
			console.error('Error changePage:', error);
			return { action: 'changePage', success: false, message: 'Error changePage' };
		}
	},
} satisfies Actions;