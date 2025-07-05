import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY, SALT, STRIPE_KEY_FRONT, STRIPE_KEY_BACK } from '$env/static/private';
import { error, fail } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import { customAlphabet } from 'nanoid'
import Stripe from 'stripe';
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)
const stripe = new Stripe(STRIPE_KEY_BACK, {
	apiVersion: '2025-06-30.basil' // Use a stable API version
});

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
		getMembership,
		stripePublishableKey: STRIPE_KEY_FRONT
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
		const paymentMethodId = formData.get('paymentMethodId') as string | null;

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

		const vitalizioFetch = (userId) => fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId: userId },
				update: {
					$set: {
						'membership.membershipLevel': 'Socio vitalizio',
						'membership.membershipStatus': true,
						'membership.membershipExpiry': new Date(Date.now() + 36500 * 24 * 60 * 60 * 1000),
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const mailFetch = (email, order) => fetch(`${BASE_URL}/api/mailer/new-order`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				email,
				order
			}),
			headers: {
				'Content-Type': 'application/json'
			}
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

		// Stripe payment processing
		let paymentIntentId: string | null = null;
		if (payment === 'Carta di credito') {
			if (!paymentMethodId) {
				return fail(400, {
					action: 'new',
					success: false,
					message: 'ID metodo di pagamento non valido.'
				});
			}

			const amountInCents = Math.round(Number(totalValue) * 100);

			try {
				const paymentIntent = await stripe.paymentIntents.create({
					amount: amountInCents,
					currency: 'eur',
					payment_method: paymentMethodId,
					confirm: true,
					automatic_payment_methods: { enabled: true, allow_redirects: 'never' }
				});
				// console.log('paymentIntent.status', paymentIntent.status)
				//paymentIntentId = paymentIntent.id;

				if (paymentIntent.status === 'succeeded') {
					paymentIntentId = paymentIntent.id;
				} else {
					return fail(400, {
						action: 'new',
						success: false,
						message: `Pagamento fallito: ${paymentIntent.status}`
					});
				}

			} catch (err: any) {
				console.error('Stripe error:', err);
				return fail(400, {
					action: 'new',
					success: false,
					message: `Pagamento fallito: ${err.message}`
				});
			}
		}

		try {
			const membershipRes = await membershipFetch
			if (!membershipRes.ok) {
				return fail(400, { action: 'new', success: false, message: await membershipRes.text() });
			}
			membership = await membershipRes.json()
			if (membership.length < 1) {
				return fail(400, { action: 'new', success: false, message: "Missing membership" });
			}

			if (!locals.auth) {
				const userRes = await userFetch
				if (!userRes.ok) {
					console.error('user fetch failed', userRes.status, await userRes.text());
					return fail(400, { action: 'new', success: false, message: 'errore database user' });
				}
				const response = await userRes.json();
				if (response.length > 0) {
					userExist = true;
					return fail(400, { action: 'new', success: false, message: 'email esistente' });
				}

				const cookieId = crypto.randomUUID()
				const resNewUser = await fetch(`${BASE_URL}/api/mongo/create`, {
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
				if (!resNewUser.ok) {
					return fail(400, { action: 'resNewUser', success: false, message: await resNewUser.text() });
				}
				const newUser = await resNewUser.json();
				currentUserId = newUser.userId;

				userExist = true;

				cookies.set('session_id', cookieId, {
					httpOnly: true,
					//maxAge: 60 * 60 * 24 * 7 // one week
					maxAge: 60 * 60 * 24, // one day
					sameSite: 'strict',
					secure: process.env.NODE_ENV === 'production',
					path: '/'
				});
			} else {
				currentUserId = locals.user.userId
				userExist = true
			}
			// } catch (error) {
			// 	console.log('userCheck error:', error);
			// }

			// try {
			const newDoc = {
				// orderId: nanoid(),
				// orderCode: crypto.randomUUID(),
				userId: currentUserId,
				status: 'requested',
				type: 'membership',
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
					statusPayment: paymentIntentId ? 'done' : 'pending',
					transactionId: paymentIntentId || '',
					points: '',
					value: ''
				},
				//cart: [cartItem]
			};
			//console.log(userExist, membershipLevel, membership);

			if (!userExist || membership.length < 1) return fail(400, { action: 'new', success: false, message: "Errore Ordine" })

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
					returnObj: true
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!resMembership.ok) {
				return fail(400, { action: 'new', success: false, message: await resMembership.text() });
			}

			if (membershipLevel === 'Socio vitalizio') {
				const resVitalizio = await vitalizioFetch(currentUserId);
				if (!resVitalizio.ok) {
					return fail(400, { action: 'new', success: false, message: await resVitalizio.text() });
				}
			}

			const order = await resMembership.json();
			const mailRes = await mailFetch(email, order);
			//console.log('mailRes', mailRes);

			if (!mailRes.ok) {
				return fail(400, { action: 'new', success: false, message: await mailRes.text() });
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
		const paymentMethodId = formData.get('paymentMethodId') as string | null;

		let newExpire = new Date()

		let paymentIntentId: string | null = null;

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

		if (!payment || !locals.auth) {
			return fail(400, { action: 'renew', success: false, message: 'Dati mancanti' });
		}

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
					totalValue: Number(membership[0]?.price),
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
						statusPayment: paymentIntentId ? 'done' : 'pending',
						transactionId: paymentIntentId || '',
						points: '',
						value: ''
					},
					cart: membership
				},
				returnObj: true
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const updateFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId: userId },
				update: {
					$set: {
						'membership.membershipLevel': 'Socio ordinario',
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

		const mailFetch = (email, order) => fetch(`${BASE_URL}/api/mailer/new-order`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				email,
				order
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const resMembership = await membershipFetch;
			if (!resMembership.ok) {
				return fail(400, { action: 'renew', success: false, message: await resMembership.text() });
			}
			const membership = await resMembership.json();

			// Stripe payment processing
			if (payment === 'Carta di credito') {
				if (!paymentMethodId) {
					return fail(400, {
						action: 'renew',
						success: false,
						message: 'ID metodo di pagamento non valido.'
					});
				}

				const amountInCents = Math.round(Number(membership[0]?.price) * 100);

				try {
					const paymentIntent = await stripe.paymentIntents.create({
						amount: amountInCents,
						currency: 'eur',
						payment_method: paymentMethodId,
						confirm: true,
						automatic_payment_methods: { enabled: true, allow_redirects: 'never' }
					});
					if (paymentIntent.status === 'succeeded') {
						paymentIntentId = paymentIntent.id;
					} else {
						return fail(400, {
							action: 'renew',
							success: false,
							message: `Pagamento fallito: ${paymentIntent.status}`
						});
					}
				} catch (err: any) {
					console.error('Stripe error:', err);
					return fail(400, {
						action: 'renew',
						success: false,
						message: `Pagamento fallito: ${err.message}`
					});
				}
			}

			const orderFetchRes = await orderFetch(membership);
			if (!orderFetchRes.ok) {
				return fail(400, { action: 'renew', success: false, message: await orderFetchRes.text() });
			}

			const resUpdate = await updateFetch;
			if (!resUpdate.ok) {
				return fail(400, { action: 'renew', success: false, message: await resUpdate.text() });
			}

			const order = await orderFetchRes.json();
			const mailRes = await mailFetch(userData.email, order);
			//console.log('mailRes', await mailRes.json());

			if (!mailRes.ok) {
				return fail(400, { action: 'renew', success: false, message: await mailRes.text() });
			}

			return { action: 'renew', success: true, message: "tessera rinnovata con successo" };

		} catch (err) {
			console.error('Error renew membership:', err);
			return { action: 'renew', success: false, message: 'Error renew' };
		}
	},

} satisfies Actions;