import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	let getTableNames = [];
	let getLayout = [];
	// const userId = locals.user.userId || ''
	const user: any = locals.user


	const courseFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'product', // product | order | user | layout | discount
			query: { type: 'course' }, //IF USE Products.model -> types: course / product / membership / event
			projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1000,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});


	const riflessologyFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'user', //product | order | user | layout | discount

			query: {
				$or: [
					{ level: 'formatore' },
					{ level: 'superadmin' },
					{ level: 'admin' }
				],
				status: "enabled" //IF USE Products.model -> types: course / product / membership / event
			},



			projection: { _id: 0, password: 0 },
			sort: { createdAt: -1 },
			limit: 1000,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const modelsFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'layout', //product | order | user | layout | discount
			query: { status: "enabled" },
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
		const [courseRes, riflessologyRes, modelsRes] = await Promise.all([
			courseFetch,
			riflessologyFetch,
			modelsFetch]);

		if (courseRes.status !== 200 || riflessologyRes.status !== 200 || modelsRes.status !== 200) {
			const errorText = `${await courseRes.text()} ${await riflessologyRes.text()} ${await modelsRes.text()} `;
			console.error('Promise.all failed', courseRes.status, riflessologyRes.status, modelsRes.status, errorText);
			//return fail(400, { action: 'load', success: false, message: errorText });
			throw error(400, errorText);
		}


		const resGetTable = await courseRes.json();
		if (resGetTable.length > 0) {
			getTable = resGetTable.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10),
				eventStartDate: obj.eventStartDate,
				timeStartDate: obj.eventStartDate.substring(11, 16),
				//timeEndDate: obj.eventEndDate.substring(11, 16),
			}));
		}

		getTableNames = await riflessologyRes.json();
		getLayout = await modelsRes.json();

	} catch (error) {
		console.log('page fetch error:', error);
		throw error(500, 'Server error');
	}
	//console.log('getTable', getTable.length);
	return {
		getTable,
		getLayout,
		getTableNames,
		userData: user
	};

	// GET COURSES
	// try {
	// 	let query = {}; //IF USE Products.model -> types: course / product / membership / event
	// 	const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
	// 	const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
	// 	const limit = 1000;
	// 	const skip = 0;

	// 	if (locals.user.level == 'formatore') {
	// 		query = { type: 'course', userId };
	// 	} else {
	// 		query = { type: 'course' };
	// 	}

	// 	const res = await fetch(`${BASE_URL}/api/mongo/find`, {
	// 		method: 'POST',
	// 		body: JSON.stringify({
	// 			apiKey: APIKEY,
	// 			schema: 'product', //product | order | user | layout | discount
	// 			query,
	// 			projection,
	// 			sort,
	// 			limit,
	// 			skip
	// 		}),
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		}
	// 	});
	// 	const response = await res.json();

	// 	getTable = response.map((obj: any) => ({
	// 		...obj,
	// 		createdAt: obj.createdAt.substring(0, 10),
	// 		eventStartDate: obj.eventStartDate,
	// 		timeStartDate: obj.eventStartDate.substring(11, 16),
	// 		//timeEndDate: obj.eventEndDate.substring(11, 16),
	// 	}));
	// } catch (error) {
	// 	console.log('course getTable fetch error:', error);
	// }

	// GET RIFLESSOLOGI
	// try {
	// 	const query = { status: "enabled", level: "formatore" }; //IF USE Products.model -> types: course / product / membership / event
	// 	const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
	// 	const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
	// 	const limit = 1000;
	// 	const skip = 0;
	// 	const res = await fetch(`${BASE_URL}/api/mongo/find`, {
	// 		method: 'POST',
	// 		body: JSON.stringify({
	// 			apiKey: APIKEY,
	// 			schema: 'user', //product | order | user | layout | discount
	// 			query,
	// 			projection,
	// 			sort,
	// 			limit,
	// 			skip
	// 		}),
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		}
	// 	});
	// 	getTableNames = await res.json();
	// } catch (error) {
	// 	console.log('course getTableNames fetch error:', error);
	// }

	// GET MODELS
	// try {
	// 	const query = { status: "enabled" }; //IF USE Products.model -> types: course / product / membership / event
	// 	const projection = { _id: 0 } // 0: exclude | 1: include
	// 	const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
	// 	const limit = 1000;
	// 	const skip = 0;
	// 	const res = await fetch(`${BASE_URL}/api/mongo/find`, {
	// 		method: 'POST',
	// 		body: JSON.stringify({
	// 			apiKey: APIKEY,
	// 			schema: 'layout', //product | order | user | layout | discount
	// 			query,
	// 			projection,
	// 			sort,
	// 			limit,
	// 			skip
	// 		}),
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		}
	// 	});
	// 	getLayout = await res.json();
	// } catch (error) {
	// 	console.log('course getLayout fetch error:', error);
	// }


	// if (locals.auth) {
	// 	user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
	// 	user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
	// 	user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	// }
	// return {
	// 	getLayout,
	// 	getTable,
	// 	getTableNames,
	// 	auth: locals.auth,
	// 	userData: user,
	// };
}

export const actions: Actions = {
	new: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const userId = locals.user.userId;
		const name = locals.user.name;
		const surname = locals.user.surname
		const eventStartDate = formData.get('eventStartDate');
		const stockQty = formData.get('stockQty') || 0;
		const provinceArray = formData.get('provinceArray') || '';
		const province = provinceArray.split(",");
		const location = formData.get('location');
		const layoutId = formData.get('layoutId');
		const tagArray = formData.get('tagArray') || "";
		const tag = tagArray.split(",");
		const arrayEmail = formData.get('notificationEmail') || "";
		const notificationEmail = arrayEmail.split(",");
		const infoExtra = formData.get('infoExtra');

		if (!name || !surname || !eventStartDate || !stockQty || !provinceArray || !location) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		const newDoc = {
			prodId: nanoid(),
			layoutId,
			userId,
			name,
			surname,
			eventStartDate,
			stockQty,
			county: province,
			location,
			notificationEmail,
			tag,
			infoExtra,
			type: 'course',
		};


		const resFetch = fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				newDoc,
				returnObj: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			if (res.status != 200) {
				const errorText = await res.text();
				console.error('user find failed', res.status, errorText);
				return fail(400, { action: 'new', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'new', success: true, message: result.message };

		} catch (error) {
			console.error('Error new :', error);
			return { action: 'new', success: false, message: 'Error new' };
		}
	},

	modify: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const eventStartDate = formData.get('eventStartDate');
		const stockQty = formData.get('stockQty') || 0;
		const provinceArray = formData.get('provinceArray') || '';
		const province = provinceArray.split(",");
		const location = formData.get('location');
		const layoutId = formData.get('layoutId');
		const tagArray = formData.get('tagArray');
		const emailArray = formData.get('notificationEmail');
		const infoExtra = formData.get('infoExtra');
		const prodId = formData.get('prodId');
		let tag: string[] = [];
		let notificationEmail: string[] = [];

		if (typeof tagArray === 'string' && tagArray.trim().length) {
			tag = tagArray.split(',').map((t) => t.trim());
		}

		if (typeof emailArray === 'string' && emailArray.trim().length) {
			notificationEmail = emailArray.split(',').map((t) => t.trim());
		}


		if (!eventStartDate || !stockQty || !provinceArray || !location || !layoutId) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}


		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { prodId, type: 'course' }, // 'course', 'product', 'membership', 'event'
				update: {
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
			if (res.status != 200) {
				const errorText = await res.text();
				console.error('discount update failed', res.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'modify', success: true, message: result.message };

		} catch (error) {
			console.error('Error creating new modify:', error);
			return { action: 'modify', success: false, message: 'Error modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');

		const resFetch = fetch(`${BASE_URL}/api/mongo/remove`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { prodId: prodId, type: 'course' },
				multi: false,
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		try {
			const res = await resFetch;
			if (res.status != 200) {
				const errorText = await res.text();
				console.error('discount delete failed', res.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'delete', success: true, message: result.message };

		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Error delete' };
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const county = formData.get('county');
		const layoutId = formData.get('layoutId');
		const userId = formData.get('userId');

		const query = {
			type: 'course',
			// ...(countryState && { countryState }),
			...(county && { county: { $in: [county] } }),
			...(layoutId && { layoutId }),
			...(userId && { userId }),
			//...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
		};

		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query,
				projection: { _id: 0 },
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;

			if (res.status != 200) {
				const errorText = await res.text();
				console.error('discount filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const payload = await res.json();

			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error filter' };
		}
	}
} satisfies Actions;
