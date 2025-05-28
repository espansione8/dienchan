import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid'
const apiKey = APIKEY;
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

type CartItem = {
	prodId?: string;
	layoutView: { layoutId?: string, price: number };
	orderQuantity: number;
	price: number;
	[key: string]: any;
};

type DiscountItem = {
	discountId: string;
	code: string;
	type: 'amount' | 'percent';
	value: number;
	selectedApplicability: 'userId' | 'membershipLevel' | 'prodId' | 'layoutId';
	status: 'active' | 'disabled';
	userId?: string;
	membershipLevel?: string;
	prodId?: string;
	layoutId?: string;
	[key: string]: any;
};

export const load: PageServerLoad = async ({ locals, fetch }) => {
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

	if (selectedApplicability === 'prodId' || selectedApplicability === 'layoutId') {
		// Item-specific discounts
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
						throw new Error('Invalid price while calculating discount');
					}
					if (typeof item.price !== 'number') return fail(400, { action: 'discount helper', success: false, message: 'Errore calcolo' });
					const singleValue = (numericPrice * value) / 100;
					itemDiscount = singleValue * qty;
				}
				totalDiscount += itemDiscount;
			}

			// if (isLayout) {
			// 	let itemDiscount = 0;
			// 	if (type === 'amount') {
			// 		itemDiscount = value * item.orderQuantity;
			// 	} else if (type === 'percent') {
			// 		const singleValue = (item.layoutView.price * value) / 100;
			// 		itemDiscount = singleValue * item.orderQuantity;
			// 	}
			// 	totalDiscount += itemDiscount;
			// }
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
	new: async ({ request, fetch, locals }) => {
		const userId = locals.user?.userId ?? '';
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const descrShort = formData.get('descrShort') as string;
		const category = formData.get('category') as string || '';
		const price = formData.get('price') as string;
		//const prodImage = formData.get('image') as string || '';
		const renewalLength = formData.get('renewalLength') as string;

		if (!title || !price || !renewalLength || !userId) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}
		//console.log('new', title, descrShort, price, renewalLength, userId);
		try {
			const returnObj = false
			const newDoc = {
				orderId: nanoid(),
				title,
				descrShort,
				stockQty: 1,
				category: [category],
				price: Number(price),
				renewalLength,
				userId,
			};

			const res = await fetch(`${BASE_URL}/api/mongo/create`, {
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
			console.error('Error order new:', error);
			return { action: 'new', success: false, message: 'Error order new' };
		}
	},

	applyDiscount: async ({ request, fetch, locals }) => {

		const discountFetch = (discountCodes: string[]) => fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
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

			// Validate required fields
			if (!discountCode?.trim()) {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'Codice sconto richiesto'
				});
			}

			const originalTotal = Number(grandTotal) || 0;

			let cartArray: CartItem[] = [];
			try {
				cartArray = JSON.parse(cart || '[]');
			} catch {
				return fail(400, { action: 'applyDiscount', success: false, message: 'Cart invalido' });
			}
			const discountArray: string[] = JSON.parse(discountList || '[]');

			// Check if discount code is already applied
			if (discountArray.includes(discountCode)) {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'Sconto già applicato'
				});
			}

			// Create new discount array with the new code
			const newDiscountArray = [...discountArray, discountCode];

			// Fetch all discounts from database
			const discountRes = await discountFetch(newDiscountArray);
			const discountGroup: DiscountItem[] = await discountRes.json();

			// Find the specific discount being applied
			const discountItem = discountGroup.find((item: DiscountItem) => item.code === discountCode);

			if (!discountItem) {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'Codice sconto non trovato'
				});
			}

			// Check if discount is active
			if (discountItem.status === 'disabled') {
				return fail(400, {
					action: 'applyDiscount',
					success: false,
					message: 'Sconto non attivo'
				});
			}

			// Validate discount applicability
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
			console.log('discountApplied', discountApplied());



			return {
				action: 'applyDiscount',
				success: true,
				message: 'Sconto applicato con successo',
				payload: {
					discountApplied: discountApplied(),
					discountArray: newDiscountArray
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
				apiKey,
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

			// Validate required fields
			if (!removeCode?.trim()) {
				return fail(400, {
					action: 'removeDiscount',
					success: false,
					message: 'Codice sconto richiesto'
				});
			}

			const originalTotal = Number(grandTotal) || 0;
			const cartArray: CartItem[] = JSON.parse(cart || '[]');
			let discountArray: string[] = JSON.parse(discountList || '[]');

			// Remove the discount code from array
			discountArray = discountArray.filter(code => code !== removeCode);

			// If no discounts remain, return empty result
			if (discountArray.length === 0) {
				return {
					action: 'removeDiscount',
					success: true,
					message: 'Sconto rimosso con successo',
					payload: {
						discountApplied: [],
						discountArray: []
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
					discountArray
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
			return fail(400, { action: 'confirmCart', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			const response = await fetch(`${BASE_URL}/api/auth/sign-up-admin`, {
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
				return { action: 'confirmCart', success: true, message: result.message };
			} else {
				return { action: 'confirmCart', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error confirmCart:', error);
			return { action: 'confirmCart', success: false, message: 'Error confirmCart' };
		}
	},

} satisfies Actions;		