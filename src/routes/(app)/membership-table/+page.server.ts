import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid'
import { pageAuth } from '$lib/pageAuth';
const apiKey = APIKEY;
const baseURL = BASE_URL;
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	try {
		const query = { type: 'membership' }; //IF USE Products.model -> types: course / product / membership / event
		const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'product', //product | order | user | layout | discount
				query,
				projection,
				sort,
				limit,
				skip
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.status != 200) {
			console.error('product fetch failed', res.status, await res.text());
			return
		}
		const response = await res.json();
		getTable = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));
	} catch (error) {
		console.log('membershipfetch error:', error);
	}

	// const user = locals.user
	// if (locals.auth) {
	// 	user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
	// 	user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
	// 	user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	// }
	return {
		getTable,
		// auth: locals.auth,
		// userData: user,
	};
}

// SAMPLE for parallel requests
// const [resImg, response] = await Promise.all([
// 	await uploadImg.json(),
// 	await res.json()
// ])

export const actions: Actions = {
	new: async ({ request, fetch, locals }) => {
		const userId = locals.user.userId
		const formData = await request.formData();
		const title = formData.get('title');
		const descrShort = formData.get('descrShort');
		const category = formData.get('category') || '';
		const price = formData.get('price');
		//const file = formData.get('image') || '';
		const renewalLength = formData.get('renewalLength');

		if (!title || !price || !renewalLength || !userId) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}
		//console.log('new', title, descrShort, price, renewalLength, userId);
		try {
			const prodId = nanoid() // OLD stringHash(crypto.randomUUID());
			const returnObj = false
			const newDoc = {
				prodId,
				title,
				descrShort,
				stockQty: 1,
				category: [category],
				price,
				type: 'membership',
				renewalLength,
				userId,
			};

			const res = await fetch(`${baseURL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					newDoc,
					returnObj
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (res.status != 200) {
				const errorText = await res.text();
				console.error('product create failed', res.status, errorText);
				return fail(400, { action: 'new', success: false, message: errorText });
			}
			const response = await res.json();
			return { action: 'new', success: true, message: response.message };

		} catch (error) {
			console.error('Error creating new membership:', error);
			return fail(400, { action: 'new', success: false, message: 'Errore creazione membership' });
		}
	},

	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const title = formData.get('title') || '';
		const price = formData.get('price');
		const renewalLength = formData.get('renewalLength');
		const descrShort = formData.get('descrShort') || '';

		if (!prodId || !title || !price || !renewalLength) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		try {
			const query = { prodId, type: 'membership' }; // 'course', 'product', 'membership', 'event'
			const update = {
				$set: {
					prodId,
					title,
					descrShort,
					price,
					renewalLength
				}
			};
			const options = { upsert: false }
			const multi = false

			const res = await fetch(`${baseURL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (res.status != 200) {
				const errorText = await res.text();
				console.error('product update failed', res.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const response = await res.json();
			return { action: 'modify', success: true, message: response.message };
			//console.log('response.message', response);
		} catch (error) {
			console.error('Error modify:', error);
			return fail(400, { action: 'modify', success: false, message: 'Errore modify' });
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');

		try {
			const query = { prodId: prodId, type: 'membership' };
			const multi = false

			const res = await fetch(`${baseURL}/api/mongo/remove`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					query,
					multi,
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (res.status != 200) {
				const errorText = await res.text();
				console.error('product remove failed', res.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}
			const response = await res.json();
			return { action: 'delete', success: true, message: response.message };

		} catch (error) {
			console.error('Error delete:', error);
			return fail(400, { action: 'delete', success: false, message: 'Errore delete' });
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		//const prodId = formData.get('prodId');
		const status = formData.get('status');
		const title = formData.get('title');
		//const price = formData.get('price');

		if (!status && !title) {
			return fail(400, { action: 'filter', success: false, message: 'Dati mancanti' });
		}

		try {
			const query = {
				type: 'membership',
				//...(prodId && { prodId }),
				...(status && { status }),
				...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
				//...(price && { price }),
			};

			const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
			const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
			const limit = 1000;
			const skip = 0;
			const res = await fetch(`${baseURL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					query,
					projection,
					sort,
					limit,
					skip
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (res.status != 200) {
				const errorText = await res.text();
				console.error('product find failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const response = await res.json();

			const payload = response.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10)
			}));
			//console.log('response', response);
			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error filter membership:', error);
			return fail(400, { action: 'filter', success: false, message: 'Errore filtro 500' });
		}
	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const status = formData.get('status');
		if (!prodId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';
		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			const query = { prodId: prodId, type: 'membership' };
			const update = {
				$set: {
					status: newStatus,
				}
			};
			const options = { upsert: false }
			const multi = false
			const res = await fetch(`${baseURL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (res.status != 200) {
				const errorText = await res.text();
				console.error('product update failed', res.status, errorText);
				return fail(400, { action: 'changeStatus', success: false, message: errorText });
			}
			const response = await res.json();
			return { action: 'changeStatus', success: true, message: response.message };
			//console.log('res', res);

		} catch (error) {
			console.error('Error changing status:', error);
			return fail(400, { action: 'changeStatus', success: false, message: 'Errore changeStatus' });
		}
	},
} satisfies Actions;