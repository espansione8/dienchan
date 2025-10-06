import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 9)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	let getTableNames = [];
	let getLayout = [];
	let setQuery: { type: string; userId?: string } = { type: 'course', userId: locals.user.userId };
	const user: any = locals.user
	// const userId = locals.user.userId || ''

	if (user.level === 'admin' || user.level === 'superadmin') {
		setQuery = { type: 'course' }
	}

	const courseFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'product', // product | order | user | layout | discount
			query: setQuery, //IF USE Products.model -> types: course / product / membership / event
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
					{ level: 'formatore base' },
					{ level: 'master' },
					{ level: 'formatore avanzato' }
				],
				status: "enabled" //IF USE Products.model -> types: course / product / membership / event
			},
			projection: { _id: 0, password: 0 },
			sort: { surname: 1 },
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

		if (!courseRes.ok || !riflessologyRes.ok || !modelsRes.ok) {
			const errorText = `${await courseRes.text()} ${await riflessologyRes.text()} ${await modelsRes.text()} `;
			console.error('Promise.all failed', courseRes.status, riflessologyRes.status, modelsRes.status, errorText);
			//return fail(400, { action: 'load', success: false, message: errorText });
			throw error(400, errorText);
		}

		const resGetTable = await courseRes.json();
		if (resGetTable.length > 0) {
			getTable = resGetTable
				.filter((obj: any) => obj.layoutView)
				.map((obj: any) => ({
					...obj,
					createdAt: obj.createdAt ? obj.createdAt.substring(0, 10) : undefined,
					eventStartDate: obj.eventStartDate ? obj.eventStartDate.substring(0, 10) : undefined,
					timeStartDate: obj.eventStartDate ? obj.eventStartDate.substring(11, 16) : undefined,
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
}

export const actions: Actions = {
	new: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const userId = locals.user.userId;
		const name = locals.user.name;
		const surname = locals.user.surname
		const eventStartDate = formData.get('eventStartDate');
		const stockQty = formData.get('stockQty');
		const provinceArray = formData.get('provinceArray') as string;
		const province = provinceArray.split(",");
		const location = formData.get('location');
		const layoutId = formData.get('layoutId');
		// const tagArray = formData.get('tagArray') as string || '[]';
		// const tag = tagArray.split(",");
		const arrayEmail = formData.get('notificationEmail') as string;
		const notificationEmail = arrayEmail.split(",");
		const infoExtra = formData.get('infoExtra');

		if (!name || !surname || !eventStartDate || !stockQty || !provinceArray || !location) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				newDoc: {
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
					//tag,
					infoExtra,
					type: 'course',
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
			console.error('Error new :', error);
			return { action: 'new', success: false, message: 'Error new' };
		}
	},

	modify: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const eventStartDate = formData.get('eventStartDate');
		const stockQty = formData.get('stockQty');
		const provinceArray = formData.get('provinceArray') as string;
		const province = provinceArray.split(",");
		const location = formData.get('location');
		const layoutId = formData.get('layoutId');
		///const tagArray = formData.get('tagArray');
		const emailArray = formData.get('notificationEmail');
		const infoExtra = formData.get('infoExtra');
		const prodId = formData.get('prodId');
		//let tag: string[] = [];
		let notificationEmail: string[] = [];

		// if (typeof tagArray === 'string' && tagArray.trim().length) {
		// 	tag = tagArray.split(',').map((t) => t.trim());
		// }

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
						//...(tag.length ? { tag } : {}),
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
			if (!res.ok) {
				const errorText = await res.text();
				console.error('modify update failed', res.status, errorText);
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
			if (!res.ok) {
				const errorText = await res.text();
				console.error('course delete failed', res.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'delete', success: true, message: result.message };

		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Error delete' };
		}
	},

	filter: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const county = formData.get('county');
		const layoutId = formData.get('layoutId');
		let userId: any;

		if (locals.user.level == 'admin' || locals.user.level == 'superadmin') {
			userId = formData.get('userId');

		} else {
			userId = locals.user.userId
		}


		const query = {
			type: 'course',
			// ...(countryState && { countryState }),
			...(county && { county: { $in: [county] } }),
			...(layoutId && { layoutId }),
			...(userId && { userId }),
			//...(locals.user.level === 'formatore' && { userId: localUserId }),
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

			if (!res.ok) {
				const errorText = await res.text();
				console.error('course filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const resData = await res.json();
			const payload = resData
				.filter(item => item.layoutView !== null)
				.map((obj: any) => ({
					...obj,
					createdAt: obj.createdAt ? obj.createdAt.substring(0, 10) : undefined,
					eventStartDate: obj.eventStartDate ? obj.eventStartDate.substring(0, 10) : undefined,
					timeStartDate: obj.eventStartDate ? obj.eventStartDate.substring(11, 16) : undefined,
				}));;

			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error filter' };
		}
	},

	createCertification: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const certificationPlace = formData.get('certificationPlace');
		const certificationDate = formData.get('certificationDate');
		const selectedSubscriber = formData.get('selectedSubscriber') as string;
		const subscriberArray = JSON.parse(selectedSubscriber) || [];
		const userId = locals.user.userId;

		if (!certificationPlace || !certificationDate || !userId) {
			return fail(400, { action: 'createCertification', success: false, message: 'Dati mancanti' });
		}

		if (subscriberArray.length === 0) {
			return fail(400, { action: 'createCertification', success: false, message: 'Nessun partecipante selezionato' });
		}

		const selectedUserIds = subscriberArray.map((sub: { userId: string }) => sub.userId);

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { prodId, type: 'course' }, // 'course', 'product', 'membership', 'event'
				update: {
					$set: {
						certificationStatus: true,
						"listSubscribers.$[elem].certificationStatus": true,
						"listSubscribers.$[elem].certificationDate": certificationDate,
						"listSubscribers.$[elem].certificationPlace": certificationPlace
					}
				},
				options: {
					arrayFilters: [{ "elem.userId": { $in: selectedUserIds } }],
					upsert: false
				},
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
				console.error('createCertification update failed', res.status, errorText);
				return fail(400, { action: 'createCertification', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'createCertification', success: true, message: result.message };

		} catch (error) {
			console.error('Error createCertification:', error);
			return { action: 'createCertification', success: false, message: 'Error createCertification' };
		}
	},

	coursePdf: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const subscribers = formData.get('subscribers') as string;
		const subscribersArray = JSON.parse(subscribers) || [];
		// console.log('prodId', prodId);
		// console.log('subscribersArray', subscribersArray);

		if (!prodId || subscribersArray.length === 0) {
			return fail(400, { action: 'coursePdf', success: false, message: 'Dati mancanti' });
		}

		const resFetchProduct = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product',
				query: { prodId: prodId },
				projection: { _id: 0, listSubscribers: 1 },
				limit: 1
			}),
			headers: { 'Content-Type': 'application/json' }
		});

		const resFetchUsers = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user',
				query: { userId: { $in: subscribersArray.map(sub => sub.userId) } },
				projection: { _id: 0, userId: 1, city: 1, county: 1 },
				limit: 1000
			}),
			headers: { 'Content-Type': 'application/json' }
		});

		const resFetchOrders = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'order',
				query: {
					userId: { $in: subscribersArray.map(sub => sub.userId) },
					'cart': { $elemMatch: { prodId: prodId } }
				},
				projection: {
					_id: 0,
					userId: 1,
					'payment.method': 1,
					'payment.statusPayment': 1,
					'totalValue': 1
				},
				sort: { createdAt: -1 },
				limit: 1000,
				skip: 0
			}),
			headers: { 'Content-Type': 'application/json' }
		});

		try {
			const [resProduct, resUsers, resOrders] = await Promise.all([
				resFetchProduct,
				resFetchUsers,
				resFetchOrders
			]);

			if (!resOrders.ok) {
				const errorText = await resOrders.text();
				console.error('coursePdf failed', resOrders.status, errorText);
				return fail(400, { action: 'coursePdf', success: false, message: errorText });
			}

			const resOrdersData = await resOrders.json();
			const resProductData = resProduct.ok ? await resProduct.json() : [];
			const resUsersData = resUsers.ok ? await resUsers.json() : [];

			const productSubscribersMap = new Map();
			if (resProductData.length > 0 && resProductData[0].listSubscribers) {
				resProductData[0].listSubscribers.forEach(sub => {
					productSubscribersMap.set(sub.userId, {
						paymentMethod: sub.paymentMethod,
						paymentStatus: sub.paymentStatus
					});
				});
			}

			const usersMap = new Map(resUsersData.map(user => [
				user.userId,
				{ city: user.city, county: user.county }
			]));

			const orderMap = new Map(resOrdersData.map(order => [
				order.userId,
				{
					method: order.payment.method,
					status: order.payment.statusPayment,
					value: order.totalValue
				}
			]));

			const payload = subscribersArray.map(user => {
				const orderData = orderMap.get(user.userId);
				const productSubData = productSubscribersMap.get(user.userId);
				const userData = usersMap.get(user.userId);

				return {
					...user,
					paymentMethod: orderData?.method || productSubData?.paymentMethod || null,
					paymentStatus: orderData ? orderData.status : (productSubData?.paymentStatus || 'not paid'),
					value: orderData ? orderData.value : null,
					city: userData?.city || null,
					county: userData?.county || null
				};
			});

			return { action: 'coursePdf', success: true, message: 'coursePdf attivato', payload };

		} catch (error) {
			console.error('Error coursePdf:', error);
			return { action: 'coursePdf', success: false, message: 'Error coursePdf' };
		}
	}

} satisfies Actions;
