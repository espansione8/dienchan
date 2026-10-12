import type { PageServerLoad, Actions } from './$types'
import type { CartItem, DiscountItem } from '$lib/types';
import { BASE_URL, APIKEY, SALT, STRIPE_KEY_BACK, STRIPE_API } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';
import { hash } from '$lib/tools/hash';
import { customAlphabet } from 'nanoid'
import Stripe from 'stripe';
import { createCheckoutSession, createOfflineCheckout } from '$lib/server/checkout';
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 9)
const stripe = new Stripe(STRIPE_KEY_BACK, {
	apiVersion: STRIPE_API // Use a stable API version https://docs.stripe.com/api/versioning
});

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	return {
		userData: locals.user || null,
		auth: locals.auth,
	};
};

// calculate discount for a single item used in applyDiscount/removeDiscount 
const calculateItemDiscount = (
	discount: DiscountItem,
	cartArray: CartItem[],
	originalTotal: number
): number => {
	const { type, value, selectedApplicability } = discount;
	let totalDiscount = 0;

	// Gestione sconto QUANTITÀ
	if (selectedApplicability === 'prodId' && discount.qty && discount.qty > 1) {
		cartArray.forEach((item: CartItem) => {
			if (item.prodId === discount.prodId) {
				const itemQty = typeof item.orderQuantity === 'number' && item.orderQuantity > 0
					? item.orderQuantity
					: 1;

				// Verifica se la quantità nel carrello soddisfa la soglia minima
				if (itemQty >= discount.qty) {
					const numericPrice = Number(item.price);
					if (!Number.isFinite(numericPrice)) {
						throw new Error('Errore calcolo prezzo non valido');
					}

					let itemDiscount = 0;

					if (type === 'amount') {
						// Quante volte si applica la soglia
						const times = Math.floor(itemQty / discount.qty);
						itemDiscount = value * times;
					} else if (type === 'percent') {
						// Sconto percentuale sul totale dei prodotti
						const totalValue = numericPrice * itemQty;
						itemDiscount = (totalValue * value) / 100;
					}

					totalDiscount += itemDiscount;
				}
			}
		});
	}

	// Gestione sconto PRODOTTO SINGOLO (senza qty)
	else if (selectedApplicability === 'prodId' && (!discount.qty || discount.qty <= 1)) {
		cartArray.forEach((item: CartItem) => {
			if (item.prodId === discount.prodId) {
				const itemQty = typeof item.orderQuantity === 'number' && item.orderQuantity > 0
					? item.orderQuantity
					: 1;
				let itemDiscount = 0;
				const numericPrice = Number(item.price);

				if (!Number.isFinite(numericPrice)) {
					throw new Error('Errore calcolo');
				}

				if (type === 'amount') {
					itemDiscount = value * itemQty;
				} else if (type === 'percent') {
					const singleValue = (numericPrice * value) / 100;
					itemDiscount = singleValue * itemQty;
				}
				totalDiscount += itemDiscount;
			}
		});
	}
	else if (selectedApplicability === 'layoutId') {
		cartArray.forEach((item: CartItem) => {
			if (item.layoutView?.layoutId === discount.layoutId) {
				const qty = typeof item.orderQuantity === 'number' && item.orderQuantity > 0
					? item.orderQuantity
					: 1;
				let itemDiscount = 0;
				const numericPrice = Number(item.layoutView.price);
				if (!Number.isFinite(numericPrice)) {
					throw new Error('Errore calcolo');
				}
				if (type === 'amount') {
					itemDiscount = value * qty;
				} else if (type === 'percent') {
					const singleValue = (numericPrice * value) / 100;
					itemDiscount = singleValue * qty;
				}
				totalDiscount += itemDiscount;
			}
		});
	}
	else if (selectedApplicability === 'email' || selectedApplicability === 'membershipLevel' || selectedApplicability === 'riflessologo') {
		if (type === 'amount') {
			totalDiscount = value;
		} else if (type === 'percent') {
			totalDiscount = (originalTotal * value) / 100;
		}
	}
	else if (selectedApplicability === 'referral') {
		totalDiscount = (originalTotal * discount.refDiscount) / 100;
	}

	return totalDiscount;
}

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

export const actions: Actions = {
	new: async ({ request, fetch, locals, cookies }) => {
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
		const discountList = formData.get('discountList') as string;
		const cartItem = JSON.parse(String(cart)) || [];
		const discountArray: string[] = (JSON.parse(discountList || '[]') as any[]).map((item) => item.code);
		// note: `usedPoints` / `newPointsBalance` are NOT read from the form — the redemption is
		// recomputed from the account balance further down.
		const usePoint = formData.get('usePoint') === 'true';
		const storePickUp = formData.get('storePickUp') === 'true';
		const orderNotes = formData.get('orderNotes') as string | null;
		const shippingName = formData.get('shippingName');
		const shippingSurname = formData.get('shippingSurname');
		const shippingEmail = formData.get('shippingEmail');
		const shippingPhone = formData.get('shippingPhone');
		const shippingMobilePhone = formData.get('shippingMobilePhone');
		const shippingAddress = formData.get('shippingAddress');
		const shippingCity = formData.get('shippingCity');
		const shippingCounty = formData.get('shippingCounty');
		const shippingPostalCode = formData.get('shippingPostalCode');
		const shippingCountry = formData.get('shippingCountry');

		const finalShippingData = storePickUp
			? { name: '', surname: '', email: '', phone: '', mobilePhone: '', address: 'Ritiro in sede', city: '', county: '', postalCode: '', country: '' }
			: {
					name: shippingName,
					surname: shippingSurname,
					email: shippingEmail,
					phone: shippingPhone,
					mobilePhone: shippingMobilePhone,
					address: shippingAddress,
					city: shippingCity,
					county: shippingCounty,
					postalCode: shippingPostalCode,
					country: shippingCountry
				};

		let totalDiscount = 0;

		// ---- validation (nothing has been charged yet) ----
		if (!name || !surname || !email || !address || !city || !county || !postalCode || !country || !payment || cartItem.length < 1) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}
		if (!locals.auth) {
			if (!password1 || !password2 || password1.length < 8) {
				return fail(400, { action: 'new', success: false, message: 'Password troppo corta' });
			}
			if (password1 !== password2) {
				return fail(400, { action: 'new', success: false, message: 'Password non corrispondenti' });
			}
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

		const finalNotes = orderNotes && discountNotes ? `${orderNotes} - ${discountNotes}` : orderNotes || discountNotes;

		try {
			// ---- authoritative pricing ----
			// The client's posted prices and discount amounts are never trusted: the total is
			// rebuilt from the product and discount documents before anything is charged.
			const productIds = cartItem.map((i: any) => i.prodId).filter(Boolean);
			const priceRes = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: { prodId: { $in: productIds } },
					projection: { _id: 0 },
					sort: { createdAt: -1 },
					limit: 1000,
					skip: 0
				}),
				headers: { 'Content-Type': 'application/json' }
			});
			if (!priceRes.ok) {
				return fail(400, { action: 'new', success: false, message: 'Errore lettura prezzi' });
			}
			const catalog: any[] = await priceRes.json();
			const byProdId = new Map(catalog.map((row) => [row.prodId, row]));

			const unitPrice = (element: any) => {
				const db = byProdId.get(element.prodId);
				if (!db) throw new Error(`Prodotto non trovato: ${element.prodId}`);
				const src = element.type === 'course' ? (db.layoutView ?? {}) : db;
				const promoActive =
					src.promoStatus === 'enabled' &&
					Number(src.promoPrice) > 0 &&
					(!src.promoEndDate || new Date(src.promoEndDate) > new Date());
				const unit = promoActive ? Number(src.promoPrice) : Number(src.price);
				if (!Number.isFinite(unit)) throw new Error(`Prezzo non valido: ${element.prodId}`);
				return unit;
			};

			const pricedCart = cartItem.map((element: any) => ({
				...element,
				price: unitPrice(element),
				...(element.layoutView ? { layoutView: { ...element.layoutView, price: unitPrice(element) } } : {})
			}));
			const cartTotal = pricedCart.reduce((sum: number, el: any) => sum + el.price * (el.orderQuantity || 1), 0);

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
					(acc: number, d) => acc + calculateItemDiscount(d, pricedCart, cartTotal),
					0
				);
			}
			// Points redemption is computed here, never taken from the form. The client posts
			// `usedPoints` and `newPointsBalance`, so trusting them let a tampered form both
			// discount the order and mint itself points. 1 point = 1 €, capped by the real
			// balance and by what is actually left to pay.
			const pointsAvailable = Number(locals.user?.pointsBalance ?? 0);
			if (usePoint && pointsAvailable <= 0) {
				return fail(400, { action: 'new', success: false, message: 'Saldo punti insufficiente' });
			}
			const pointsUsed = usePoint ? Math.max(0, Math.min(pointsAvailable, cartTotal - serverDiscount)) : 0;
			const pointsBalanceAfter = pointsAvailable - pointsUsed;

			if (usePoint) serverDiscount += pointsUsed;

			// Delivery fee mirrors the client's calculateDeliveryFee() rules exactly, so the
			// server total agrees with what the customer was shown.
			const deliveryFee = (() => {
				if (storePickUp) return 0;
				if (cartTotal >= 100) return 0;
				const allFree = cartTotal === 0 || pricedCart.every((el: any) => el.price === 0);
				if (allFree) return 0;
				const onlyBooks =
					pricedCart.length > 0 &&
					pricedCart.every((el: any) => {
						const category = byProdId.get(el.prodId)?.category ?? el.category;
						return category && String(category).includes('Libri');
					});
				return onlyBooks ? 4.5 : 9;
			})();

			const expectedTotal = cartTotal - serverDiscount + deliveryFee;

			if (Math.round(Number(totalValue)) !== Math.round(expectedTotal)) {
				return fail(400, { action: 'new', success: false, message: 'Totale non valido' });
			}
			totalDiscount = serverDiscount;

			if (!locals.auth && (await emailAlreadyRegistered(fetch, email))) {
				return fail(400, {
					action: 'new',
					success: false,
					message: "Questa email è già registrata. Accedi per completare l'ordine, oppure usa un altro indirizzo."
				});
			}

			const invoicing = {
				name, surname, businessName: '', vatNumber: '', address, city, county, postalCode,
				state: '', region: '', country, invoiceNotes: '', email, phone, mobilePhone
			};
			const shipping = {
				name: finalShippingData.name, surname: finalShippingData.surname, address: finalShippingData.address,
				city: finalShippingData.city, county: finalShippingData.county, postalCode: finalShippingData.postalCode,
				state: '', region: '', country: finalShippingData.country, deliveryNotes: '',
				email: finalShippingData.email, phone: finalShippingData.phone, mobilePhone: finalShippingData.mobilePhone
			};
			const newUserData = locals.auth
				? null
				: {
						name, surname, address, postalCode, city, county, country, phone, mobilePhone,
						passwordHash: hash(password1, SALT), howDidYouKnow: '', eventDetails: ''
					};

			const baseDoc = {
				status: 'requested',
				orderDate: new Date(),
				orderConfirmDate: null,
				promotionId: '',
				promotionName: '',
				promoterId: '',
				agencyId: '',
				orderConfirmed: false,
				totalPoints: pointsUsed,
				totalDiscount: Number(totalDiscount),
				totalVAT: 0,
				browser: '',
				orderIp: '',
				orderNotes: finalNotes,
				type: 'product',
				invoicing,
				shipping,
				storePickUp
			};

			// ---- bank transfer: order is created immediately, payment pending ----
			if (payment !== 'Carta di credito') {
				const { cookieId } = await createOfflineCheckout({
					flow: 'cart',
					amountCents: Math.round(totalValue * 100),
					email,
					name,
					surname,
					payload: {
						productTitle: 'Ordine Associazione Diện Chẩn',
						orderType: 'product',
						paymentMethod: payment,
						statusPayment: 'pending',
						userId: locals.user?.userId ?? null,
						newUser: newUserData,
						baseDoc,
						cartItem,
						discountArray,
						usePoint,
						pointsUsed,
						pointsBalanceAfter,
						mailTemplate: 'new-order',
						mailTo: [email]
					}
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

			// ---- card: prepare everything, then redirect to Stripe ----
			const session = await createCheckoutSession({
				flow: 'cart',
				amountCents: Math.round(totalValue * 100),
				email,
				name,
				surname,
				payload: {
					productTitle: 'Ordine Associazione Diện Chẩn',
					orderType: 'product',
					paymentMethod: 'Carta di credito',
					statusPayment: 'done',
					userId: locals.user?.userId ?? null,
					newUser: newUserData,
					baseDoc,
					cartItem,
					discountArray,
					usePoint,
					pointsUsed,
					pointsBalanceAfter,
					mailTemplate: 'new-order',
					mailTo: [email]
				},
				stripe
			});

			return {
				action: 'new',
				success: true,
				message: 'Reindirizzamento al pagamento…',
				payload: { redirectUrl: session.url }
			};
		} catch (err: any) {
			console.error('cart new error:', err);
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
		const subTotal = formData.get('subTotal') as string;
		const discountList = formData.get('discountList') as string;
		const originalTotal = Number(subTotal) || 0;
		const discountArray: string[] = JSON.parse(discountList || '[]').map(item => item.code);
		const cartArray: CartItem[] = JSON.parse(cart || '[]');

		try {
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


			// check: Prevent more than one 'referral' discount
			const countReferral = discountGroup.filter(d => d.selectedApplicability === 'referral').length;
			if (discountItem.selectedApplicability === 'referral' && countReferral > 1) {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'È possibile applicare un solo sconto Formatore.'
				});
			}
			const countRiflessologo = discountGroup.filter(d => d.selectedApplicability === 'riflessologo').length;
			if (discountItem.selectedApplicability === 'riflessologo' && countRiflessologo > 1) {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'È possibile applicare un solo sconto Riflessologo.'
				});
			}

			// check for "referral" and "riflessologo" conflict
			const isReferralDiscount = discountItem.selectedApplicability === 'referral';
			const isRiflessologoDiscount = discountItem.selectedApplicability === 'riflessologo';

			const existReferralDiscountInGroup = discountGroup.some(d => d.selectedApplicability === 'referral');
			const existRiflessologoDiscountInGroup = discountGroup.some(d => d.selectedApplicability === 'riflessologo');

			if (existReferralDiscountInGroup && existRiflessologoDiscountInGroup) {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'È possibile applicare un solo sconto Formatore.'
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
						return cartArray.some(item => item.prodId === discount.prodId);

					case 'layoutId':
						return cartArray.some(item => item.layoutView?.layoutId === discount.layoutId);

					case 'referral':
						return true;

					case 'riflessologo':
						//console.log('isRiflessologo:', user.isRiflessologo);
						return user?.isRiflessologo === true;

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

			// Validazione quantità per sconti qty
			if (discountItem.selectedApplicability === 'prodId' && discountItem.qty && discountItem.qty > 1) {
				const productInCart = cartArray.find(item => item.prodId === discountItem.prodId);
				const currentQty = productInCart?.orderQuantity || 0;

				if (currentQty < discountItem.qty) {
					return fail(400, {
						action: 'applyDiscount',
						success: false,
						message: `Quantità insufficiente. Servono almeno ${discountItem.qty} pezzi per applicare questo sconto (attualmente: ${currentQty})`
					});
				}
			}

			// Calculate all discounts
			const discountApplied = () => {
				return discountGroup.map(discount => ({
					code: discount.code,
					//type: discount.type,
					totalDiscount: calculateItemDiscount(discount, cartArray, originalTotal)
				}));
			};

			return {
				action: 'applyDiscount',
				success: true,
				message: 'Sconto applicato con successo',
				payload: {
					discountApplied: discountApplied(),
					discountId: discountItem.discountId
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
			const removeCode = formData.get('removeCode').toString().toLowerCase().trim();
			const subTotal = formData.get('subTotal') as string;
			const cart = formData.get('cart') as string;
			const discountList = formData.get('discountList') as string;
			const originalTotal = Number(subTotal) || 0;
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