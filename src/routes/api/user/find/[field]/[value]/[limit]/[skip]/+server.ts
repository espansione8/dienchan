import { json } from '@sveltejs/kit';
import { Users } from '$lib/models/Users.model';
import dbConnect from '$lib/database';
//import type { RequestHandler } from '@sveltejs/kit';

///BASE_URL/api/user/find/:field/:value/:limit/:skip

export const GET = async ({ params }) => {
	const field = params.field;
	let value;
	if (isNaN(params.value)) {
		value = new RegExp(`.*${params.value}.*`, 'i');
	} else {
		value = params.value;
	}

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
		const find = await Users.find({ [field]: value })
			.limit(queryLimit)
			.skip(skipResults)
			.lean()
			.exec();
		//throw new Error("@1migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		return json(find);
		// return {
		// 	body: find
		// };
	} catch (err) {
		console.log('GET User find ERROR:', err);
		return json({
			error: `Server error: ${err}`
		}, {
			status: 500
		});
	}
};
