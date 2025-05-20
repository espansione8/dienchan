import type { PageServerLoad, Actions } from './$types'
import { fail } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import { customAlphabet } from 'nanoid'
const apiKey = import.meta.env.VITE_APIKEY;
const salt = import.meta.env.VITE_SALT;

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	let getCourse = [];
	let userData = [];
	try {
		const query = { prodId: params.idCourse, type: 'course' }; //IF USE Products.model -> types: course / product / membership / event
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
		if (!res.ok) {
			console.error('getCourse fetch failed', res.status, await res.text());
			return;
		}
		const response = await res.json();
		getCourse = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

	} catch (error) {
		console.log('getCourse fetch error:', error);
	}
	if (locals.auth) {
		try {
			const query = { userId: locals.user.userId };
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
			if (!res.ok) {
				console.error('user fetch failed', res.status, await res.text());
				return;
			}
			const response = await res.json();
			userData = response.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10)
			}));
		} catch (error) {
			console.log('userfetch error:', error);
		}
	}
	return {
		getCourse: getCourse[0],
		userData: userData[0] ?? null,
		auth: locals.auth
	};
}

export const actions: Actions = {
	new: async ({ request, fetch, locals, cookies }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const address = formData.get('address');
		const city = formData.get('city');
		const county = formData.get('county');
		const postalCode = formData.get('postalCode');
		const country = formData.get('country');
		const phone = formData.get('phone') || '';
		const mobilePhone = formData.get('mobilePhone') || '';
		const payment = formData.get('payment');
		const password1 = formData.get('password1') || '';
		const password2 = formData.get('password2') || '';
		const totalValue = formData.get('totalValue');
		const cart = formData.get('cart');
		const cartItem = JSON.parse(String(cart)) || null;

		//const file = formData.get('image') || '';
		//console.log(name, surname, email, address, city, county, postalCode, country, phone, mobilePhone, payment, password1, password2, totalValue);
		let currentUserId: string = locals.user?.userId ?? '';

		if (!locals.auth && (password1 != password2)) {
			return fail(400, { action: 'new', success: false, message: 'Password non corrispondenti' });
		}

		if (!locals.auth && (password1 == '' || password2 == '')) {
			return fail(400, { action: 'new', success: false, message: 'Password non valide' });
		}

		if (!name || !surname || !email || !address || !city || !county || !postalCode || !country || !payment || !totalValue || !cart) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		if (!locals.auth) {
			let userExist = false;
			try {
				const query = { email };
				const projection = { _id: 0, email: 1 } // 0: exclude | 1: include
				const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
				const limit = 1;
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
					return fail(400, { action: 'new', success: false, message: 'errore database user' });
				}
				const response = await res.json();
				if (response.length > 0) {
					userExist = true;
					return fail(400, { action: 'new', success: false, message: 'email esistente' });
				}
			} catch (error) {
				console.log('userCheck error:', error);
			}
			if (!userExist) {
				try {
					const userId = nanoid() // OLD stringHash(crypto.randomUUID());
					///console.log('new userId', userId);
					const userCode = crypto.randomUUID()
					const cookieId = crypto.randomUUID()
					const returnObj = true
					const newDoc = {
						userId,
						userCode,
						name,
						surname,
						email,
						address,
						postalCode,
						city,
						county,
						country,
						phone,
						mobilePhone,
						password: hash(password1, salt),
						cookieId,
						// "membership.membershipLevel": 'Socio ordinario',
						// "membership.membershipSignUp": new Date(),
						// "membership.membershipActivation": new Date(),
						// "membership.membershipExpiry": new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
						// "membership.membershipStatus": true
					};

					const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/create`, {
						method: 'POST',
						body: JSON.stringify({
							apiKey,
							schema: 'user', //product | order | user | layout | discount
							newDoc,
							returnObj
						}),
						headers: {
							'Content-Type': 'application/json'
						}
					});
					if (!res.ok) {
						return fail(400, { action: 'user', success: false, message: await res.text() });
					}
					const response = await res.json();
					currentUserId = response.userId;
					//console.log('response1', response);


					if (res.status == 200) {
						cookies.set('session_id', cookieId, {
							httpOnly: true,
							//maxAge: 60 * 60 * 24 * 7 // one week
							maxAge: 60 * 60 * 24, // one day
							sameSite: 'strict',
							secure: process.env.NODE_ENV === 'production',
							path: '/'
						});
					} else {
						return fail(400, { action: 'user', success: false, message: response.message });
					}
				} catch (error) {
					console.error('Error creating new user:', error);
					return fail(400, { action: 'user', success: false, message: 'Error new user' });
				}
			}
		}

		try {
			const orderId = nanoid() // OLD stringHash(crypto.randomUUID());
			const orderCode = crypto.randomUUID()
			const returnObj = false
			const newDoc = {
				orderId,
				orderCode,
				userId: currentUserId,
				status: 'requested',
				orderDate: new Date(),
				orderConfirmDate: null,
				promotionId: '',
				promotionName: '',
				promoterId: '',
				agencyId: '',
				orderConfirmed: false,
				totalPoints: 0,
				totalValue: Number(totalValue),
				totalVAT: 0,
				browser: '',
				orderIp: '',
				orderNotes: '',
				invoicing: {
					name,
					surname,
					businessName: '',
					vatNumber: '',
					address,
					city,
					county,
					postalCode,
					state: '',
					region: '',
					country,
					invoiceNotes: '',
					email,
					phone,
					mobilePhone
				},
				shipping: {
					name,
					surname,
					address,
					city,
					county,
					postalCode,
					state: '',
					region: '',
					country,
					deliveryNotes: '',
					email,
					phone,
					mobilePhone,
					// tracking: {
					// 	company: '',
					// 	trackingNumber: '',
					// 	trackingLink: '',
					// 	status: '',
					// 	estimatedDelivery: new Date()
					// }
				},
				payment: {
					method: payment,
					statusPayment: 'pending',
					transactionId: '',
					points: '',
					value: ''
				},
				cart: [cartItem]
			};

			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'order', //product | order | user | layout | discount
					newDoc,
					returnObj
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();
			//console.log('response2', response);

			if (res.status == 200) {
				if (locals.auth) {
					return { action: 'new', success: true, message: response.message, payload: true };
				} else {
					return { action: 'new', success: true, message: response.message, payload: false };
				}
			} else {
				return fail(400, { action: 'new', success: false, message: response.message });
			}
		} catch (error) {
			console.error('Error creating new order:', error);
			return fail(400, { action: 'new', success: false, message: 'Error new order' });
		}
	}
} satisfies Actions;