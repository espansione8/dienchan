//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	let getTableNames = [];
	let getLayout = [];
	const user = locals.user

	try {
		let arrayField: any[] = [];
		let arrayValue: any[] = [];

		// get courses
		arrayField = ['status', 'type'];
		arrayValue = ['enabled', 'course'];
		const resProductsCorso = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'product',
				arrayField,
				arrayValue
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const resGetTable = await resProductsCorso.json();
		console.log('resGetTable', resGetTable);

		getTable = resGetTable.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			eventStartDate: obj.eventStartDate.substring(0, 10),
			timeStartDate: obj.eventStartDate.substring(11, 16),
			//timeEndDate: obj.eventEndDate.substring(11, 16),
		}));

		// user list
		arrayField = ['status', 'level'];
		arrayValue = ['enabled', 'superadmin'];
		// arrayValue = ['enabled', 'formatore']; // REFACTOR
		const resName = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'user',
				arrayField,
				arrayValue
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		getTableNames = await resName.json();

		// get layout
		arrayField = [];
		arrayValue = [];
		const resLayout = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
			method: 'POST',
			body: JSON.stringify({
				schema: 'layout',
				arrayField,
				arrayValue
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		getLayout = await resLayout.json();

	} catch (error) {
		console.log('course filter fetch error:', error);
	}
	//console.log('getTableCorsi', getTableCorsi);
	return {
		getTable,
		getTableNames,
		getLayout,
		auth: locals.auth,
		userData: user
	};
}
