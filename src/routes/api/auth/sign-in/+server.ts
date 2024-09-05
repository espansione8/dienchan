// src/routes/api/auth/sign-in
import { json as json$1 } from '@sveltejs/kit';
import { serialize } from 'cookie';

import stringHash from 'string-hash';
import dbConnect from '$lib/database';
import { User } from '$lib/models/Users.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const loginEmail = body.loginEmail.replace(/\s+/g, '').toLowerCase();
	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();

		const user = await Users.findOne({ email: loginEmail }, { _id: 1, email: 1, password: 1 })
			.limit(1)
			.lean()
			.exec();

		//console.log('user', user);
		//const hashed = stringHash(body.loginPassword);
		//console.log('stringHash(body.loginPassword)', typeof hashed.toString());
		//console.log('pass test', user.password === stringHash(body.loginPassword).toString());

		if (!user || user.password !== stringHash(body.loginPassword).toString()) {
			return json$1(
				{
					message: 'Incorrect user or password'
				},
				{
					status: 401
				}
			);
		}

		// Look for existing email to avoid duplicate entries
		const duplicateUser = await Users.exists({ email: loginEmail }).limit(1).lean().exec();

		const cookieId = crypto.randomUUID();
		// If there is user with cookie, update the cookie, otherwise create a new DB entry
		if (duplicateUser) {
			await Users.updateOne({ email: loginEmail }, { $set: { cookieId } });
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

		if (user) {
			//console.log('session_id', cookieId);
			return new Response(JSON.stringify({ message: 'Success Sign In' }), {
				status: 200,
				headers
			});
		}
	} catch (err) {
		console.error('signUser ERROR:', err);
		return new Response(JSON.stringify({ message: '(500) sign in failed' }), {
			status: 500,
			headers: {
				'content-type': 'application/json; charset=utf-8'
			}
		});
	}
};
