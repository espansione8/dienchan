// src/routes/api/auth/sign-in-guest
import { json } from '@sveltejs/kit';
import stringHash from 'string-hash';
import dbConnect from '$lib/db/mongo/database';
import { User } from '$lib/db/mongo/schema/Users.model';

export const POST = async ({ request, cookies }) => {
	const body = await request.json();
	const loginEmail = body.loginEmail.replace(/\s+/g, '').toLowerCase();
	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();

		const userCheck = await User.exists({ userId: body.ssn }).limit(1).lean().exec();
		const user = await User.findOne({ userId: body.ssn }, { _id: 1, email: 1, password: 1 })
			.limit(1)
			.lean()
			.exec();

		//console.log('user', user);
		//const hashed = stringHash(body.loginPassword);
		//console.log('stringHash(body.loginPassword)', typeof hashed.toString());
		//console.log('pass test', user.password === stringHash(body.loginPassword).toString());

		if (!userCheck) {
			return json(
				{
					message: 'Guest not enabled'
				},
				{
					status: 401
				}
			);
		}

		if (user.email == 'guest') {
			const password = stringHash(body.loginPassword);
			await User.updateOne(
				{ userId: body.ssn },
				{
					$set: {
						email: loginEmail,
						password
					}
				}
			);
		} else if (
			user.email != loginEmail ||
			user.password !== stringHash(body.loginPassword).toString()
		) {
			return json(
				{
					message: 'Incorrect user or password'
				},
				{
					status: 401
				}
			);
		}

		const docCheck = await User.exists({
			documentPageId: body.pid,
			'memberDocModifyArray.userId': body.ssn
		})
			.limit(1)
			.lean()
			.exec();

		// Look for existing email to avoid duplicate entries
		const duplicateUser = await User.exists({ userId: body.ssn }).limit(1).lean().exec();

		const cookieId = crypto.randomUUID();
		// If there is user with cookie, update the cookie, otherwise create a new DB entry
		if (duplicateUser) {
			await User.updateOne({ userId: body.ssn }, { $set: { cookieId } });
		}
		// Set cookie using SvelteKit's cookies API
		// If you want cookies to be passed alongside user when they redirect to another website using a link, change sameSite to 'lax'
		// If you don't want cookies to be valid everywhere in your app, modify the path property accordingly
		cookies.set('session_id', cookieId, {
			httpOnly: true,
			//maxAge: 60 * 60 * 24 * 7 // one week
			maxAge: 60 * 60 * 24, // one day
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			path: '/'
		});

		if (userCheck && docCheck) {
			//console.log('session_id', cookieId);
			return json({ message: 'Success Sign In' }, { status: 200 });
		} else {
			return json({ message: 'login failed' }, { status: 400 });
		}
	} catch (err) {
		console.error('signUser GUEST ERROR:', err);
		return json({ message: '(500) sign in failed' }, { status: 500 });
	}
};
