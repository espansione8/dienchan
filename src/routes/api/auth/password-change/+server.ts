// src/routes/api/auth/password-change
import { json as json$1 } from '@sveltejs/kit';
//import { serialize } from 'cookie';

import stringHash from 'string-hash';
import dbConnect from '$lib/database';
import { User } from '$lib/models/Users.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const currentPass = stringHash(body.currentPass).toString();
	//console.log('change pass', currentPass);

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();

		const userCheck = await User.exists({ email: body.email, password: currentPass })
			.limit(1)
			.lean()
			.exec();

		if (!userCheck) {
			return json$1(
				{
					message: 'Change incorrect user or password'
				},
				{
					status: 401
				}
			);
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

		// Look for existing email to avoid duplicate entries
		/* const duplicateUser = await User.exists({ userId: body.ssn }).limit(1).lean().exec();

		const cookieId = crypto.randomUUID();
		// If there is user with cookie, update the cookie, otherwise create a new DB entry
		if (duplicateUser) {
			await User.updateOne({ userId: body.ssn }, { $set: { cookieId } });
		}
		// Set cookie
		// If you want cookies to be passed alongside user when they redirect to another website using a link, change sameSite to 'lax'
		// If you don't want cookies to be valid everywhere in your app, modify the path property accordingly
		const headers = {
			'Set-Cookie': serialize('session_id', cookieId, {
				httpOnly: true,
				//maxAge: 60 * 60 * 24 * 7 // one week
				maxAge: 60 * 60 * 24,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				path: '/'
			})
		};
		*/

		//console.log('session_id', cookieId);
		return new Response(JSON.stringify({ message: 'New password registered' }), {
			status: 200
			//headers
		});
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
