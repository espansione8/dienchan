///BASE_URL/api/finds/:limit/:skip
import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
import { Order } from '$lib/models/Orders.model';
import { User } from '$lib/models/Users.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, params }) => {
	const body = await request.json();
	const {
		schema,
		arrayField,
		arrayValue,
	} = body;

	let model: unknown;
	if (schema == 'product') model = Product;
	if (schema == 'order') model = Order;
	if (schema == 'user') model = User;

	// filter
	let i = 0
	const filter = {}

	for (i = 0; i < arrayField.length; i++) {
		if (arrayField[i] != '' && arrayValue[i] != '') filter[arrayField[i]] = arrayValue[i]
	}
	console.log('filter', filter);

	// limit + skip
	let queryLimit = 1;
	if (isNaN(Number(params.limit)) || params.limit === '0') {
		queryLimit = 1000;
	} else {
		queryLimit = Number(params.limit);
	}

	let skipResults = 0;
	if (isNaN(Number(params.skip))) {
		skipResults = 0;
	} else {
		skipResults = Number(params.skip);
	}

	try {
		await dbConnect();
		const find = await model.find(filter)
			.limit(queryLimit)
			.skip(skipResults)
			.populate('userView')
			.lean()
			.exec();

		//console.log('find', find);

		return json(find);
		// return {
		// 	body: find
		// };
	} catch (err) {
		console.log('Query find ERROR:', err);
		return json({
			error: `Server error: ${err}`
		}, {
			status: 500
		});
	}
};
