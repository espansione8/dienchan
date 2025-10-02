//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
const apiKey = APIKEY;
const baseURL = BASE_URL;

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	let getRiflessologi = [];
	let getLayout = [];
	//const user = locals.user

	try {
		// get courses
		const currentYear = new Date().getFullYear()
		const startOfYear = new Date(currentYear, 0, 1);
		const startOfNextYear = new Date(currentYear + 1, 0, 1);
		//const currentYear = new Date().getUTCFullYear()
		//const startOfYear = new Date(Date.UTC(currentYear, 0, 1));
		//const startOfNextYear = new Date(Date.UTC(currentYear + 1, 0, 1));
		const resProductsCorso = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'product',
				query: {
					status: 'enabled',
					type: 'course',
					eventStartDate: {
						$gte: startOfYear,
						$lt: startOfNextYear
					}
				},
				sort: { eventStartDate: 1 },
				projection: { _id: 0 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!resProductsCorso.ok) throw error(400, `resProductsCorso: ${await resProductsCorso.text()}`);

		const resGetTable = await resProductsCorso.json();

		getTable = resGetTable
			.filter((obj: any) => obj.layoutView)
			.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt ? obj.createdAt.substring(0, 10) : undefined,
				eventStartDate: obj.eventStartDate ? obj.eventStartDate.substring(0, 10) : undefined,
				timeStartDate: obj.eventStartDate ? obj.eventStartDate.substring(11, 16) : undefined,
			}));

		// riflessologi list
		const resRiflessologi = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'user',
				query: {
					status: 'enabled',
					$or: [
						// { level: 'superadmin' },
						{ level: 'formatore base' },
						{ level: 'formatore avanzato' },
					]
				},
				projection: { _id: 0, name: 1, surname: 1, userId: 1 },
				sort: { surname: 1 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!resRiflessologi.ok) throw error(400, `resRiflessologi: ${await resRiflessologi.text()}`);
		const allFormatori = await resRiflessologi.json(); // Salviamo qui i formatori

		const resCorsiAttivi = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'product',
				query: {
					type: 'course',
					status: 'enabled'
				},
				projection: { _id: 0, userId: 1 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!resCorsiAttivi.ok) throw error(400, `resCorsiAttivi: ${await resCorsiAttivi.text()}`);
		const corsiAttivi = await resCorsiAttivi.json();

		// Creiamo un Set con gli userId dei formatori che hanno corsi attivi
		const formatoriConCorsiAttivi = new Set(corsiAttivi.map(corso => corso.userId));

		// Filtriamo solo i formatori che hanno almeno un corso attivo
		getRiflessologi = allFormatori.filter(formatore =>
			formatoriConCorsiAttivi.has(formatore.userId)
		);

		// get layout
		const resLayout = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'layout',
				query: {},
				projection: { _id: 0 },
				sort: { title: 1 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!resLayout.ok) throw error(400, `resLayout: ${await resLayout.text()}`);
		getLayout = await resLayout.json();

	} catch (error) {
		console.log('layout find error:', error);
	}
	//console.log('getTable', typeof getTable[0].eventStartDate, getTable[0].eventStartDate);

	return {
		getTable,
		getRiflessologi,
		getLayout,
		auth: locals.auth,
		userData: locals.user
	};
}
