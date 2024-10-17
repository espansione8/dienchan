//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	let getTableNames = [];
	let getLayout = [];
	const user = locals.data

	try {
		const resProductsCorso = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/products/find/type/course/0/0`
		);

		const resGetTable = await resProductsCorso.json();

		getTable = resGetTable.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			eventStartDate: obj.eventStartDate.substring(0, 10),
			timeStartDate: obj.eventStartDate.substring(11, 16),
			//timeEndDate: obj.eventEndDate.substring(11, 16),
		}));

		let arrayField = [];
		let arrayValue = [];

		// LISTA NOMI RIFLESSOLOGI
		arrayField = ['status', 'level'];
		arrayValue = ['enabled', 'superadmin'];
		// arrayValue = ['enabled', 'formatore']; // REFACTOR
		const resName = await fetch(`/api/finds/0/0`, {
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


		// Layout list
		// arrayField: unknown[] = [];
		// arrayValue: unknown[] = [];
		arrayField = [];
		arrayValue = [];
		const resLayout = await fetch(`/api/finds/0/0`, {
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
		getLayout,
		getTable,
		getTableNames,
		auth: locals.auth,
		userData: user
	};
}
