import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import stringHash from 'string-hash';
import { customAlphabet } from 'nanoid'
import { pageAuth } from '$lib/pageAuth';
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)



export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');
	// if (!locals.auth) {
	// 	throw redirect(302, '/login');
	// }

	let getTable = [];

	const layoutFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'layout', //product | order | user | layout | discount
			query: {},
			projection: {},
			sort: { createdAt: -1 },
			limit: 1000,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	try {

		const layoutRes = await layoutFetch;
		if (layoutRes.status !== 200) {
			const errorText = await layoutRes.text();
			console.error('layoutFetch failed', layoutRes.status, errorText);
			throw error(400, errorText);
		}

		const resLayoutTable = await layoutRes.json();
		if (resLayoutTable.length > 0) {
			getTable = resLayoutTable.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10)
			}));
		}


	} catch (error) {
		console.log('page fetch error:', error);
		throw error(500, 'Server error');
	}

	return {
		getTable,
	};
}


export const actions: Actions = {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const descr = formData.get('descr');
		const urlPic = formData.get('urlPic');
		const price = formData.get('price') || '';

		if (!title || !descr || !price) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				newDoc: {
					layoutId: nanoid(),
					title,
					descr,
					urlPic,
					price,
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
			console.error('Error layout new :', error);
			return { action: 'new', success: false, message: 'Error layout new' };
		}
	},

	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');
		const title = formData.get('title') || '';
		const descr = formData.get('descr') || '';
		const urlPic = formData.get('urlPic') || '';
		const price = formData.get('price') || '';

		if (!layoutId || !title) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				query: { layoutId: layoutId },
				update: {
					$set: {
						title,
						descr,
						urlPic,
						price
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
				console.error('layout update failed', res.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'modify', success: true, message: result.message };

		} catch (error) {
			console.error('Error layout modify:', error);
			return { action: 'modify', success: false, message: 'Error layout modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');

		const resFetch = fetch(`${BASE_URL}/api/mongo/remove`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				query: { layoutId: layoutId },
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
				console.error('layout delete failed', res.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'delete', success: true, message: result.message };

		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Error layout delete' };
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const status = formData.get('status');
		const title = formData.get('title');
		const descr = formData.get('descr');
		//const price = formData.get('price');
		//console.log('layoutId', layoutId);

		if (!status && !title && !descr) {
			return fail(400, { action: 'filter', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				query: {
					...(status && { status }),
					...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
					...(descr && { descr: { $regex: `.*${descr}.*`, $options: 'i' } }),
					//...(layoutId && { layoutId: layoutId }),
					//...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
					//...(price && { price }),
				},
				projection: { _id: 0 },
				sort: { createdAt: -1 },
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
				console.error('layout filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const payload = await res.json();

			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error layout filter' };
		}
	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');
		const status = formData.get('status');
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';

		if (!layoutId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				query: { layoutId: layoutId },
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
				console.error('changeStatus layout failed', res.status, errorText);
				return fail(400, { action: 'changeStatus', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'changeStatus', success: true, message: result.message };

		} catch (error) {
			console.error('Error changeStatus:', error);
			return fail(400, { action: 'changeStatus', success: false, message: 'Error layout changeStatus' });
		}
	},
} satisfies Actions;