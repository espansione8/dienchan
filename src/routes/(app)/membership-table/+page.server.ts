import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'
//import type { Locals, MembershipProduct } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}

	let getTable = [];
	try {
		const path = `${import.meta.env.VITE_BASE_URL}/api/products/find/type/membership/0/0`

		// ADMIN course
		const resGetTable = await fetch(path);
		const resGetTableProducts = await resGetTable.json();
		getTable = resGetTableProducts.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

	} catch (error) {
		console.log('membershipfetch error:', error);
	}

	const user = locals.data
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
	newMembership: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const descrShort = formData.get('descrShort');
		const price = formData.get('price');
		const renewalLength = formData.get('renewalLength');
		const userId = locals.data.userId
		if (!title || !price || !renewalLength || !userId) {
			return fail(400, { action: 'newMembership', success: false, message: 'Dati mancanti' });
		}
		//console.log('newMembership', title, descrShort, price, renewalLength, userId);
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/newProds`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					type: 'membership',
					title,
					descrShort,
					price,
					renewalLength,
					userId
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'newMembership', success: true, message: result.message };
			} else {
				return { action: 'newMembership', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new membership:', error);
			return { action: 'newMembership', success: false, message: 'Errore creazione membership' };
		}
	},
	//TODO
	filterSearch: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const descrShort = formData.get('descrShort');
		const price = formData.get('price');
		const renewalLength = formData.get('renewalLength');
		const userId = locals.data.userId
		if (!title || !price || !renewalLength || !userId) {
			return fail(400, { action: 'newMembership', success: false, message: 'Dati mancanti' });
		}
		//console.log('newMembership', title, descrShort, price, renewalLength, userId);
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/newProds`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					type: 'membership',
					title,
					descrShort,
					price,
					renewalLength,
					userId
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'newMembership', success: true, message: result.message };
			} else {
				return { action: 'newMembership', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new membership:', error);
			return { action: 'newMembership', success: false, message: 'Errore creazione membership' };
		}
	}
} satisfies Actions;