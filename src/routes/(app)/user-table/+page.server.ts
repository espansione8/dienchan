import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('0123456789', 12)

const apiKey = APIKEY;

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];

	const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey,
			schema: 'user', //product | order | user | layout | discount
			query: {},
			projection: { _id: 0, password: 0 },
			sort: { createdAt: -1 },
			limit: 1000,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});


	try {

		const userRes = await userFetch;

		if (userRes.status !== 200) {
			console.error('user fetch failed', userRes.status, await userRes.text());
			throw error(400, 'user fetch failed');
		}

		getTable = await userRes.json();
		getTable = getTable.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

	} catch (error) {
		console.log('getUser fetch error:', error);
		throw error(500, 'Server error');
	}

	return {
		getTable
	};
}

export const actions: Actions = {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode') || '';
		const city = formData.get('city') || '';
		const county = formData.get('county') || '';
		const country = formData.get('country') || '';
		const phone = formData.get('phone') || '';
		const mobilePhone = formData.get('mobilePhone') || '';
		const password1 = formData.get('password1') || '';
		const level = formData.get('level') || '';


		if (!name || !surname || !email || !address || !postalCode || !city || !county || !country || !phone || !mobilePhone || !password1 || !level) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}


		const resFetch = fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				newDoc: {
					userId: nanoid(),
					name,
					surname,
					email,
					address,
					postalCode,
					city,
					county,
					country,
					phone,
					mobilePhone,
					password1,
					level
				},
				returnObj: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});


		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('user find failed', res.status, errorText);
				return fail(400, { action: 'new', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'new', success: true, message: result.message };

		} catch (error) {
			console.error('Error user new :', error);
			return { action: 'new', success: false, message: 'Error user new' };
		}
	},

	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode') || '';
		const city = formData.get('city') || '';
		const county = formData.get('county') || '';
		const country = formData.get('country') || '';
		const phone = formData.get('phone') || '';
		const mobilePhone = formData.get('mobilePhone') || '';
		const level = formData.get('level') || '';
		const namePublic = !!(formData.get('namePublic'));
		const surnamePublic = !!(formData.get('surnamePublic'));
		const emailPublic = !!(formData.get('emailPublic') || '');
		const addressPublic = !!(formData.get('addressPublic') || '');
		const cityPublic = !!(formData.get('cityPublic') || '');
		const statePublic = !!(formData.get('statePublic') || '');
		const postalCodePublic = !!(formData.get('postalCodePublic') || '');
		const countryPublic = !!(formData.get('countryPublic') || '');
		const phonePublic = !!(formData.get('phonePublic') || '');
		const mobilePhonePublic = !!(formData.get('mobilePhonePublic') || '');

		if (!name || !surname || !email || !address || !postalCode || !city || !county || !country || !phone || !mobilePhone || !level) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}


		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId },
				update: {
					$set: {
						name,
						surname,
						email,
						address,
						postalCode,
						city,
						county,
						country,
						phone,
						mobilePhone,
						level,
						namePublic,
						surnamePublic,
						emailPublic,
						addressPublic,
						cityPublic,
						statePublic,
						postalCodePublic,
						countryPublic,
						phonePublic,
						mobilePhonePublic
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('user update failed', res.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'modify', success: true, message: result.message };

		} catch (error) {
			console.error('Error user modify:', error);
			return { action: 'modify', success: false, message: 'Error user modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');

		const resFetch = fetch(`${BASE_URL}/api/mongo/remove`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId: userId }, // 'course', 'product', 'membership', 'event'
				multi: false,
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('user delete failed', res.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'delete', success: true, message: result.message };

		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Error user delete' };
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const level = formData.get('level');
		const membershipLevel = formData.get('membershipLevel');
		const email = formData.get('email');
		// const arrayField = ['level', 'membership.membershipLevel', 'email'];
		// const arrayValue = [level, membershipLevel, email];

		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: {
					...(level && { level }),
					...(membershipLevel && { ['membership.membershipLevel']: membershipLevel }),
					...(email && { email })
				},
				projection: { _id: 0 }, // 0: exclude | 1: include,
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending,
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;

			if (!res.ok) {
				const errorText = await res.text();
				console.error('discount filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const payload = await res.json();

			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error user filter:', error);
			return { action: 'filter', success: false, message: 'Error user filter' };
		}

	},


	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const status = formData.get('status');
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';
		if (!userId) {
			return fail(400, { action: 'disableUser', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId },
				update: {
					$set: {
						status: newStatus,
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('changeStatus update failed', res.status, errorText);
				return fail(400, { action: 'changeStatus', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'changeStatus', success: true, message: result.message };

		} catch (error) {
			console.error('Error changeStatus:', error);
			return fail(400, { action: 'changeStatus', success: false, message: 'Error changeStatus' });
		}
	}
} satisfies Actions;
