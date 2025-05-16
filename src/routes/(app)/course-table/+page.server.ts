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
	let getTableNames = [];
	let getLayout = [];
	const userId = locals.user.userId || ''

	// GET COURSES
	try {
		let query = {}; //IF USE Products.model -> types: course / product / membership / event
		const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;

		if (locals.user.level == 'formatore') {
			query = { type: 'course', userId };
		} else {
			query = { type: 'course' };
		}

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
			createdAt: obj.createdAt.substring(0, 10),
			eventStartDate: obj.eventStartDate,
			timeStartDate: obj.eventStartDate.substring(11, 16),
			//timeEndDate: obj.eventEndDate.substring(11, 16),
		}));
	} catch (error) {
		console.log('course getTable fetch error:', error);
	}

	// GET RIFLESSOLOGI
	try {
		const query = { status: "enabled", level: "formatore" }; //IF USE Products.model -> types: course / product / membership / event
		const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'user', //product | order | user | layout | discount
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
		getTableNames = await res.json();
	} catch (error) {
		console.log('course getTableNames fetch error:', error);
	}

	// GET MODELS
	try {
		const query = { status: "enabled" }; //IF USE Products.model -> types: course / product / membership / event
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
		getLayout = await res.json();
	} catch (error) {
		console.log('course getLayout fetch error:', error);
	}

	const user: any = locals.user
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}
	return {
		getLayout,
		getTable,
		getTableNames,
		auth: locals.auth,
		userData: user,
	};
}

export const actions: Actions = {
	new: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const userId = locals.user.userId;
		const name = locals.user.name;
		const surname = locals.user.surname;
		//const title = formData.get('title') || '';
		//const descrLong = formData.get('descrLong') || '';
		const eventStartDate = formData.get('eventStartDate');
		console.log('eventStartDate new', eventStartDate);

		const stockQty = formData.get('stockQty') || 0;
		const provinceArray = formData.get('provinceArray') || '';
		const province = provinceArray.split(",");
		// const countryState = formData.get('countryState') || '';
		const location = formData.get('location');
		const layoutId = formData.get('layoutId');
		//const price = formData.get('price');
		const tagArray = formData.get('tagArray') || "";
		const tag = tagArray.split(",");
		const arrayEmail = formData.get('notificationEmail') || "";
		const notificationEmail = arrayEmail.split(",");
		const infoExtra = formData.get('infoExtra');

		// console.log({ name }, { surname }, { eventStartDate }, { stockQty }, { provinceArray }, { stockQty }, { location });

		if (!name || !surname || !eventStartDate || !stockQty || !provinceArray || !location) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		try {
			const prodId = stringHash(crypto.randomUUID());
			const returnObj = false
			const newDoc = {
				prodId,
				layoutId,
				userId,
				name,
				surname,
				//title,
				//descrLong,
				eventStartDate,
				stockQty,
				county: province,
				location,
				notificationEmail,
				tag,
				//price,
				infoExtra,
				type: 'course',
			};
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
				return { action: 'new', success: true, message: response.message };
			} else {
				return { action: 'new', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error creating newCourse:', error);
			return { action: 'new', success: false, message: 'Errore newCourse' };
		}
	},

	modify: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		// const userId = locals.user.userId;
		// const name = locals.user.name;
		// const surname = locals.user.surname;
		//const title = formData.get('title') || '';
		//const descrLong = formData.get('descrLong') || '';
		const eventStartDate = formData.get('eventStartDate');
		// console.log('eventStartDate mod', eventStartDate);

		const stockQty = formData.get('stockQty') || 0;
		// const countryState = formData.get('countryState') || '';
		const provinceArray = formData.get('provinceArray') || '';
		const province = provinceArray.split(",");
		const location = formData.get('location');
		const layoutId = formData.get('layoutId');
		//const price = formData.get('price');
		const tagArray = formData.get('tagArray');
		let tag: string[] = [];

		if (typeof tagArray === 'string' && tagArray.trim().length) {
			tag = tagArray.split(',').map((t) => t.trim());
		}
		//const arrayEmail = formData.get('notificationEmail') || "";
		//const notificationEmail = arrayEmail.split(",");

		const emailArray = formData.get('notificationEmail');
		let notificationEmail: string[] = [];
		if (typeof emailArray === 'string' && emailArray.trim().length) {
			notificationEmail = emailArray.split(',').map((t) => t.trim());
		}

		const infoExtra = formData.get('infoExtra');
		const prodId = formData.get('prodId');

		if (!eventStartDate || !stockQty || !provinceArray || !location || !layoutId) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			const query = { prodId, type: 'course' }; // 'course', 'product', 'membership', 'event'
			const update = {
				$set: {
					eventStartDate,
					stockQty,
					county: province,
					location,
					layoutId,
					notificationEmail,
					...(tag.length ? { tag } : {}),
					infoExtra
				}
			};
			const options = { upsert: false }
			const multi = false
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
		const prodId = formData.get('prodId');

		const query = { prodId: prodId, type: 'course' };//'course', 'product', 'membership', 'event'
		const multi = false
		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/remove`, {
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
			const response = await res.json();
			console.log('response', response);

			if (res.status == 200) {
				return { action: 'delete', success: true, message: response.message };
			} else {
				return { action: 'delete', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'deleteCoudeleterse', success: false, message: 'Errore delete' };
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const county = formData.get('county');
		const layoutId = formData.get('layoutId');
		const userId = formData.get('userId');
		// console.log('layoutId', layoutId);
		try {
			const query = {
				type: 'course',
				// ...(countryState && { countryState }),
				...(county && { county: { $in: [county] } }),
				...(layoutId && { layoutId }),
				...(userId && { userId }),
				//...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
			};

			const projection = { _id: 0 } // 0: exclude | 1: include
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
					createdAt: obj.createdAt.substring(0, 10),
					eventStartDate: obj.eventStartDate.substring(0, 10),
					timeStartDate: obj.eventStartDate.substring(11, 16)
				}));
				return { action: 'filter', success: true, message: 'Filtro applicato', filterTableList };

			} else {
				return { action: 'filter', success: false, message: 'Corso non trovato' };
			}
		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Errore filter' };
		}
	}
} satisfies Actions;
