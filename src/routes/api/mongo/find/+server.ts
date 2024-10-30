//`${import.meta.env.VITE_BASE_URL}/api/mongo/find`
import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
import { Order } from '$lib/models/Orders.model';
import { User } from '$lib/models/Users.model';
import { Layout } from '$lib/models/ProductLayouts.model';
import { Discount } from '$lib/models/Discounts.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

// INSTRUCTION
// const query = { type: 'product', price: 50 }; // for prods: type:'course' | 'product' | 'membership' | 'event'
// const limit = 1000;
// const skip = 0;
// const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
// 	method: 'POST',
// 	body: JSON.stringify({
// 		schema: 'layout', //product | order | user | layout | discount
// 		query,
//		limit,
//		skip
// 	}),
// 	headers: {
// 		'Content-Type': 'application/json'
// 	}
// });
// const response = await res.json();

//const email = emailToCheck.replace(/\s+/g, '').toLowerCase();

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const {
		schema,
		query,
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
		const find = await model.find(query, { _id: 0, password: 0 })
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
			.lean()
			.exec();

		if (find) {
			return json(find, { status: 200 });
		}
		return json({ message: 'search error' }, { status: 400 });
	} catch (err) {
		console.log('search ERROR:', err);
		return json({ message: `search error: ${err}` }, { status: 500 });
	}
};