// TRAINING SOURCE
//https://github.com/sveltejs/kit/pull/3384
//https://blog.logrocket.com/authentication-sveltekit-using-cookies/
//https://www.youtube.com/watch?v=K1Tya6ovVOI // Protect SvelteKit Routes with Hooks
//import { redirect } from '@sveltejs/kit';
import { APIKEY, BASE_URL } from '$env/static/private';
// import { User } from '$lib/server/mongo/schema/Users.model';
// import dbConnect from '$lib/server/mongo/database';
import type { Handle } from '@sveltejs/kit';

// NOTE: src/app.d.ts to set type of event.locals.[name]

export const handle: Handle = async ({ event, resolve, }) => {
	const session_id = event.cookies.get('session_id');
	//console.log('event.url.pathname', event.url.pathname);
	if (session_id) {
		try {
			// await dbConnect();
			// check auth
			// const getSession = await User.findOne(
			// 	{ cookieId: session_id },
			// 	{ _id: 0, password: 0, remoteIP: 0, remoteHost: 0, remoteBrowser: 0, notesOnUser: 0, 'uploadfiles._id': 0 }
			// )
			// 	.limit(1)
			// 	.lean()
			// 	.exec();
			const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', //product | order | user | layout | discount
					query: { cookieId: session_id },
					projection: { _id: 0, password: 0, remoteIP: 0, remoteHost: 0, remoteBrowser: 0, notesOnUser: 0, 'uploadfiles._id': 0 }, // 0: exclude | 1: include
					sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
					limit: 1,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const userRes = await userFetch;

			if (!userRes.ok) {
				event.locals.user = null;
				event.locals.auth = false;
				const response = await resolve(event);
				return response
			}
			const user = await userRes.json();
			// event.locals.user = user[0] || null;
			// event.locals.auth = true;
			// Validate response format
			if (!Array.isArray(user) || user.length === 0) {
				event.locals.user = null;
				event.locals.auth = false;
			} else {
				event.locals.user = user[0];
				event.locals.auth = true;
			}
			const response = await resolve(event);
			return response;

		} catch (error) {
			console.log('hook error:', error);
			return resolve(event);
		}
	}
	// DEFINE in +layout.server.ts in root
	event.locals.user = null;
	event.locals.auth = false;
	// FRONTEND USE
	// import { page } from '$app/stores';
	// $page.data.user $page.data.auth 
	return resolve(event);
}
