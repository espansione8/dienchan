import { json } from '@sveltejs/kit';
import { Order } from '$lib/models/Orders.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

///BASE_URL/api/orders/all/:limit/:skip

export const GET: RequestHandler = async ({ params }) => {
	let queryLimit = 1000;
	if (isNaN(Number(params.limit))) {
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
		const all = await Order.find().limit(queryLimit).skip(skipResults).lean().sort({ orderDate: -1 }).exec();
		//throw new Error("@1migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		return json(all);
		// return {
		// 	body: all
		// };
	} catch (err) {
		console.log('GET User all ERROR:', err);
		return json({
			error: `Server error: ${err}`
		}, {
			status: 500
		});
	}
};
