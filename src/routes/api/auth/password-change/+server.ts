// src/routes/api/auth/password-change
import { json } from '@sveltejs/kit';
import stringHash from 'string-hash';
import dbConnect from '$lib/database';
import { User } from '$lib/models/Users.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const currentPass = stringHash(body.currentPass).toString();

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();

		const userCheck = await User.exists({ email: body.email, password: currentPass })
			.limit(1)
			.lean()
			.exec();

		if (!userCheck) {
			return json({ message: 'Change incorrect user or password' }, { status: 400 });
		}

		const password = stringHash(body.newPass).toString();
		await User.updateOne(
			{ email: body.email },
			{
				$set: {
					password
				}
			}
		);

		return json({ message: 'New password registered' }, { status: 200 });

	} catch (err) {
		console.error('reset ERROR:', err);
		return json({ message: '(500) reset failed' }, { status: 500 });
	}
};
