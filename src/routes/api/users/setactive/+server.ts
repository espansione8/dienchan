import { json as json$1 } from '@sveltejs/kit';
import { User } from '$lib/models/Users.model';
import dbConnect from '$lib/database';
//import type { RequestHandler } from '@sveltejs/kit';

///BASE_URL/api/users/setactive/

export const POST = async ({ request }) => {
	const body = await request.json();
	//console.log('POST billing data', body);
	try {
		await dbConnect();
		const filter = { userId: body.userId, email: body.email };
		const update = {
			active: body.status
		};
		const newData = await Users.updateOne(filter, update, {
			new: true
		}).lean();

		if (newData.matchedCount == 1) {
			return json$1({
				message: 'POST new User point OK',
				status: 200
			});
		}

		return json$1({
			message: 'POST User point ERR',
			status: 500
		});
	} catch (err) {
		console.log('POST User point ERROR:', err);
		return json$1(
			{
				error: `Server error: ${err}`
			},
			{
				status: 500
			}
		);
	}
};
