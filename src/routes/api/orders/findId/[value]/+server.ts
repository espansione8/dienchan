import { json } from '@sveltejs/kit';
import { Order } from '$lib/models/Orders.model';
import dbConnect from '$lib/database';
//import type { RequestHandler } from '@sveltejs/kit';

///BASE_URL/api/orders/findId/:value

export const GET = async ({ params }) => {
	try {
		await dbConnect();
		const findId = await Order.find({ userId: params.value }).lean().exec();

		return json(findId);
		// return {
		// 	body: findId
		// };
	} catch (err) {
		console.log('GET Order findId ERROR:', err);
		return json(
			{
				error: `Server error: ${err}`
			},
			{
				status: 500
			}
		);
	}
};
