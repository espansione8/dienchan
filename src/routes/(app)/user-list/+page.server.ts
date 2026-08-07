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
	let getRiflessologi = [];

	try {
		// Count
		const countFetch = fetch(`${BASE_URL}/api/mongo/count`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: {
					'membership.membershipStatus': true, level: {
						$in: ['riflessologo', 'formatore base', 'master', 'formatore avanzato']
					}
				},
				option: { hint: { userId: 1 } },// optional: define index to use
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
				query: {
					'membership.membershipStatus': true, level: {
						$in: ['riflessologo', 'formatore base', 'master', 'formatore avanzato']
					}
				},
				sort: { surname: 1 }, // 1:Sort ascending | -1:Sort descending
				projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
				limit: 40,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		// aggregate - Updated for array county field
		const aggregateFetch = fetch(`${BASE_URL}/api/mongo/aggregate`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user',
				pipeline: [
					{
						$match: {
							'membership.membershipStatus': true,
							level: { $in: ['riflessologo', 'formatore base', 'master', 'formatore avanzato'] },
							county: { $exists: true, $ne: null, $not: { $size: 0 } } // Check array exists and is not empty
						}
					},
					{ $unwind: '$county' }, // Unwind the county array to process each element
					{ $group: { _id: '$county', count: { $sum: 1 } } }, // group by county and count
					{ $sort: { _id: 1 } } // sort by county name alphabetically
				]
			}),
			headers: { 'Content-Type': 'application/json' }
		});

		// lightweight full list (name/surname/userId only) for the Riflessologo filter/search picker
		const riflessologiFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user',
				query: {
					'membership.membershipStatus': true, level: {
						$in: ['riflessologo', 'formatore base', 'master', 'formatore avanzato']
					}
				},
				sort: { surname: 1 },
				projection: { _id: 0, userId: 1, name: 1, surname: 1 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const [countRes, userRes, aggregateRes, riflessologiRes] = await Promise.all([
			countFetch,
			userFetch,
			aggregateFetch,
			riflessologiFetch
		]);

		if (!countRes.ok) {
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

		if (!aggregateRes.ok) {
			throw error(400, 'aggregate fetch failed');
		}

		const aggregateData = await aggregateRes.json();
		countyObj = aggregateData.reduce((acc: { [key: string]: number }, item: { _id: string, count: number }) => {
			acc[item._id] = item.count;
			return acc;
		}, {});

		if (!riflessologiRes.ok) {
			throw error(400, 'riflessologi fetch failed');
		}

		getRiflessologi = await riflessologiRes.json();

	} catch (error) {
		console.log('userfetch error:', error);
		throw error(500, 'Server error');
	}

	return {
		getTable,
		itemCount,
		countyObj,
		getRiflessologi
	};
}

export const actions: Actions = {
	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const county = formData.get('county');
		const riflessologo = formData.get('riflessologo');

		try {
			// Count filtered items - Updated for array county field
			const countFetch = fetch(`${BASE_URL}/api/mongo/count`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user',
					query: {
						'membership.membershipStatus': true,
						level: { $in: ['riflessologo', 'formatore base', 'master', 'formatore avanzato'] },
						...(county && { county: { $in: [county] } }), // Use $in to search in array
						...(riflessologo && { userId: riflessologo })
					},
					option: { hint: { userId: 1 } },
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			// Get filtered users (first page) - Updated for array county field
			const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user',
					query: {
						'membership.membershipStatus': true,
						level: { $in: ['riflessologo', 'formatore base', 'master', 'formatore avanzato'] },
						...(county && { county: { $in: [county] } }), // Use $in to search in array
						...(riflessologo && { userId: riflessologo })
					},
					sort: { surname: 1 },
					projection: { _id: 0, password: 0 },
					limit: 40,
					skip: 0
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			const [countRes, userRes] = await Promise.all([countFetch, userFetch]);

			if (!countRes.ok) throw error(400, 'Filtered count fetch failed');
			const itemCount = await countRes.json();

			if (!userRes.ok) throw error(400, 'Filtered user fetch failed');

			const getTable = (await userRes.json()).map((obj: any) => ({ ...obj, createdAt: obj.createdAt.substring(0, 10) }));

			getTable.sort((a, b) => {
				const surnameA = a.surname || '';
				const surnameB = b.surname || '';
				return surnameA.localeCompare(surnameB);
			});

			return { action: 'filter', success: true, payload: { getTable, itemCount, currentPage: 1, county, riflessologo } };
		} catch (error) {
			console.error('Error user filter:', error);
			return fail(500, { action: 'filter', success: false, message: 'Error user filter' });
		}
	},
	changePage: async ({ request, fetch }) => {
		const formData = await request.formData();
		const navigation = formData.get('navigation');
		const itemsPerPage = Number(formData.get('itemsPerPage'));
		const county = formData.get('county');
		const riflessologo = formData.get('riflessologo');
		let currentPage = Number(formData.get('currentPage'));

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
					query: {
						'membership.membershipStatus': true,
						level: { $in: ['riflessologo', 'formatore base', 'master', 'formatore avanzato'] },
						...(county && { county: { $in: [county] } }), // Use $in to search in array
						...(riflessologo && { userId: riflessologo })
					},
					sort: { surname: 1 },
					projection: { _id: 0, password: 0 },
					limit: itemsPerPage,
					skip: skipItems
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!res.ok) {
				const errorText = await res.text();
				console.error('changePage failed', res.status, errorText);
				return fail(400, { action: 'changePage', success: false, message: `changePage Error: ${errorText}` });
			}
			const getTable = await res.json();

			return { action: 'changePage', success: true, payload: { getTable, currentPage, county, riflessologo } };

		} catch (error) {
			console.error('Error changePage:', error);
			return { action: 'changePage', success: false, message: 'Error changePage' };
		}
	},
} satisfies Actions;