//import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	let getTableNames = [];
	let getLayout = [];

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

		// LISTA NOMI RIFLESSOLOGI
		const resName = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/users/all-active-names/0/0`
		);
		getTableNames = await resName.json();

		// Layout list
		const arrayField: unknown[] = [];
		const arrayValue: unknown[] = [];
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
		console.log('products-corso fetch error:', error);
	}
	//console.log('getTableCorsi', getTableCorsi);
	return {
		getLayout,
		getTable,
		getTableNames,
		auth: locals.auth
		//userData
	};
}
