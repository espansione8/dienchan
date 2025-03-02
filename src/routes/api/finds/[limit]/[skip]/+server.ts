///BASE_URL/api/finds/:limit/:skip
import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
import { Order } from '$lib/models/Orders.model';
import { User } from '$lib/models/Users.model';
import { Layout } from '$lib/models/ProductLayouts.model';
import { Discount } from '$lib/models/Discounts.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

// INSTRUCTION
// const arrayField = ['type', 'price'];
// const arrayValue = ['course', 50]; // DEFINE TYPE "course|membership|product" FOR PRODUCT SCEMA
// const resLayout = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
// 	method: 'POST',
// 	body: JSON.stringify({
// 		schema: 'layout', //product | order | user | layout | discount
// 		arrayField,
// 		arrayValue
// 	}),
// 	headers: {
// 		'Content-Type': 'application/json'
// 	}
// });
// getLayout = await resLayout.json();

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
	if (schema == 'layout') model = Layout;
	if (schema == 'discount') model = Discount;

	// filter
	let i = 0
	const filter = {}

	for (i = 0; i < arrayField.length; i++) {
		if (arrayField[i] != '' && arrayValue[i] != '' && arrayValue[i] != false && arrayValue[i] != null) {
			filter[arrayField[i]] = arrayValue[i]
		}
	}
	//console.log('filter', filter);

	// limit + skip
	let queryLimit = 1;
	if (isNaN(Number(params.limit)) || params.limit == '0') {
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

		//console.log('find', find);
		return json(find, { status: 200 });
		// if (find.length > 0) {
		// 	return json(find, { status: 200 });
		// }
		// return json({ message: 'no result' }, { status: 400 });

		// return {
		// 	body: find
		// };
	} catch (err) {
		console.log('Query find ERROR:', err);
		return json({ message: `Server error: ${err}` }, { status: 500 });
	}
};
