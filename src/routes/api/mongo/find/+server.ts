// `${BASE_URL}/api/mongo/find`
import { APIKEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { Product } from '$lib/server/mongo/schema/Products.model';
import { Order } from '$lib/server/mongo/schema/Orders.model';
import { User } from '$lib/server/mongo/schema/Users.model';
import { Layout } from '$lib/server/mongo/schema/ProductLayouts.model';
import { Discount } from '$lib/server/mongo/schema/Discounts.model';
import dbConnect from '$lib/server/mongo/database';
import type { RequestHandler } from '@sveltejs/kit';

// const email = emailToCheck.replace(/\s+/g, '').toLowerCase();
// INSTRUCTION
// import { APIKEY, BASE_URL } from '$env/static/private';

// const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
// 	method: 'POST',
// 	body: JSON.stringify({
// 		 apiKey: APIKEY,
// 		schema: 'product', //product | order | user | layout | discount
// 		query: { type: 'product', price: { $gt: 50 } },
// 		projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
// 		sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
// 		limit: 1000,
// 		skip: 0
// 	}),
// 	headers: {
// 		'Content-Type': 'application/json'
// 	}
// });
// const res = await resFetch;
// if (!res.ok) {
//     return fail(400, { action: 'renew', success: false, message: await res.text() });
// }
// const response = await res.json()

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const {
		apiKey,
		schema,
		query,
		projection,
		sort,
		limit,
		skip
	} = body;

	if (apiKey !== APIKEY) {
		return json({ message: 'api error' }, { status: 401 });
	}

	let model: any;
	if (schema == 'product') model = Product;
	if (schema == 'order') model = Order;
	if (schema == 'user') model = User;
	if (schema == 'layout') model = Layout;
	if (schema == 'discount') model = Discount;

	try {
		await dbConnect();
		const find = await model.find(query, projection)
			.sort(sort)
			.limit(limit)
			.skip(skip)
			.populate({
				path: 'userView',
				options: { strictPopulate: false }
			})
			.populate({
				path: 'layoutView',
				options: { strictPopulate: false }
			})
			.lean().exec();
		//console.log('find', find);

		if (find) return json(find, { status: 200 });
		return json({ message: 'search error' }, { status: 400 });

	} catch (err) {
		console.log('search ERROR:', err);
		return json({ message: `search ERROR: ${err}` }, { status: 500 });
	}
};