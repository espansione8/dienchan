import { json as json$1 } from '@sveltejs/kit';
// src/routes/api/sign-out.js
import { parse, serialize } from 'cookie';
import dbConnect from '$lib/database';
import { Users } from '$lib/models/Users.model';
import type { RequestHandler } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').RequestHandler} */

//export async function get({ headers: { cookie } }) {
export const GET: RequestHandler = async ({ request }) => {
	//const body = await request.json();
	const cookies = parse(request.headers.get('cookie') || '');

	if (cookies.session_id) {
		try {
			await dbConnect();
			//const res = await Users.updateOne({ cookieId: cookies.session_id }, { $set: { cookieId:'' } });
			//console.log(res.acknowledged);
			await Users.updateOne({ cookieId: cookies.session_id }, { $set: { cookieId: '' } }).lean().exec();
		} catch (err) {
			console.log('Logout ERROR:', err);
			//throw new Error("@1migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
			return new Response(JSON.stringify({ errors: `Logout ERR: ${err}` }), {
				status: 500,
				headers: {
					'content-type': 'application/json; charset=utf-8'
				}
			});
			///////////////
			//return Promise.reject(new Error(`Logout ERR: ${err}`));
		}
	}

	return json$1({
		message: 'Logged out'
	}, {
		headers: {
			'Set-Cookie': serialize('session_id', '', {
				path: '/',
				expires: new Date(0)
			})
		}
	});
}
