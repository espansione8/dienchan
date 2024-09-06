// TRAINING SOURCE
//https://github.com/sveltejs/kit/pull/3384
//https://blog.logrocket.com/authentication-sveltekit-using-cookies/
//https://www.youtube.com/watch?v=K1Tya6ovVOI // Protect SvelteKit Routes with Hooks

import { parse } from 'cookie';
import { User } from '$lib/models/Users.model';
import dbConnect from '$lib/database';
import type { Handle } from '@sveltejs/kit';

// NOTE: src/app.d.ts to set type of event.locals.[name]


// OLD
// const getSessionFromApi = async (id) => {
// 	await dbConnect();
// 	const getSession = await User.findOne(
// 		{ cookieId: id },
// 		{ _id: 1, password: 0, remoteIP: 0, remoteHost: 0, remoteBrowser: 0, notesOnUser: 0 }
// 	)
// 		.limit(1)
// 		.lean()
// 		.exec();
// 	//console.log('hook.ts getSession.email', getSession.email);
// 	if (!getSession) return Promise.resolve(null);
// 	return Promise.resolve(getSession);
// };

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = parse(event.request.headers.get('cookie') || '');
	//console.log('event.url.pathname', event.url.pathname);
	if (cookies.session_id) {
		try {
			// const checkAuth = await userAuth(cookies.session_id)
			// console.log('checkAuth', checkAuth);
			await dbConnect();
			// check auth
			const getSession = await User.findOne(
				{ cookieId: cookies.session_id },
				{ _id: 1, password: 0, remoteIP: 0, remoteHost: 0, remoteBrowser: 0, notesOnUser: 0 }
			)
				.limit(1)
				.lean()
				.exec();
			// console.log('getSession', getSession);
			if (getSession) {
				//event.locals.userData = getSession // All USER data, only for debug
				//event.locals.userSidebar = getSession

				//OLD
				const newData = JSON.stringify(getSession);
				event.locals.user = { email: getSession.email };
				event.locals.data = JSON.parse(newData);
				event.locals.session = cookies.session_id;
				event.locals.auth = true;
				// end OLD
				const response = await resolve(event);
				return response;
			}

			// route protection DEBUG: event.url detect API URL in +page.server, not the current page
			// if (event.url.pathname.startsWith('/app')) {
			//     if (!event.locals.auth) {
			//         //throw redirect(401, '/login');
			//         console.log('not logged');
			//     }
			// }
		} catch (error) {
			console.log('hook error:', error);
			return resolve(event);
		}

		// // OLD
		// const session = await getSessionFromApi(cookies.session_id);
		// //console.log('hook.ts check cookies.session_id', cookies.session_id);
		// if (session) {
		// 	//console.log('hook.ts check IF session', data);
		// 	const newData = JSON.stringify(session);
		// 	event.locals.user = { email: session.email };
		// 	event.locals.data = JSON.parse(newData);
		// 	event.locals.session = cookies.session_id;
		// 	event.locals.auth = true;
		// 	const response = await resolve(event);
		// 	// response.auth = true;
		// 	return response;
		// }
	}
	event.locals.user = null;
	event.locals.auth = false;
	event.locals.data = {};
	return resolve(event);
}