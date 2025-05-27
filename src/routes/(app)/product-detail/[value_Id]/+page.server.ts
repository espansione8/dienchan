
import type { PageServerLoad } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
const apiKey = APIKEY;

export const load: PageServerLoad = async ({ fetch, locals, params }) => {

	let getProduct = [];
	try {
		const query = { prodId: params.value_Id, type: 'product' };
		const projection = { _id: 0 };
		const limit = 1;
		const skip = 0;
		const sort = {};
		const res = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'product',
				query,
				projection,
				limit,
				skip,
				sort
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		getProduct = await res.json();

	} catch (error) {
		console.error('Error fetching product data:', error);

	}
	return {
		getProduct: getProduct[0] || null
	};
};
