// `${BASE_URL}/api/mongo/create`
import { APIKEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/server/mongo/database';
import { Product } from '$lib/server/mongo/schema/Products.model';
import { Order } from '$lib/server/mongo/schema/Orders.model';
import { User } from '$lib/server/mongo/schema/Users.model';
import { Layout } from '$lib/server/mongo/schema/ProductLayouts.model';
import { Discount } from '$lib/server/mongo/schema/Discounts.model';
import { timingSafeEqual } from 'crypto';
import type { RequestHandler } from '@sveltejs/kit';

// const email = emailToCheck.replace(/\s+/g, '').toLowerCase();
// INSTRUCTION
// import { APIKEY, BASE_URL } from '$env/static/private';
// import { customAlphabet } from 'nanoid'
// const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 9)
// const newId = nanoid();

// const resFetch = fetch(`${BASE_URL}/api/mongo/create`, {
// 	method: 'POST',
// 	body: JSON.stringify({
// 		 apiKey: APIKEY,
// 		schema: 'product', //product | order | user | layout | discount
// 		newDoc: {
// 			docId: newId,
// 			title: 'product',
// 			price: { $gt: 50 }
// 		},
// 		returnObj: false
// 	}),
// 	headers: {
// 		'Content-Type': 'application/json'
// 	}
// });
// const res = await resFetch;
// if (!res.ok) {
//     return fail(400, { action: 'renew', success: false, message: `res: ${await res.text()}` });
// }
// const response = await res.json()

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const {
		apiKey,
		schema,
		newDoc,
		returnObj
	} = body;

	//if (apiKey !== APIKEY) {
	const apiKeyBuffer = Buffer.from(apiKey || '');
	const expectedBuffer = Buffer.from(APIKEY);
	if (apiKeyBuffer.length !== expectedBuffer.length || !timingSafeEqual(apiKeyBuffer, expectedBuffer)) {
		return json({ message: 'api error' }, { status: 401 });
	}

	let model: any;
	if (schema == 'product') model = Product;
	else if (schema == 'order') model = Order;
	else if (schema == 'user') model = User;
	else if (schema == 'layout') model = Layout;
	else if (schema == 'discount') model = Discount;
	else {
		return json({ message: 'Schema not found' }, { status: 400 });
	}

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
		return json({ message: 'insert ERROR' }, { status: 500 });
	}
};