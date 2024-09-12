///BASE_URL/api/courses/all-enabled/:limit/:skip
import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;
	// let queryLimit = 1;
	// if (isNaN(Number(params.limit)) || params.limit === '0') {
	// 	queryLimit = 200;
	// } else {
	// 	queryLimit = Number(params.limit);
	// }

	// let skipResults = 0;
	// if (isNaN(Number(params.skip))) {
	// 	skipResults = 0;
	// } else {
	// 	skipResults = Number(params.skip);
	// }

	try {
		await dbConnect();
		const all = await Product.find({ status: 'enabled', userId: id, type: 'course' }) // Find all courses with 'enabled' status
			//.limit(queryLimit) // Limit results to the specified number
			//.skip(skipResults) // Skip a certain number of results (for pagination)
			.sort({ createdAt: -1 })
			.populate('userView')
			.exec(); // Execute the query and return a promise

		return json(all);
		// return {
		// 	body: all
		// };
	} catch (err) {
		console.log('GET Courses userId ERROR:', err);
		return json({
			error: `Server error: ${err}`
		}, {
			status: 500
		});
	}
};
