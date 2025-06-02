import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';

const apiKey = APIKEY;

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getOrder = [];
	// console.log('locals.user.userId', locals.user.userId);

	try {
		const query = { userId: locals.user.userId }; //IF USE Products.model -> types: course / product / membership / event
		const projection = { _id: 0 } // 0: exclude | 1: include
		const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
		const limit = 1000;
		const skip = 0;
		const res = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'order', //product | order | user | layout | discount
				query,
				projection,
				sort,
				limit,
				skip
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.status != 200) {
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
	} catch (error) {
		console.log('orders fetch error:', error);
	}

	const user = locals.user
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}

	return {
		userData: user,
		orderData: getOrder,
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

		try {
			const query = { userId }; //IF USE Products.model -> types: course / product / membership / event
			const update = {
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
			};
			const options = { upsert: false }
			const multi = false

			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'user', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (res.status != 200) {
				return fail(400, { action: 'modify', success: false, message: await res.text() });
			}

			const response = await res.json();
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
		try {
			const query = { prodId: prodId, type: 'membership' };
			const update = {
				$set: {
					status: newStatus,
				}
			};
			const options = { upsert: false }
			const multi = false
			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'product', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();
			//console.log('res', res);
			if (res.status == 200) {
				return { action: 'changeStatus', success: true, message: response.message };
			} else {
				return fail(400, { action: 'changeStatus', success: false, message: response.message });
			}
		} catch (error) {
			console.error('Error changing status:', error);
			return fail(400, { action: 'changeStatus', success: false, message: 'Errore changeStatus' });
		}
	},
	setProfilePic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const file = formData.get('fileUpload');

		if (!userId || !file || !file.name) {
			return fail(400, { action: 'setProfilePic', success: false, message: 'File mancante' });
		}

		try {
			const uploadImg = await fetch(`${BASE_URL}/api/uploads/files`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-file-name': file.name,
					'x-folder-name': `user/${userId}`
				},
				body: file
			});
			const resImg = await uploadImg.json();
			if (uploadImg.status != 200) return fail(400, { action: 'setProfilePic', success: false, message: resImg.message })

			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'user', //product | order | user | layout | discount
					query: { userId }, //IF USE Products.model -> types: course / product / membership / event,
					update: {
						$push: {
							uploadfiles: {
								type: 'profile',
								fileName: file.name,
								fileUrl: `/files/user/${userId}/${file.name}`
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
			const response = await res.json();

			if (res.status == 200) {
				return { action: 'setProfilePic', success: true, message: 'Immagine caricata' };
			} else {
				return fail(400, { action: 'setProfilePic', success: false, message: response.message });
			}
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
			const resDel = await responseDelete.json();
			if (responseDelete.status != 200) return fail(400, { action: 'delProfilePic', success: false, message: resDel.message });

			const query = { userId }; //IF USE Products.model -> types: course / product / membership / event
			const update = {
				$pull: {
					uploadfiles: {
						type: 'profile',
						fileName,
						//fileUrl: `/files/user/${userId}/${fileName}`
					}
				}
			};
			const options = { upsert: false }
			const multi = false

			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'user', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const response = await res.json();

			if (res.status == 200) {
				return { action: 'delProfilePic', success: true, message: response.message };
			} else {
				return fail(400, { action: 'delProfilePic', success: false, message: response.message });
			}
		} catch (error) {
			console.error('Error delProfilePic:', error);
			return fail(400, { action: 'delProfilePic', success: false, message: 'Errore rimozione' });
		}
	},
} satisfies Actions;