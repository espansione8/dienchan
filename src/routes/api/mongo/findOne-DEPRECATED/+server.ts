// `${import.meta.env.VITE_BASE_URL}/api/mongo/findOne`
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
// const query = { title: 'name' }; // for prods: type:'course' | 'product' | 'membership' | 'event'
// const options = { _id: 0, password: 0 }
// const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/findOne`, {
// 	method: 'POST',
// 	body: JSON.stringify({
// 		schema: 'layout', //product | order | user | layout | discount
// 		query,
// 		options
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
		options
	} = body;

	let model: any;
	if (schema == 'product') model = Product;
	if (schema == 'order') model = Order;
	if (schema == 'user') model = User;
	if (schema == 'layout') model = Layout;
	if (schema == 'discount') model = Discount;

	try {
		await dbConnect();
		const doc = await model.findOne(query, options)
			.lean()
			.exec();

		if (doc) {
			return json(doc, { status: 200 });
		}
		return json({ message: 'doc find error' }, { status: 400 });
	} catch (err) {
		console.error('doc find ERROR:', err);
		return json({ message: 'doc find ERROR' }, { status: 500 });
	}
};
