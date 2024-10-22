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
				event.locals.user = getSession as Partial<App.UserModel>;
				event.locals.auth = true;
				//event.locals.session = session_id;
				const response = await resolve(event);
				return response;
			}

			//route protection DEBUG: event.url detect API URL in +page.server, not the current page
			// if (event.url.pathname.startsWith('/app')) {
			//     if (!event.locals.auth) {
			//         console.log('not logged');
			//         throw redirect(400, '/login');
			//     }
			// }
			//////

			// // Define routes that require authentication
			// const protectedRoutes = ['/app', '/product-table'];
			// // Check if the current route is protected and user is not authenticated
			// if (protectedRoutes.some(route => event.url.pathname.startsWith(route)) && !event.locals.auth) {
			// 	throw redirect(302, '/login');
			// }

		} catch (error) {
			console.log('hook error:', error);
			return resolve(event);
		}
	}
	//event.locals.user = '';
	event.locals.user = false;
	event.locals.auth = false;
	//event.locals.session =''
	return resolve(event);
}