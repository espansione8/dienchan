import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'
import stringHash from 'string-hash';
import { pageAuth } from '$lib/pageAuth';

const apiKey = import.meta.env.VITE_APIKEY;

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');
	// if (!locals.auth) {
	// 	throw redirect(302, '/login');
	// }

	let getTable = [];
	try {
		const query = {}; //IF USE Products.model -> types: course / product / membership / event
		const projection = {} // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'layout', //product | order | user | layout | discount
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
		const response = await res.json();
		getTable = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

	} catch (error) {
		console.log('layout fetch error:', error);
	}
	// const user = locals.user
	// if (locals.auth) {
	// 	user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
	// 	user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
	// 	user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	// }
	return {
		getTable,
		//userData: user,
	};
}


export const actions: Actions = {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const descr = formData.get('descr');
		const urlPic = formData.get('urlPic');
		//const bgColor = formData.get('bgColor');
		const price = formData.get('price') || '';
		// const bundleProduct = formData.get('bundleProduct') || '';

		if (!title || !descr || !price) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}
		// console.log({ title, descr, urlPic, price, bundleProduct });
		try {
			const layoutId = stringHash(crypto.randomUUID());
			const returnObj = false
			const newDoc = {
				layoutId,
				title,
				descr,
				urlPic,
				price,
			};
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'layout', //product | order | user | layout | discount
					newDoc,
					returnObj
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();

			if (res.status == 200) {
				return { action: 'new', success: true, message: response.message };
			} else {
				return { action: 'new', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error new:', error);
			return { action: 'new', success: false, message: 'Errore new' };
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

		try {
			const query = { layoutId: layoutId };
			const update = {
				$set: {
					title,
					descr,
					urlPic,
					price
				}
			};
			const options = { upsert: false }
			const multi = false
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'layout', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();
			if (res.status == 200) {
				return { action: 'modify', success: true, message: response.message };
			} else {
				return { action: 'modify', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error modify:', error);
			return { action: 'modify', success: false, message: 'Errore modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');

		try {
			const query = { layoutId: layoutId };
			const multi = false

			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/remove`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'layout', //product | order | user | layout | discount
					query,
					multi,
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();

			//console.log('response', response);
			if (res.status == 200) {
				return { action: 'delete', success: true, message: response.message };
			} else {
				return { action: 'delete', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Errore delete' };
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

		try {
			const query = {
				...(status && { status }),
				...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
				...(descr && { descr: { $regex: `.*${descr}.*`, $options: 'i' } }),
				//...(layoutId && { layoutId: layoutId }),
				//...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
				//...(price && { price }),
			};

			const projection = { _id: 0 } // 0: exclude | 1: include
			const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
			const limit = 1000;
			const skip = 0;
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'layout', //product | order | user | layout | discount
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
			const response = await res.json();
			//console.log('response', response);

			if (res.status == 200) {
				const filterTableList = response.map((obj: any) => ({
					...obj,
					createdAt: obj.createdAt.substring(0, 10)
				}));
				return { action: 'filter', success: true, message: 'Filtro applicato', filterTableList };

			} else {
				return { action: 'filter', success: false, message: 'Modello non trovato' };
			}
		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Errore filter' };
		}
	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');
		const status = formData.get('status');
		if (!layoutId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';
		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			const query = { layoutId: layoutId };
			const update = {
				$set: {
					status: newStatus,
				}
			};
			const options = { upsert: false }
			const multi = false
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'layout', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();
			//console.log('res', res);
			if (res.status == 200) {
				return { action: 'changeStatus', success: true, message: response.message };
			} else {
				return { action: 'changeStatus', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error status:', error);
			return { action: 'changeStatus', success: false, message: 'Errore changeStatus' };
		}
	},
} satisfies Actions;