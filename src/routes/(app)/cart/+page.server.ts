import type { PageServerLoad, Actions } from './$types'
import { fail } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid'
const apiKey = import.meta.env.VITE_APIKEY;
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

type CartItem = {
	layoutView: { price: number };
	orderQuantity: number;
	[key: string]: any;
};

type DiscountResult = {
	//discountId: string;
	code: string;
	// type: string;
	// value: number;
	// selectedApplicability: string;
	totalDiscount: number;
};

export const load: PageServerLoad = async ({ locals, fetch }) => {
	try {
		const query = {};
		const projection = {};
		const sort = {};
		const limit = 1000;
		const skip = 0;

		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				apiKey: import.meta.env.VITE_APIKEY,
				schema: 'product', // Assuming you want to fetch cart items from the 'product' schema
				query,
				projection,
				sort,
				limit,
				skip
			})
		});

		if (!res.ok) {
			throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
		}

		const response = await res.json();

		return {
			userData: locals.user || null,
			auth: locals.auth,
			cartItems: response // Adjust property name as needed
		};
	} catch (error) {
		console.error('Error fetching data in load function:', error);
		return {
			userData: locals.user || null,
			auth: locals.auth,
			cartItems: [] // Provide a default value in case of error
		};
	}
};

export const actions: Actions = {
	new: async ({ request, fetch, locals }) => {
		const userId = locals.user?.userId ?? '';
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const descrShort = formData.get('descrShort') as string;
		const category = formData.get('category') as string || '';
		const price = formData.get('price') as string;
		const prodImage = formData.get('image') as string || '';
		const renewalLength = formData.get('renewalLength') as string;

		if (!title || !price || !renewalLength || !userId) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}
		//console.log('new', title, descrShort, price, renewalLength, userId);
		try {

			const prodId = nanoid() // OLD stringHash(crypto.randomUUID());
			const returnObj = false
			const newDoc = {
				prodId,
				title,
				descrShort,
				stockQty: 1,
				category: [category],
				price,
				renewalLength,
				userId,
			};

			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'order', //product | order | user | layout | discount
					newDoc,
					returnObj
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();

			if (res.status == 200) {
				return { action: 'new', success: true, message: response.message };
			} else {
				return { action: 'new', success: false, message: response.message };
			}
		} catch (error) {
			console.error('Error creating new membership:', error);
			return { action: 'new', success: false, message: 'Errore creazione membership' };
		}
	},

	applyDiscount: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const discountCode = formData.get('discountCode') as string;
		const grandTotal = formData.get('grandTotal') as string;
		const originalTotal = Number(grandTotal)
		const cart = formData.get('cart') as string;
		const cartArray = JSON.parse(cart)
		const discountList = formData.get('discountList') as string;
		const discountArray = JSON.parse(discountList)  //[]   
		const checkCode = discountArray.some((item: any) => item == discountCode);
		// butto sempre il codice nell'array 
		discountArray.push(discountCode);

		if (!discountCode || checkCode) {
			return fail(400, { action: 'applyDiscount', success: false, message: checkCode ? 'Sconto già applicato' : 'Dati mancanti' });
		}

		try {
			// l'api restituisce il gruppo di sconti nel database
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/check`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					discountArray
				})
			});
			const discountGroup = await response.json();

			// mi prendo i dati del codice sconto che sto esaminando
			const discountItem = discountGroup.find((item: any) => item.code == discountCode);
			// Verifico solo se c'è scritto qualcosa e se è attivo
			if (discountItem && discountItem.status == "disabled") {
				return fail(400, { action: 'applyDiscount', success: false, message: 'Sconto non attivo' });
			}
			if (!discountItem) {
				return fail(400, { action: 'applyDiscount', success: false, message: 'Sconto non trovato' });
			}

			// controllo se il codice è applicabile, separato per poter controllare singolarmente
			if (discountItem.selectedApplicability == 'userId' && discountItem.userId != locals.user?.userId) {
				return fail(400, { action: 'applyDiscount', success: false, message: 'Sconto non applicabile' });
			}
			else if (discountItem.selectedApplicability == 'membershipLevel' && discountItem.membershipLevel != locals.user?.membership?.membershipLevel) {
				return fail(400, { action: 'applyDiscount', success: false, message: 'Sconto non applicabile' });
			}
			else if (discountItem.selectedApplicability == 'prodId') {
				// DA FARE QUANDO CI SARA' LA POSSIBILITA' DI COMPRARE I PRODOTTI, molto simile a quello sotto
				return fail(400, { action: 'applyDiscount', success: false, message: 'Sconto non applicabile' });
			}
			else if (discountItem.selectedApplicability == 'layoutId') {
				let isThere = false;
				cartArray.forEach((item: CartItem) => {
					if (item.layoutView.layoutId == discountItem.layoutId) {
						isThere = true;
					}
				});
				if (!isThere) {
					return fail(400, { action: 'applyDiscount', success: false, message: 'Sconto non applicabile' });
				}
			}

			// QUA DEVO ARRIVARE AVENDO GIA' VERIFICATO SE IL CODICE E' ATTIVABILE
			if (response.status == 200) {
				const discountApplied: DiscountResult[] = []
				// Ciclo per ogni sconto il calcolo dello sconto
				discountGroup.forEach((discount: any) => {
					const { discountId, code, type, value, selectedApplicability } = discount;
					let totalDiscount = 0;
					// 1. ciclo gli sconti sul corso o prodotto
					cartArray.forEach((item: CartItem) => {

						if (selectedApplicability == 'prodId' || selectedApplicability == 'layoutId') {
							if (item[selectedApplicability] == discount[selectedApplicability]) {
								let itemDiscount = 0;
								if (type == 'amount') {
									itemDiscount = value * item.orderQuantity;
								} else if (type == 'percent') {
									const singleValue = (item.layoutView.price * value) / 100;
									itemDiscount = singleValue * item.orderQuantity;
								}
								totalDiscount += itemDiscount;
							}
						}
					});
					// 2. applico gli sconti sull'utente
					if (selectedApplicability == 'userId' || selectedApplicability == 'membershipLevel') {

						let itemDiscount = 0;
						if (type == 'amount') {
							itemDiscount = value
						} else if (type == 'percent') {
							itemDiscount = (originalTotal * value) / 100;
						}
						totalDiscount += itemDiscount;
					}

					// 3. aggiungo il codice con il suo sconto
					discountApplied.push({
						//discountId,
						code,
						//type,
						//value,
						//selectedApplicability,
						totalDiscount
					});
				});

				return { action: 'applyDiscount', success: true, message: "sconto applicato", payload: { discountApplied, discountArray } };
			} else {
				return { action: 'applyDiscount', success: false, message: discountGroup.message };
			}
		} catch (error) {
			console.error('Error apply Discount:', error);
			return { action: 'applyDiscount', success: false, message: 'Errore sconto' };
		}
	},

	removeDiscount: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const removeCode = formData.get('removeCode') as string;
		const grandTotal = formData.get('grandTotal') as string;
		const originalTotal = Number(grandTotal)
		const cart = formData.get('cart') as string;
		const cartArray = JSON.parse(cart)
		const discountList = formData.get('discountList') as string;
		let discountArray = JSON.parse(discountList)  //[]  
		discountArray = discountArray.filter(item => item !== removeCode);
		// console.log('formData', formData);

		try {
			// l'api restituisce il gruppo di sconti nel database
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/discounts/check`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					discountArray
				})
			});
			const discountGroup = await response.json();

			// QUA DEVO ARRIVARE AVENDO GIA' TOLTO IL CODICE SCONTO
			if (response.status == 200) {
				const discountApplied: DiscountResult[] = []
				// Ciclo per ogni sconto il calcolo dello sconto
				discountGroup.forEach((discount: any) => {
					const { discountId, code, type, value, selectedApplicability } = discount;
					let totalDiscount = 0;
					// 1. ciclo gli sconti sul corso o prodotto
					cartArray.forEach((item: CartItem) => {

						if (selectedApplicability == 'prodId' || selectedApplicability == 'layoutId') {
							if (item[selectedApplicability] == discount[selectedApplicability]) {
								let itemDiscount = 0;
								if (type == 'amount') {
									itemDiscount = value * item.orderQuantity;
								} else if (type == 'percent') {
									const singleValue = (item.layoutView.price * value) / 100;
									itemDiscount = singleValue * item.orderQuantity;
								}
								totalDiscount += itemDiscount;
							}
						}
					});
					// 2. applico gli sconti sull'utente
					if (selectedApplicability == 'userId' || selectedApplicability == 'membershipLevel') {

						let itemDiscount = 0;
						if (type == 'amount') {
							itemDiscount = value
						} else if (type == 'percent') {
							itemDiscount = (originalTotal * value) / 100;
						}
						totalDiscount += itemDiscount;
					}

					// 3. aggiungo il codice con il suo sconto
					discountApplied.push({
						//discountId,
						code,
						//type,
						//value,
						//selectedApplicability,
						totalDiscount
					});


				});

				return { action: 'removeDiscount', success: true, message: "sconto rimosso", payload: { discountApplied, discountArray } };
			} else {
				return { action: 'removeDiscount', success: false, message: discountGroup.message };
			}
		} catch (error) {
			console.error('Error removeDiscount:', error);
			return { action: 'removeDiscount', success: false, message: 'Errore sconto' };
		}
	},

	confirmCart: async ({ request, fetch }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode') || '';
		const city = formData.get('city') || '';
		const countryState = formData.get('countryState') || '';
		const country = formData.get('country') || '';
		const phone = formData.get('phone') || '';
		const mobilePhone = formData.get('mobilePhone') || '';

		if (!name || !surname || !email || !address || !postalCode || !city || !countryState || !country || !phone || !mobilePhone) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/sign-up-admin`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					surname,
					email,
					address,
					postalCode,
					city,
					countryState,
					country,
					phone,
					mobilePhone
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'newUser', success: true, message: result.message };
			} else {
				return { action: 'newUser', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new newUser:', error);
			return { action: 'newUser', success: false, message: 'Errore creazione newUser' };
		}
	},

} satisfies Actions;
