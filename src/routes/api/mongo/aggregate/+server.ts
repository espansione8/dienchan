// `${BASE_URL}/api/mongo/aggregate`
import { APIKEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { Product } from '$lib/server/mongo/schema/Products.model';
import { Order } from '$lib/server/mongo/schema/Orders.model';
import { User } from '$lib/server/mongo/schema/Users.model';
import { Layout } from '$lib/server/mongo/schema/ProductLayouts.model';
import { Discount } from '$lib/server/mongo/schema/Discounts.model';
import { timingSafeEqual } from 'crypto';
import dbConnect from '$lib/server/mongo/database';
import type { RequestHandler } from '@sveltejs/kit';

// INSTRUCTION
// import { APIKEY, BASE_URL } from '$env/static/private';

// const resFetch = fetch(`${BASE_URL}/api/mongo/aggregate`, {
//   method: 'POST',
//   body: JSON.stringify({
//       apiKey: APIKEY,
//       schema: 'user', //product | order | user | layout | discount 
//       // pipeline aggregate -> array of steps.
//       // Example count user in county:
//       pipeline: [
//           { $match: { 'membership.membershipStatus': true, 'county': { $exists: true, $ne: null } } }, // Filter members
//           { $group: { _id: '$county', count: { $sum: 1 } } }, // regroup by county and count
//           { $sort: { _id: 1 } } // sorting
//       ]
//   }),
//   headers: {
//       'Content-Type': 'application/json'
//   }
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
		pipeline  // array of operations
	} = body;

	// TODO add pipeline validation to prevent arbitrary operations


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

	if (!Array.isArray(pipeline)) {
		return json({ message: '"pipeline" must be array' }, { status: 400 });
	}

	try {
		await dbConnect();

		const aggregateResult = await model.aggregate(pipeline).exec();

		if (aggregateResult) return json(aggregateResult, { status: 200 });
		return json({ message: 'Aggregation Error' }, { status: 400 });

	} catch (err) {
		// Gestione degli errori durante l'aggregazione
		console.error('Aggregation server Error:', err);
		return json({ message: `Aggregation server Error` }, { status: 500 });
	}
};