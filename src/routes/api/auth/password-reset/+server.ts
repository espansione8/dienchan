// src/routes/api/auth/password-reset
import { json as json$1 } from '@sveltejs/kit';
//import { serialize } from 'cookie';

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

		const userCheck = await Users.exists({ email: loginEmail }).limit(1).lean().exec();

		if (!userCheck) {
			return json$1(
				{
					message: 'User not found'
				},
				{
					status: 401
				}
			);
		}
		const randomString = crypto.randomUUID();
		const newPass = randomString.slice(-12);
		const password = stringHash(newPass).toString();
		const updateNewUser = await Users.updateOne(
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
			return new Response(JSON.stringify({ message: 'Enable temporary password' }), {
				status: 200
				//headers
			});
		} else {
			return new Response(JSON.stringify({ message: '(500) reset failed' }), {
				status: 500,
				headers: {
					'content-type': 'application/json; charset=utf-8'
				}
			});
		}

		// return new Response(JSON.stringify({ message: 'Enable temporary password' }), {
		// 	status: 200
		// 	//headers
		// });
	} catch (err) {
		console.error('reset ERROR:', err);
		return new Response(JSON.stringify({ message: '(500) reset failed' }), {
			status: 500,
			headers: {
				'content-type': 'application/json; charset=utf-8'
			}
		});
	}
};
