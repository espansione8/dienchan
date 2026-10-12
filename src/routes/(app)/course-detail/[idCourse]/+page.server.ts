import type { PageServerLoad, Actions } from './$types';
import type { CartItem, DiscountItem } from '$lib/types';
import { BASE_URL, APIKEY, SALT, STRIPE_KEY_FRONT, STRIPE_KEY_BACK, STRIPE_API } from '$env/static/private';
//import { env } from '$env/dynamic/private';
import { error, fail } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import { tools } from '$lib/tools/backendTools';
import { customAlphabet } from 'nanoid';
import Stripe from 'stripe';
import { createCheckoutSession, createOfflineCheckout, setCheckoutNonceCookie } from '$lib/server/checkout';
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12);
// corsi ricorrenti: iscrizione ripetibile ogni mese, senza tracking abbonati/storico, mail dedicata via /api/mailer/new-order-12massaggi
const RECURRING_COURSES = ['CQ112QCNK', 'F82B3JBZT']; // CQ112QCNK = Workshop: 12 Massaggi mattutini (layoutId PYSYPA4QCTH1), F82B3JBZT = corso del 15 di ogni mese (Van Tri Truong)
//const apiS = '2025-12-15.clover'
const stripe = new Stripe(STRIPE_KEY_BACK, {
	apiVersion: STRIPE_API // Use a stable API version https://docs.stripe.com/api/versioning
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
			query: { prodId: params.idCourse, type: { $in: ['course', 'event'] } }, //IF USE Products.model -> types: course / product / membership / event
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
					let rawPrice;
					if (isProduct) {
						rawPrice = item.price;
					} else {
						const isPromoActive = item.layoutView?.promoStatus === 'enabled'
							&& item.layoutView?.promoPrice > 0
							&& (!item.layoutView?.promoEndDate || new Date(item.layoutView.promoEndDate) >= new Date());
						rawPrice = isPromoActive ? (item.layoutView?.promoPrice ?? 0) : (item.layoutView?.price ?? 0);
					}
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
/**
 * A guest must not silently attach an order to an account they may not control.
 * Runs BEFORE any payment, so blocking here never costs the customer money.
 */
const emailAlreadyRegistered = async (fetch: typeof globalThis.fetch, email: string) => {
	const res = await fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'user',
			query: { email },
			projection: { email: 1 },
			sort: { createdAt: -1 },
			limit: 1,
			skip: 0
		}),
		headers: { 'Content-Type': 'application/json' }
	});
	if (!res.ok) throw new Error(await res.text());
	const rows = await res.json();
	return rows.length > 0;
};

export const actions: Actions = {	new: async ({ request, fetch, locals, cookies }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const surname = formData.get('surname') as string;
		const email = formData.get('email')?.toString().toLowerCase().trim() || '';
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
		const totalValue = Number(formData.get('totalValue'));
		const cart = formData.get('cart') as string;
		const cartItem = JSON.parse(String(cart)) || null;
		const discountList = formData.get('discountList') as string;
		const totalDiscount = formData.get('totalDiscount') || 0;
		const promoterId = formData.get('promoterId') as string | null;
		const isEvent = formData.get('isEvent') === 'true';
		const bundle = formData.get('bundleProducts');
		const bundleProducts = JSON.parse(String(bundle)) || [];
		const existingNotes = (formData.get('orderNotes') as string) || '';

		const currentUserId: string = locals.user?.userId ?? '';

		// ---- enrollment check (pre-payment, so a rejected check costs nothing) ----
		if (locals.auth && currentUserId) {
			const checkEnrollmentRes = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user',
					query: { userId: currentUserId, courseJoined: cartItem?.prodId },
					projection: { _id: 1 },
					limit: 1
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			if (!checkEnrollmentRes.ok) {
				return fail(400, { action: 'new', success: false, message: 'Errore nel controllo iscrizione' });
			}

			const alreadyEnrolled = await checkEnrollmentRes.json();
			if (alreadyEnrolled.length > 0) {
				return fail(400, { action: 'new', success: false, message: 'Sei già iscritto a questo corso' });
			}
		}

		// ---- validation (nothing has been charged yet) ----
		// A zero total is legitimate (free events), so test for a real number rather than truthiness.
		if (!name || !surname || !email || !address || !city || !county || !postalCode || !country || !payment || !Number.isFinite(totalValue) || !cart || !cartItem) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}
		if (!locals.auth && password1 !== password2) {
			return fail(400, { action: 'new', success: false, message: 'Password non corrispondenti' });
		}
		if (!locals.auth && (password1 == '' || password2 == '')) {
			return fail(400, { action: 'new', success: false, message: 'Password non valide' });
		}

		// A guest must not attach an order to an account they may not control — checked before
		// ANY payment method is started, so blocking here never costs the customer money.
		if (!locals.auth && (await emailAlreadyRegistered(fetch, email))) {
			return fail(400, {
				action: 'new',
				success: false,
				message: "Questa email è già registrata. Accedi per completare l'ordine, oppure usa un altro indirizzo."
			});
		}

		try {
			const membershipRes = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: { type: 'membership', title: 'Socio ordinario' },
					projection: { _id: 0, userView: 0, layoutView: 0 },
					sort: { createdAt: -1 },
					limit: 1,
					skip: 0
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			if (!membershipRes.ok) {
				return fail(400, { action: 'new', success: false, message: await membershipRes.text() });
			}
			const membership = await membershipRes.json();
			if (membership.length < 1) {
				return fail(400, { action: 'new', success: false, message: 'Missing membership' });
			}

			const discountNotes = (() => {
				if (!discountList || discountList === '[]') return '';
				try {
					const discounts = JSON.parse(discountList);
					if (!Array.isArray(discounts) || discounts.length === 0) return '';
					return `Codici sconto applicati: ${discounts.map((item: any) => item.code).join(', ')}`;
				} catch (err) {
					console.error('Error parsing discountList:', err);
					return '';
				}
			})();

			const finalNotes = existingNotes && discountNotes ? `${existingNotes}\n\n${discountNotes}` : existingNotes || discountNotes;

			const userHasMembership = locals.user?.membership?.membershipStatus;
			let orderCart: any[] = [];
			if ((!isEvent && !locals.auth) || (!isEvent && !userHasMembership)) {
				orderCart = [...bundleProducts, cartItem, membership[0]];
			} else {
				orderCart = [...bundleProducts, cartItem];
			}

			// ---- authoritative pricing (floor check) ----
			// The charge must at least cover the DB price of the item being bought, less the
			// server-recomputed discount. A floor rather than an equality check is used because the
			// client total also carries the membership surcharge, and bundle items are not priced.
			const priceRes = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: { prodId: cartItem.prodId },
					projection: { _id: 0 },
					sort: { createdAt: -1 },
					limit: 1,
					skip: 0
				}),
				headers: { 'Content-Type': 'application/json' }
			});
			if (!priceRes.ok) {
				return fail(400, { action: 'new', success: false, message: 'Errore lettura prezzi' });
			}
			const priceRows: any[] = await priceRes.json();
			const dbProduct = priceRows[0];
			if (!dbProduct) {
				return fail(400, { action: 'new', success: false, message: 'Prodotto non trovato' });
			}

			const priceSource = cartItem.type === 'course' ? (dbProduct.layoutView ?? {}) : dbProduct;
			const promoActive =
				priceSource.promoStatus === 'enabled' &&
				Number(priceSource.promoPrice) > 0 &&
				(!priceSource.promoEndDate || new Date(priceSource.promoEndDate) > new Date());
			const baseUnit = Number(promoActive ? priceSource.promoPrice : priceSource.price);
			if (!Number.isFinite(baseUnit)) {
				return fail(400, { action: 'new', success: false, message: 'Prezzo non valido' });
			}

			const pricedCart = [
				{
					...cartItem,
					price: baseUnit,
					...(cartItem.layoutView ? { layoutView: { ...cartItem.layoutView, price: baseUnit } } : {})
				}
			];
			const baseTotal = baseUnit * (cartItem.orderQuantity || 1);

			const discountCodes = (JSON.parse(discountList || '[]') as any[]).map((i) => i.code).filter(Boolean);
			let serverDiscount = 0;
			if (discountCodes.length) {
				const dRes = await fetch(`${BASE_URL}/api/mongo/find`, {
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
					headers: { 'Content-Type': 'application/json' }
				});
				if (!dRes.ok) {
					return fail(400, { action: 'new', success: false, message: 'Errore lettura sconti' });
				}
				const discountDocs: DiscountItem[] = await dRes.json();
				serverDiscount = discountDocs.reduce(
					(acc: number, d) => acc + calculateItemDiscount(d, pricedCart, baseTotal),
					0
				);
			}

			if (Math.round(Number(totalValue)) < Math.round(baseTotal - serverDiscount)) {
				return fail(400, { action: 'new', success: false, message: 'Totale non valido' });
			}

			const invoicing = {
				name, surname, businessName: '', vatNumber: '', address, city, county, postalCode,
				state: '', region: '', country, invoiceNotes: '', email, phone, mobilePhone
			};
			const shipping = {
				name, surname, address, city, county, postalCode, state: '', region: '', country,
				deliveryNotes: '', email, phone, mobilePhone
			};
			const isRecurring = RECURRING_COURSES.includes(cartItem.prodId);
			const newUserData = locals.auth
				? null
				: {
						name, surname, address, postalCode, city, county, country, phone, mobilePhone,
						passwordHash: hash(password1, SALT), howDidYouKnow: '', eventDetails: ''
					};

			// promoter commission is derived from the layout, never from the client
			let promoterPoints = 0;
			if (promoterId) {
				const layoutId = cartItem.layoutId;
				if (layoutId === 'XW7LYV2LG2BU') promoterPoints = 10;
				if (layoutId === '794792843') promoterPoints = 40;
			}

			const sharedPayload = {
				productTitle: cartItem.layoutView?.title ?? 'Corso',
				orderType: 'course',
				userId: locals.user?.userId ?? null,
				newUser: newUserData,
				cart: orderCart,
				cartItemProdId: cartItem.prodId,
				isRecurring,
				bundleProducts,
				promoterId: promoterId?.trim() || null,
				promoterPoints,
				notificationEmail: cartItem.notificationEmail,
				mailTemplate: isRecurring ? 'new-order-12massaggi' : 'new-order',
				mailTo: [email, 'vantri70@gmail.com'],
				buyerName: `${name} ${surname}`,
				courseDate: orderCart.find((item) => item.type === 'course')?.eventStartDate,
				invoicing,
				shipping,
				orderNotes: finalNotes,
				membershipUpdate: !locals.user?.membership?.membershipStatus,
				subscriber: {
					userId: currentUserId,
					email, name, surname, phone, mobilePhone,
					...(promoterId ? { promoterId: promoterId.trim() } : { promoterId: null })
				}
			};

			// ---- bank transfer: order is created immediately, payment pending ----
			if (payment !== 'Carta di credito') {
				const { cookieId } = await createOfflineCheckout({
					flow: 'course',
					amountCents: Math.round(totalValue * 100),
					email,
					name,
					surname,
					payload: { ...sharedPayload, paymentMethod: payment, statusPayment: 'pending' }
				});

				if (cookieId) {
					cookies.set('session_id', cookieId, {
						httpOnly: true,
						maxAge: 60 * 60 * 24,
						sameSite: 'lax',
						secure: process.env.NODE_ENV === 'production',
						path: '/'
					});
				}

				return {
					action: 'new',
					success: true,
					message: "L'ordine è stato inviato. Controlla lo storico nel tuo profilo",
					payload: { redirect: !locals.auth }
				};
			}

			// ---- card ----
			const session = await createCheckoutSession({
				flow: 'course',
				amountCents: Math.round(totalValue * 100),
				email,
				name,
				surname,
				payload: { ...sharedPayload, paymentMethod: 'Carta di credito', statusPayment: 'done' },
				stripe
			});
			// This page is open to guests and the order is written by the webhook, so the only
			// place a guest account can be logged in is the success page — which requires the
			// nonce cookie to prove the request comes from the browser that paid.
			setCheckoutNonceCookie(cookies, session.loginNonce);

			return {
				action: 'new',
				success: true,
				message: 'Reindirizzamento al pagamento…',
				payload: { redirectUrl: session.url }
			};
		} catch (err: any) {
			console.error('course new error:', err);
			return fail(400, {
				action: 'new',
				success: false,
				message: "Errore durante la creazione dell'ordine. Riprova o contattaci."
			});
		}
	},
	applyDiscount: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const discountCode = formData.get('discountCode').toString().toLowerCase().trim();
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
			const removeCode = formData.get('removeCode').toString().toLowerCase().trim();
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
		const discountCode = formData.get('discountCode').toString().toLowerCase().trim();// email formatore

		try {
			const userFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', //product | order | user | layout | discount
					query: { email: discountCode }, //IF USE Products.model -> types: course / product / membership / event
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