import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY, STRIPE_KEY_BACK, STRIPE_API } from '$env/static/private';
import { fail } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid'
import Stripe from 'stripe';
import { createCheckoutSession, createOfflineCheckout } from '$lib/server/checkout';

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 9)
const stripe = new Stripe(STRIPE_KEY_BACK, {
	apiVersion: STRIPE_API
});

const INSURANCE_PRICE = 70;

const INSURANCE_PRODUCT = {
	title: 'Contributo Socio Praticante',
	description:
		"Il presente contributo permette a un socio praticante di godere di alcune agevolazioni quali utilizzo delle sale dell'associazione con tariffa agevolata e inclusione della polizza di copertura RC dell'associazione",
	price: INSURANCE_PRICE,
	type: 'insurance'
};

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const user = locals.user

	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

	// Recupera ordini insurance dell'utente se loggato
	let insuranceOrders = [];
	if (user?.userId) {
		try {
			const ordersRes = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order',
					query: {
						userId: user.userId,
						type: 'insurance',
						status: 'requested',
						orderConfirmed: false,
						'payment.statusPayment': { $in: ['pending', 'done'] },
						orderDate: { $gte: oneMonthAgo }

					}
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (ordersRes.ok) {
				insuranceOrders = await ordersRes.json();
			}
		} catch (err) {
			console.error('Error fetching insurance orders:', err);
		}
	}

	return {
		userData: user,
		auth: locals.auth,
		insuranceOrders
	};
}

export const actions: Actions = {

	/**
	 * Acquisto del contributo socio praticante.
	 *
	 * Authenticated only. Validation and the amount (a fixed 70 €) are settled before any
	 * payment; for cards the order is written by the webhook, for bank transfer right away.
	 */
	new: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const payment = formData.get('payment') as string;

		const userData = locals.user;
		const userId = userData?.userId;

		// Verifica che l'utente sia loggato
		if (!locals.auth || !userId) {
			return fail(400, { action: 'new', success: false, message: "Devi essere loggato per acquistare l'assicurazione" });
		}

		// Verifica dati utente completi
		if (!userData.name || !userData.surname || !userData.email || !userData.address ||
			!userData.city || !userData.county[0] || !userData.postalCode || !userData.country) {
			return fail(400, { action: 'new', success: false, message: 'Dati utente incompleti. Aggiorna il tuo profilo prima di procedere.' });
		}

		if (!payment) {
			return fail(400, { action: 'new', success: false, message: 'Metodo di pagamento mancante' });
		}

		try {
			const totalValue = INSURANCE_PRICE;
			const amountCents = totalValue * 100;

			const invoicing = {
				name: userData.name,
				surname: userData.surname,
				businessName: '',
				vatNumber: '',
				address: userData.address,
				city: userData.city,
				county: userData.county[0],
				postalCode: userData.postalCode,
				state: '',
				region: '',
				country: userData.country,
				invoiceNotes: '',
				email: userData.email,
				phone: userData.phone,
				mobilePhone: userData.mobilePhone
			};
			const shipping = { ...invoicing, deliveryNotes: '' };

			// ---- bank transfer: order is created immediately, payment pending ----
			if (payment !== 'Carta di credito') {
				await createOfflineCheckout({
					flow: 'insurance',
					amountCents,
					email: userData.email,
					name: userData.name,
					surname: userData.surname,
					payload: {
						productTitle: INSURANCE_PRODUCT.title,
						orderType: 'insurance',
						paymentMethod: payment,
						statusPayment: 'pending',
						userId,
						newUser: null,
						insuranceProduct: INSURANCE_PRODUCT,
						extraCart: [],
						mailTemplate: 'new-insurance',
						mailTo: [userData.email],
						invoicing,
						shipping,
						orderNotes: ''
					}
				});
				return { action: 'new', success: true, message: "L'ordine è stato inviato. Controlla lo storico nel tuo profilo" };
			}

			// ---- card: prepare everything, then redirect to Stripe ----
			const session = await createCheckoutSession({
				flow: 'insurance',
				amountCents,
				email: userData.email,
				name: userData.name,
				surname: userData.surname,
				payload: {
					productTitle: INSURANCE_PRODUCT.title,
					orderType: 'insurance',
					paymentMethod: 'Carta di credito',
					statusPayment: 'done',
					userId,
					newUser: null,
					insuranceProduct: INSURANCE_PRODUCT,
					extraCart: [],
					mailTemplate: 'new-insurance',
					mailTo: [userData.email],
					invoicing,
					shipping,
					orderNotes: ''
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
			console.error('insurance new error:', err);
			return fail(400, {
				action: 'new',
				success: false,
				message: "Errore durante la creazione dell'ordine. Riprova o contattaci."
			});
		}
	}
} satisfies Actions;
