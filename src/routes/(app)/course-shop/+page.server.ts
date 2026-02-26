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
		// const currentYear = new Date().getFullYear()
		// const startOfYear = new Date(currentYear, 2, 1); // from march  //from Jan new Date(currentYear, 0, 1); 
		// const startOfNextYear = new Date(currentYear + 1, 2, 1); // start of 01 march // start of 01 Jan  new Date(currentYear + 1, 0, 1);
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth();

		const academicYear = currentMonth < 5 ? currentYear - 1 : currentYear;
		const startOfYear = new Date(academicYear, 5, 1); // June 1st of academic year
		const startOfNextYear = new Date(academicYear + 1, 5, 1); // June 1st of next academic year
		// 1. Start Timer
		//const startTime = performance.now();

		const resProductsCorso = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'product',
				query: {
					status: 'enabled',
					type: { $in: ['course', 'event'] },
					eventStartDate: {
						$gte: startOfYear,
						$lt: startOfNextYear
					}
				},
				sort: { eventStartDate: 1 },
				//projection: { _id: 0 },
				projection: { prodId: 1, userId: 1, layoutView: 1, eventStartDate: 1, eventEndDate: 1, layoutId: 1, county: 1, timeStartDate: 1, timeEndDate: 1, type: 1, name: 1, surname: 1 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!resProductsCorso.ok) throw error(400, `resProductsCorso: ${await resProductsCorso.text()}`);

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

		// get layout
		const resLayout = await fetch(`${baseURL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey,
				schema: 'layout',
				query: {},
				projection: { _id: 0, title: 1, urlPic: 1, price: 1, promoPrice: 1, promoEndDate: 1, promoStatus: 1 },
				sort: { title: 1 },
				limit: 1000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!resLayout.ok) throw error(400, `resLayout: ${await resLayout.text()}`);

		const [resProductsCorso1, resRiflessologi1, getLayout1] = await Promise.all([
			resProductsCorso,
			resRiflessologi,
			resLayout
		]);

		const resGetTable = await resProductsCorso1.json();

		getTable = resGetTable
			.filter((obj: any) => obj.layoutView)
			.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt ? obj.createdAt.substring(0, 10) : undefined,
				eventStartDate: obj.eventStartDate ? obj.eventStartDate.substring(0, 10) : undefined,
				timeStartDate: obj.eventStartDate ? obj.eventStartDate.substring(11, 16) : undefined,
			}));

		const allFormatori = await resRiflessologi1.json(); // Salviamo qui i formatori

		// Creiamo un Set con gli userId dei formatori che hanno corsi attivi
		const formatoriConCorsiAttivi = new Set(resGetTable.map(corso => corso.userId));

		// Filtriamo solo i formatori che hanno almeno un corso attivo
		getRiflessologi = allFormatori.filter(formatore =>
			formatoriConCorsiAttivi.has(formatore.userId)
		);

		getLayout = await getLayout1.json();

		// 2. End Timer & Calculate Duration
		// const endTime = performance.now();
		// const duration = (endTime - startTime).toFixed(2);

		// 3. Measure Size before parsing JSON
		// const resClone = resProductsCorso.clone();
		// const rawText = await resClone.text();
		// const sizeInBytes = new TextEncoder().encode(rawText).length;
		// const sizeInKB = (sizeInBytes / 1024).toFixed(2);
		// console.log(`Fetch took ${duration}ms | Size: ${sizeInKB} KB`);
		// console.log(`Fetch took ${duration}ms `);

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
