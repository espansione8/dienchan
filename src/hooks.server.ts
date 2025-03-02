// TRAINING SOURCE
//https://github.com/sveltejs/kit/pull/3384
//https://blog.logrocket.com/authentication-sveltekit-using-cookies/
//https://www.youtube.com/watch?v=K1Tya6ovVOI // Protect SvelteKit Routes with Hooks
//import { redirect } from '@sveltejs/kit';
import { User } from '$lib/models/Users.model';
import dbConnect from '$lib/database';
import type { Handle } from '@sveltejs/kit';

// NOTE: src/app.d.ts to set type of event.locals.[name]

export const handle: Handle = async ({ event, resolve, }) => {
	const session_id = event.cookies.get('session_id');
	//console.log('event.url.pathname', event.url.pathname);
	if (session_id) {
		try {
			await dbConnect();
			// check auth
			const getSession = await User.findOne(
				{ cookieId: session_id },
				{ _id: 0, password: 0, remoteIP: 0, remoteHost: 0, remoteBrowser: 0, notesOnUser: 0, 'uploadfiles._id': 0 }
			)
				.limit(1)
				.lean()
				.exec();

			if (getSession) {
				//event.locals.user = getSession.email;
				event.locals.user = getSession;
				event.locals.auth = true;
				//event.locals.session = session_id;
				const response = await resolve(event);
				return response;
			}

		} catch (error) {
			console.log('hook error:', error);
			return resolve(event);
		}
	}
	// DEFINE in +layout.server.ts in root
	event.locals.user = {};
	event.locals.auth = false;
	// FRONTEND USE
	// import { page } from '$app/stores';
	// $page.data.user $page.data.auth 
	return resolve(event);
}
