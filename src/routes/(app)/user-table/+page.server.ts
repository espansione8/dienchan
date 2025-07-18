import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY, SALT } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';
import { customAlphabet } from 'nanoid'
import { hash } from '$lib/tools/hash';
import Papa from 'papaparse';
const nanoid = customAlphabet('0123456789', 12)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	let itemCount = 0;

	try {
		// Count
		const countFetch = await fetch(`${BASE_URL}/api/mongo/count`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: {},
				option: { hint: { email: 1 } },// optional: define index to use
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		// get user
		const userFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: {},
				projection: { _id: 0, password: 0 },
				//sort: { createdAt: -1 },
				limit: 50,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const [countRes, userRes] = await Promise.all([
			countFetch,
			userFetch
		]);

		if (!countRes.ok) {
			// return fail(400, { action: 'renew', success: false, message: `res: ${await res.text()}` });
			throw error(400, 'count fetch failed');
		}

		itemCount = await countRes.json()

		if (!userRes.ok) {
			console.error('user fetch failed', userRes.status, await userRes.text());
			throw error(400, 'user fetch failed');
		}

		getTable = await userRes.json();
		getTable = getTable.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));

	} catch (error) {
		console.log('getUser fetch error:', error);
		throw error(500, 'Server error');
	}

	return {
		getTable,
		itemCount
	};
}

export const actions: Actions = {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
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
		const password1: any = formData.get('password1') || '';
		const level = formData.get('level') || '';


		if (!name || !surname || !email || !address || !postalCode || !city || !county || !country || !phone || !mobilePhone || !password1 || !level) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}


		const resFetch = fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				newDoc: {
					userId: nanoid(),
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
					level
				},
				returnObj: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});


		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('user find failed', res.status, errorText);
				return fail(400, { action: 'new', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'new', success: true, message: result.message };

		} catch (error) {
			console.error('Error user new :', error);
			return { action: 'new', success: false, message: 'Error user new' };
		}
	},

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
		const level = formData.get('level') || '';
		const namePublic = !!(formData.get('namePublic'));
		const surnamePublic = !!(formData.get('surnamePublic'));
		const emailPublic = !!(formData.get('emailPublic') || '');
		const addressPublic = !!(formData.get('addressPublic') || '');
		const cityPublic = !!(formData.get('cityPublic') || '');
		const statePublic = !!(formData.get('statePublic') || '');
		const postalCodePublic = !!(formData.get('postalCodePublic') || '');
		const countryPublic = !!(formData.get('countryPublic') || '');
		const phonePublic = !!(formData.get('phonePublic') || '');
		const mobilePhonePublic = !!(formData.get('mobilePhonePublic') || '');

		if (!name || !surname || !email || !address || !postalCode || !city || !county || !country || !phone || !mobilePhone || !level) {
			return fail(400, { action: 'newUser', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId },
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
						level,
						namePublic,
						surnamePublic,
						emailPublic,
						addressPublic,
						cityPublic,
						statePublic,
						postalCodePublic,
						countryPublic,
						phonePublic,
						mobilePhonePublic
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
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('user update failed', res.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'modify', success: true, message: result.message };

		} catch (error) {
			console.error('Error user modify:', error);
			return { action: 'modify', success: false, message: 'Error user modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');

		const resFetch = fetch(`${BASE_URL}/api/mongo/remove`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId: userId }, // 'course', 'product', 'membership', 'event'
				multi: false,
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('user delete failed', res.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'delete', success: true, message: result.message };

		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Error user delete' };
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const level = formData.get('level');
		const membershipLevel = formData.get('membershipLevel');
		const email = formData.get('email');
		// const arrayField = ['level', 'membership.membershipLevel', 'email'];
		// const arrayValue = [level, membershipLevel, email];

		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: {
					...(level && { level }),
					...(membershipLevel && { ['membership.membershipLevel']: membershipLevel }),
					...(email && { email })
				},
				projection: { _id: 0 }, // 0: exclude | 1: include,
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending,
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
				const errorText = await res.text();
				console.error('discount filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const payload = await res.json();

			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error user filter:', error);
			return { action: 'filter', success: false, message: 'Error user filter' };
		}

	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const status = formData.get('status');
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';
		if (!userId) {
			return fail(400, { action: 'disableUser', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId },
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
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('changeStatus update failed', res.status, errorText);
				return fail(400, { action: 'changeStatus', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'changeStatus', success: true, message: result.message };

		} catch (error) {
			console.error('Error changeStatus:', error);
			return fail(400, { action: 'changeStatus', success: false, message: 'Error changeStatus' });
		}
	},

	changeInsurance: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const insuranceStatus = formData.get('insuranceStatus');
		const insuranceDate = formData.get('insuranceDate');
		const newStatus = insuranceStatus === 'true' ? false : true;
		const newDate = insuranceDate ? new Date(insuranceDate.toString()) : new Date();

		// console.log('insuranceStatus', typeof insuranceStatus, insuranceStatus);
		// console.log('insuranceDate', typeof insuranceDate, JSON.stringify(insuranceDate));
		// console.log('newStatus', typeof newStatus, newStatus);
		// console.log('newDate', typeof newDate, newDate);

		if (!userId) {
			return fail(400, { action: 'disableUser', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId },
				update: {
					$set: {
						insurance: {
							insuranceDate: newDate,
							insuranceStatus: newStatus
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

		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('changeInsurance update failed', res.status, errorText);
				return fail(400, { action: 'changeInsurance', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'changeInsurance', success: true, message: result.message };

		} catch (error) {
			console.error('Error changeInsurance:', error);
			return fail(400, { action: 'changeInsurance', success: false, message: 'Error changeInsurance' });
		}
	},

	uploadCsv: async ({ request, fetch }) => {
		const formData = await request.formData();
		const file = formData.get('fileUpload');

		if (!file || typeof file === 'string' || !(file instanceof Blob) || !(file.type === 'text/csv' || file.name?.toLowerCase().endsWith('.csv'))) {
			return fail(400, { action: 'uploadCsv', success: false, message: 'File CSV mancante o non valido' });
		}

		try {
			const fileContent = await file.text();
			const csvData = await new Promise((resolve, reject) => {
				Papa.parse(fileContent, {
					header: true,
					dynamicTyping: true,
					complete: (results) => {
						resolve(results.data);
					},
					error: (error) => {
						reject(error);
					},
				});
			});

			const unflattenObject = (obj) => {
				const result = {};
				for (const key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) {
						const parts = key.split('.');
						let current = result;
						for (let i = 0; i < parts.length - 1; i++) {
							if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
								current[parts[i]] = {};
							}
							current = current[parts[i]];
						}
						current[parts[parts.length - 1]] = obj[key];
					}
				}
				return result;
			}

			// default expiry date + 1 year
			const getDefaultExpiryDate = (activationDate = new Date()) => {
				const date = new Date(activationDate);
				date.setFullYear(date.getFullYear() + 1);
				return date;
			}

			// Enum  membership
			const VALID_MEMBERSHIP_LEVELS = [
				'Socio inattivo',
				'Socio ordinario',
				'Socio sostenitore',
				'Socio vitalizio',
				'Socio contributore',
				'Master Dien Chan',
			];

			const bulkOperations = csvData.map(row => {
				const processedRow = { ...row };
				// set default?
				if (processedRow.cod === null || processedRow.cod === undefined) {
					processedRow.cod = '';
				}

				const finalUpdateDocument = unflattenObject(processedRow);

				//START MEMBERSHIP
				if (!finalUpdateDocument.membership || typeof finalUpdateDocument.membership !== 'object') {
					finalUpdateDocument.membership = {};
				}
				const membership = finalUpdateDocument.membership;

				if (
					membership.membershipLevel === null ||
					membership.membershipLevel === undefined ||
					!VALID_MEMBERSHIP_LEVELS.includes(membership.membershipLevel)
				) {
					membership.membershipLevel = 'Socio inattivo';
				}

				if (membership.membershipSignUp) {
					const parsedDate = new Date(membership.membershipSignUp);
					membership.membershipSignUp = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
				} else {
					membership.membershipSignUp = new Date();
				}

				// membership.membershipActivation (Date, default Date.now)
				if (membership.membershipActivation) {
					const parsedDate = new Date(membership.membershipActivation);
					membership.membershipActivation = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
				} else {
					membership.membershipActivation = new Date();
				}

				// membership.membershipExpiry (Date, default 1 year from activation/now)
				if (membership.membershipExpiry) {
					const parsedDate = new Date(membership.membershipExpiry);
					membership.membershipExpiry = isNaN(parsedDate.getTime()) ? getDefaultExpiryDate(membership.membershipActivation) : parsedDate;
				} else {
					membership.membershipExpiry = getDefaultExpiryDate(membership.membershipActivation);
				}

				// membership.membershipStatus (Boolean, default false)
				if (membership.membershipStatus === null || membership.membershipStatus === undefined) {
					membership.membershipStatus = false;
				} else if (typeof membership.membershipStatus === 'string') {
					// Convert string "true"/"false" in boolean
					membership.membershipStatus = (membership.membershipStatus.toLowerCase() === 'true');
				}
				//END MEMBERSHIP

				// !!!IMPORTANT!!!: 
				if (!finalUpdateDocument.userId) { // NOTE!! change IF NOT 'userId'
					console.warn('skipped ROW for upsert:', row);
					return null;
				}

				return {
					updateOne: {
						filter: { userId: finalUpdateDocument.userId },
						update: { $set: finalUpdateDocument },
						upsert: true
					}
				};
			}).filter(op => op !== null); // Filter empty rows

			if (bulkOperations.length === 0) {
				return { action: 'uploadCsv', success: false, message: 'Nessun dato valido da processare nel CSV.' };
			}

			const res = await fetch(`${BASE_URL}/api/mongo/update-bulk`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', // 'user' OR 'product'
					update: bulkOperations,
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!res.ok) {
				return { action: 'uploadCsv', success: false, message: `res: ${await res.text()}` };
			}

			return { action: 'uploadCsv', success: true, message: 'CSV caricato' };
		} catch (err) {
			console.error('Error uploadCsv:', err);
			return { action: 'uploadCsv', success: false, message: 'Errore server upload' };
		}
	},

	downloadCsv: async ({ request, fetch }) => {
		try {
			const resFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', //product | order | user | layout | discount
					query: {},
					projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
					sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
					limit: 100000,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!resFetch.ok) {
				return fail(400, { action: 'downloadCsv', success: false, message: `resFetch: ${await resFetch.text()}` });
			}
			const content = await resFetch.json();
			console.log('content', content.length);

			return { action: 'downloadCsv', success: true, message: 'Download report', payload: content };

		} catch (error) {
			console.error('Errore durante la generazione e il download del CSV:', error);
			return fail(500, { action: 'downloadCsv', success: false, message: 'Si è verificato un errore durante la generazione del report.' });
		}
	},

	changePage: async ({ request, fetch }) => {
		const formData = await request.formData();
		const navigation = formData.get('navigation');
		const itemsPerPage = Number(formData.get('itemsPerPage'));
		let currentPage = Number(formData.get('currentPage'));
		//console.log('changePage', navigation, itemsPerPage, currentPage);

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
					schema: 'user', //product | order | user | layout | discount
					query: {},
					projection: { _id: 0 },
					//sort: { createdAt: -1 },
					limit: itemsPerPage,
					skip: skipItems
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!res.ok) {
				const errorText = await res.text();
				console.error('discount changePage failed', res.status, errorText);
				return fail(400, { action: 'changePage', success: false, message: `changePage Error: ${errorText}` });
			}
			const result = await res.json();

			return { action: 'changePage', success: true, message: result.message, payload: { result, currentPage } };

		} catch (error) {
			console.error('Error changePage:', error);
			return { action: 'changePage', success: false, message: 'Error changePage' };
		}
	},

	modifyPoints: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const pointsType = formData.get('pointsType');
		const points = Number(formData.get('points'));
		const note = formData.get('note');

		if (!userId || !pointsType || !points) {
			return fail(400, { action: 'modifyPoints', success: false, message: 'Dati mancanti' });
		}

		let pointsIncrementValue;
		let pointsForHistory;

		if (pointsType === 'add') {
			pointsIncrementValue = points;
			pointsForHistory = points;
		} else if (pointsType === 'remove') {
			pointsIncrementValue = -points;
			pointsForHistory = -points;
		}

		const updatePayload = {
			$inc: {
				pointsBalance: pointsIncrementValue
			},
			$push: {
				pointsHistory: {
					points: pointsForHistory,
					note: note
				}
			}
		};

		try {
			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user', //product | order | user | layout | discount
					query: { userId },
					update: updatePayload,
					options: { upsert: false },
					multi: false
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!res.ok) {
				const errorText = await res.text();
				console.error('user update failed', res.status, errorText);
				return fail(400, { action: 'modifyPoints', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'modifyPoints', success: true, message: result.message };

		} catch (error) {
			console.error('Error user modifyPoints:', error);
			return { action: 'modifyPoints', success: false, message: 'Error user modifyPoints' };
		}
	},

} satisfies Actions;
