// src/routes/api/auth/sign-in
import { json } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import dbConnect from '$lib/db/mongo/database';
import { User } from '$lib/db/mongo/schema/Users.model';

const salt = import.meta.env.VITE_SALT;

export const POST = async ({ request, cookies }) => {
	const body = await request.json();
	const loginEmail = body.loginEmail.replace(/\s+/g, '').toLowerCase();

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();

		const user = await User.findOne({ email: loginEmail }, { _id: 1, email: 1, password: 1 })
			.limit(1)
			.lean()
			.exec();

		// const hashed = stringHash(body.loginPassword);
		// console.log('stringHash(body.loginPassword)', typeof hashed.toString());
		// console.log('pass test', user.password === stringHash(body.loginPassword).toString());

		if (!user || user.password !== hash(body.loginPassword, salt)) {
			return json({ message: 'Incorrect user or password' }, { status: 400 });
		}

		// Look for existing email to avoid duplicate entries
		const duplicateUser = await User.exists({ email: loginEmail }).limit(1).lean().exec();

		const cookieId = crypto.randomUUID();
		// If there is user with cookie, update the cookie, otherwise create a new DB entry
		if (duplicateUser) {
			await User.updateOne({ email: loginEmail }, { $set: { cookieId } });
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

		if (user) {
			return json({ message: 'Success Sign In' }, { status: 200 });
		}
		return json({ message: 'login error' }, { status: 400 });
	} catch (err) {
		console.error('signUser ERROR:', err);
		return json({ message: '(500) sign in failed' }, { status: 500 });
	}
};
