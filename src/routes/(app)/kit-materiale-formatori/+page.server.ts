import type { PageServerLoad, Actions } from './$types';
import { BASE_URL, APIKEY } from '$env/static/private';
import { error, fail, redirect } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 9);

export const load: PageServerLoad = async ({ fetch, locals }) => {
	// Verifica accesso (superadmin, admin, o formatore)
	if (!locals.auth) {
		throw redirect(302, '/login');
	}

	const userLevel = locals.user?.level;
	const isFormatore = locals.user?.isRiflessologo;

	if (userLevel !== 'superadmin' && userLevel !== 'admin' && !isFormatore) {
		throw error(403, 'Accesso non autorizzato');
	}

	// Fetch prodotti kit formatori
	let kitProducts = [];
	let tableList = [];

	try {
		// Fetch prodotti
		const productsFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product',
				query: {
					type: 'product',
					category: 'Materiale formatori'
				},
				projection: { _id: 0 },
				sort: { title: 1 },
				limit: 100,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!productsFetch.ok) {
			console.error('products fetch failed', productsFetch.status, await productsFetch.text());
			throw error(400, 'Errore caricamento prodotti');
		}

		kitProducts = await productsFetch.json();

		// Fetch ordini che contengono prodotti "Materiale formatori"
		const ordersFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'order',
				query: {
					type: 'product',
					'cart.category': 'Materiale formatori'
				},
				projection: { _id: 0 },
				sort: { createdAt: -1 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!ordersFetch.ok) {
			console.error('orders fetch failed', ordersFetch.status, await ordersFetch.text());
			throw error(400, 'Errore caricamento ordini');
		}

		tableList = await ordersFetch.json();
	} catch (err) {
		console.error('Error fetching data:', err);
		throw error(500, 'Errore server');
	}
	return {
		kitProducts,
		tableList,
		auth: locals.auth,
		userData: locals.user
	};
};

export const actions: Actions = {
	createOrder: async ({ request, fetch, locals }) => {
		if (!locals.auth) {
			return fail(401, {
				action: 'createOrder',
				success: false,
				message: 'Non autorizzato'
			});
		}

		try {
			const formData = await request.formData();

			// Parse cart data
			const cartData = formData.get('cart') as string;
			let cart: Array<{ prodId: string; quantity: number }> = [];

			try {
				cart = JSON.parse(cartData);
			} catch (e) {
				return fail(400, {
					action: 'createOrder',
					success: false,
					message: 'Dati carrello non validi'
				});
			}

			// Dati spedizione
			const shippingName = formData.get('shippingName') as string;
			const shippingSurname = formData.get('shippingSurname') as string;
			const shippingEmail = formData.get('shippingEmail')?.toString().toLowerCase().trim();
			const shippingPhone = formData.get('shippingPhone') as string;
			const shippingMobilePhone = formData.get('shippingMobilePhone') as string;
			const shippingAddress = formData.get('shippingAddress') as string;
			const shippingCity = formData.get('shippingCity') as string;
			const shippingCounty = formData.get('shippingCounty') as string;
			const shippingPostalCode = formData.get('shippingPostalCode') as string;
			const shippingCountry = formData.get('shippingCountry') as string;

			// Validazione
			if (!cart || cart.length === 0) {
				return fail(400, {
					action: 'createOrder',
					success: false,
					message: 'Carrello vuoto'
				});
			}

			if (!shippingName || !shippingSurname || !shippingEmail || !shippingMobilePhone ||
				!shippingAddress || !shippingCity || !shippingCounty || !shippingPostalCode || !shippingCountry) {
				return fail(400, {
					action: 'createOrder',
					success: false,
					message: 'Compila tutti i campi obbligatori'
				});
			}

			// Fetch tutti i prodotti nel carrello
			const productIds = cart.map(item => item.prodId);

			const productFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: { prodId: { $in: productIds } },
					projection: { _id: 0 },
					limit: 100
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!productFetch.ok) {
				return fail(400, {
					action: 'createOrder',
					success: false,
					message: 'Errore nel recupero dei prodotti'
				});
			}

			const products = await productFetch.json();

			if (products.length === 0) {
				return fail(400, {
					action: 'createOrder',
					success: false,
					message: 'Nessun prodotto trovato'
				});
			}

			// Crea array carrello con i prodotti completi e quantità
			const cartItems = cart.map(cartItem => {
				const product = products.find(p => p.prodId === cartItem.prodId);
				if (!product) {
					throw new Error(`Prodotto ${cartItem.prodId} non trovato`);
				}
				return {
					...product,
					orderQuantity: cartItem.quantity
				};
			});

			// Crea ordine
			const orderId = nanoid();
			const orderCode = crypto.randomUUID();

			const newOrder = {
				orderId,
				orderCode,
				userId: locals.user.userId,
				status: 'confirmed',
				orderDate: new Date(),
				orderConfirmDate: new Date(),
				orderConfirmed: true,
				totalValue: 0,
				totalVAT: 0,
				totalPoints: 0,
				totalDiscount: 0,
				type: 'product',
				promotionId: '',
				promotionName: '',
				promoterId: null,
				agencyId: '',
				browser: '',
				orderIp: '',
				invoicing: {
					name: locals.user.name,
					surname: locals.user.surname,
					businessName: '',
					vatNumber: '',
					address: locals.user.address,
					city: locals.user.city,
					county: locals.user.county?.[0] || '',
					postalCode: locals.user.postalCode,
					state: '',
					region: '',
					country: locals.user.country,
					invoiceNotes: '',
					email: locals.user.email,
					phone: locals.user.phone || '',
					mobilePhone: locals.user.mobilePhone || ''
				},
				shipping: {
					name: shippingName,
					surname: shippingSurname,
					address: shippingAddress,
					city: shippingCity,
					county: shippingCounty,
					postalCode: shippingPostalCode,
					state: '',
					region: '',
					country: shippingCountry,
					deliveryNotes: '',
					email: shippingEmail,
					phone: shippingPhone || '',
					mobilePhone: shippingMobilePhone
				},
				payment: {
					method: 'Non richiesto',
					statusPayment: 'done',
					transactionId: '',
					points: '',
					value: ''
				},
				cart: cartItems
			};

			// Salva ordine
			const orderRes = await fetch(`${BASE_URL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order',
					newDoc: newOrder,
					returnObj: true
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!orderRes.ok) {
				return fail(400, {
					action: 'createOrder',
					success: false,
					message: 'Errore durante la creazione dell\'ordine'
				});
			}

			const order = await orderRes.json();

			// Invia email notifica
			const mailRes = await fetch(`${BASE_URL}/api/mailer/new-order`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					//email: [shippingEmail],
					email: ['powerperformance.vn@gmail.com', shippingEmail],
					order
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!mailRes.ok) {
				console.error('Failed to send notification email:', await mailRes.text());
			}

			return {
				action: 'createOrder',
				success: true,
				message: 'Ordine inviato con successo! Verrai reindirizzato al tuo profilo.',
				payload: { orderId }
			};

		} catch (err) {
			console.error('Error creating order:', err);
			return fail(500, {
				action: 'createOrder',
				success: false,
				message: 'Errore server durante la creazione dell\'ordine'
			});
		}
	}
};