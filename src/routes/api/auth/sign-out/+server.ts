// src/routes/api/sign-out
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/db/mongo/database';
import { User } from '$lib/db/mongo/schema/Users.model';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	const session_id = cookies.get('session_id');
	if (session_id) {
		try {
			// await dbConnect();
			// const logout = await User.updateOne({ cookieId: session_id }, { $set: { cookieId: '' } }).lean().exec();
			// console.log(logout);

			// if (logout.modifiedCount == 1) {
			// 	cookies.delete('session_id', { path: '/' });
			// 	return json({ message: 'Logged out' }, { status: 200 });
			// }

			// return json({ message: 'error Log out' }, { status: 400 });
			cookies.delete('session_id', { path: '/' });
			return json({ message: 'Logged out' }, { status: 200 });
		} catch (err) {
			console.log('Logout ERROR:', err);
			return json({ errors: `Logout ERR: ${err}` }, { status: 500 });
		}
	}
}
