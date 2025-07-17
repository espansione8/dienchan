import type { PageServerLoad, Actions } from './$types';
import type { CartItem, DiscountItem } from '$lib/types';
import { BASE_URL, APIKEY, SALT, STRIPE_KEY_FRONT, STRIPE_KEY_BACK } from '$env/static/private';
import { error, fail } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import { customAlphabet } from 'nanoid';
import Stripe from 'stripe';
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12);
const stripe = new Stripe(STRIPE_KEY_BACK, {
	apiVersion: '2025-06-30.basil' // Use a stable API version
});

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	//console.log('stripe:', STRIPE_KEY_FRONT);

	let getCourse = [];
	let formatoreData = [];
	//let kitProducts = [];

	const courseFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'product', //product | order | user | layout | discount
			query: { prodId: params.idCourse, type: 'course' }, //IF USE Products.model -> types: course / product / membership / event
			projection: { _id: 0 }, // 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const userFetch = (id: string) =>
		fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId: id }, //IF USE Products.model -> types: course / product / membership / event
				projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

	// const kitFetch = (kitProducts: Array<string>) => fetch(`${BASE_URL}/api/mongo/find`, {
	// 	method: 'POST',
	// 	body: JSON.stringify({
	// 		apiKey: APIKEY,
	// 		schema: 'product', //product | order | user | layout | discount
	// 		query: { prodId: { $in: kitProducts }, type: 'product' },
	// 		projection: { _id: 0 },
	// 		sort: { createdAt: -1 },
	// 		limit: 1000,
	// 		skip: 0
	// 	}),
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	}
	// })

	try {
		const courseRes = await courseFetch;
		// 
		if (!courseRes.ok) {
			console.error('course fetch failed', courseRes.status, await courseRes.text());
			throw error(400, 'course fetch failed');
		}
		getCourse = await courseRes.json();
		// 
		getCourse = getCourse.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

		// const kitRes = await kitFetch(getCourse[0].bundleProducts);
		// 
		// if (!kitRes.ok) {
		// 	console.error('kit fetch failed', kitRes.status, await kitRes.text());
		// 	throw error(400, 'kit fetch failed');
		// 
		// }
		// kitProducts = await kitRes.json();
		// console.log('kitProducts', kitProducts);

		const userRes = await userFetch(getCourse[0].userId);
		// 
		if (!userRes.ok) {
			console.error('user fetch failed', userRes.status, await userRes.text());
			throw error(400, 'user fetch failed');
		}
		formatoreData = await userRes.json();
		// 
	} catch (error) {
		console.log('getCourse fetch error:', error);
		throw error(500, 'Server error');
	}

	return {
		getCourse: getCourse[0],
		formatoreData: formatoreData[0] ?? null,
		// 
		auth: locals.auth,
		userData: locals.user,
		bundleProducts: getCourse[0].layoutView?.bundleProducts ?? [],
		stripePublishableKey: STRIPE_KEY_FRONT
	};
};
// calculate discount for a single item used in applyDiscount/removeDiscount
const calculateItemDiscount = (
	discount: DiscountItem,
	cartArray: CartItem[],
	originalTotal: number
): number => {
	const { type, value, selectedApplicability } = discount;
	// 
	let totalDiscount = 0;

	if (selectedApplicability === 'prodId' || selectedApplicability === 'layoutId') {
		cartArray.forEach((item: CartItem) => {
			const isProduct = selectedApplicability === 'prodId' && item.prodId === discount.prodId;
			const isLayout =
				selectedApplicability === 'layoutId' && item.layoutView?.layoutId === discount.layoutId;

			if (isProduct || isLayout) {
				const qty =
					typeof item.orderQuantity === 'number' && item.orderQuantity > 0 ? item.orderQuantity : 1;
				let itemDiscount = 0;
				if (type === 'amount') {
					itemDiscount = value * qty;
				} else if (type === 'percent') {
					const rawPrice = isProduct ? item.price : item.layoutView.price;
					const numericPrice = Number(rawPrice);
					if (!Number.isFinite(numericPrice)) {
						throw new Error('Errore calcolo');
					}
					const singleValue = (numericPrice * value) / 100;
					itemDiscount = singleValue * qty;
				}
				totalDiscount += itemDiscount;
			}
		});
		// 
	} else if (selectedApplicability === 'email' || selectedApplicability === 'membershipLevel') {
		// User-level discounts
		if (type === 'amount') {
			totalDiscount = value;
			// 
		} else if (type === 'percent') {
			totalDiscount = (originalTotal * value) / 100;
		}
		// 
	}
	// else if (selectedApplicability === 'cart') {
	// 	// Cart-level discounts
	// 	if (type === 'amount') {
	// 		totalDiscount = value;
	// 
	// 	} else if (type === 'percent') {
	// 		totalDiscount = (originalTotal * value) / 100;
	// 	}

	return totalDiscount;
};
// 
export const actions: Actions = {
	new: async ({ request, fetch, locals, cookies }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const surname = formData.get('surname') as string;
		const email = formData.get('email') as string;
		const address = formData.get('address') as string;
		const city = formData.get('city') as string;
		const county = formData.get('county') as string;
		const postalCode = formData.get('postalCode') as string;
		const country = formData.get('country') as string;
		const phone = (formData.get('phone') as string) || '';
		const mobilePhone = (formData.get('mobilePhone') as string) || '';
		const payment = formData.get('payment') as string;
		const password1: any = (formData.get('password1') as string) || '';
		const password2 = (formData.get('password2') as string) || '';
		const totalValue = formData.get('totalValue') as string;
		const cart = formData.get('cart') as string;
		const cartItem = JSON.parse(String(cart)) || null;
		const totalDiscount = formData.get('totalDiscount') || 0;
		const paymentMethodId = formData.get('paymentMethodId') as string | null;
		const promoterId = formData.get('promoterId') as string | null;

		const bundle = formData.get('bundleProducts');

		const bundleProducts = JSON.parse(String(bundle)) || [];

		// console.log('bundleProducts', bundleProducts);
		// return { action: 'new', success: cartItem, message: JSON.stringify(cartItem), payload: { redirect: false } };

		//const file = formData.get('image') || '';
		//console.log(name, surname, email, address, city, county, postalCode, country, phone, mobilePhone, payment, password1, password2, totalValue);

		let currentUserId: string = locals.user?.userId ?? '';
		//let membership = [];
		let userExist = locals.auth;

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
		});

		const membershipFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product |order | user | layout | discount								
				query: { type: 'membership', title: 'Socio ordinario' }, //IF USE Products.model -> type: course / product / membership / event
				projection: { _id: 0, userView: 0, layoutView: 0 }, // 0: exclude | 1: 'include',
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const updateFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { type: 'course', prodId: cartItem.prodId }, // 'course', 'product', 'membership', 'event',
				update: {
					$push: {
						listSubscribers: { userId: currentUserId, email, name, surname, phone, mobilePhone }
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const updateUserFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId: currentUserId }, // 'course', 'product', 'membership', 'event',
				update: {
					$push: {
						courseJoined: cartItem.prodId
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const mailFetch = (email, order) =>
			fetch(`${BASE_URL}/api/mailer/new-order`, {
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

		if (!name || !surname || !email || !address || !city || !county || !postalCode || !country || !payment || !totalValue || !cart || !cartItem) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		if (!locals.auth && password1 !== password2) {
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

		if (!locals.auth) {
			try {
				// const membershipRes = await membershipFetch;
				// if (!membershipRes.ok) {
				// 	return fail(400, {
				// 		action: 'new',
				// 		success: false,
				// 		message: await membershipRes.text()
				// 	});
				// }
				// membership = await membershipRes.json();
				// if (membership.length < 1) {
				// 	return fail(400, { action: 'new', success: false, message: 'Missing membership' });
				// }

				const userRes = await userFetch;
				if (!userRes.ok) {
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
					const cookieId = crypto.randomUUID();
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
								cookieId
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

					if (res.status != 200) {
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
				promoterId: promoterId ? promoterId.trim() : null,
				agencyId: '',
				orderConfirmed: false,
				totalPoints: 0,
				// totalValue: Number(totalValue),
				totalVAT: 0,
				browser: '',
				orderIp: '',
				orderNotes: '',
				type: 'course',
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
					mobilePhone
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
				}
				//cart: [cartItem]
			};

			const membershipRes = await membershipFetch;
			if (!membershipRes.ok) {
				return fail(400, {
					action: 'new',
					success: false,
					message: await membershipRes.text()
				});
			}

			const membership = await membershipRes.json();

			if (membership.length < 1) {
				return fail(400, { action: 'new', success: false, message: 'Missing membership' });
			}

			let cart = [];

			if (!userExist || !locals.user?.membership.membershipStatus) {
				cart = [...bundleProducts, cartItem, membership[0]];
			} else {
				cart = [...bundleProducts, cartItem];
			}
			// console.log('cart', cart);
			// return fail(400, { action: 'new', success: false, message: `bundleProducts` });

			// TODO??? Recalculate to prevent client-side manipulation

			// Cart order
			const orderId = nanoid();
			const orderCode = crypto.randomUUID();
			const orderRes = await fetch(`${BASE_URL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order', //product | order | user | layout | discount
					newDoc: {
						orderId,
						orderCode,
						totalValue: Number(totalValue),
						totalDiscount: Number(totalDiscount),
						...newDoc,
						//cart: [cartItem]
						cart
					},
					returnObj: true
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!orderRes.ok) {
				return fail(400, { action: 'new', success: false, message: `res: ${await orderRes.text()}` });
			}
			const order = await orderRes.json();

			if (!locals.user?.membership.membershipStatus) {
				const newExpire = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
				const membershipUpdateRes = await fetch(`${BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'user', //product | order | user | layout | discount
						query: { userId: locals.user?.userId },
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

				if (!membershipUpdateRes.ok) return fail(400, { action: 'new', success: false, message: 'Error new order' });
			}

			const updateRes = await updateFetch;
			if (!updateRes.ok) {
				return fail(400, {
					action: 'new',
					success: false,
					message: `updateRes: ${await updateRes.text()}`
				});
			}

			const mailArray = [...cartItem.notificationEmail, email];
			const mailRes = await mailFetch(mailArray, order);

			if (!mailRes.ok) {
				return fail(400, {
					action: 'new',
					success: false,
					message: `mailRes: ${await mailRes.text()}`
				});
			}

			const updateUserRes = await updateUserFetch;

			if (!updateUserRes.ok) {
				return fail(400, {
					action: 'new',
					success: false,
					message: `updateUserRes: ${await updateUserRes.text()}`
				});
			}

			const updateQty = bundleProducts.map(async (item) => {
				const updateQtyRes = await fetch(`${BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'product',
						query: { prodId: item.prodId },
						update: {
							$inc: {
								stockQty: -1
							}
						},
						options: { upsert: false },
						multi: false
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (!updateQtyRes.ok) {
					const errorData = await updateQtyRes.json();
					console.error(`Failed to update prodId ${item.prodId}:`, errorData);
					throw new Error(`Failed to update stock for ${item.prodId}`); // return fail do not stop the map and don't trigger try/catch
				}
				return updateQtyRes.json();
			});

			await Promise.all(updateQty);

			if (payment === 'Carta di credito' && promoterId) {
				const id = cartItem.layoutId
				let points = 0;
				let pointsBase = 0;
				let pointsAvanzato = 0;
				if (id === 'XW7LYV2LG2BU') points = 10; // base
				if (id === '794792843') points = 40; // avanzato
				if (id === 'accademia') { // accademia
					pointsBase = 50;
					pointsAvanzato = 100;
				}

				//course type
				const userPointsFetch = await fetch(`${BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'user', //product | order | user | layout | discount
						query: { email: promoterId }, // 'course', 'product', 'membership', 'event',
						update: {
							$inc: {
								pointsBalance: points
							},
							$push: {
								pointsHistory: {
									points: points,
									note: `Commissione ${cartItem.layoutView.title} - Ordine ${orderId}`,
								}
							}
						},
						options: { upsert: false },
						multi: false
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (!userPointsFetch.ok) {
					return fail(400, {
						action: 'new',
						success: false,
						message: `userPointsFetch: ${await userPointsFetch.text()}`
					});
				}
			}

			if (locals.auth) {
				return {
					action: 'new',
					success: true,
					message: "L'ordine è stato inviato. Controlla lo storico nel tuo profilo",
					payload: { redirect: false }
				};

			} else {
				return {
					action: 'new',
					success: true,
					message:
						"Benvenuto! L'ordine è stato inviato. Tra poco verrai reindirizzato sul tuo profilo.",
					payload: { redirect: true }
				};
			}

		} catch (error) {
			console.error('Error creating new order:', error);
			return fail(400, { action: 'new', success: false, message: 'Error new order' });
		}
	},

	applyDiscount: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const discountCode = formData.get('discountCode') as string;
		const cart = formData.get('cart') as string;

		const grandTotal = formData.get('grandTotal') as string;
		const discountList = formData.get('discountList') as string;
		const originalTotal = Number(grandTotal) || 0;

		const discountArray: string[] = JSON.parse(discountList || '[]').map((item) => item.code);
		const cartArray: CartItem[] = JSON.parse(cart || '[]');

		const discountFetch = (discountCodes: string[]) =>
			fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'discount',
					query: { code: { $in: discountCodes } },
					projection: { _id: 0, password: 0 },
					sort: { createdAt: -1 },
					limit: 1000,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

		try {
			// let cartArray: CartItem[] = [];
			// try {
			// 	cartArray = JSON.parse(cart || '[]');

			// } catch {
			// 	return fail(400, { action: 'applyDiscount', success: false, message: 'Cart invalido' });

			// }

			if (!discountCode?.trim()) {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'Codice sconto richiesto'
				});
			}

			if (discountArray.includes(discountCode)) {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'Sconto già applicato'
				});
			}

			// Fetch all discounts from database that match new array
			const newDiscountArray = [...discountArray, discountCode];
			const discountRes = await discountFetch(newDiscountArray);

			const discountGroup: DiscountItem[] = await discountRes.json();
			// console.log('newDiscountArray', newDiscountArray);
			// console.log('discountGroup', discountGroup);

			// Find the specific discount being applied
			const discountItem = discountGroup.find((item: DiscountItem) => item.code === discountCode);

			if (!discountItem) {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'Codice sconto non trovato'
				});
			}

			if (discountItem.status === 'disabled') {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'Sconto non attivo'
				});
			}

			if (discountItem.selectedApplicability === 'refPoints') {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'sconto Formatore valido solo per acquisti strumenti'
				});
			}

			const validateDiscountApplicability = (
				discount: DiscountItem,
				user: any,
				cartArray: CartItem[]
			): boolean => {
				const { selectedApplicability } = discount;

				switch (selectedApplicability) {
					case 'email':
						return discount.email === user?.email;

					case 'membershipLevel':
						return discount.membershipLevel === user?.membership?.membershipLevel;

					case 'prodId':
						return cartArray.some((item) => item.prodId === discount.prodId);

					case 'layoutId':
						return cartArray.some((item) => item.layoutView?.layoutId === discount.layoutId);

					default:
						return false;
				}
			};

			if (!validateDiscountApplicability(discountItem, locals.user, cartArray)) {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'Sconto non applicabile'
				});
			}

			// Calculate all discounts
			const discountApplied = () => {
				return discountGroup.map((discount) => ({
					code: discount.code,
					totalDiscount: calculateItemDiscount(discount, cartArray, originalTotal)
				}));
			};

			return {
				action: 'applyDiscount',
				success: true,
				message: 'Sconto applicato con successo',
				payload: {
					discountApplied: discountApplied()
				}
			};
		} catch (error) {
			console.error('Error applying discount:', error);

			return fail(500, {
				action: 'applyDiscount',
				success: false,
				message: "Errore durante l'applicazione dello sconto"
			});
		}
	},

	removeDiscount: async ({ request, fetch, locals }) => {
		const discountFetch = (discountCodes: string[]) =>
			fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'discount',
					query: { code: { $in: discountCodes } },
					projection: { _id: 0, password: 0 },
					sort: { createdAt: -1 },
					limit: 1000,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

		try {
			const formData = await request.formData();
			const removeCode = formData.get('removeCode') as string;
			const grandTotal = formData.get('grandTotal') as string;

			const cart = formData.get('cart') as string;
			const discountList = formData.get('discountList') as string;
			const originalTotal = Number(grandTotal) || 0;

			const cartArray: CartItem[] = JSON.parse(cart || '[]');
			let discountArray: string[] = JSON.parse(discountList || '[]').map((item) => item.code);

			if (!removeCode?.trim()) {
				return fail(400, {
					action: 'removeDiscount',
					success: false,
					message: 'Codice sconto richiesto'
				});
			}

			// Remove the discount code from array
			discountArray = discountArray.filter((code) => code !== removeCode);

			// IF no discounts remain, return empty result
			if (discountArray.length === 0) {
				return {
					action: 'removeDiscount',
					success: true,
					message: 'Sconto rimosso con successo',
					payload: {
						discountApplied: []
					}
				};
			}

			// Fetch remaining discounts from database
			const discountRes = await discountFetch(discountArray);
			const discountGroup: DiscountItem[] = await discountRes.json();

			// Calculate remaining discounts
			const discountApplied = () => {
				return discountGroup.map((discount) => ({
					code: discount.code,
					totalDiscount: calculateItemDiscount(discount, cartArray, originalTotal)
				}));
			};

			return {
				action: 'removeDiscount',
				success: true,
				message: 'Sconto rimosso con successo',
				payload: {
					discountApplied: discountApplied()
				}
			};
		} catch (error) {
			console.error('Error removing discount:', error);

			return fail(500, {
				action: 'removeDiscount',
				success: false,
				message: 'Errore durante la rimozione dello sconto'
			});
		}
	},

	applyEmailRef: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const discountCode = formData.get('discountCode') as string; // email formatore

		try {
			const userFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', //product | order | user | layout | discount
					query: { email: discountCode.trim() }, //IF USE Products.model -> types: course / product / membership / event
					projection: { _id: 0, email: 1 }, // 0: exclude | 1: include
					sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
					limit: 1,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!userFetch.ok) {
				return fail(400, {
					action: 'applyEmailRef',
					success: false,
					message: 'Utente non trovato'
				});
			}

			const user = await userFetch.json();

			if (user.length === 0) {
				return fail(400, {
					action: 'applyEmailRef',
					success: false,
					message: 'Utente non trovato'
				});
			}

			return {
				action: 'applyEmailRef',
				success: true,
				message: 'Codice amico applicato con successo',
				payload: discountCode.trim()
			};

		} catch (error) {
			console.error('Error applying applyEmailRef:', error);

			return fail(500, {
				action: 'applyEmailRef',
				success: false,
				message: "Errore durante l'applicazione dello sconto"
			});
		}
	},
};