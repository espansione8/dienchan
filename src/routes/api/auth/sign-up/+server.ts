import { json as json$1 } from '@sveltejs/kit';
// src/routes/api/auth/sign-up.js
import stringHash from 'string-hash';
import { serialize } from 'cookie';
import dbConnect from '$lib/database';
import { Users } from '$lib/models/Users.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const registerEmail = body.registerEmail.replace(/\s+/g, '').toLowerCase();
	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?
		const user = await Users.findOne({ email: registerEmail }, { _id: 1, email: 1 })
			.limit(1)
			.lean()
			.exec();

		// If there is, either send status 409 Conflict and inform the user that their email is already taken
		// or send status 202 or 204 and tell them to double-check on their credentials and try again - it is considered more secure
		if (user) {
			return json$1(
				{
					message: 'User already registered'
				},
				{
					status: 409
				}
			);
		}

		// Add user to DB
		// All database code can only run inside async functions as it uses await
		const cookieId = crypto.randomUUID();
		const newUser = new Users();
		newUser.email = registerEmail;
		newUser.password = stringHash(body.password1);
		newUser.userId = stringHash(cookieId);
		newUser.cookieId = cookieId;
		await newUser
			.save()
			.then(async (res) => {
				if (res?.cookieId === cookieId) {
					await fetch(`${import.meta.env.VITE_API_URL}/api/mailer/sign-up-confirm`, {
						method: 'POST',
						body: JSON.stringify({ registerEmail }),
						headers: {
							'Content-Type': 'application/json'
						}
					});
				}
			})
			.catch(console.error);

		// Set cookie
		// If you want cookies to be passed alongside user when they redirect to another website using a link, change sameSite to 'lax'
		// If you don't want cookies to be valid everywhere in your app, modify the path property accordingly
		const headers = {
			'Set-Cookie': serialize('session_id', cookieId, {
				httpOnly: true,
				maxAge: 60 * 60 * 24 * 7, // one week
				sameSite: 'strict',
				path: '/'
			})
		};

		return json$1(
			{
				message:
					"Sign up done! Check incoming email (don't forget SPAM folder) for the confirmation message."
			},
			{
				headers: headers
			}
		);
	} catch (err) {
		console.log('registerUser ERROR:', err);
		return json$1(
			{
				message: 'Sign Up failed'
			},
			{
				status: 500
			}
		);
	}
};
