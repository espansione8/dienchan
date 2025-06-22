import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';

const apiKey = APIKEY;

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	try {
		const res = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'user', //product | order | user | layout | discount
				query: { 'membership.membershipStatus': true },
				projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
				sort: {}, // 1:Sort ascending | -1:Sort descending
				limit: 100000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!res.ok) {
			console.error('user fetch failed', res.status, `res: ${await res.text()}`);
			throw error(400, 'user fetch failed');
		}
		const response = await res.json();
		getTable = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));
	} catch (error) {
		console.log('userfetch error:', error);
	}

	return {
		getTable,
		itemCount: getTable.length
	};
}

// export const actions: Actions = {
// 	filterUser: async ({ request, fetch }) => {
// 		const formData = await request.formData();
// 		const level = formData.get('level');
// 		const membershipLevel = formData.get('membershipLevel');
// 		const email = formData.get('email');

// 		console.log('level', level);

// 		const arrayField = ['level', 'membership.membershipLevel', 'email'];
// 		const arrayValue = [level, membershipLevel, email];

// 		try {
// 			const response = await fetch(`${BASE_URL}/api/finds/0/0`, {
// 				method: 'POST',
// 				body: JSON.stringify({
// 					schema: 'user',
// 					arrayField,
// 					arrayValue
// 				}),
// 				headers: {
// 					'Content-Type': 'application/json'
// 				}
// 			});
// 			//console.log('response', response);
// 			const result = await response.json();

// 			if (response.status == 200) {
// 				const filterTableList = result.map((obj: any) => ({
// 					...obj,
// 					createdAt: obj.createdAt.substring(0, 10)
// 				}));
// 				return { action: 'filterUser', success: true, message: 'Filtro applicato', filterTableList };

// 			} else {
// 				return { action: 'filterUser', success: false, message: 'Utente non trovato' };
// 			}
// 		} catch (error) {
// 			console.error('Error filterUser:', error);
// 			return { action: 'filterUser', success: false, message: 'Errore filterUser' };
// 		}
// 	}
// } satisfies Actions;
