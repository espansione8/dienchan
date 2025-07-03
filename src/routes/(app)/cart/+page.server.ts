import type { PageServerLoad, Actions } from './$types'
import type { CartItem, DiscountItem } from '$lib/types';
import { BASE_URL, APIKEY, SALT } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

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
	///// IF selectedApplicability === 'refPoints' use refDiscount
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
	} else if (selectedApplicability === 'email' || selectedApplicability === 'membershipLevel') {
		// User-level discounts
		if (type === 'amount') {
			totalDiscount = value;
		} else if (type === 'percent') {
			totalDiscount = (originalTotal * value) / 100;
		}
	}
	else if (selectedApplicability === 'refPoints') {
		// Ref-level discounts
		totalDiscount = (originalTotal * discount.refDiscount) / 100;

	}
	return totalDiscount;
	// else if (selectedApplicability === 'cart') {
	// 	// Cart-level discounts
	// 		if (type === 'amount') {
	// 			totalDiscount = value;
	// 		} else if (type === 'percent') {
	// 		totalDiscount = (originalTotal * value) / 100;
	// 		}
	// 	}
}

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
		const totalValue = Number(formData.get('totalValue'));
		const cart = formData.get('cart');
		//const discountList = formData.get('discountList')
		const discountList = formData.get('discountList') as string;;
		const cartItem = JSON.parse(String(cart)) || null;
		const discountItem = JSON.parse(String(discountList)) || null;
		const discountArray: string[] = JSON.parse(discountList || '[]').map(item => item.code);
		const newPointsBalance = Number(formData.get('newPointsBalance'));
		const usedPoints = Number(formData.get('usedPoints'));
		const usePoint = formData.get('usePoint') === 'true' // 'true' make it boolean

		// Calculate total cart on server anche for security
		const cartRecalculated = () => {
			let total = 0;
			//total += 9 //delivery fee
			cartItem.forEach((element: any) => {
				if (element.type == 'course') {
					total += element.layoutView.price * (element.orderQuantity || 1);
				} else {
					total += element.price * (element.orderQuantity || 1);
				}
			});
			return total;
		};
		const totalDiscount = discountItem.reduce((acc, element: any) => acc + (element.totalDiscount || 0), 0)

		let recalculatedTotal = cartRecalculated() - totalDiscount;
		if (usePoint) {
			recalculatedTotal -= usedPoints;
		}
		if (Number(totalValue) !== recalculatedTotal) {
			return fail(400, { action: 'new', success: false, message: 'Totale non valido' });
		}

		const mailFetch = (email, order) => fetch(`${BASE_URL}/api/mailer/new-order`, {
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

		//const file = formData.get('image') || '';
		console.log(name, surname, email, address, city, county, postalCode, country, phone, mobilePhone, payment, password1, password2, totalValue, cartItem);
		let currentUserId: string = locals.user?.userId ?? '';

		if (!locals.auth) {
			if (!password1 || !password2 || password1.length < 8) {
				return fail(400, { action: 'new', success: false, message: 'Password troppo corta' });
			}
			if (password1 !== password2) {
				return fail(400, { action: 'new', success: false, message: 'Password non corrispondenti' });
			}
		}

		if (!name || !surname || !email || !address || !city || !county || !postalCode || !country || !payment || !totalValue || cartItem.length < 1) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		if (!locals.auth) {
			let userExist = false;
			try {
				const res = await fetch(`${BASE_URL}/api/mongo/find`, {
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
				if (!res.ok) {
					console.error('user fetch failed', res.status, await res.text());
					return fail(400, { action: 'new', success: false, message: 'errore database user' });
				}
				const response = await res.json();
				if (response.length > 0) {
					userExist = true;
					return fail(400, { action: 'new', success: false, message: 'email esistente' });
				}
			} catch (err) {
				console.log('userCheck error:', err);
				return fail(400, { action: 'new', success: false, message: 'userCheck error' });
			}
			if (!userExist) {
				try {
					const cookieId = crypto.randomUUID()

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
								cookieId,
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
					if (!res.ok) {
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
				totalValue: totalValue < 100 ? totalValue + 9 : totalValue,
				totalDiscount: Number(totalDiscount),
				totalVAT: 0,
				browser: '',
				orderIp: '',
				orderNotes: '',
				type: 'product',
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
				cart: cartItem
			};
			const res = await fetch(`${BASE_URL}/api/mongo/create`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order', //product | order | user | layout | discount
					newDoc,
					returnObj: true
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!res.ok) {
				return fail(400, { action: 'new', success: false, message: await res.text() });
			}

			const order = await res.json();
			// METTERE EMAIL ADMIN DIENCHAN
			// const mailArray = [amministrazionedienchan@gmail.com, email]
			const mailRes = await mailFetch(email, order);
			if (!mailRes.ok) {
				console.error('Mail sending failed:', await mailRes.text());
			}

			const updateQty = cartItem.map(async (item) => {
				const updateQtyRes = await fetch(`${BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'product',
						query: { prodId: item.prodId },
						update: {
							$inc: {
								stockQty: -item.orderQuantity
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

			if (discountArray.length > 0) {
				// Calc discount points for user
				const discountRes = await fetch(`${BASE_URL}/api/mongo/find`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'discount',
						query: { code: { $in: discountArray }, type: 'refPoints' },
						projection: { _id: 0 },
						sort: { createdAt: -1 },
						limit: 1,
						skip: 0
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (!discountRes.ok) {
					return fail(400, { action: 'new', success: false, message: await discountRes.text() });
				}
				const discount = await discountRes.json();
				console.log('discount', discount);

				if (!discount[0].email) {
					console.error('no refPoint email found');
				}
				const calcPoint = Math.round(totalValue * discount[0].refPoints / 100);

				const updateRes = await fetch(`${BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'user', //product | order | user | layout | discount
						query: { email: discount[0].email },
						update: {
							$inc: {
								pointsBalance: calcPoint
							},
							$push: {
								pointsHistory: {
									points: calcPoint,
									note: `punti per ordine: ${orderId}`
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
				if (!updateRes.ok) {
					const errorText = await updateRes.text();
					console.error('user update failed', updateRes.status, errorText);
					return fail(400, { action: 'modifyPoints', success: false, message: errorText });
				}
			}

			if (usePoint) {
				if (newPointsBalance < 0) {
					return fail(400, { action: 'new', success: false, message: 'Saldo punti insufficiente' });
				}
				const updatePoint = await fetch(`${BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'user', //product | order | user | layout | discount
						query: { userId: currentUserId },
						update: {
							$set: {
								pointsBalance: Math.round(newPointsBalance)
							},
							$push: {
								pointsHistory: {
									points: -usedPoints,
									note: `punti utilizzati per ordine: ${orderId}`
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
				if (!updatePoint.ok) {
					const errorText = await updatePoint.text();
					console.error('user points update failed', updatePoint.status, errorText);
					return fail(400, { action: 'new: update points balance', success: false, message: errorText });
				}
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
		const formData = await request.formData();
		const discountCode = formData.get('discountCode') as string;
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

					case 'refPoints':
						return true;

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
			const removeCode = formData.get('removeCode') as string;
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