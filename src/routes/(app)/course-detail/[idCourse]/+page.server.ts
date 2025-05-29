import type { PageServerLoad, Actions } from './$types'
import type { CartItem, DiscountItem } from '$lib/types';
import { BASE_URL, APIKEY, SALT } from '$env/static/private';
import { error, fail } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	let getCourse = [];
	let userData = [];

	const courseFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'product', //product | order | user | layout | discount
			query: { prodId: params.idCourse, type: 'course' }, //IF USE Products.model -> types: course / product / membership / event
			projection: { _id: 0 }, // 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1,
			skip: 0,
		}),
		headers: {
			'Content-Type': 'application/json'
		},
	});
	const userFetch = (id: string) => fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'user', //product | order | user | layout | discount
			query: { userId: id }, //IF USE Products.model -> types: course / product / membership / event
			projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1,
			skip: 0,
		}),
		headers: {
			'Content-Type': 'application/json'
		},
	});

	try {
		const courseRes = await courseFetch;
		if (courseRes.status != 200) {
			console.error('course fetch failed', courseRes.status, await courseRes.text());
			throw error(400, 'course fetch failed');
		}
		getCourse = await courseRes.json();
		getCourse = getCourse.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

		const userRes = await userFetch(getCourse[0].userId);
		if (userRes.status != 200) {
			console.error('user fetch failed', userRes.status, await userRes.text());
			throw error(400, 'course fetch failed');
		}
		userData = await userRes.json();

	} catch (error) {
		console.log('getCourse fetch error:', error);
		throw error(500, 'Server error');
	}

	return {
		getCourse: getCourse[0],
		userData: userData[0] ?? null,
		auth: locals.auth
	};
}
// calculate discount for a single item used in applyDiscount/removeDiscount 
const calculateItemDiscount = (
	discount: DiscountItem,
	cartArray: CartItem[],
	originalTotal: number
): number => {
	const { type, value, selectedApplicability } = discount;
	let totalDiscount = 0;

	if (selectedApplicability === 'prodId' || selectedApplicability === 'layoutId') {
		cartArray.forEach((item: CartItem) => {
			const isProduct = selectedApplicability === 'prodId' && item.prodId === discount.prodId;
			const isLayout = selectedApplicability === 'layoutId' && item.layoutView?.layoutId === discount.layoutId;

			if (isProduct || isLayout) {
				const qty =
					typeof item.orderQuantity === 'number' && item.orderQuantity > 0
						? item.orderQuantity
						: 1;
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
	} else if (selectedApplicability === 'userId' || selectedApplicability === 'membershipLevel') {
		// User-level discounts
		if (type === 'amount') {
			totalDiscount = value;
		} else if (type === 'percent') {
			totalDiscount = (originalTotal * value) / 100;
		}
	}
	// else if (selectedApplicability === 'cart') {
	// 	// Cart-level discounts
	// 	if (type === 'amount') {
	// 		totalDiscount = value;
	// 	} else if (type === 'percent') {
	// 		totalDiscount = (originalTotal * value) / 100;
	// 	}

	return totalDiscount;
};

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
		const password1: any = formData.get('password1') || '';
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
				const res = await fetch(`${BASE_URL}/api/mongo/find`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
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
						password: hash(password1, SALT),
						cookieId,
						// "membership.membershipLevel": 'Socio ordinario',
						// "membership.membershipSignUp": new Date(),
						// "membership.membershipActivation": new Date(),
						// "membership.membershipExpiry": new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
						// "membership.membershipStatus": true
					};

					const res = await fetch(`${BASE_URL}/api/mongo/create`, {
						method: 'POST',
						body: JSON.stringify({
							apiKey: APIKEY,
							schema: 'user', //product | order | user | layout | discount
							newDoc,
							returnObj
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

			const res = await fetch(`${BASE_URL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order', //product | order | user | layout | discount
					newDoc,
					returnObj
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (res.status != 200) {
				return fail(400, { action: 'new', success: false, message: await res.text() });
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

	applyDiscount: async ({ request, fetch, locals }) => {
		const discountFetch = (discountCodes: string[]) => fetch(`${BASE_URL}/api/mongo/find`, {
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
			const discountCode = formData.get('discountCode') as string;
			const cart = formData.get('cart') as string;
			const grandTotal = formData.get('grandTotal') as string;
			const discountList = formData.get('discountList') as string;
			const originalTotal = Number(grandTotal) || 0;
			const discountArray: string[] = JSON.parse(discountList || '[]').map(item => item.code);
			const cartArray: CartItem[] = JSON.parse(cart || '[]');
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
			console.log('newDiscountArray', newDiscountArray);
			console.log('discountGroup', discountGroup);

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

			const validateDiscountApplicability = (
				discount: DiscountItem,
				user: any,
				cartArray: CartItem[]
			): boolean => {
				const { selectedApplicability } = discount;

				switch (selectedApplicability) {
					case 'userId':
						return discount.userId === user?.userId;

					case 'membershipLevel':
						return discount.membershipLevel === user?.membership?.membershipLevel;

					case 'prodId':
						return cartArray.some(item => item.prodId === discount.prodId);

					case 'layoutId':
						return cartArray.some(item => item.layoutView?.layoutId === discount.layoutId);

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
				return discountGroup.map(discount => ({
					code: discount.code,
					totalDiscount: calculateItemDiscount(discount, cartArray, originalTotal)
				}));
			};

			return {
				action: 'applyDiscount',
				success: true,
				message: 'Sconto applicato con successo',
				payload: {
					discountApplied: discountApplied(),
				}
			};

		} catch (error) {
			console.error('Error applying discount:', error);
			return fail(500, {
				action: 'applyDiscount',
				success: false,
				message: 'Errore durante l\'applicazione dello sconto'
			});
		}
	},

	removeDiscount: async ({ request, fetch, locals }) => {
		const discountFetch = (discountCodes: string[]) => fetch(`${BASE_URL}/api/mongo/find`, {
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
			let discountArray: string[] = JSON.parse(discountList || '[]').map(item => item.code);

			if (!removeCode?.trim()) {
				return fail(400, {
					action: 'removeDiscount',
					success: false,
					message: 'Codice sconto richiesto'
				});
			}

			// Remove the discount code from array
			discountArray = discountArray.filter(code => code !== removeCode);

			// IF no discounts remain, return empty result
			if (discountArray.length === 0) {
				return {
					action: 'removeDiscount',
					success: true,
					message: 'Sconto rimosso con successo',
					payload: {
						discountApplied: [],
					}
				};
			}

			// Fetch remaining discounts from database
			const discountRes = await discountFetch(discountArray);
			const discountGroup: DiscountItem[] = await discountRes.json();

			// Calculate remaining discounts
			const discountApplied = () => {
				return discountGroup.map(discount => ({
					code: discount.code,
					totalDiscount: calculateItemDiscount(discount, cartArray, originalTotal)
				}));
			};

			return {
				action: 'removeDiscount',
				success: true,
				message: 'Sconto rimosso con successo',
				payload: {
					discountApplied: discountApplied(),
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
	}

} satisfies Actions;