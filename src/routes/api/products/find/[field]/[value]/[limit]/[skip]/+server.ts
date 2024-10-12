///BASE_URL/api/products/find/:field/:value/:limit/:skip
import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const field: string = params.field || '';
	let value;
	if (isNaN(params.value)) {
		value = new RegExp(`.*${params.value}.*`, 'i');
	} else {
		value = params.value;
	}

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
		const find = await Product.find({ [field]: value })
			.limit(queryLimit)
			.skip(skipResults)
			.lean()
			.populate(['userView', 'layoutView'])
			//.populate('userView')
			.exec();

		return json(find);
		// return {
		// 	body: find
		// };
	} catch (err) {
		console.log('GET Product find ERROR:', err);
		return json({
			error: `Server error: ${err}`
		}, {
			status: 500
		});
	}
};
