import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY, SALT } from '$env/static/private';
import { error, fail } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	let getMembership = [];

	const user = locals.user
	const membershipFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'product', //product | order | user | layout | discount
			//query: { type: 'membership' },
			query: {
				$or: [
					{ title: 'Socio vitalizio' },
					{ title: 'Socio ordinario' }
				],
				type: 'membership' //IF USE Products.model -> types: course / product / membership / event
			},
			projection: { _id: 0 }, // 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 100,
			skip: 0,
		}),
		headers: {
			'Content-Type': 'application/json'
		},
	});

	try {
		const membershipRes = await membershipFetch;
		if (membershipRes.status != 200) {
			console.error('user fetch failed', membershipRes.status, await membershipRes.text());
			throw error(400, 'membershipFetch failed');
		}
		getMembership = await membershipRes.json();

	} catch (error) {
		console.log('membershipFetch error:', error);
		throw error(500, 'Server error');
	}
	// if (locals.auth) {
	// 	user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
	// 	user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
	// 	user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	// }
	return {
		userData: user,
		auth: locals.auth,
		getMembership
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
		const membershipLevel = formData.get('membershipLevel') || '';
		const password1: any = formData.get('password1') || '';
		const password2 = formData.get('password2') || '';
		const totalValue = formData.get('totalValue');
		// const cart = formData.get('cart');
		// const cartItem = JSON.parse(String(cart)) || null;

		const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { email },
				projection: { email: 1 },
				sort: { createdAt: -1 },
				limit: 1,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})

		const membershipFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { type: 'membership', title: membershipLevel }, //IF USE Products.model -> type: course / product / membership / event
				projection: { _id: 0, userView: 0, layoutView: 0 }, // 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1,
				skip: 0,
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		//const file = formData.get('image') || '';
		//console.log(name, surname, email, address, city, county, postalCode, country, phone, mobilePhone, payment, password1, password2, totalValue);
		let currentUserId: string = locals.user?.userId ?? '';
		let membership: any[] = [];
		let userExist = false;

		if (!name || !surname || !email || !address || !city || !county || !postalCode || !country || !payment || !totalValue) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		if (!locals.auth && (password1 != password2)) {
			return fail(400, { action: 'new', success: false, message: 'Password non corrispondenti' });
		}

		if (!locals.auth && (password1 == '' || password2 == '')) {
			return fail(400, { action: 'new', success: false, message: 'Password non valide' });
		}

		if (!locals.auth) {
			try {
				const membershipRes = await membershipFetch
				if (membershipRes.status != 200) {
					return fail(400, { action: 'new', success: false, message: await membershipRes.text() });
				}
				membership = await membershipRes.json()

				if (membership.length < 1) {
					return fail(400, { action: 'new', success: false, message: "Missing membership" });
				}

				const userRes = await userFetch
				if (userRes.status != 200) {
					console.error('user fetch failed', userRes.status, await userRes.text());
					return fail(400, { action: 'new', success: false, message: 'errore database user' });
				}
				const response = await userRes.json();
				if (response.length > 0) {
					userExist = true;
					return fail(400, { action: 'new', success: false, message: 'email esistente' });
				}
			} catch (error) {
				console.log('userCheck error:', error);
			}
			if (!userExist) {
				try {
					const cookieId = crypto.randomUUID()
					const res = await fetch(`${BASE_URL}/api/mongo/create`, {
						method: 'POST',
						body: JSON.stringify({
							apiKey: APIKEY,
							schema: 'user', //product | order | user | layout | discount
							newDoc: {
								userId: nanoid(),
								userCode: crypto.randomUUID(),
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
								password: hash(password1, SALT),
								cookieId,
								// "membership.membershipLevel": 'Socio ordinario',
								// "membership.membershipSignUp": new Date(),
								// "membership.membershipActivation": new Date(),
								// "membership.membershipExpiry": new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
								// "membership.membershipStatus": true
							},
							returnObj: true
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

					cookies.set('session_id', cookieId, {
						httpOnly: true,
						//maxAge: 60 * 60 * 24 * 7 // one week
						maxAge: 60 * 60 * 24, // one day
						sameSite: 'strict',
						secure: process.env.NODE_ENV === 'production',
						path: '/'
					});

				} catch (err) {
					console.error('Error creating new user:', err);
					return fail(400, { action: 'user', success: false, message: 'Error new user' });
				}
			}
		}

		try {
			const newDoc = {
				// orderId: nanoid(),
				// orderCode: crypto.randomUUID(),
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
				// totalValue: Number(totalValue),
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
				//cart: [cartItem]
			};

			if (!userExist && membership.length > 0) {
				// Membership order
				const resMembership = await fetch(`${BASE_URL}/api/mongo/create`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'order', //product | order | user | layout | discount
						newDoc: {
							orderId: nanoid(),
							orderCode: crypto.randomUUID(),
							totalValue: Number(membership[0]?.price || 25.00),
							...newDoc,
							cart: membership
						},
						returnObj: false
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});
				if (!resMembership.ok) {
					return fail(400, { action: 'new', success: false, message: await resMembership.text() });
				}
			}

			if (locals.auth) {
				return { action: 'new', success: true, message: "L'ordine è stato inviato. Controlla lo storico nel tuo profilo", payload: { redirect: false } };
			} else {
				return { action: 'new', success: true, message: "Benvenuto! L'ordine è stato inviato. Tra poco verrai reindirizzato sul tuo profilo.", payload: { redirect: true } };
			}

		} catch (error) {
			console.error('Error creating new order:', error);
			return fail(400, { action: 'new', success: false, message: 'Error new order' });
		}
	},

	renew: async ({ request, fetch, locals }) => {
		const userData = locals.user;
		const userId = userData.userId;

		const formData = await request.formData();
		const payment = formData.get('payment');

		let newExpire = new Date()

		if (!userData.name || !userData.surname || !userData.email || !userData.address ||
			!userData.city || !userData.county || !userData.postalCode || !userData.country) {
			return fail(400, { action: 'renew', success: false, message: 'Dati utente incompleti' });
		}

		if (userData.membership && userData.membership.membershipStatus) {
			const currentExpiryDate = new Date(userData.membership.membershipExpiry); // Conversion date string to Date obj
			currentExpiryDate.setFullYear(currentExpiryDate.getFullYear() + 1);
			newExpire = currentExpiryDate;
		} else {
			newExpire = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
		}

		const updateFetch = await fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId: userId },
				update: {
					$set: {
						'membership.membershipExpiry': newExpire,
						'membership.membershipStatus': true,
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const membershipFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { type: 'membership', title: 'Socio ordinario' }, //IF USE Products.model -> type: course / product / membership / event
				projection: { _id: 0, userView: 0, layoutView: 0 }, // 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1,
				skip: 0,
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		const orderFetch = (membership) => fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'order', //product | order | user | layout | discount
				newDoc: {
					orderId: nanoid(),
					orderCode: crypto.randomUUID(),
					userId: userData.userId,
					status: 'requested',
					orderDate: new Date(),
					orderConfirmDate: null,
					promotionId: '',
					promotionName: '',
					promoterId: '',
					agencyId: '',
					orderConfirmed: false,
					totalPoints: 0,
					totalValue: Number(membership[0]?.price || 25.00),
					totalVAT: 0,
					browser: '',
					orderIp: '',
					orderNotes: '',
					invoicing: {
						name: userData.name,
						surname: userData.surname,
						businessName: '',
						vatNumber: '',
						address: userData.address,
						city: userData.city,
						county: userData.county,
						postalCode: userData.postalCode,
						state: '',
						region: '',
						country: userData.country,
						invoiceNotes: '',
						email: userData.email,
						phone: userData.phone,
						mobilePhone: userData.mobilePhone
					},
					shipping: {
						name: userData.name,
						surname: userData.surname,
						address: userData.address,
						city: userData.city,
						county: userData.county,
						postalCode: userData.postalCode,
						state: '',
						region: '',
						country: userData.country,
						deliveryNotes: '',
						email: userData.email,
						phone: userData.phone,
						mobilePhone: userData.mobilePhone,
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
					cart: membership
				},
				returnObj: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!payment || !locals.auth) {
			return fail(400, { action: 'renew', success: false, message: 'Dati mancanti' });
		}

		try {
			const resMembership = await membershipFetch;
			if (!resMembership.ok) {
				return fail(400, { action: 'renew', success: false, message: await resMembership.text() });
			}
			const membership = await resMembership.json();

			const orderFetchRes = await orderFetch(membership);
			if (!orderFetchRes.ok) {
				return fail(400, { action: 'renew', success: false, message: await orderFetchRes.text() });
			}

			const resUpdate = await updateFetch;
			if (!resUpdate.ok) {
				return fail(400, { action: 'renew', success: false, message: await resUpdate.text() });
			}

			return { action: 'renew', success: true, message: "tessera rinnovata con successo" };

		} catch (err) {
			console.error('Error renew membership:', err);
			return { action: 'renew', success: false, message: 'Error renew' };
		}
	},

} satisfies Actions;