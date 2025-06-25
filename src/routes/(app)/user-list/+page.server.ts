import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { error, fail } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';

const apiKey = APIKEY;

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	let itemCount = 0;
	let countyObj = {};

	try {
		// Count
		const countFetch = fetch(`${BASE_URL}/api/mongo/count`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { 'membership.membershipStatus': true },
				option: { hint: { email: 1 } },// optional: define index to use
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		// get user
		const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'user', //product | order | user | layout | discount
				query: { 'membership.membershipStatus': true },
				projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
				sort: {}, // 1:Sort ascending | -1:Sort descending
				limit: 40,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		// get county
		const countyFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'user', //product | order | user | layout | discount
				query: { 'membership.membershipStatus': true },
				projection: { _id: 0, county: 1 }, // 0: exclude | 1: include
				sort: {}, // 1:Sort ascending | -1:Sort descending
				limit: 100000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		// aggregate
		const aggregateCountByCountyPromise = fetch(`${BASE_URL}/api/mongo/aggregate`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user',
				pipeline: [
					{ "$match": { "membership.membershipStatus": true, "county": { "$exists": true, "$ne": null } } },
					{ "$group": { "_id": "$county", "count": { "$sum": 1 } } }, // regroup by county and count
					{ "$sort": { "_id": 1 } }
				]
			}),
			headers: { 'Content-Type': 'application/json' }
		});
		const [countRes, userRes, countyRes] = await Promise.all([
			countFetch,
			userFetch,
			countyFetch
		]);

		if (!countRes.ok) {
			// return fail(400, { action: 'renew', success: false, message: `res: ${await res.text()}` });
			throw error(400, 'count fetch failed');
		}

		itemCount = await countRes.json()

		if (!userRes.ok) {
			console.error('user fetch failed', userRes.status, `userRes: ${await userRes.text()}`);
			throw error(400, 'user fetch failed');
		}
		const response = await userRes.json();
		getTable = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

		if (!countyRes.ok) {
			// return fail(400, { action: 'renew', success: false, message: `res: ${await res.text()}` });
			throw error(400, 'countyRes fetch failed');
		}

		const countyArray = await countyRes.json();

		const numReflexologistsInProvince: { [key: string]: number } = {};
		countyArray.forEach((item) => {
			const county = item.county;
			if (county) { // Assicurati che il campo provincia esista
				numReflexologistsInProvince[county] = (numReflexologistsInProvince[county] || 0) + 1;
			}
		});

		// Ordina le province alfabeticamente
		const sortedNumReflexologistsInProvince = Object.keys(numReflexologistsInProvince)
			.sort((a, b) => {
				const countyA = a || '';
				const countyB = b || '';
				return countyA.localeCompare(countyB);
			})
			.reduce((acc: { [key: string]: number }, key) => {
				acc[key] = numReflexologistsInProvince[key];
				return acc;
			}, {});

		countyObj = sortedNumReflexologistsInProvince;

	} catch (error) {
		console.log('userfetch error:', error);
	}

	return {
		getTable,
		itemCount,
		countyObj
	};
}

export const actions: Actions = {
	changePage: async ({ request, fetch }) => {
		const formData = await request.formData();
		const navigation = formData.get('navigation');
		const itemsPerPage = Number(formData.get('itemsPerPage'));
		let currentPage = Number(formData.get('currentPage'));
		//console.log('changePage', navigation, itemsPerPage, currentPage);

		if (navigation === 'prev') {
			currentPage = Math.max(1, currentPage - 1);
		} else if (navigation === 'next') {
			currentPage += 1;
		} else if (navigation === 'reset') {
			currentPage = 1;
		}
		const skipItems = (currentPage - 1) * itemsPerPage;

		try {
			const res = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', //product | order | user | layout | discount
					query: { 'membership.membershipStatus': true },
					projection: { _id: 0, password: 0 },
					//sort: { createdAt: -1 },
					limit: itemsPerPage,
					skip: skipItems
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!res.ok) {
				const errorText = await res.text();
				console.error('discount changePage failed', res.status, errorText);
				return fail(400, { action: 'changePage', success: false, message: `changePage Error: ${errorText}` });
			}
			const result = await res.json();

			return { action: 'changePage', success: true, message: result.message, payload: { result, currentPage } };

		} catch (error) {
			console.error('Error changePage:', error);
			return { action: 'changePage', success: false, message: 'Error changePage' };
		}
	},
} satisfies Actions;
