import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	let getTableNames = [];

	const orderFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'order', //product | order | user | layout | discount
			query: {},
			projection: { _id: 0, password: 0 },
			sort: { createdAt: -1 },
			limit: 50,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const userFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'user', //product | order | user | layout | discount
			query: { status: 'enabled' },
			projection: { _id: 0, userId: 1, surname: 1, name: 1 },
			sort: { surname: 1 },
			limit: 0,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	try {

		const [userRes, orderRes] = await Promise.all([
			userFetch,
			orderFetch
		])

		if (userRes.status !== 200 || orderRes.status !== 200) {
			const errorText = `${await userRes.text()} ${await orderRes.text()} `;
			console.error('Promise.all failed', userRes.status, orderRes.status, errorText);
			//return fail(400, { action: 'load', success: false, message: errorText });
			throw error(400, errorText);
		}

		const resGetOrder = await orderRes.json();
		if (resGetOrder.length > 0) {
			getTable = resGetOrder.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10),
				orderDate: obj.orderDate.substring(0, 10),
				totalCart: obj.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(2)
			}));
		}

		getTableNames = await userRes.json();

	} catch (error) {
		console.log('page fetch error:', error);
		throw error(500, 'Server error');
	}

	return {
		getTable,
		getTableNames,
		auth: locals.auth
	};
}

export const actions: Actions = {
	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId');
		const userId = formData.get('userId');
		const email = formData.get('email');
		const name = formData.get('name');
		const surname = formData.get('surname');
		const city = formData.get('city');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode');
		const county = formData.get('county');
		const country = formData.get('country');
		const phone = formData.get('phone');
		const mobile = formData.get('mobile');
		const paymentMethod = formData.get('paymentMethod');
		const status = formData.get('status');
		const statusPayment = formData.get('statusPayment');
		const promoterId = formData.get('promoterId') as string | null;
		const cart = formData.get('cart') as string;
		const cartItem = cart ? JSON.parse(String(cart)) : null;
		const type = formData.get('type') as string;

		const filterOrderId = formData.get('filterOrderId') as string;
		const filterUserId = formData.get('filterUserId') as string;
		const filterSurname = formData.get('filterSurname') as string;
		const filterEmail = formData.get('filterEmail') as string;
		const filterPaymentMethod = formData.get('filterPaymentMethod') as string;
		const filterStatus = formData.get('filterStatus') as string;
		const filterStatusPayment = formData.get('filterStatusPayment') as string;
		const filterType = formData.get('filterType') as string;
		const filterCourseId = formData.get('filterCourseId') as string;

		const hasFilters = filterOrderId || filterUserId || filterSurname || filterEmail ||
			filterPaymentMethod || filterStatus || filterStatusPayment || filterType || filterCourseId;

		if (!orderId) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		try {
			const resFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order',
					query: { orderId },
					projection: { _id: 0 },
					sort: { createdAt: -1 },
					limit: 1,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!resFetch.ok) {
				const errorText = await resFetch.text();
				console.error('order find failed', resFetch.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}

			const oldOrder = await resFetch.json();
			let oldStatusPayment = '';
			let orderCartItems = [];

			if (oldOrder.length > 0) {
				oldStatusPayment = oldOrder[0].payment.statusPayment;
				orderCartItems = oldOrder[0].cart;
			}

			// If payment is being canceled, restore stock quantities
			if (statusPayment === 'canceled' && oldStatusPayment === 'pending') {
				const itemsToRestore = cartItem || orderCartItems;

				//const cartItems = orderData[0].cart;
				//const userEmail = orderData[0].invoicing?.email;
				//const userId = orderData[0].userId;

				if (itemsToRestore && itemsToRestore.length > 0) {
					const restoreQty = itemsToRestore.map(async (item: any) => {
						// Skip non-product items (courses, events, memberships don't have stock)
						if (item.type === 'course' || item.type === 'event' || item.type === 'membership') {
							return Promise.resolve();
						}

						const restoreQtyRes = await fetch(`${BASE_URL}/api/mongo/update`, {
							method: 'POST',
							body: JSON.stringify({
								apiKey: APIKEY,
								schema: 'product',
								query: { prodId: item.prodId },
								update: {
									$inc: {
										stockQty: item.orderQuantity || 1
									}
								},
								options: { upsert: false },
								multi: false
							}),
							headers: {
								'Content-Type': 'application/json'
							}
						});

						if (!restoreQtyRes.ok) {
							const errorData = await restoreQtyRes.json();
							console.error(`Failed to restore prodId ${item.prodId}:`, errorData);
							throw new Error(`Failed to restore stock for ${item.prodId}`);
						}
						//return restoreQtyRes.json();

						// Remove user from listSubscribers for courses, events, and memberships
						if ((item.type === 'course' || item.type === 'event' || item.type === 'membership') && email) {
							const removeSubscriberRes = await fetch(`${BASE_URL}/api/mongo/update`, {
								method: 'POST',
								body: JSON.stringify({
									apiKey: APIKEY,
									schema: 'product',
									query: { prodId: item.prodId },
									update: {
										$pull: {
											listSubscribers: { email: email }
										}
									},
									options: { upsert: false },
									multi: false
								}),
								headers: {
									'Content-Type': 'application/json'
								}
							});
							//console.log('removeSubscriberRes', removeSubscriberRes);

							if (!removeSubscriberRes.ok) {
								const errorData = await removeSubscriberRes.json();
								console.error(`Failed to remove subscriber from ${item.prodId}:`, errorData);
								throw new Error(`Failed to remove subscriber from ${item.prodId}`);
							}
						}

						// Remove course ID from user profile
						if (item.type === 'course' && userId) {
							const removeJoinedRes = await fetch(`${BASE_URL}/api/mongo/update`, {
								method: 'POST',
								body: JSON.stringify({
									apiKey: APIKEY,
									schema: 'user',  //product | order | user | layout | discount
									query: { userId },
									update: {
										$pull: { courseJoined: item.prodId }
									},
									options: { upsert: false },
									multi: false
								}),
								headers: {
									'Content-Type': 'application/json'
								}
							});
							//console.log('removeJoinedRes', removeJoinedRes);

							if (!removeJoinedRes.ok) {
								const errorData = await removeJoinedRes.json();
								console.error(`Failed to remove courseJoined  from ${userId}:`, errorData);
								throw new Error(`Failed to remove courseJoined  from ${userId}`);
							}
						}
					});

					await Promise.all(restoreQty);
				}
			}

			const resUpdate = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order',
					query: { orderId: orderId },
					update: {
						$set: {
							...(email && { 'shipping.email': email }),
							...(name && { 'shipping.name': name }),
							...(surname && { 'shipping.surname': surname }),
							...(city && { 'shipping.city': city }),
							...(address && { 'shipping.address': address }),
							...(postalCode && { 'shipping.postalCode': postalCode }),
							...(county && { 'shipping.county': county }),
							...(country && { 'shipping.country': country }),
							...(phone && { 'shipping.phone': phone }),
							...(mobile && { 'shipping.mobile': mobile }),
							...(status && { status }),
							...(promoterId && { promoterId: promoterId.trim() }),
							...(paymentMethod && { 'payment.method': paymentMethod }),
							...(statusPayment && { 'payment.statusPayment': statusPayment }),
						}
					},
					options: { upsert: false },
					multi: false
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!resUpdate.ok) {
				const errorText = await resUpdate.text();
				console.error('order update failed', resUpdate.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const result = await resUpdate.json();

			if (statusPayment === 'done' && oldStatusPayment === 'pending' && promoterId && type === 'course') {
				const courseItem = (cartItem || orderCartItems).find((item: any) => item.type === 'course');
				if (courseItem) {
					const id = courseItem.layoutId;
					let points = 0;
					let pointsBase = 0;
					let pointsAvanzato = 0;
					if (id === 'XW7LYV2LG2BU') points = 10; // base
					if (id === '794792843') points = 40; // avanzato
					if (id === 'riflessologo') { // riflessologo
						pointsBase = 50;
						pointsAvanzato = 100;
					}

					const userPointsFetch = await fetch(`${BASE_URL}/api/mongo/update`, {
						method: 'POST',
						body: JSON.stringify({
							apiKey: APIKEY,
							schema: 'user',
							query: { email: promoterId },
							update: {
								$inc: {
									pointsBalance: points
								},
								$push: {
									pointsHistory: {
										points: points,
										note: `Commissione ${courseItem.layoutView.title} - Ordine ${orderId}`,
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

					if (!userPointsFetch.ok) {
						return fail(400, {
							action: 'new',
							success: false,
							message: `userPointsFetch: ${await userPointsFetch.text()}`
						});
					}
				}
			}

			if (statusPayment === 'done' && oldStatusPayment === 'pending' && (type === 'course' || type === 'membership')) {
				const resFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'user',
						query: { userId },
						projection: { _id: 0, membership: 1 },
						sort: { createdAt: -1 },
						limit: 1,
						skip: 0
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				const userUpdateFetch = await fetch(`${BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'user',
						query: { userId },
						update: {
							$set: {
								"membership.membershipStatus": true
							},
						},
						options: { upsert: false },
						multi: false
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (!resFetch.ok) {
					const errorText = await resFetch.text();
					console.error('user fetch failed', resFetch.status, errorText);
					return fail(400, { action: 'modify', success: false, message: errorText });
				}

				const user = await resFetch.json();
				console.log('user', user);

				if (user[0].membership.membershipStatus === false) {
					const res = await userUpdateFetch;
					if (!res.ok) {
						const errorText = await res.text();
						console.error('user update failed', res.status, errorText);
						return fail(400, { action: 'modify', success: false, message: errorText });
					}
				}
			}

			// FUORI DA TUTTI GLI IF - Riapplica i filtri se presenti
			if (hasFilters) {
				const filteredRes = await fetch(`${BASE_URL}/api/mongo/find`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'order',
						query: {
							...(filterOrderId && { orderId: filterOrderId }),
							...(filterUserId && { userId: filterUserId }),
							...(filterSurname && { 'shipping.surname': { $regex: `.*${filterSurname}.*`, $options: 'i' } }),
							...(filterEmail && { 'shipping.email': { $regex: `.*${filterEmail}.*`, $options: 'i' } }),
							...(filterPaymentMethod && { 'payment.method': filterPaymentMethod }),
							...(filterStatus && { status: filterStatus }),
							...(filterStatusPayment && { 'payment.statusPayment': filterStatusPayment }),
							...(filterType && { type: filterType }),
							...(filterCourseId && {
								'cart': {
									$elemMatch: {
										type: { $in: ['course', 'event'] },
										prodId: filterCourseId
									}
								}
							}),
						},
						projection: { _id: 0, password: 0 },
						sort: { createdAt: -1 },
						limit: 50,
						skip: 0
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (filteredRes.ok) {
					const payload = await filteredRes.json();
					return { action: 'modify', success: true, message: result.message, payload };
				}
			}

			return { action: 'modify', success: true, message: result.message };

		} catch (error) {
			console.error('Error order modify:', error);
			return { action: 'modify', success: false, message: 'Error order modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId');

		try {
			// First, fetch the order to get the cart items and user email
			const orderFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order',
					query: { orderId: orderId },
					projection: { cart: 1, userId: 1, invoicing: 1, _id: 0 },
					sort: {},
					limit: 1,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!orderFetch.ok) {
				const errorText = await orderFetch.text();
				console.error('order fetch failed', orderFetch.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}

			const orderData = await orderFetch.json();
			//console.log('orderData', orderData);

			if (!orderData || orderData.length === 0) {
				return fail(400, { action: 'delete', success: false, message: 'Ordine non trovato' });
			}

			const cartItems = orderData[0].cart;
			const userEmail = orderData[0].invoicing?.email;
			const userId = orderData[0].userId;
			//console.log(userEmail, userId);

			// Restore stock quantities and remove user from listSubscribers
			if (cartItems && cartItems.length > 0) {
				const restoreOperations = cartItems.map(async (item) => {
					// Restore stock for products
					if (item.type !== 'course' && item.type !== 'event' && item.type !== 'membership') {
						const restoreQtyRes = await fetch(`${BASE_URL}/api/mongo/update`, {
							method: 'POST',
							body: JSON.stringify({
								apiKey: APIKEY,
								schema: 'product',
								query: { prodId: item.prodId },
								update: {
									$inc: {
										stockQty: item.orderQuantity || 1
									}
								},
								options: { upsert: false },
								multi: false
							}),
							headers: {
								'Content-Type': 'application/json'
							}
						});

						if (!restoreQtyRes.ok) {
							const errorData = await restoreQtyRes.json();
							console.error(`Failed to restore prodId ${item.prodId}:`, errorData);
							throw new Error(`Failed to restore stock for ${item.prodId}`);
						}
					}

					// Remove user from listSubscribers for courses, events, and memberships
					if ((item.type === 'course' || item.type === 'event' || item.type === 'membership') && userEmail) {
						const removeSubscriberRes = await fetch(`${BASE_URL}/api/mongo/update`, {
							method: 'POST',
							body: JSON.stringify({
								apiKey: APIKEY,
								schema: 'product',
								query: { prodId: item.prodId },
								update: {
									$pull: {
										listSubscribers: { email: userEmail }
									}
								},
								options: { upsert: false },
								multi: false
							}),
							headers: {
								'Content-Type': 'application/json'
							}
						});
						//console.log('removeSubscriberRes', removeSubscriberRes);

						if (!removeSubscriberRes.ok) {
							const errorData = await removeSubscriberRes.json();
							console.error(`Failed to remove subscriber from ${item.prodId}:`, errorData);
							throw new Error(`Failed to remove subscriber from ${item.prodId}`);
						}
					}

					// Remove course ID from user profile
					if (item.type === 'course' && userId) {
						const removeJoinedRes = await fetch(`${BASE_URL}/api/mongo/update`, {
							method: 'POST',
							body: JSON.stringify({
								apiKey: APIKEY,
								schema: 'user',  //product | order | user | layout | discount
								query: { userId },
								update: {
									$pull: { courseJoined: item.prodId }
								},
								options: { upsert: false },
								multi: false
							}),
							headers: {
								'Content-Type': 'application/json'
							}
						});
						//console.log('removeJoinedRes', removeJoinedRes);

						if (!removeJoinedRes.ok) {
							const errorData = await removeJoinedRes.json();
							console.error(`Failed to remove courseJoined  from ${userId}:`, errorData);
							throw new Error(`Failed to remove courseJoined  from ${userId}`);
						}
					}
				});

				await Promise.all(restoreOperations);
			}

			// Now delete the order
			const resFetch = await fetch(`${BASE_URL}/api/mongo/remove`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order',
					query: { orderId: orderId },
					multi: false,
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!resFetch.ok) {
				const errorText = await resFetch.text();
				console.error('order delete failed', resFetch.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}

			const result = await resFetch.json();

			return { action: 'delete', success: true, message: result.message };

		} catch (error) {
			console.error('Error order delete:', error);
			return fail(400, { action: 'delete', success: false, message: 'Error order delete' });
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId');
		const userId = formData.get('userId');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const paymentMethod = formData.get('paymentMethod');
		const status = formData.get('status');
		const statusPayment = formData.get('statusPayment');
		const type = formData.get('type');
		const courseId = formData.get('courseId');

		if (!orderId && !userId && !surname && !email && !paymentMethod && !status && !statusPayment && !type && !courseId) {
			return fail(400, { action: 'filter', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'order', //product | order | user | layout | discount
				query: {
					...(orderId && { orderId }),
					...(userId && { userId }),
					...(surname && { 'shipping.surname': { $regex: `.*${surname}.*`, $options: 'i' } }),
					...(email && { 'shipping.email': { $regex: `.*${email}.*`, $options: 'i' } }),
					...(paymentMethod && { 'payment.method': paymentMethod }),
					...(status && { status }),
					...(statusPayment && { 'payment.statusPayment': statusPayment }),
					...(type && { 'type': type }),
					...(courseId && {
						'cart': {
							$elemMatch: {
								type: { $in: ['course', 'event'] },
								prodId: courseId
							}
						}
					}),
				},
				projection: { _id: 0, password: 0 },
				sort: { createdAt: -1 },
				limit: 50,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;

			if (!res.ok) {
				const errorText = await res.text();
				console.error('order filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const payload = await res.json();

			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error order filter' };
		}
	},

	changePage: async ({ request, fetch }) => {
		const formData = await request.formData();
		const navigation = formData.get('navigation');
		const itemsPerPage = Number(formData.get('itemsPerPage'));
		let currentPage = Number(formData.get('currentPage'));

		const orderId = formData.get('orderId');
		const userId = formData.get('userId');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const paymentMethod = formData.get('paymentMethod');
		const status = formData.get('status');
		const statusPayment = formData.get('statusPayment');
		const type = formData.get('type');
		const courseId = formData.get('courseId');

		if (navigation === 'prev') {
			currentPage = Math.max(1, currentPage - 1);
		} else if (navigation === 'next') {
			currentPage += 1;
		} else if (navigation === 'reset') {
			currentPage = 1;
		}

		const skipItems = (currentPage - 1) * itemsPerPage;

		try {
			const res = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order',
					query: {
						// Applica tutti i filtri se presenti
						...(orderId && { orderId }),
						...(userId && { userId }),
						...(surname && { 'shipping.surname': { $regex: `.*${surname}.*`, $options: 'i' } }),
						...(email && { 'shipping.email': { $regex: `.*${email}.*`, $options: 'i' } }),
						...(paymentMethod && { 'payment.method': paymentMethod }),
						...(status && { status }),
						...(statusPayment && { 'payment.statusPayment': statusPayment }),
						...(type && { 'type': type }),
						...(courseId && {
							'cart': {
								$elemMatch: {
									type: { $in: ['course', 'event'] },
									prodId: courseId
								}
							}
						}),
					},
					projection: { _id: 0, password: 0 },
					sort: { orderDate: -1 },
					limit: itemsPerPage,
					skip: skipItems
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!res.ok) {
				const errorText = await res.text();
				console.error('order changePage failed', res.status, errorText);
				return fail(400, {
					action: 'changePage',
					success: false,
					message: `changePage Error: ${errorText}`
				});
			}

			const result = await res.json();

			return {
				action: 'changePage',
				success: true,
				message: 'Pagina caricata',
				payload: { result, currentPage }
			};

		} catch (error) {
			console.error('Error changePage:', error);
			return fail(400, {
				action: 'changePage',
				success: false,
				message: 'Error changePage'
			});
		}
	},

	downloadCsv: async ({ request, fetch }) => {
		try {
			const resFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order', //product | order | user | layout | discount
					query: {},
					projection: { _id: 0 }, // 0: exclude | 1: include
					sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
					limit: 10000,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!resFetch.ok) {
				const errorText = await resFetch.text();
				console.error('downloadCsv fetch failed', resFetch.status, errorText);
				return fail(400, { action: 'downloadCsv', success: false, message: `resFetch: ${await resFetch.text()}` });
			}
			const content = await resFetch.json();
			//console.log('content', content.length);

			return { action: 'downloadCsv', success: true, message: 'Download report', payload: content };

		} catch (error) {
			console.error('Errore durante la generazione e il download del CSV:', error);
			return fail(500, { action: 'downloadCsv', success: false, message: 'Si è verificato un errore durante la generazione del report.' });
		}
	},
} satisfies Actions;
