import { json } from '@sveltejs/kit';
import { User } from '$lib/models/Users.model';
import dbConnect from '$lib/database';
//import type { RequestHandler } from '@sveltejs/kit';

///BASE_URL/api/users/findUserId/:value

export const GET = async ({ params }) => {
	try {
		await dbConnect();
		const findUserId = await Users.findOne({ userId: params.value }).lean().exec();
		//throw new Error("@1migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		return json(findUserId);
		// return {
		// 	body: findId
		// };
	} catch (err) {
		console.log('GET User findUserId ERROR:', err);
		return json({
			error: `Server error: ${err}`
		}, {
			status: 500
		});
	}
};
