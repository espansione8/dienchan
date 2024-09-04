import { json } from '@sveltejs/kit';
import { Users } from '$lib/models/Users.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	try {
		await dbConnect();
		const test = await Users.find().limit(5).lean().exec();
		//throw new Error("@1migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		return json(test);
		// return {
		// 	body: test
		// };
	} catch (err) {
		console.log('GET User test ERROR:', err);
		return json({
			error: `Server error: ${err}`
		}, {
			status: 500
		});
	}
};
