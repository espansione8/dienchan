import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY, SALT, STRIPE_KEY_FRONT, STRIPE_KEY_BACK, STRIPE_API } from '$env/static/private';
import { error, fail } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import { customAlphabet } from 'nanoid'
import Stripe from 'stripe';
import {
	createCheckoutSession,
	resolveOrCreateUser,
	setCheckoutNonceCookie
} from '$lib/server/checkout';
import type { CheckoutFlow, NewUserData } from '$lib/server/checkout';

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 9)
const stripe = new Stripe(STRIPE_KEY_BACK, {
	apiVersion: STRIPE_API // Use a stable API version https://docs.stripe.com/api/versioning
});

const INSURANCE_PRICE = 70;
// Prezzi reali (confermati dall'utente): usati solo se il prodotto a DB non ha un prezzo.
const VITALIZIO_FALLBACK = 390;
const ORDINARIO_FALLBACK = 25;

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getMembership = [];

	const membershipFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'product', //product | order | user | layout | discount
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
			console.error('membership fetch failed', membershipRes.status, await membershipRes.text());
			throw error(400, 'membershipFetch failed');
		}
		getMembership = await membershipRes.json();

	} catch (err) {
		console.log('membershipFetch error:', err);
		throw error(500, 'Server error');
	}
	return {
		userData: locals.user,
		auth: locals.auth,
		getMembership,
		stripePublishableKey: STRIPE_KEY_FRONT
	};
}

// --------------------------------------------------------------------------- shared helpers

type Locals = { user?: any; auth?: any };

/** Fetch the membership product document server-side so the price never comes from the client. */
const fetchMembershipProduct = async (fetch: typeof globalThis.fetch, title: string) => {
	const res = await fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'product',
			query: { type: 'membership', title },
			projection: { _id: 0, userView: 0, layoutView: 0 },
			sort: { createdAt: -1 },
			limit: 1,
			skip: 0
		}),
		headers: { 'Content-Type': 'application/json' }
	});
	if (!res.ok) throw new Error(await res.text());
	const rows = await res.json();
	if (!rows.length) throw new Error(`Missing membership "${title}"`);
	return rows[0];
};

/**
 * A guest must not silently attach an order to an account they may not control.
 * This runs BEFORE any payment, so blocking here never costs the customer money.
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

const INSURANCE_PRODUCT = {
	title: 'Contributo Socio Praticante',
	description:
		"Il presente contributo permette a un socio praticante di godere di alcune agevolazioni quali utilizzo delle sale dell'associazione con tariffa agevolata e inclusione della polizza di copertura RC dell'associazione",
	price: INSURANCE_PRICE,
	type: 'insurance',
	uploadfiles: []
};

/**
 * Bank-transfer path: the guest still gets an account (and a session cookie) exactly as on the
 * card path — only the membership stays inactive until the transfer is confirmed manually.
 */
const resolveOfflineUser = async (
	cookies: Cookies,
	locals: Locals,
	email: string,
	newUser: NewUserData | null,
	withInsurance: boolean
): Promise<string> => {
	const { userId, cookieId } = await resolveOrCreateUser({
		userId: locals.user?.userId ?? null,
		email,
		newUser,
		activateMembership: false,
		withInsurance
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
	return userId;
};

const createOfflineOrder = async (fetch: typeof globalThis.fetch, newDoc: any, totalValue: number, cart: any[]) => {
	const orderId = nanoid();
	const orderCode = crypto.randomUUID();
	const res = await fetch(`${BASE_URL}/api/mongo/create`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'order',
			newDoc: { orderId, orderCode, totalValue, ...newDoc, cart },
			returnObj: true
		}),
		headers: { 'Content-Type': 'application/json' }
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

/**
 * Mail is best-effort: the order is already created by the time this runs, so a network failure
 * must never turn a successful order into an error response.
 */
const mailOrder = async (fetch: typeof globalThis.fetch, path: string, email: string | string[], order: any) => {
	try {
		const res = await fetch(`${BASE_URL}/api/mailer/${path}`, {
			method: 'POST',
			body: JSON.stringify({ apiKey: APIKEY, email, order }),
			headers: { 'Content-Type': 'application/json' }
		});
		if (!res.ok) console.error(`mailer ${path} failed:`, await res.text());
	} catch (err) {
		console.error(`mailer ${path} threw:`, err);
	}
};

/** Shared tail for every card checkout: build the payload, open the Stripe session, bind the nonce. */
const startCardCheckout = async (
	cookies: Cookies,
	flow: CheckoutFlow,
	amountCents: number,
	payload: Record<string, any>,
	email: string,
	name?: string,
	surname?: string
) => {
	const session = await createCheckoutSession({
		flow,
		amountCents,
		email,
		name,
		surname,
		payload,
		stripe
	});
	setCheckoutNonceCookie(cookies, session.loginNonce);
	return session;
};

const buildNewUserData = (
	locals: Locals,
	form: {
		name: string; surname: string; address: string; postalCode: string; city: string;
		county: string; country: string; phone: string; mobilePhone: string;
		password1: string; howDidYouKnow: string; eventDetails: string;
	}
): NewUserData | null => {
	if (locals.auth) return null;
	return {
		name: form.name,
		surname: form.surname,
		address: form.address,
		postalCode: form.postalCode,
		city: form.city,
		county: form.county,
		country: form.country,
		phone: form.phone,
		mobilePhone: form.mobilePhone,
		passwordHash: hash(form.password1, SALT),
		howDidYouKnow: form.howDidYouKnow,
		eventDetails: form.eventDetails
	};
};

export const actions: Actions = {

	/**
	 * Tesseramento (new membership).
	 *
	 * All validation happens BEFORE any money moves. A guest whose email is already registered is
	 * stopped here and asked to log in, rather than having the order attached to an account they
	 * may not control.
	 *
	 * Historically this "email esistente" check ran *after* the card had been charged, which is
	 * how 231 payments were taken without an order ever being recorded.
	 */
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
		const membershipLevel = (formData.get('membershipLevel') as string) || '';
		const password1: any = (formData.get('password1') as string) || '';
		const password2 = (formData.get('password2') as string) || '';
		const howDidYouKnow = (formData.get('howDidYouKnow') as string) || '';
		const eventDetails = (formData.get('eventDetails') as string) || '';

		// ---- validation (nothing has been charged yet) ----
		if (!name || !surname || !email || !address || !city || !county || !postalCode || !country || !payment || !howDidYouKnow) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}
		if ((howDidYouKnow === 'presentazione' || howDidYouKnow === 'fiera') && !eventDetails) {
			return fail(400, { action: 'new', success: false, message: "Specifica i dettagli dell'evento" });
		}
		if (!locals.auth) {
			if (!password1 || !password2) {
				return fail(400, { action: 'new', success: false, message: 'Password non valide' });
			}
			if (password1 !== password2) {
				return fail(400, { action: 'new', success: false, message: 'Password non corrispondenti' });
			}
			if (password1.length < 8) {
				return fail(400, { action: 'new', success: false, message: 'Password troppo corta' });
			}
		}

		try {
			if (!locals.auth && (await emailAlreadyRegistered(fetch, email))) {
				return fail(400, {
					action: 'new',
					success: false,
					message:
						"Questa email è già registrata. Accedi per completare l'ordine, oppure usa un altro indirizzo."
				});
			}

			const vitalizio = membershipLevel === 'Socio vitalizio';
			const membershipProduct = await fetchMembershipProduct(fetch, vitalizio ? 'Socio vitalizio' : 'Socio ordinario');
			const totalValue = Number(membershipProduct?.price ?? (vitalizio ? VITALIZIO_FALLBACK : ORDINARIO_FALLBACK));
			const amountCents = Math.round(totalValue * 100);

			const invoicing = {
				name, surname, businessName: '', vatNumber: '', address, city, county, postalCode,
				state: '', region: '', country, invoiceNotes: '', email, phone, mobilePhone
			};
			const newUserData = buildNewUserData(locals, {
				name, surname, address, postalCode, city, county, country, phone, mobilePhone,
				password1, howDidYouKnow, eventDetails
			});

			// ---- bank transfer: order is created immediately, payment pending ----
			if (payment !== 'Carta di credito') {
				const offlineUserId = await resolveOfflineUser(cookies, locals, email, newUserData, false);
				const order = await createOfflineOrder(
					fetch,
					{
						userId: offlineUserId,
						status: 'requested', type: 'membership', orderDate: new Date(), orderConfirmDate: null,
						promotionId: '', promotionName: '', promoterId: '', agencyId: '', orderConfirmed: false,
						totalPoints: 0, totalVAT: 0, browser: '', orderIp: '', orderNotes: '',
						invoicing, shipping: { ...invoicing, deliveryNotes: '' },
						payment: { method: payment, statusPayment: 'pending', transactionId: '', points: '', value: '' }
					},
					totalValue,
					[membershipProduct]
				);
				await mailOrder(fetch, 'new-order', email, order);
				return {
					action: 'new',
					success: true,
					message: "L'ordine è stato inviato. Controlla lo storico nel tuo profilo",
					payload: { redirect: false }
				};
			}

			// ---- card: prepare everything, then redirect to Stripe ----
			const session = await startCardCheckout(
				cookies,
				'membership-new',
				amountCents,
				{
					productTitle: vitalizio ? 'Socio vitalizio' : 'Socio ordinario',
					orderType: 'membership',
					userId: locals.user?.userId ?? null,
					newUser: newUserData,
					membershipProduct,
					extraCart: [],
					membershipUpdate: {
						level: vitalizio ? 'Socio vitalizio' : 'Socio ordinario',
						expiryYears: vitalizio ? 100 : 1,
						setActivation: true
					},
					mailTemplate: 'new-order',
					mailTo: [email],
					invoicing,
					shipping: { ...invoicing, deliveryNotes: '' },
					orderNotes: ''
				},
				email,
				name,
				surname
			);

			return { action: 'new', success: true, message: 'Reindirizzamento al pagamento…', payload: { redirectUrl: session.url } };
		} catch (err: any) {
			console.error('membership new error:', err);
			return fail(400, {
				action: 'new',
				success: false,
				message: "Errore durante la creazione dell'ordine. Riprova o contattaci."
			});
		}
	},

	/** Rinnovo tessera — authenticated users only. */
	renew: async ({ request, fetch, locals, cookies }) => {
		const userData = locals.user;
		if (!locals.auth || !userData) {
			return fail(400, { action: 'renew', success: false, message: 'Devi essere loggato' });
		}
		if (!userData.name || !userData.surname || !userData.email || !userData.address ||
			!userData.city || !userData.county?.[0] || !userData.postalCode || !userData.country) {
			return fail(400, { action: 'renew', success: false, message: 'Dati utente incompleti' });
		}

		const formData = await request.formData();
		const payment = formData.get('payment') as string;
		if (!payment) {
			return fail(400, { action: 'renew', success: false, message: 'Metodo di pagamento mancante' });
		}

		try {
			const membershipProduct = await fetchMembershipProduct(fetch, 'Socio ordinario');
			const totalValue = Number(membershipProduct?.price ?? ORDINARIO_FALLBACK);
			const amountCents = Math.round(totalValue * 100);

			const invoicing = {
				name: userData.name, surname: userData.surname, businessName: '', vatNumber: '',
				address: userData.address, city: userData.city, county: userData.county[0],
				postalCode: userData.postalCode, state: '', region: '', country: userData.country,
				invoiceNotes: '', email: userData.email, phone: userData.phone, mobilePhone: userData.mobilePhone
			};

			if (payment !== 'Carta di credito') {
				const order = await createOfflineOrder(
					fetch,
					{
						userId: userData.userId,
						status: 'requested', type: 'membership', orderDate: new Date(), orderConfirmDate: null,
						promotionId: '', promotionName: '', promoterId: '', agencyId: '', orderConfirmed: false,
						totalPoints: 0, totalVAT: 0, browser: '', orderIp: '', orderNotes: '',
						invoicing, shipping: { ...invoicing, deliveryNotes: '' },
						payment: { method: payment, statusPayment: 'pending', transactionId: '', points: '', value: '' }
					},
					totalValue,
					[membershipProduct]
				);
				await mailOrder(fetch, 'new-order', userData.email, order);
				return {
					action: 'renew',
					success: true,
					// the membership is only extended once the transfer is confirmed
					message:
						"L'ordine è stato inviato. La tessera sarà rinnovata alla conferma del pagamento.",
					payload: { redirect: false }
				};
			}

			const session = await startCardCheckout(
				cookies,
				'membership-renew',
				amountCents,
				{
					productTitle: 'Rinnovo tessera annuale',
					orderType: 'membership',
					userId: userData.userId,
					newUser: null,
					membershipProduct,
					extraCart: [],
					membershipUpdate: { level: 'Socio ordinario', expiryYears: 1, setActivation: false },
					mailTemplate: 'new-order',
					mailTo: [userData.email],
					invoicing,
					shipping: { ...invoicing, deliveryNotes: '' },
					orderNotes: ''
				},
				userData.email,
				userData.name,
				userData.surname
			);

			return { action: 'renew', success: true, message: 'Reindirizzamento al pagamento…', payload: { redirectUrl: session.url } };
		} catch (err: any) {
			console.error('membership renew error:', err);
			return fail(400, {
				action: 'renew',
				success: false,
				message: "Errore durante il rinnovo della tessera. Riprova o contattaci."
			});
		}
	},

	/** Tesseramento + assicurazione (95 €) — always a new registration. */
	newWithInsurance: async ({ request, fetch, locals, cookies }) => {
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
		const howDidYouKnow = (formData.get('howDidYouKnow') as string) || '';
		const eventDetails = (formData.get('eventDetails') as string) || '';
		const promoterId = (formData.get('promoterId') as string) || '';

		if (!name || !surname || !email || !address || !city || !county || !postalCode || !country || !payment || !howDidYouKnow) {
			return fail(400, { action: 'newWithInsurance', success: false, message: 'Dati mancanti' });
		}
		if ((howDidYouKnow === 'presentazione' || howDidYouKnow === 'fiera') && !eventDetails) {
			return fail(400, { action: 'newWithInsurance', success: false, message: "Specifica i dettagli dell'evento" });
		}
		if (!locals.auth) {
			if (!password1 || !password2) {
				return fail(400, { action: 'newWithInsurance', success: false, message: 'Password non valide' });
			}
			if (password1 !== password2) {
				return fail(400, { action: 'newWithInsurance', success: false, message: 'Password non corrispondenti' });
			}
			if (password1.length < 8) {
				return fail(400, { action: 'newWithInsurance', success: false, message: 'Password troppo corta' });
			}
		}

		try {
			if (!locals.auth && (await emailAlreadyRegistered(fetch, email))) {
				return fail(400, {
					action: 'newWithInsurance',
					success: false,
					message:
						"Questa email è già registrata. Accedi per completare l'ordine, oppure usa un altro indirizzo."
				});
			}

			const membershipProduct = await fetchMembershipProduct(fetch, 'Socio ordinario');
			const membershipPrice = Number(membershipProduct?.price ?? ORDINARIO_FALLBACK);
			const totalValue = membershipPrice + INSURANCE_PRICE;
			const amountCents = Math.round(totalValue * 100);

			const invoicing = {
				name, surname, businessName: '', vatNumber: '', address, city, county, postalCode,
				state: '', region: '', country, invoiceNotes: '', email, phone, mobilePhone
			};
			const newUserData = buildNewUserData(locals, {
				name, surname, address, postalCode, city, county, country, phone, mobilePhone,
				password1, howDidYouKnow, eventDetails
			});

			if (payment !== 'Carta di credito') {
				const offlineUserId = await resolveOfflineUser(cookies, locals, email, newUserData, true);
				const order = await createOfflineOrder(
					fetch,
					{
						userId: offlineUserId,
						status: 'requested', type: 'insurance', orderDate: new Date(), orderConfirmDate: null,
						promotionId: '', promotionName: '', promoterId: promoterId.trim(), agencyId: '',
						orderConfirmed: false, totalPoints: 0, totalVAT: 0, browser: '', orderIp: '', orderNotes: '',
						invoicing, shipping: { ...invoicing, deliveryNotes: '' },
						payment: { method: payment, statusPayment: 'pending', transactionId: '', points: '', value: '' }
					},
					totalValue,
					[membershipProduct, INSURANCE_PRODUCT]
				);
				await mailOrder(fetch, 'new-membership-insurance', email, order);
				return {
					action: 'newWithInsurance',
					success: true,
					message: "L'ordine è stato inviato. Controlla lo storico nel tuo profilo",
					payload: { redirect: false }
				};
			}

			const session = await startCardCheckout(
				cookies,
				'membership-insurance',
				amountCents,
				{
					productTitle: 'Socio praticante + assicurazione',
					orderType: 'insurance',
					userId: locals.user?.userId ?? null,
					newUser: newUserData,
					withInsurance: true,
					membershipProduct,
					extraCart: [INSURANCE_PRODUCT],
					promoterId: promoterId.trim() || null,
					membershipUpdate: { level: 'Socio ordinario', expiryYears: 1, setActivation: true },
					mailTemplate: 'new-membership-insurance',
					mailTo: [email],
					invoicing,
					shipping: { ...invoicing, deliveryNotes: '' },
					orderNotes: ''
				},
				email,
				name,
				surname
			);

			return { action: 'newWithInsurance', success: true, message: 'Reindirizzamento al pagamento…', payload: { redirectUrl: session.url } };
		} catch (err: any) {
			console.error('membership newWithInsurance error:', err);
			return fail(400, {
				action: 'newWithInsurance',
				success: false,
				message: "Errore durante la creazione dell'ordine. Riprova o contattaci."
			});
		}
	},

	applyEmailRef: async ({ request, fetch }) => {
		const formData = await request.formData();
		const discountCode = formData.get('discountCode').toString().toLowerCase().trim();

		try {
			const userFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user',
					query: { email: discountCode },
					projection: { _id: 0, email: 1 },
					sort: { createdAt: -1 },
					limit: 1,
					skip: 0
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			if (!userFetch.ok) {
				return fail(400, { action: 'applyEmailRef', success: false, message: 'Utente non trovato' });
			}

			const user = await userFetch.json();
			if (user.length === 0) {
				return fail(400, { action: 'applyEmailRef', success: false, message: 'Utente non trovato' });
			}

			return {
				action: 'applyEmailRef',
				success: true,
				message: 'Codice amico applicato con successo',
				payload: discountCode.trim()
			};
		} catch (err) {
			console.error('Error applying applyEmailRef:', err);
			return fail(500, {
				action: 'applyEmailRef',
				success: false,
				message: "Errore durante l'applicazione del codice"
			});
		}
	}
} satisfies Actions;
