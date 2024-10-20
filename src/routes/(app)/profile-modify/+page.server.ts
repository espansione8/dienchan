import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	let getOrderData = [];
	let getOrder = [];
	// console.log('locals.data', locals.user.userId);
	const res = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/orders/findId/${locals.user.userId}`
	);
	getOrderData = await res.json();

	getOrder = getOrderData.map((obj) => ({
		...obj,
		createdAt: obj.createdAt.substring(0, 10)
	}));
	//console.log('getOrder', getOrder);

	const user = locals.user
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}
	//console.log('locals.data', typeof locals.data, locals.data);
	return {
		//sessionAuth: session.auth,
		//userEmail: session.user.email,
		userData: user,
		orderData: getOrder,
		auth: locals.auth
	};
}


export const actions: Actions = {
	newUser: async ({ request, fetch }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode') || '';
		const city = formData.get('city') || '';
		const countryState = formData.get('countryState') || '';
		const country = formData.get('country') || '';
		const phone = formData.get('phone') || '';
		const mobilePhone = formData.get('mobilePhone') || '';
		const password1 = formData.get('password1') || '';

		if (!name || !surname || !email || !address || !postalCode || !city || !countryState || !country || !phone || !mobilePhone || !password1) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, productId, layoutId, notes });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/sign-up-admin`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					surname,
					email,
					address,
					postalCode,
					city,
					countryState,
					country,
					phone,
					mobilePhone,
					password1
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'newUser', success: true, message: result.message };
			} else {
				return { action: 'newUser', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new newUser:', error);
			return { action: 'newUser', success: false, message: 'Errore creazione newUser' };
		}
	},

	modifyUser: async ({ request, fetch }) => {

		const formData = await request.formData();
		const userId = formData.get('userId');
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode') || '';
		const city = formData.get('city') || '';
		const countryState = formData.get('countryState') || '';
		const country = formData.get('country') || '';
		const phone = formData.get('phone') || '';
		const mobilePhone = formData.get('mobilePhone') || '';

		if (!name || !surname || !email || !address || !postalCode || !city || !countryState || !country || !phone || !mobilePhone) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, productId, layoutId, notes });
		try {

			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/modify`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId,
					name,
					surname,
					email,
					address,
					postalCode,
					city,
					countryState,
					country,
					phone,
					mobilePhone
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'modifyUser', success: true, message: result.message };
			} else {
				return { action: 'modifyUser', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new modifyUser:', error);
			return { action: 'modifyUser', success: false, message: 'Errore creazione modifyUser' };
		}
	},

	disableUser: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const status = formData.get('status');
		if (!userId) {
			return fail(400, { action: 'disableUser', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, productId, layoutId, notes });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/status`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId,
					status
				})
			});
			const result = await response.json();
			if (response.status == 200) {
				return { action: 'disableUser', success: true, message: result.message };
			} else {
				return { action: 'disableUser', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error changing User status:', error);
			return { action: 'disableUser', success: false, message: 'Errore modifica User' };
		}
	},

	deleteUser: async ({ request, fetch }) => {

		const formData = await request.formData();
		const userId = formData.get('userId');
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/remove`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'deleteUser', success: true, message: result.message };
			} else {
				return { action: 'deleteUser', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error deleteUser:', error);
			return { action: 'deleteUser', success: false, message: 'Errore deleteUser' };
		}
	},

	filterUser: async ({ request, fetch }) => {
		const formData = await request.formData();
		const level = formData.get('level');
		const membershipLevel = formData.get('membershipLevel');
		const email = formData.get('email');

		console.log('level', level);

		const arrayField = ['level', 'membership.membershipLevel', 'email'];
		const arrayValue = [level, membershipLevel, email];

		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
				method: 'POST',
				body: JSON.stringify({
					schema: 'user',
					arrayField,
					arrayValue
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			//console.log('response', response);
			const result = await response.json();

			if (response.status == 200) {
				const filterTableList = result.map((obj: any) => ({
					...obj,
					createdAt: obj.createdAt.substring(0, 10)
				}));
				return { action: 'filterUser', success: true, message: 'Filtro applicato', filterTableList };

			} else {
				return { action: 'filterUser', success: false, message: 'Filtro NON applicato' };
			}
		} catch (error) {
			console.error('Error filterUser:', error);
			return { action: 'filterUser', success: false, message: 'Errore filterUser' };
		}
	}
} satisfies Actions;