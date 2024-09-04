import { redirect } from '@sveltejs/kit';
export async function load({ params, fetch, parent, locals }) {
	const { session } = await parent(); // get data from +layout.server.ts
	//console.log('params', params);
	//console.log('profile session', session);
	let localSession = locals.session || false;
	let userAuth = false;
	if (!session?.auth) {
		localSession = false;
		userAuth = false;
		throw redirect(302, '/login');
	}
	if (session?.auth) {
		throw redirect(302, '/profile');
	}
	return {
		sessionAuth: session.auth
	};
}
