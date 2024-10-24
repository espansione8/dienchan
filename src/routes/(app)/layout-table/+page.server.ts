import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}
	let getTable = [];
	let getLayout = [];

	let arrayField = [];
	let arrayValue = [];

	try {
		// const userData = session.user;
		//console.log('MY DOCS userData', userData);

		// GET PRODUCTS
		arrayField = [];
		arrayValue = [];
		const res = await fetch(`/api/finds/0/0`, {
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
		const resGetTable = await res.json();
		getTable = resGetTable.map((obj) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10)
		}));


		// Layout list
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
		console.log('layout fetch error:', error);
	}
	const user = locals.user
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}
	return {
		getTable,
		getLayout,
		auth: locals.auth,
		userData: user,
	};
}


export const actions: Actions = {
	newLayout: async ({ request, fetch }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const descr = formData.get('descr');
		const urlPic = formData.get('urlPic');
		const bgColor = formData.get('bgColor');
		const price = formData.get('price') || '';
		// const bundleProduct = formData.get('bundleProduct') || '';

		if (!title || !descr || !price) {
			return fail(400, { action: 'newLayout', success: false, message: 'Dati mancanti' });
		}

		// console.log({ title, descr, urlPic, price, bundleProduct });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/layouts/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title,
					descr,
					urlPic,
					bgColor,
					price
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'newLayout', success: true, message: result.message };
			} else {
				return { action: 'newLayout', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new newLayout:', error);
			return { action: 'newLayout', success: false, message: 'Errore creazione newLayout' };
		}
	},

	modifyLayout: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');
		const title = formData.get('title') || '';
		const descr = formData.get('descr') || '';
		const urlPic = formData.get('urlPic') || '';
		const bgColor = formData.get('bgColor') || '';
		const price = formData.get('price') || '';


		console.log('layoutId', layoutId);
		if (!layoutId || !title) {
			return fail(400, { action: 'modifyLayout', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/layouts/modify`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					layoutId,
					title,
					descr,
					urlPic,
					bgColor,
					price
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'modifyLayout', success: true, message: result.message };
			} else {
				return { action: 'modifyLayout', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new modifyLayout:', error);
			return { action: 'modifyLayout', success: false, message: 'Errore creazione modifyLayout' };
		}
	},

	deleteLayout: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/layouts/remove`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					layoutId
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'deleteLayout', success: true, message: result.message };
			} else {
				return { action: 'deleteLayout', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new deleteLayout:', error);
			return { action: 'deleteLayout', success: false, message: 'Errore creazione deleteLayout' };
		}
	},

	filterLayout: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');

		// console.log('level', level);

		const arrayField = ['layoutId'];
		const arrayValue = [layoutId];

		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
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
			//console.log('response', response);
			const result = await response.json();

			if (response.status == 200) {
				const filterTableList = result.map((obj: any) => ({
					...obj,
					createdAt: obj.createdAt.substring(0, 10)
				}));
				return { action: 'filterLayout', success: true, message: 'Filtro applicato', filterTableList };

			} else {
				return { action: 'filterLayout', success: false, message: 'Corso non trovato' };
			}
		} catch (error) {
			console.error('Error filterLayout:', error);
			return { action: 'filterLayout', success: false, message: 'Errore filterLayout' };
		}
	}


} satisfies Actions;