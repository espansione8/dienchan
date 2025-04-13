import { json } from '@sveltejs/kit';
import { Order } from '$lib/db/mongo/schema/Orders.model';
import dbConnect from '$lib/db/mongo/database';
//import type { RequestHandler } from '@sveltejs/kit';

///BASE_URL/api/orders/findId/:value

export const GET = async ({ params }) => {
	try {
		await dbConnect();
		const findId = await Order.find({ userId: params.value }, { _id: 0 }).lean().exec();

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
