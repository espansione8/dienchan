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
	let totalPendingApprovals = 0;
	let pendingApprovalsList = [];

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

		// get pending approvals count su TUTTI gli utenti
		const pendingFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user',
				query: {
					$and: [
						{ trainingHistory: { $exists: true, $ne: [] } },
						{ trainingHistory: { $elemMatch: { approved: false } } }
					]
				},
				projection: {
					_id: 0,
					userId: 1,
					name: 1,
					surname: 1,
					email: 1,
					phone: 1,
					mobilePhone: 1,
					county: 1,
					city: 1,
					userAvatar: 1,
					trainingHistory: 1
				},
				limit: 100000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const [countRes, userRes, pendingRes] = await Promise.all([
			countFetch,
			userFetch,
			pendingFetch
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


		if (pendingRes.ok) {
			const pendingUsers = await pendingRes.json();

			// Costruisci la lista con solo i training non approvati
			pendingApprovalsList = pendingUsers.map((user: any) => {
				const pendingTrainings = (user.trainingHistory || []).filter(
					(t: any) => t.approved === false
				);

				return {
					userId: user.userId,
					name: user.name,
					surname: user.surname,
					email: user.email,
					phone: user.phone,
					mobilePhone: user.mobilePhone,
					county: user.county,
					city: user.city,
					userAvatar: user.userAvatar,
					trainingHistory: pendingTrainings,
					pendingCount: pendingTrainings.length
				};
			}).filter(u => u.pendingCount > 0);

			// Calcola il totale
			totalPendingApprovals = pendingApprovalsList.reduce(
				(sum, u) => sum + u.pendingCount,
				0
			);
		}

	} catch (error) {
		console.log('getUser fetch error:', error);
		throw error(500, 'Server error');
	}

	return {
		getTable,
		getUser: locals.user,
		itemCount,
		totalPendingApprovals,
		pendingApprovalsList
	};
}

export const actions: Actions = {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const surname = formData.get('surname');
		const email = formData.get('email')?.toString().toLowerCase().trim();
		const address = formData.get('address');
		const postalCode = formData.get('postalCode') || '';
		const city = formData.get('city') || '';
		const countyArray = formData.get('countyArray') as string;
		const county = countyArray.split(",");
		const country = formData.get('country') || '';
		const phone = formData.get('phone') || '';
		const mobilePhone = formData.get('mobilePhone') || '';
		const password1: any = formData.get('password1') || '';
		const level = formData.get('level') || '';
		const membershipExpiry = formData.get('membershipExpiry') as string;
		const membershipStatus = formData.get('membershipStatus') as string;
		const membershipLevel = formData.get('membershipLevel') as string;

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
					level,
					'membership.membershipExpiry': membershipExpiry,
					'membership.membershipStatus': membershipStatus,
					'membership.membershipLevel': membershipLevel,
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
		const email = formData.get('email')?.toString().toLowerCase().trim();
		const address = formData.get('address');
		const postalCode = formData.get('postalCode') || '';
		const city = formData.get('city') || '';
		const countyArray = formData.get('countyArray') as string;
		const county = countyArray.split(",");
		const country = formData.get('country') || '';
		const phone = formData.get('phone') || '';
		const mobilePhone = formData.get('mobilePhone') || '';
		const level = formData.get('level') as string;
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
		const membershipExpiry = formData.get('membershipExpiry') as string;
		const membershipStatus = formData.get('membershipStatus') as string;
		const membershipLevel = formData.get('membershipLevel') as string;

		const insuranceExpiry = formData.get('insuranceExpiry') || null;
		const insuranceStatus = formData.get('insuranceStatus')

		const riflessologoLevels = new Set(['riflessologo', 'formatore base', 'master', 'formatore avanzato']);
		const isRiflessologo = !!level && riflessologoLevels.has(level.toLowerCase());

		if (!name || !surname || !email || !address || !postalCode || !city || !county || !country || !level || !membershipLevel || !membershipExpiry || !membershipStatus) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
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
						isRiflessologo,
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
						mobilePhonePublic,
						'membership.membershipExpiry': membershipExpiry,
						'membership.membershipStatus': membershipStatus,
						'membership.membershipLevel': membershipLevel,
						'insurance.insuranceStatus': insuranceStatus === 'true',
						...(insuranceStatus === 'true' && insuranceExpiry && { 'insurance.insuranceExpiry': insuranceExpiry }),
						// 'insurance.insuranceExpiry': insuranceExpiry !== null ? insuranceExpiry : null,
						// 'insurance.insuranceStatus': insuranceStatus === 'true' ? true : false,
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

			// Ricarica l'utente modificato
			const userFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user',
					query: { userId },
					projection: { _id: 0, password: 0 },
					sort: { createdAt: -1 },
					limit: 1,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!userFetch.ok) {
				const errorText = await userFetch.text();
				console.error('user fetch failed', userFetch.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const user = await userFetch.json();

			return { action: 'modify', success: true, message: result.message, payload: user };

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
		const email = formData.get('email')?.toString().toLowerCase().trim();
		const name = formData.get('name');
		const surname = formData.get('surname');
		const county = formData.get('county');
		const mobilePhone = formData.get('mobilePhone');
		// const arrayField = ['level', 'membership.membershipLevel', 'email'];
		// const arrayValue = [level, membershipLevel, email];

		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: {
					...(level && { level: { $regex: level, $options: 'i' } }),
					...(membershipLevel && { ['membership.membershipLevel']: membershipLevel }),
					//...(email && { email })
					...(email && { email: { $regex: email, $options: 'i' } }),
					...(name && { name: { $regex: name, $options: 'i' } }),
					...(surname && { surname: { $regex: surname, $options: 'i' } }),
					...(county && { county: { $in: [county] } }),
					...(mobilePhone && { mobilePhone: { $regex: mobilePhone, $options: 'i' } }),
				},
				projection: { _id: 0 }, // 0: exclude | 1: include,
				//sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending,
				limit: 500,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			let payload = [];
			if (!res.ok) {
				const errorText = await res.text();
				console.error('discount filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			payload = await res.json();
			payload = payload.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10)
			}));

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

		const updateFetch = fetch(`${BASE_URL}/api/mongo/update`, {
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
				//TODO TEST
				// options: {
				// 	upsert: false,
				// 	returnDocument: 'after',
				// 	projection: { _id: 0, password: 0 }
				// }
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId },
				projection: { _id: 0, password: 0 }, // 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await updateFetch;
			const resUser = await userFetch;

			if (!res.ok) {
				const errorText = await res.text();
				console.error('changeStatus update failed', res.status, errorText);
				return fail(400, { action: 'changeStatus', success: false, message: errorText });
			}
			const result = await res.json();

			if (!resUser.ok) {
				const errorText = await resUser.text();
				console.error('user update failed', resUser.status, errorText);
				return fail(400, { action: 'changeStatus', success: false, message: errorText });
			}
			const user = await resUser.json();

			return { action: 'changeStatus', success: true, message: result.message, payload: user };

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
			const csvData: any = await new Promise((resolve, reject) => {
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

				const finalUpdateDocument: any = unflattenObject(processedRow);

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
					//sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
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
			//console.log('content', content.length);

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
		const level = formData.get('level');
		const membershipLevel = formData.get('membershipLevel');
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
					query: {
						...(level && { level }),
						...(membershipLevel && { ['membership.membershipLevel']: membershipLevel })
					},
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

	logUser: async ({ request, cookies, locals }) => {
		const data = await request.formData();
		const userId = data.get('userId');
		//console.log('userId', userId);
		const cookieId = crypto.randomUUID()

		let response: any;

		if (!userId || typeof userId !== 'string') {
			return fail(400, { action: 'logUser', success: false, message: 'userId mancante' });
		}

		const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId }, //IF USE Products.model -> types: course / product / membership / event
				projection: { cookieId: 1 }, // 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1,
				skip: 0,
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		const updateFetch = (userId: string, cookieId: string) => fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { userId }, //IF USE Products.model -> types: course / product / membership / event,
				update: { $set: { cookieId } },
				options: { upsert: false },
				multi: false,
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		if (locals.user.level !== 'superadmin') {
			return fail(400, { action: 'logUser', success: false, message: 'Non permesso' });
		}

		try {
			// MEMO
			// const [userRes, updateRes] = await Promise.all([ for
			// 	userFetch,
			// 	updateFetch(response[0].email)
			// ]);

			// const userRes = await userFetch;

			// if (!userRes.ok) {
			// 	const errorText = await userRes.text();
			// 	console.error('user find failed', userRes.status, errorText);
			// 	return fail(400, { action: 'logUser', success: false, message: errorText });
			// }
			// response = await userRes.json(); // [{ email, password }]
			// console.log('response', response);

			// if (!response || response.length === 0 || !response[0].cookieId) {
			// 	return fail(400, { action: 'logUser', success: false, message: 'login fallito' })
			// }

			const updateRes = await updateFetch(userId, cookieId);

			if (!updateRes.ok) {
				const errorText = await updateRes.text();
				console.error('user update failed', updateRes.status, errorText);
				return fail(400, { action: 'logUser', success: false, message: errorText });
			}

			cookies.set('session_id', cookieId, {
				httpOnly: true,
				//maxAge: 60 * 60 * 24 * 7 // one week
				//maxAge: 60 * 60 * 24 * 1 // one day
				maxAge: 60 * 60 * 24 * 1,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				path: '/'
			});
			return { action: 'logUser', success: true, message: "Master login, Redirect user" };

		} catch (error: any) {
			console.error('Error logUser:', error);
			return fail(400, { action: 'logUser', success: false, message: 'Error logUser' });
		}
	},

	approveTraining: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const trainingDate = formData.get('trainingDate');
		const trainingFileName = formData.get('trainingFileName');
		const trainingDescription = formData.get('trainingDescription');
		const approved = formData.get('approved') === 'true';


		if (!userId || !trainingDate || !trainingFileName) {
			return fail(400, { action: 'approveTraining', success: false, message: 'Dati mancanti' });
		}

		const updateFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user',
				query: {
					userId,
					'trainingHistory': {
						$elemMatch: {
							date: trainingDate,
							fileName: trainingFileName,
							description: trainingDescription
						}
					}
				},
				update: {
					$set: {
						'trainingHistory.$.approved': approved
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
			const res = await updateFetch;

			if (!res.ok) {
				const errorText = await res.text();
				return fail(400, { action: 'approveTraining', success: false, message: errorText });
			}

			const result = await res.json();

			const userFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user',
					query: { userId },
					projection: { _id: 0, password: 0 },
					sort: { createdAt: -1 },
					limit: 1,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!userFetch.ok) {
				const errorText = await userFetch.text();
				return fail(400, { action: 'approveTraining', success: false, message: errorText });
			}

			const user = await userFetch.json();

			return {
				action: 'approveTraining',
				success: true,
				message: result.message,
				payload: user,
				approved
			};

		} catch (error) {
			return fail(400, { action: 'approveTraining', success: false, message: 'Error approveTraining' });
		}
	},

	delTraining: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const fileName = formData.get('fileName');
		const trainingDate = formData.get('trainingDate');
		const trainingDescription = formData.get('trainingDescription');

		if (!userId || !fileName) {
			return fail(400, { action: 'delTraining', success: false, message: 'Dati mancanti' });
		}

		try {
			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user',
					query: { userId },
					update: {
						$pull: {
							trainingHistory: {
								fileName,
								...(trainingDate && { date: trainingDate }), // 🆕 Usa date se disponibile
								fileUrl: `/uploads/user/${userId}/${fileName}`,
								description: trainingDescription
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

			if (!res.ok) {
				return fail(400, { action: 'delTraining', success: false, message: await res.text() });
			}

			const response = await res.json();

			// Elimina il file fisico
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

			if (!responseDelete.ok) {
				return fail(400, { action: 'delTraining', success: false, message: await responseDelete.text() });
			}

			return {
				action: 'delTraining',
				success: true, message:
					response.message,
				payload: ['ok'],
				approved: true
			};

		} catch (error) {
			console.error('Error delTraining:', error);
			return fail(400, { action: 'delTraining', success: false, message: 'Errore rimozione' });
		}
	},

	resetPassword: async ({ request, fetch }) => {
		const data = await request.formData();
		const resetEmail = data.get('resetEmail')?.toString().toLowerCase().trim() || '';
		const newPass = nanoid(6);
		const hashed = hash(newPass, SALT);

		if (!resetEmail) {
			return fail(400, { action: 'resetPassword', success: false, message: 'L\'email è obbligatoria.' });
		}

		// const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		// 	method: 'POST',
		// 	body: JSON.stringify({
		// 		apiKey: APIKEY,
		// 		schema: 'user',
		// 		query: { email: resetEmail },
		// 		projection: { email: 1 },
		// 		sort: { createdAt: -1 },
		// 		limit: 1,
		// 		skip: 0
		// 	}),
		// 	headers: {
		// 		'Content-Type': 'application/json'
		// 	}
		// });

		try {
			// const userRes = await userFetch;
			// if (!userRes.ok) {
			// 	// Restituisco comunque messaggio generico
			// 	return { action: 'resetPassword', success: true, message: 'Se l\'email è registrata, riceverai le istruzioni per il reset' };
			// }
			// const user = await userRes.json();

			// // Se l'utente NON esiste, restituisco lo stesso messaggio generico
			// if (user.length == 0 || user[0].email != resetEmail) {
			// 	return { action: 'resetPassword', success: true, message: 'Se l\'email è registrata, riceverai le istruzioni per il reset' };
			// }

			// Solo se l'utente esiste, eseguo update e invio email
			const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'user',
					query: { email: resetEmail },
					update: {
						$set: {
							password: hashed,
							cookieId: '',
						}
					},
					options: { upsert: false },
					multi: false
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const mailFetch = fetch(`${BASE_URL}/api/mailer/recover-password`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					email: ['amministrazionedienchan@gmail.com', resetEmail],
					password: newPass
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const res = await resFetch;
			if (!res.ok) {
				return fail(400, { action: 'resetPassword', success: false, message: 'Errore reset password' });
			}

			const mailRes = await mailFetch;
			if (!mailRes.ok) {
				return fail(400, { action: 'resetPassword', success: false, message: 'Errore invio mail' });
			}

			return { action: 'resetPassword', success: true, message: 'Pass reset fatto' };

		} catch (err: any) {
			console.error('Password reset error:', err);
			// Anche per errori del server, messaggio generico
			return { action: 'resetPassword', success: true, message: 'Errore Reset' };
		}
	},

	setProfilePic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const file = formData.get('fileUpload') as File;

		if (!userId || !file || !file.name) {
			return fail(400, { action: 'setProfilePic', success: false, message: 'File mancante' });
		}

		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			return fail(400, { action: 'setProfilePic', success: false, message: 'File troppo grande (max 10MB)' });
		}

		// const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
		const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/JPG', 'image/JPEG'];
		if (!allowedTypes.includes(file.type)) {
			return fail(400, { action: 'setProfilePic', success: false, message: 'Tipo di file non supportato (solo JPEG, PNG, WebP)' });
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

			return { action: 'delProfilePic', success: true, message: response.message || 'Immagine rimossa' };

		} catch (error) {
			console.error('Error delProfilePic:', error);
			return fail(400, { action: 'delProfilePic', success: false, message: 'Errore rimozione' });
		}
	},
} satisfies Actions;
