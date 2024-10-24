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
		const level = formData.get('level') || '';

		//  cast boolean 
		const namePublic = !!(formData.get('namePublic') || '');
		const surnamePublic = !!(formData.get('surnamePublic') || '');
		const emailPublic = !!(formData.get('emailPublic') || '');
		const addressPublic = !!(formData.get('addressPublic') || '');
		const cityPublic = !!(formData.get('cityPublic') || '');
		const statePublic = !!(formData.get('statePublic') || '');
		const postalCodePublic = !!(formData.get('postalCodePublic') || '');
		const countryPublic = !!(formData.get('countryPublic') || '');
		const phonePublic = !!(formData.get('phonePublic') || '');
		const mobilePhonePublic = !!(formData.get('mobilePhonePublic') || '');

		if (!name || !surname || !email || !address || !postalCode || !city || !countryState || !country || !phone || !mobilePhone) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}

		// console.log('namePublic', typeof namePublic, namePublic);
		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
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
	}


} satisfies Actions;