import { json as json$1 } from '@sveltejs/kit';

export const GET = async ({ request }) => {
	const body = await request.json();
	try {
		return json$1({
			message: 'received GET',
			return: body
		});
	} catch (err) {
		console.log('received GET ERROR:', err);
		//throw new Error("@1migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		return new Response(JSON.stringify({ message: `received GET ERR: ${err}` }), {
			status: 500,
			headers: {
				'content-type': 'application/json; charset=utf-8'
			}
		});
		//
		//return Promise.reject(new Error(`registerUser ERR: ${err}`));
	}
};
