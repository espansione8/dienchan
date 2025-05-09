
import type { PageServerLoad } from './$types'

const apiKey = import.meta.env.VITE_APIKEY;

export const load: PageServerLoad = async ({ fetch, locals, params }) => {

	let getProduct = [];
	try {
		const query = { prodId: params.value_Id, type: 'product' };
		const projection = { _id: 0, password: 0 };
		const limit = 1;
		const skip = 0;
		const sort = {};
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
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
