import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

///BASE_URL/api/users/all/:limit/:skip

export const GET: RequestHandler = async ({ params }) => {
	let queryLimit = 1;
	if (isNaN(Number(params.limit)) || params.limit === '0') {
		queryLimit = 10;
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
		const all = await Products.find({ status: 'enabled' }).limit(queryLimit).skip(skipResults).lean().exec();
		//throw new Error("@1migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		return json(all);
		// return {
		// 	body: all
		// };
	} catch (err) {
		console.log('GET ProductCorso all ERROR:', err);
		return json({
			error: `Server error: ${err}`
		}, {
			status: 500
		});
	}
};
