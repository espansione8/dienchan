import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'
import stringHash from 'string-hash';
import { pageAuth } from '$lib/pageAuth';
//import type { Locals, MembershipProduct } from '$lib/types';

const apiKey = import.meta.env.VITE_APIKEY;

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');
	// if (!locals.auth) {
	// 	throw redirect(302, '/login');
	// }

	let getTable = [];
	try {
		const query = { type: 'membership' }; //types: course / product / membership / event
		const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
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
		const response = await res.json();
		getTable = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

	} catch (error) {
		console.log('membershipfetch error:', error);
	}

	const user = locals.user
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}
	return {
		getTable,
		auth: locals.auth,
		userData: user,
	};
}

export const actions: Actions = {
	new: async ({ request, fetch, locals }) => {
		const userId = locals.user.userId
		const formData = await request.formData();
		const title = formData.get('title');
		const descrShort = formData.get('descrShort');
		const category = formData.get('category') || '';
		const price = formData.get('price');
		const prodImage = formData.get('image') || '';
		const renewalLength = formData.get('renewalLength');

		if (!title || !price || !renewalLength || !userId) {
			return fail(400, { action: 'newMembership', success: false, message: 'Dati mancanti' });
		}
		//console.log('newMembership', title, descrShort, price, renewalLength, userId);
		try {

			const prodId = stringHash(crypto.randomUUID());
			const returnObj = false
			const newDoc = {
				prodId,
				title,
				descrShort,
				stockQty: 1,
				category: [category],
				price,
				uploadfiles: [
					{
						_id: false,
						type: 'membership', //'product-primary', 'product-gallery', 'membership', 'course'
						filetype: prodImage.type,
						filename: prodImage.name,
						fileUrl: `product/${prodId}/${prodImage.name}`
					}
				],
				type: 'membership',
				renewalLength,
				userId,
			};
			const uploadImg = await fetch(`${import.meta.env.VITE_BASE_URL}/api/uploads/files`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-file-name': prodImage.name,
					'x-folder-name': `product/${prodId}`
				},
				body: prodImage
			});
			if (uploadImg.status != 200) return { action: 'newMembership', success: fail, message: 'errore file upload' };

			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/create`, {
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
			const response = await res.json();

			if (res.status == 200) {
				return { action: 'newMembership', success: true, message: response.message };
			} else {
				return { action: 'newMembership', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error creating new membership:', error);
			return { action: 'newMembership', success: false, message: 'Errore creazione membership' };
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

		const query = { prodId, type: 'membership' };
		const update = {
			$set: {
				prodId,
				title,
				descrShort,
				price,
			}
		};
		const options = { upsert: false }
		const multi = false

		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
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
			const response = await res.json();
			console.log('response.message', response);

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

	// delete: async ({ request, fetch }) => {
	// 	const formData = await request.formData();
	// 	const prodId = formData.get('prodId');

	// 	const apiKey = import.meta.env.VITE_APIKEY;
	// 	const query = { prodId: prodId };
	// 	const multi = false

	// 	try {
	// 		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/remove`, {
	// 			method: 'POST',
	// 			body: JSON.stringify({
	// 				apiKey,
	// 				schema: 'product', //product | order | user | layout | discount
	// 				query,
	// 				multi,
	// 			}),
	// 			headers: {
	// 				'Content-Type': 'application/json'
	// 			}
	// 		});
	// 		const response = await res.json();
	// 		if (res.status == 200) {
	// 			return { action: 'delete', success: true, message: response.message };
	// 		} else {
	// 			return { action: 'delete', success: false, message: response.message };
	// 		}
	// 	} catch (error) {
	// 		console.error('Error delete:', error);
	// 		return { action: 'delete', success: false, message: 'Errore delete' };
	// 	}
	// },

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const status = formData.get('status');
		const title = formData.get('title');
		const price = formData.get('price');

		if (!prodId && !status && !title && !price) {
			return fail(400, { action: 'filterSearch', success: false, message: 'Dati mancanti' });
		}

		try {
			const query = {
				type: 'membership',
				...(prodId && { prodId }),
				...(status && { status }),
				...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
				...(price && { price }),
			};

			const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
			const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
			const limit = 1000;
			const skip = 0;
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
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
			const response = await res.json();

			if (res.status == 200) {
				const filterTableList = response.map((obj: any) => ({
					...obj,
					createdAt: obj.createdAt.substring(0, 10)
				}));
				return { action: 'filterSearch', success: true, message: response.message, filterTableList };
			} else {
				return { action: 'filterSearch', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error filter membership:', error);
			return { action: 'filterSearch', success: false, message: 'Errore filtro membership' };
		}
	},

	// changeStatus: async ({ request, fetch }) => {
	// 	const formData = await request.formData();
	// 	const prodId = formData.get('prodId');
	// 	let status = formData.get('status');
	// 	if (!prodId || !status) {
	// 		return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
	// 	}
	// 	status = status == 'enabled' ? 'disabled' : 'enabled';
	// 	const query = { prodId: prodId };
	// 	const update = {
	// 		$set: {
	// 			status: status,
	// 		}
	// 	};
	// 	const options = { upsert: false }
	// 	const multi = false
	// 	// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
	// 	try {
	// 		// await dbConnect();
	// 		// const res = await Product.updateOne(query, update, options).lean().exec();
	// 		// if (res.matchedCount > 0) {
	// 		// 	return { action: 'changeStatus', success: true, message: 'update ok' };
	// 		// } else {
	// 		// 	return { action: 'changeStatus', success: false, message: 'update error' };
	// 		// }
	// 		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
	// 			method: 'POST',
	// 			body: JSON.stringify({
	// 				apiKey,
	// 				schema: 'product', //product | order | user | layout | discount
	// 				query,
	// 				update,
	// 				options,
	// 				multi
	// 			}),
	// 			headers: {
	// 				'Content-Type': 'application/json'
	// 			}
	// 		});
	// 		const response = await res.json();
	// 		if (res.status == 200) {
	// 			return { action: 'changeStatus', success: true, message: response.message };
	// 		} else {
	// 			return { action: 'changeStatus', success: false, message: response.message };
	// 		}
	// 	} catch (error) {
	// 		console.error('Error changing status:', error);
	// 		return { action: 'changeStatus', success: false, message: 'Errore changeStatus' };
	// 	}
	// },
} satisfies Actions;