// `${import.meta.env.VITE_BASE_URL}/api/mongo/create`
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/db/mongo/database';
import { Product } from '$lib/db/mongo/schema/Products.model';
import { Order } from '$lib/db/mongo/schema/Orders.model';
import { User } from '$lib/db/mongo/schema/Users.model';
import { Layout } from '$lib/db/mongo/schema/ProductLayouts.model';
import { Discount } from '$lib/db/mongo/schema/Discounts.model';
import type { RequestHandler } from '@sveltejs/kit';

// const email = emailToCheck.replace(/\s+/g, '').toLowerCase();
// INSTRUCTION
// import stringHash from 'string-hash';
// const newId = stringHash(crypto.randomUUID());
// const apiKey = import.meta.env.VITE_APIKEY;
// const returnObj = false // return new Doc instead of String
// const newDoc = {
// 	docId: newId,
// 	title: 'product',
// 	price: { $gt: 50 }
// };
// const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/create`, {
// 	method: 'POST',
// 	body: JSON.stringify({
// 		apiKey,
// 		schema: 'product', //product | order | user | layout | discount
// 		newDoc,
//		returnObj
// 	}),
// 	headers: {
// 		'Content-Type': 'application/json'
// 	}
// });
// const response = await res.json();

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const {
		apiKey,
		schema,
		newDoc,
		returnObj
	} = body;

	if (apiKey !== import.meta.env.VITE_APIKEY) {
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
		const insert = await model.create(newDoc);
		//console.log('insert API', insert._id);

		if (insert._id) {
			if (returnObj) { return json(insert, { status: 200 }); }
			else { return json({ message: 'insert ok', status: 200 }); }
		}

		return json({ message: 'insert error', status: 400 });

	} catch (err) {
		console.log('insert ERROR:', err);
		return json({ message: 'insert ERROR' }, { status: 505 });
	}
};