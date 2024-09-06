import { json } from '@sveltejs/kit';
import { Course } from '$lib/models/Courses.model.js';
import dbConnect from '$lib/database';
//import type { RequestHandler } from '@sveltejs/kit';

///BASE_URL/api/users/findUserId/:value

export const GET = async ({ params }) => {
	try {
		await dbConnect();
		const findCourse = await Course.findOne({ prodCorsoId: params.value }).lean().populate('userView').exec();
		//throw new Error("@1migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		return json(findCourse);
		// return {
		// 	body: findId
		// };
	} catch (err) {
		console.log('GET Course ERROR:', err);
		return json({
			error: `Server error: ${err}`
		}, {
			status: 500
		});
	}
};
