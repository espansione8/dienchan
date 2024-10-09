import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'
import { Product } from '$lib/models/Products.model';

export const load: PageServerLoad = async ({ locals }) => {
	//console.log('locals', locals);
	// if (!locals.auth) {
	// 	throw redirect(302, '/login');
	// }
	//console.log('locals.data', locals.data);

	let user = locals.data
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}

	return {
		//sessionAuth: session.auth,
		//userEmail: session.user.email,
		userData: user,
		auth: locals.auth
	};
}

export const actions: Actions = {
	newMembership: async ({ request, fetch }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode');
		const city = formData.get('city');
		const countryState = formData.get('countryState');
		const country = formData.get('country');
		const phone = formData.get('phone');
		const mobilePhone = formData.get('mobilePhone');
		const password1 = formData.get('password1');
		const membershipLevel = 'Socio ordinario';
		const paymentType = formData.get('radio-paymentType');

		if (!name || !surname || !email || !address || !postalCode || !city || !countryState || !country || !password1 || !paymentType) {
			console.log('newMembership', name, surname, email, address, postalCode, city, countryState, country, password1, paymentType);
			return fail(400, { action: 'newMembership', success: false, message: 'Dati mancanti' });
		}
		try {
			const findProduct = await Product.findOne({ title: membershipLevel });
			const product = findProduct?.prodId ? findProduct : () => { return { action: 'newMembership', success: false, message: 'errore iscrizione (1)' } }

			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/orders/purchase-first`, {
				method: 'POST',
				body: JSON.stringify({
					name,
					surname,
					email,
					password1, // only registration
					address,
					city,
					countryState,
					postalCode,
					country,
					phone,
					mobilePhone,
					cart: [product],
					paymentType,
					userId: ''
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const res = await response.json();
			if (res.status == 200) {
				return { action: 'newMembership', success: true, message: res.message };
			} else {
				return { action: 'newMembership', success: false, message: res.message };
			}
		} catch (error) {
			console.error('Error creating new membership:', error);
			return { action: 'newMembership', success: false, message: 'Errore creazione membership' };
		}
	},
	newLifetime: async ({ request, fetch }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode');
		const city = formData.get('city');
		const countryState = formData.get('countryState');
		const country = formData.get('country');
		const phone = formData.get('phone');
		const mobilePhone = formData.get('mobilePhone');
		const password1 = formData.get('password1');
		const membershipLevel = 'Socio vitalizio';
		const paymentType = formData.get('radio-paymentType');

		if (!name || !surname || !email || !address || !postalCode || !city || !countryState || !country || !password1 || !paymentType) {
			console.log('newMembership', name, surname, email, address, postalCode, city, countryState, country, password1, paymentType);
			return fail(400, { action: 'newMembership', success: false, message: 'Dati mancanti' });
		}
		try {
			const findProduct = await Product.findOne({ title: membershipLevel });
			const product = findProduct?.prodId ? findProduct : () => { return { action: 'newMembership', success: false, message: 'errore iscrizione (1)' } }

			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/orders/purchase-first`, {
				method: 'POST',
				body: JSON.stringify({
					name,
					surname,
					email,
					password1, // only registration
					address,
					city,
					countryState,
					postalCode,
					country,
					phone,
					mobilePhone,
					cart: [product],
					paymentType,
					userId: ''
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const res = await response.json();
			if (res.status == 200) {
				return { action: 'newMembership', success: true, message: res.message };
			} else {
				return { action: 'newMembership', success: false, message: res.message };
			}
		} catch (error) {
			console.error('Error creating new membership:', error);
			return { action: 'newMembership', success: false, message: 'Errore creazione membership' };
		}
	},
	renewMembership: async ({ request, fetch, locals }) => {
		const userData = locals.data;
		const formData = await request.formData();
		const userId = userData.userId;
		const membershipActivation = userData.membership.membershipExpiry;
		const membershipStatus = true;
		const membershipExpiry = formData.get('membershipExpiry');
		const paymentType = formData.get('radio-paymentType');

		if (!paymentType) {
			//console.log('renewMembership', name, surname, email, address, postalCode, city, countryState, country, password1, paymentType);
			return fail(400, { action: 'renewMembership', success: false, message: 'Dati mancanti' });
		}
		try {
			const findProduct = await Product.findOne({ title: 'Socio ordinario' });
			const product = findProduct?.prodId ? findProduct : () => { return { action: 'newMembership', success: false, message: 'errore rinnovo (1)' } }

			const response1 = await fetch(`${import.meta.env.VITE_BASE_URL}/api/memberships/renew`, {
				method: 'POST',
				body: JSON.stringify({
					userId,
					membershipActivation,
					membershipExpiry,
					membershipStatus,
					paymentType
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const response2 = await fetch(`${import.meta.env.VITE_BASE_URL}/api/orders/purchase`, {
				method: 'POST',
				body: JSON.stringify({
					userId: userData.userId,
					cart: [product],
					paymentType,
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const resMembership = await response1.json();
			const resOrder = await response2.json();
			//console.log(response1, response2)

			if (response1.status == 200 && response2.status == 200) {
				return { action: 'renewMembership', success: true, message: "tessera rinnovata con successo" };
			} else {
				console.log(resMembership.message, resOrder.message);
				return { action: 'renewMembership', success: false, message: "errore rinnovo tessera" };
			}
		} catch (error) {
			console.error('Error creating new membership:', error);
			return { action: 'renewMembership', success: false, message: 'Errore creazione renewMembership' };
		}
	},

} satisfies Actions;