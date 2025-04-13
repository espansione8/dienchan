// src/routes/api/users/check
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/db/mongo/database';
import { User } from '$lib/db/mongo/schema/Users.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const registerEmail = body.email.replace(/\s+/g, '').toLowerCase();
	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?
		const user = await User.findOne({ email: registerEmail }, { _id: 1, email: 1 })
			.limit(1)
			.lean()
			.exec();

		//console.log({ user });
		if (!user) {
			return json(
				{
					message: 'OK to register'
				},
				{
					status: 200
				}
			);
		}
		return json(
			{
				message: 'Email già in uso'
			},
			{
				status: 400
			}
		);
	} catch (err) {
		console.log('checkUser ERROR:', err);
		return json(
			{
				message: 'checkUser failed'
			},
			{
				status: 500
			}
		);
	}
};
