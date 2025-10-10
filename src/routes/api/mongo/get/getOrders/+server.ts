import { json } from '@sveltejs/kit';
import { Order } from '$lib/server/mongo/schema/Orders.model';

import dbConnect from '$lib/server/mongo/database';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {

	try {
		await dbConnect();

		// Query per ottenere tutti gli ordini
		const orders = await Order.find({})
			.populate({
				path: 'userView',
				options: { strictPopulate: false }
			})
			.lean()
			.exec();

		return json(orders, { status: 200 });

	} catch (err) {
		console.log('orders fetch ERROR:', err);
		return json({ message: `orders fetch ERROR: ${err}` }, { status: 500 });
	}
};