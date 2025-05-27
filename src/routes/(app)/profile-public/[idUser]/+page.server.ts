import type { PageServerLoad } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { error, fail } from '@sveltejs/kit';

const apiKey = APIKEY;
const baseURL = BASE_URL;

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	//const { session } = await parent(); // get data from +layout.server.ts
	//console.log('params', params);
	//console.log('query', query);
	//////////////////

	// const resUser = await fetch(
	// 	`${BASE_URL}/api/users/findUserId/${params.idUser}`
	// );
	// const getUser = await resUser.json();
	const userFetch = fetch(`${baseURL}/api/mongo/find`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			apiKey,
			schema: 'user', //product | order | user | layout | discount
			query: { userId: params.idUser }, //IF USE Products.model -> types: course / product / membership / event
			projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1,
			skip: 0,
		})
	});
	const userRes = await userFetch;
	if (userRes.status != 200) {
		const errorText = await userRes.text();
		console.error('user find failed', userRes.status, errorText);
		throw error(404, 'Server error');
	}

	const getUser = await userRes.json();
	if (getUser.length == 0) {
		throw error(404, 'User not found');
	}

	return {
		getUser: getUser[0],
		auth: locals.auth
	};
}
