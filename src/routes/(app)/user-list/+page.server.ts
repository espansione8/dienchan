import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'
import { pageAuth } from '$lib/pageAuth';

const apiKey = import.meta.env.VITE_APIKEY;

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	try {
		const query = {};
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
		if (res.status != 200) {
			console.error('user fetch failed', res.status, await res.text());
			return
		}
		const response = await res.json();
		getTable = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));
	} catch (error) {
		console.log('userfetch error:', error);
	}
	const reflexologists = [
		{
			id: '1',
			name: 'Marco',
			surname: 'Rossi',
			province: 'Milano',
			city: 'Milano',
			phone: '+39 333 1234567',
			email: 'marco.rossi@example.com',
			profileImage: '/images/michael-dam-mEZ3PoFGs_k-unsplash.jpg',
			yearsOfExperience: 8,
			rating: 4.8,
			specialties: ['Riflessologia facciale', 'Massaggio terapeutico'],
			joinDate: '2020-03-15'
		},
		{
			id: '2',
			name: 'Laura',
			surname: 'Bianchi',
			province: 'Roma',
			city: 'Roma',
			phone: '+39 333 7654321',
			email: 'laura.bianchi@example.com',
			profileImage: '/images/successkid.jpg',
			yearsOfExperience: 12,
			rating: 4.9,
			specialties: ['Riflessologia facciale', 'Diện Chẩn avanzato'],
			joinDate: '2018-06-22'
		},
		{
			id: '3',
			name: 'Giovanni',
			surname: 'Verdi',
			province: 'Torino',
			city: 'Torino',
			phone: '+39 333 9876543',
			email: 'giovanni.verdi@example.com',
			profileImage: '/images/d3151a34-491e-4c12-a689-32d95305e599.jpeg',
			yearsOfExperience: 5,
			rating: 4.5,
			specialties: ['Diện Chẩn base', 'Bellezza Viso'],
			joinDate: '2021-11-10'
		},
		{
			id: '4',
			name: 'Francesca',
			surname: 'Neri',
			province: 'Firenze',
			city: 'Firenze',
			phone: '+39 333 2468101',
			email: 'francesca.neri@example.com',
			profileImage: '/images/michael-dam-mEZ3PoFGs_k-unsplash.jpg',
			yearsOfExperience: 15,
			rating: 5.0,
			specialties: ['Riflessologia facciale', 'Diện Chẩn avanzato', 'Formazione'],
			joinDate: '2015-04-18'
		},
		{
			id: '5',
			name: 'Antonio',
			surname: 'Marrone',
			province: 'Napoli',
			city: 'Napoli',
			phone: '+39 333 1357924',
			email: 'antonio.marrone@example.com',
			profileImage: '/images/successkid.jpg',
			yearsOfExperience: 7,
			rating: 4.6,
			specialties: ['Diện Chẩn base', 'Massaggio terapeutico'],
			joinDate: '2019-08-30'
		},
		{
			id: '6',
			name: 'Giulia',
			surname: 'Ricci',
			province: 'Bologna',
			city: 'Bologna',
			phone: '+39 333 8642097',
			email: 'giulia.ricci@example.com',
			profileImage: '/images/d3151a34-491e-4c12-a689-32d95305e599.jpeg',
			yearsOfExperience: 10,
			rating: 4.7,
			specialties: ['Riflessologia plantare', 'Tecniche di rilassamento'],
			joinDate: '2017-02-14'
		},
		{
			id: '7',
			name: 'Paolo',
			surname: 'Esposito',
			province: 'Milano',
			city: 'Monza',
			phone: '+39 333 5792468',
			email: 'paolo.esposito@example.com',
			profileImage: '/images/michael-dam-mEZ3PoFGs_k-unsplash.jpg',
			yearsOfExperience: 6,
			rating: 4.4,
			specialties: ['Diện Chẩn base'],
			joinDate: '2020-10-05'
		},
		{
			id: '8',
			name: 'Chiara',
			surname: 'Romano',
			province: 'Roma',
			city: 'Ostia',
			phone: '+39 333 9753102',
			email: 'chiara.romano@example.com',
			profileImage: '/images/successkid.jpg',
			yearsOfExperience: 9,
			rating: 4.8,
			specialties: [
				'Riflessologia facciale',
				'Diện Chẩn avanzato',
				'Riflessologia facciale',
				'Diện Chẩn avanzato',
				'Riflessologia facciale',
				'Diện Chẩn avanzato'
			],
			joinDate: '2018-12-01'
		}
	]
	return {
		getTable,
		reflexologists
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
		const level = formData.get('level') || '';


		if (!name || !surname || !email || !address || !postalCode || !city || !countryState || !country || !phone || !mobilePhone || !password1 || !level) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
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
					password1,
					level
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
		const level = formData.get('level') || '';
		const namePublic = !!(formData.get('namePublic'));
		const surnamePublic = !!(formData.get('surnamePublic'));
		const emailPublic = !!(formData.get('emailPublic') || '');
		const addressPublic = !!(formData.get('addressPublic') || '');
		const cityPublic = !!(formData.get('cityPublic') || '');
		const statePublic = !!(formData.get('statePublic') || '');
		const postalCodePublic = !!(formData.get('postalCodePublic') || '');
		const countryPublic = !!(formData.get('countryPublic') || '');
		const phonePublic = !!(formData.get('phonePublic') || '');
		const mobilePhonePublic = !!(formData.get('mobilePhonePublic') || '');

		if (!name || !surname || !email || !address || !postalCode || !city || !countryState || !country || !phone || !mobilePhone || !level) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}

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
	},

	disableUser: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const status = formData.get('status');
		if (!userId) {
			return fail(400, { action: 'disableUser', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
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
				return { action: 'filterUser', success: false, message: 'Utente non trovato' };
			}
		} catch (error) {
			console.error('Error filterUser:', error);
			return { action: 'filterUser', success: false, message: 'Errore filterUser' };
		}
	}
} satisfies Actions;
