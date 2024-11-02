// `${import.meta.env.VITE_BASE_URL}/api/mongo/find`
import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
import { Order } from '$lib/models/Orders.model';
import { User } from '$lib/models/Users.model';
import { Layout } from '$lib/models/ProductLayouts.model';
import { Discount } from '$lib/models/Discounts.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

// const email = emailToCheck.replace(/\s+/g, '').toLowerCase();
// INSTRUCTION
// const query = { type: 'product', price: { $gt: 50 } };
// const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
// const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
// const limit = 1;
// const skip = 0;
// const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
// 	method: 'POST',
// 	body: JSON.stringify({
// 		schema: 'product', //product | order | user | layout | discount
// 		query,
// 		projection,
// 		sort,
// 		limit,
// 		skip
// 	}),
// 	headers: {
// 		'Content-Type': 'application/json'
// 	}
// });
// const response = await res.json();

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const {
		schema,
		query,
		projection,
		sort,
		limit,
		skip
	} = body;

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

		if (find) return json(find, { status: 200 });
		return json({ message: 'search error' }, { status: 400 });

	} catch (err) {
		console.log('search ERROR:', err);
		return json({ message: `search ERROR: ${err}` }, { status: 500 });
	}
};