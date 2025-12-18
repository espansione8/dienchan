import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY, SALT, STRIPE_KEY_FRONT, STRIPE_KEY_BACK } from '$env/static/private';
import { error, fail } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import { customAlphabet } from 'nanoid'
import Stripe from 'stripe';
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 9)
const stripe = new Stripe(STRIPE_KEY_BACK, {
	apiVersion: '2025-08-27.basil'
});

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const user = locals.user

	return {
		userData: user,
		auth: locals.auth,
		stripePublishableKey: STRIPE_KEY_FRONT
	};
}

export const actions: Actions = {
	createPaymentIntent: async ({ request }) => {
		try {
			const formData = await request.formData();
			const email = formData.get('email')?.toString().toLowerCase().trim();
			const name = formData.get('name') as string;
			const surname = formData.get('surname') as string;

			if (!email) {
				return fail(400, {
					action: 'createPaymentIntent',
					success: false,
					message: 'Dati mancanti'
				});
			}

			const amountInCents = 7000; // 70 euro fissi

			const paymentIntent = await stripe.paymentIntents.create({
				amount: amountInCents,
				currency: 'eur',
				automatic_payment_methods: {
					enabled: true
				},
				metadata: {
					email,
					name: `${name.trim()} ${surname.trim()}`
				},
				payment_method_options: {
					card: {
						request_three_d_secure: 'automatic'
					}
				}
			});

			return {
				action: 'createPaymentIntent',
				success: true,
				payload: {
					clientSecret: paymentIntent.client_secret,
					paymentIntentId: paymentIntent.id
				}
			};
		} catch (err: any) {
			console.error('PaymentIntent creation error:', err);
			return fail(400, {
				action: 'createPaymentIntent',
				success: false,
				message: `Errore creazione pagamento: ${err.message}`
			});
		}
	},

	new: async ({ request, fetch, locals }) => {
	const formData = await request.formData();
	const payment = formData.get('payment');
	const paymentIntentId = formData.get('paymentIntentId') as string | null;

	const userData = locals.user;
	const userId = userData?.userId;

	// Verifica che l'utente sia loggato
	if (!locals.auth || !userId) {
		return fail(400, { action: 'new', success: false, message: 'Devi essere loggato per acquistare l\'assicurazione' });
	}

	// Verifica dati utente completi
	if (!userData.name || !userData.surname || !userData.email || !userData.address ||
		!userData.city || !userData.county[0] || !userData.postalCode || !userData.country) {
		return fail(400, { action: 'new', success: false, message: 'Dati utente incompleti. Aggiorna il tuo profilo prima di procedere.' });
	}

	if (!payment) {
		return fail(400, { action: 'new', success: false, message: 'Metodo di pagamento mancante' });
	}	
	// Calcola la data di scadenza (oggi + 1 anno)
	// const insuranceExpiry = new Date();
	// insuranceExpiry.setFullYear(insuranceExpiry.getFullYear() + 1);

	const mailFetch = (email, order) => fetch(`${BASE_URL}/api/mailer/new-insurance`, {
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
		const insuranceProduct = {
			title: 'Contributo Socio Praticante',
			description: 'Il presente contributo permette a un socio praticante di godere di alcune agevolazioni quali utilizzo delle sale dell\'associazione con tariffa agevolata e inclusione della polizza di copertura RC dell\'associazione',
			price: 70,
			type: 'insurance'
		};

		const newDoc = {
			userId: userId,
			status: 'requested',
			type: 'insurance',
			orderDate: new Date(),
			orderConfirmDate: null,
			promotionId: '',
			promotionName: '',
			promoterId: '',
			agencyId: '',
			orderConfirmed: false,
			totalPoints: 0,
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
				county: userData.county[0],
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
				county: userData.county[0],
				postalCode: userData.postalCode,
				state: '',
				region: '',
				country: userData.country,
				deliveryNotes: '',
				email: userData.email,
				phone: userData.phone,
				mobilePhone: userData.mobilePhone,
			},
			payment: {
				method: payment,
				statusPayment: paymentIntentId ? 'done' : 'pending',
				transactionId: paymentIntentId || '',
				points: '',
				value: ''
			},
		};

		// Crea l'ordine
		const resInsurance = await fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'order',
				newDoc: {
					orderId: nanoid(),
					orderCode: crypto.randomUUID(),
					totalValue: 70,
					...newDoc,
					cart: [insuranceProduct]
				},
				returnObj: true
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		
		if (!resInsurance.ok) {
			return fail(400, { action: 'new', success: false, message: await resInsurance.text() });
		}

		// Aggiorna i dati assicurazione dell'utente (sempre insuranceStatus = false)
		const updateUser = await fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user',
				query: { userId: userId },
				update: {
					$set: {
					// 'insurance.insuranceExpiry': insuranceExpiry,
						'insurance.insuranceStatus': false // Sempre false anche con pagamento carta
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!updateUser.ok) {
			return fail(400, { action: 'new', success: false, message: await updateUser.text() });
		}

		const order = await resInsurance.json();
		const mailRes = await mailFetch(userData.email, order);

		if (!mailRes.ok) {
			return fail(400, { action: 'new', success: false, message: await mailRes.text() });
		}

		return { action: 'new', success: true, message: "L'ordine è stato inviato. Controlla lo storico nel tuo profilo" };

	} catch (error) {
		console.error('Error creating insurance order:', error);
		return fail(400, { action: 'new', success: false, message: 'Error new order' });
	}
},

} satisfies Actions;