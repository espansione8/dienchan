import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY, SALT } from '$env/static/private';
import { fail } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';
import { hash } from '$lib/tools/hash';

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getOrder = [];
	let getCourse = [];
	// console.log('locals.user.userId', locals.user.userId);

	const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'order', //product | order | user | layout | discount
			query: { userId: locals.user.userId }, //IF USE Products.model -> types: course / product / membership / event,
			projection: { _id: 0 },  // 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1000,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const courseFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'product', //product | order | user | layout | discount
			//query: {type: 'course', query: { type: 'course', prodId: { $in: array } } }, //IF USE Products.model -> types: course / product / membership / event,
			query: {
				listSubscribers: {
					$elemMatch: {
						userId: locals.user.userId,
						certificationStatus: true
					}
				}
			},
			projection: {
				listSubscribers: {
					$elemMatch: {
						userId: locals.user.userId,
						certificationStatus: true
					}
				},
				_id: 0, prodId: 1, layoutId: 1, layoutView: 1, name: 1, surname: 1
			}, // 0: exclude | 1: include
			sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1000,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	try {
		const res = await resFetch;
		if (!res.ok) {
			console.error('orders fetch error:', res.status, await res.text());
			return fail(400, { action: 'page load', success: false, message: await res.text() });
		}

		const response = await res.json();
		getOrder = response.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			orderDate: obj.orderDate.substring(0, 10),
			totalCart: obj.cart.reduce((total: any, item: any) => total + item.price, 0).toFixed(2)
		}));

		const courseRes = await courseFetch;
		if (!courseRes.ok) {
			console.error('orders fetch error:', courseRes.status, await courseRes.text());
			return fail(400, { action: 'page load', success: false, message: await courseRes.text() });
		}

		getCourse = await courseRes.json();

	} catch (error) {
		console.log('orders fetch error:', error);
	}

	const user = locals.user
	// if (locals.auth) {
	// 	user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
	// 	user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
	// 	user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	// }

	return {
		userData: user,
		orderData: getOrder,
		courseData: getCourse,
		auth: locals.auth
	};
}

export const actions: Actions = {
	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email');
		const address = formData.get('address');
		const postalCode = formData.get('postalCode') || '';
		const city = formData.get('city') || '';
		const county = formData.get('county') || '';
		const country = formData.get('country') || '';
		const phone = formData.get('phone') || '';
		const mobilePhone = formData.get('mobilePhone') || '';
		//const level = formData.get('level') || '';

		// cast boolean 
		const namePublic = !!(formData.get('namePublic') || '');
		const surnamePublic = !!(formData.get('surnamePublic') || '');
		const emailPublic = !!(formData.get('emailPublic') || '');
		const addressPublic = !!(formData.get('addressPublic') || '');
		const cityPublic = !!(formData.get('cityPublic') || '');
		const postalCodePublic = !!(formData.get('postalCodePublic') || '');
		const countyPublic = !!(formData.get('countyPublic') || '');
		const countryPublic = !!(formData.get('countryPublic') || '');
		const phonePublic = !!(formData.get('phonePublic') || '');
		const mobilePhonePublic = !!(formData.get('mobilePhonePublic') || '');

		if (!name || !surname || !email || !address || !postalCode || !city || !county || !country || !phone || !mobilePhone) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		const updateFecth = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId }, //IF USE Products.model -> types: course / product / membership / event,
				update: {
					$set: {
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
						//level,
						namePublic,
						surnamePublic,
						emailPublic,
						addressPublic,
						cityPublic,
						postalCodePublic,
						countyPublic,
						countryPublic,
						phonePublic,
						mobilePhonePublic,
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const updateRes = await updateFecth;
			if (!updateRes.ok) {
				return fail(400, { action: 'modify', success: false, message: await updateRes.text() });
			}
			const response = await updateRes.json();
			return { action: 'modify', success: true, message: response.message };

		} catch (error) {
			console.error('Error modify:', error);
			return fail(400, { action: 'modify', success: false, message: 'Errore modify' });
		}
	},
	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const status = formData.get('status');
		if (!prodId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';
		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		const updateFecth = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { prodId: prodId, type: 'membership' },
				update: {
					$set: {
						status: newStatus,
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		try {
			const updateRes = await updateFecth;
			if (!updateRes.ok) {
				return fail(400, { action: 'changeStatus', success: false, message: await updateRes.text() });
			}
			const response = await updateRes.json();

			return { action: 'changeStatus', success: true, message: response.message };

		} catch (error) {
			console.error('Error changing status:', error);
			return fail(400, { action: 'changeStatus', success: false, message: 'Errore changeStatus' });
		}
	},
	setProfilePic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const file = formData.get('fileUpload') as File;

		if (!userId || !file || !file.name) {
			return fail(400, { action: 'setProfilePic', success: false, message: 'File mancante' });
		}

		try {
			const uploadImg = await fetch(`${BASE_URL}/api/uploads/files`, {
				method: 'POST',
				headers: {
					//'Content-Type': 'application/json',
					'x-file-name': file.name,
					'x-folder-name': `user/${userId}`
				},
				body: file
			});

			if (!uploadImg.ok) return fail(400, { action: 'setProfilePic', success: false, message: `uploadImg: ${await uploadImg.text()}` })

			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', //product | order | user | layout | discount
					query: { userId }, //IF USE Products.model -> types: course / product / membership / event,
					update: {
						$push: {
							uploadfiles: {
								type: 'profile',
								fileName: file.name,
								fileUrl: `/uploads/user/${userId}/${file.name}`
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

			if (!res.ok) return fail(400, { action: 'setProfilePic', success: false, message: await res.text() })

			return { action: 'setProfilePic', success: true, message: 'Immagine caricata' };

		} catch (error) {
			console.error('Error upload:', error);
			return fail(400, { action: 'setProfilePic', success: false, message: 'Errore upload' });
		}
	},
	delProfilePic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const fileName = formData.get('fileName');
		//console.log(fileName);

		if (!userId || !fileName) {
			return fail(400, { action: 'delProfilePic', success: false, message: 'Dati mancanti' });
		}

		try {
			const responseDelete = await fetch(`${BASE_URL}/api/uploads/files`, {
				method: 'DELETE',
				body: JSON.stringify({
					dir: `user/${userId}`,
					fileName
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!responseDelete.ok) return fail(400, { action: 'delProfilePic', success: false, message: await responseDelete.text() });

			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', //product | order | user | layout | discount
					query: { userId }, //IF USE Products.model -> types: course / product / membership / event,
					update: {
						$pull: {
							uploadfiles: {
								type: 'profile',
								fileName,
								//fileUrl: `/uploads/user/${userId}/${fileName}`
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
			if (!res.ok) return fail(400, { action: 'delProfilePic', success: false, message: await res.text() });
			const response = await res.json();

			return { action: 'delProfilePic', success: true, message: response.message };

		} catch (error) {
			console.error('Error delProfilePic:', error);
			return fail(400, { action: 'delProfilePic', success: false, message: 'Errore rimozione' });
		}
	},
	changePassword: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const passwordOld = formData.get('passwordOld') as string;
		const passwordNew = formData.get('passwordNew') as string;
		const userId = locals.user.userId;

		if (!passwordOld || !passwordNew || !userId) {
			return fail(400, { action: 'changePassword', success: false, message: 'Dati mancanti' });
		}

		const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId }, //IF USE Products.model -> types: course / product / membership / event
				projection: { password: 1 }, // 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1,
				skip: 0,
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		const updateFecth = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId }, //IF USE Products.model -> types: course / product / membership / event,
				update: {
					$set: {
						password: hash(passwordNew, SALT)
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const userRes = await userFetch;
			if (!userRes.ok) return fail(400, { action: 'changePassword', success: false, message: await userRes.text() });

			const user = await userRes.json();
			if (!user || user.length === 0 || user[0].password !== hash(passwordOld, SALT)) {
				return fail(400, { action: 'changePassword', success: false, message: 'Password errata' })
			}

			const updateRes = await updateFecth;
			if (!updateRes.ok) {
				return fail(400, { action: 'changePassword', success: false, message: await updateRes.text() });
			}
			const update = await updateRes.json();

			return { action: 'changePassword', success: true, message: update.message };

		} catch (error) {
			console.error('Error changePassword:', error);
			return fail(400, { action: 'changePassword', success: false, message: 'Errore changePassword' });
		}
	},
	setTraining: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const trainingDate = formData.get('trainingDate');
		const trainingDescription = formData.get('trainingDescription');
		const trainingHours = formData.get('trainingHours');
		const file = formData.get('fileUpload') as File;

		// console.log(trainingDate, trainingDescription, trainingHours, file, userId);
		// return

		if (!userId || !file || !file.name || !trainingDate || !trainingDescription || !trainingHours) {
			return fail(400, { action: 'setTraining', success: false, message: 'File mancante' });
		}

		// file size (10MB limit)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return fail(400, { action: 'setTraining', success: false, message: 'File troppo grande (max 10MB)' });
		}

		// Validate file type
		const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.oasis.opendocument.spreadsheet', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msexcel'];
		if (!allowedTypes.includes(file.type)) {
			return fail(400, { action: 'setTraining', success: false, message: 'Tipo di file non supportato' });
		}
		try {
			const uploadFile = await fetch(`${BASE_URL}/api/uploads/files`, {
				method: 'POST',
				headers: {
					//'Content-Type': 'application/json',
					'x-file-name': file.name,
					'x-folder-name': `user/${userId}`
				},
				body: file
			});

			if (!uploadFile.ok) return fail(400, { action: 'setTraining', success: false, message: `uploadImg: ${await uploadFile.text()}` })

			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', //product | order | user | layout | discount
					query: { userId }, //IF USE Products.model -> types: course / product / membership / event,
					update: {
						$push: {
							trainingHistory: {
								hours: Number(trainingHours),
								description: trainingDescription,
								date: trainingDate,
								fileName: file.name,
								fileUrl: `/uploads/user/${userId}/${file.name}`
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

			if (!res.ok) return fail(400, { action: 'setTraining', success: false, message: await res.text() })

			return { action: 'setTraining', success: true, message: 'Formazione aggiunta' };

		} catch (error) {
			console.error('Error setTraining:', error);
			return fail(400, { action: 'setTraining', success: false, message: 'Errore setTraining' });
		}
	},
	delTraining: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const fileName = formData.get('fileName');
		//console.log(fileName);

		if (!userId || !fileName) {
			return fail(400, { action: 'delTraining', success: false, message: 'Dati mancanti' });
		}

		try {
			const responseDelete = await fetch(`${BASE_URL}/api/uploads/files`, {
				method: 'DELETE',
				body: JSON.stringify({
					dir: `user/${userId}`,
					fileName
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!responseDelete.ok) return fail(400, { action: 'delTraining', success: false, message: await responseDelete.text() });

			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', //product | order | user | layout | discount
					query: { userId }, //IF USE Products.model -> types: course / product / membership / event,
					update: {
						$pull: {
							trainingHistory: {
								fileName,
								fileUrl: `/uploads/user/${userId}/${fileName}`
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
			if (!res.ok) return fail(400, { action: 'delTraining', success: false, message: await res.text() });
			const response = await res.json();

			return { action: 'delTraining', success: true, message: response.message };

		} catch (error) {
			console.error('Error delTraining:', error);
			return fail(400, { action: 'delTraining', success: false, message: 'Errore rimozione' });
		}
	},
} satisfies Actions;