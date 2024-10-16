import { json } from '@sveltejs/kit';
import { User } from '$lib/models/Users.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

///BASE_URL/api/users/all-active-names/:limit/:skip

export const GET: RequestHandler = async ({ params }) => {
	let queryLimit = 10;
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

		const all = await User.find({ status: 'enabled' }, { name: 1, surname: 1, userId: 1 }).limit(queryLimit).skip(skipResults).lean().exec();

		//console.log({ all })
		if (all.length > 0) {
			return json(
				{
					response: all
				},
				{
					status: 200
				}
			);
		}
		return json(
			{
				message: 'user not found'
			},
			{
				status: 400
			}
		);
	} catch (err) {
		console.log('GET User all ERROR:', err);
		return json(
			{
				message: `Server error: ${err}`
			}, {
			status: 500
		});
	}
};
