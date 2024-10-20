// src/routes/api/auth/password-reset
import { json } from '@sveltejs/kit';
import stringHash from 'string-hash';
import dbConnect from '$lib/database';
import { User } from '$lib/models/Users.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const loginEmail = body.email.replace(/\s+/g, '').toLowerCase();
	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();

		const userCheck = await User.exists({ email: loginEmail }).limit(1).lean().exec();

		if (!userCheck) {
			return json({ message: 'User not found' }, { status: 400 });
		}
		const randomString = crypto.randomUUID();
		const newPass = randomString.slice(-12);
		const password = stringHash(newPass).toString();
		const updateNewUser = await User.updateOne(
			{ email: loginEmail },
			{
				$set: {
					email: loginEmail,
					password
				}
			}
		);

		if (updateNewUser.modifiedCount == 1) {
			const data = {
				email: loginEmail,
				password: newPass
			};
			await fetch(`${import.meta.env.VITE_BASE_URL}/api/mailer/recover`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
					//'Content-Type': 'application/pdf'
					//Accept: 'application/pdf'
				},
				body: JSON.stringify(data)
			});
			return json({ message: 'Enable temporary password' }, { status: 200 });
		} else {
			return json({ message: '(400) reset failed' }, { status: 400 });
		}

	} catch (err) {
		console.error('reset ERROR:', err);
		return json({ message: '(500) reset failed' }, { status: 500 });
	}
};
