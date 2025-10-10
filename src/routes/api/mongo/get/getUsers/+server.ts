import { json } from '@sveltejs/kit';
import { User } from '$lib/server/mongo/schema/Users.model';
import dbConnect from '$lib/server/mongo/database';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {

	try {
		await dbConnect();

		// Query per ottenere tutti gli utenti
		const users = await User.find({})
			.select('-token -password') // Escludi campi sensibili
			.lean()
			.exec();

		return json(users, { status: 200 });

	} catch (err) {
		console.log('users fetch ERROR:', err);
		return json({ message: `users fetch ERROR: ${err}` }, { status: 500 });
	}
};