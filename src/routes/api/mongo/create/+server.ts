// `${import.meta.env.VITE_BASE_URL}/api/mongo/create`
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Product } from '$lib/models/Products.model';
import { Order } from '$lib/models/Orders.model';
import { User } from '$lib/models/Users.model';
import { Layout } from '$lib/models/ProductLayouts.model';
import { Discount } from '$lib/models/Discounts.model';
import type { RequestHandler } from '@sveltejs/kit';

// const email = emailToCheck.replace(/\s+/g, '').toLowerCase();
// INSTRUCTION
// import stringHash from 'string-hash';
// const newId = stringHash(crypto.randomUUID());
// const newDoc = {
// 	docId: newId,
// 	title: 'product',
// 	price: { $gt: 50 }
// };
// const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/create`, {
// 	method: 'POST',
// 	body: JSON.stringify({
// 		schema: 'product', //product | order | user | layout | discount
// 		newDoc
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
		newDoc,
	} = body;

	let model: any;
	if (schema == 'product') model = Product;
	if (schema == 'order') model = Order;
	if (schema == 'user') model = User;
	if (schema == 'layout') model = Layout;
	if (schema == 'discount') model = Discount;

	try {
		await dbConnect();
		const insert = await model.create(newDoc);
		//console.log('insert', insert);

		if (insert) return { message: 'insert ok', status: 200 };
		return { message: 'insert error', status: 400 };

	} catch (err) {
		console.log('insert ERROR:', err);
		return json({ message: 'insert ERROR' }, { status: 500 });
	}
};