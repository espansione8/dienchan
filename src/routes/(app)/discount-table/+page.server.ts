import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid'
import { pageAuth } from '$lib/pageAuth';
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 9)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getDiscount
	let getLayout
	let getProduct
	let getUser


	try {
		const discountFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'discount', //product | order | user | layout | discount
				query: {}, //IF USE Products.model -> types: course / product / membership / event
				projection: { _id: 0 },// 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		const layoutFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				query: {}, //IF USE Products.model -> types: course / product / membership / event
				projection: { _id: 0, layoutId: 1, title: 1 },// 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		const productFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { type: 'product' }, //IF USE Products.model -> type: course / product / membership / event
				projection: { _id: 0, prodId: 1, title: 1 },// 0: exclude | 1: include
				sort: { title: 1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: {}, //IF USE Products.model -> types: course / product / membership / event
				projection: { userId: 1, email: 1 },// 0: exclude | 1: include
				sort: { email: 1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		const [discountRes, layoutRes, productRes, userRes] = await Promise.all([
			discountFetch,
			layoutFetch,
			productFetch,
			userFetch
		]);

		if (discountRes.status !== 200 || layoutRes.status !== 200 || productRes.status !== 200 || userRes.status !== 200) {
			const errorText = `${await discountRes.text()} ${await layoutRes.text()} ${await productRes.text()} ${await userRes.text()}`;
			console.error('Promise.all failed', discountRes.status, layoutRes.status, productRes.status, userRes.status, errorText);
			//return fail(400, { action: 'load', success: false, message: errorText });
			throw error(400, errorText);
		}

		const resGetTable = await discountRes.json();
		if (resGetTable.length > 0) {
			getDiscount = resGetTable.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10)
			}));
		}
		getLayout = await layoutRes.json();
		getProduct = await productRes.json();
		getUser = await userRes.json();

	} catch (error) {
		console.log('page fetch error:', error);
		throw error(500, 'Server error');
	}

	return {
		getDiscount,
		getLayout,
		getProduct,
		getUser,
		//auth: locals.auth,
	};
}

export const actions: Actions = {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
		const type = formData.get('type');
		const selectedApplicability = formData.get('applicability') as string;
		const selectId = formData.get('selectId').toString().trim()
		const code = formData.get('code').toString().toLowerCase().trim()
		const notes = formData.get('notes') || '';
		const value = formData.get('value');
		const refDiscount = formData.get('refDiscount');
		const refPoints = formData.get('refPoints');
		//console.log('new discount', type, selectedApplicability, selectId, code, notes, value, refDiscount, refPoints);

		// let value, refDiscount, refPoints;
		// if (type == 'percent' || type == 'amount') {
		// 	value = formData.get('value');
		// } else if (type === 'referral') {
		// 	refDiscount = formData.get('refDiscount');
		// 	refPoints = formData.get('refPoints');
		// }

		if (!code || !type || !selectedApplicability || !selectId) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		let newDoc = {}

		let selectIdToUse: string | boolean;
		if (selectedApplicability === 'riflessologo') {
			selectIdToUse = selectId === 'true';
		} else {
			selectIdToUse = selectId.toString().toLowerCase().trim();
		}

		if (type == 'percent' || type == 'amount') {
			newDoc = {
				discountId: nanoid(),
				code,
				type,
				value,
				selectedApplicability,
				[selectedApplicability]: selectIdToUse,
				notes
			}
		} else if (type == 'referral') {
			newDoc = {
				discountId: nanoid(),
				code,
				type,
				refDiscount,
				refPoints,
				selectedApplicability,
				referral: selectIdToUse.toString().toLowerCase().trim(),
				notes
			}
		} else {
			return fail(400, { action: 'new', success: false, message: 'no TYPE' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'discount', //product | order | user | layout | discount
				newDoc: newDoc,
				returnObj: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			// console.log('newDoc', newDoc);
			// console.log('res', res);

			if (!res.ok) {
				const errorText = await res.text();
				console.error('discount new failed', res.status, errorText);
				return fail(400, { action: 'new', success: false, message: `discount create${errorText}` });
			}
			const result = await res.json();

			return { action: 'new', success: true, message: result.message };

		} catch (error) {
			console.error('Error new :', error);
			return { action: 'discount', success: false, message: 'Error new' };
		}
	},

	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const discountId = formData.get('discountId');
		const code = formData.get('code')?.toString().toLowerCase().trim();;
		const type = formData.get('type');
		const selectedApplicability = formData.get('applicability') as string;
		const selectId = formData.get('selectId');
		const notes = formData.get('notes') || '';
		const value = formData.get('value');
		const refDiscount = formData.get('refDiscount');
		const refPoints = formData.get('refPoints');

		// let value, refDiscount, refPoints;
		// if (type == 'percent' || type == 'amount') {
		// 	value = formData.get('value');
		// } else if (type === 'referral') {
		// 	refDiscount = formData.get('refDiscount');
		// 	refPoints = formData.get('refPoints');
		// }

		if (!discountId || !code || !type || !selectedApplicability || !selectId) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		let update = {}

		let selectIdToUse: string | boolean;
		if (selectedApplicability === 'riflessologo') {
			selectIdToUse = selectId === 'true';
		} else {
			selectIdToUse = selectId.toString().toLowerCase().trim();
		}

		if (type == 'percent' || type == 'amount') {
			update = {
				$set: {
					code: code,
					type: type,
					value: value,
					selectedApplicability: selectedApplicability,
					[selectedApplicability]: selectIdToUse, // 'email', 'membershipLevel', 'prodId', 'layoutId', 'referral'
					notes: notes,
				}
			}
		} else if (type == 'referral') {
			update = {
				$set: {
					code: code,
					type: type,
					refDiscount,
					refPoints,
					selectedApplicability: selectedApplicability,
					[selectedApplicability]: selectId, // 'email', 'membershipLevel', 'prodId', 'layoutId', 'referral'
					notes: notes,
				}
			}
		} else {
			return fail(400, { action: 'modify', success: false, message: 'no TYPE' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'discount', //product | order | user | layout | discount
				query: { discountId }, // 'course', 'product', 'membership', 'event',
				update: update,
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
		const discountId = formData.get('discountId');

		const resFetch = await fetch(`${BASE_URL}/api/mongo/remove`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'discount', //product | order | user | layout | discount
				query: { discountId: discountId }, // 'course', 'product', 'membership', 'event'
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
		const code = formData.get('code');
		const discountId = formData.get('discountId');
		const selectedApplicability = formData.get('selectedApplicability');
		const type = formData.get('type');
		const status = formData.get('status');
		const referralEmail = formData.get('referralEmail').toString().trim();

		const resFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'discount', //product | order | user | layout | discount
				query: {
					//type: 'course', 'product', 'membership', 'event'
					...(code && { code: { $regex: `.*${code}.*`, $options: 'i' } }),
					...(discountId && { discountId: { $regex: `.*${discountId}.*`, $options: 'i' } }),
					...(type && { type }),
					...(selectedApplicability && { selectedApplicability }),
					...(status && { status }),
					...(referralEmail && { referral: { $regex: `.*${referralEmail}.*`, $options: 'i' }, type: 'referral' }),
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
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error filter' };
		}
	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const discountId = formData.get('discountId');
		const status = formData.get('status');
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';

		if (!discountId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'discount', //product | order | user | layout | discount
				query: { discountId },
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
	},

} satisfies Actions;