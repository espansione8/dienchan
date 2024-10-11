import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	//console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}

	let getTable = [];
	let getTableNames = [];
	let getLayout = [];
	const userId = locals.data.userId || ''

	try {
		let path = `${import.meta.env.VITE_BASE_URL}/api/products/find/type/course/0/0`
		if (locals.data.level == 'formatore') path = `${import.meta.env.VITE_BASE_URL}/api/courses/user-id/${userId}`

		// ADMIN course
		const res = await fetch(path);

		const resGetTable = await res.json();
		getTable = resGetTable.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			eventStartDate: obj.eventStartDate,
			timeStartDate: obj.eventStartDate.substring(11, 16),
			//timeEndDate: obj.eventEndDate.substring(11, 16),
		}));

		// LISTA NOMI RIFLESSOLOGI
		const resName = await fetch(
			`${import.meta.env.VITE_BASE_URL}/api/users/all-active-names/0/0`
		);
		getTableNames = await resName.json();

		// Layout list
		const arrayField = [];
		const arrayValue = [];
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
	const user = locals.data
	if (locals.auth) {
		user.membership.membershipExpiry = user.membership.membershipExpiry.toISOString().substring(0, 10);
		user.membership.membershipSignUp = user.membership.membershipSignUp.toISOString().substring(0, 10);
		user.membership.membershipActivation = user.membership.membershipActivation.toISOString().substring(0, 10);
	}
	return {
		getLayout,
		getTable,
		getTableNames,
		auth: locals.auth,
		userData: user,
	};
}

export const actions: Actions = {
	newCourse: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const userId = locals.data.userId;
		const name = locals.data.name;
		const surname = locals.data.surname;
		const title = formData.get('title') || '';
		const descrLong = formData.get('descrLong') || '';
		const eventStartDate = formData.get('eventStartDate');
		const stockQty = formData.get('stockQty') || 0;
		const countryState = formData.get('countryState') || '';
		const location = formData.get('location');
		const category = formData.get('category');
		const layoutId = formData.get('layoutId'); // TODO aggiungere input nel fronte-end + API
		const price = formData.get('price');
		const tagArray = formData.get('tagArray') || [];
		const tag = tagArray.split(",");
		const arrayEmail = formData.get('notificationEmail') || [];
		const notificationEmail = arrayEmail.split(",");
		//console.log("tag", typeof tag, tag);
		const infoExtra = formData.get('infoExtra');
		//console.log({ name }, { surname }, { title }, { descrLong }, { eventStartDate }, { stockQty }, { countryState }, { location }, { category }, { price }, { notificationEmail }, { tag }, { infoExtra });

		if (!name || !surname || !title || !descrLong || !eventStartDate || !stockQty || !countryState || !location || !category || !price) {
			return fail(400, { action: 'newCourse', success: false, message: 'Dati mancanti' });
		}

		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/courses/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId,
					name,
					surname,
					title,
					descrLong,
					eventStartDate,
					stockQty,
					countryState,
					location,
					category,
					notificationEmail,
					tag,
					price,
					infoExtra
				})
			});
			const result = await response.json();
			if (response.status == 200) {
				return { action: 'newCourse', success: true, message: result.message };
			} else {
				return { action: 'newCourse', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new newCourse:', error);
			return { action: 'newCourse', success: false, message: 'Errore creazione newCourse' };
		}
	},

	modifyCourse: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const userId = locals.data.userId;
		const name = locals.data.name;
		const surname = locals.data.surname;
		const title = formData.get('title') || '';
		const descrLong = formData.get('descrLong') || '';
		const eventStartDate = formData.get('eventStartDate');
		const stockQty = formData.get('stockQty') || 0;
		const countryState = formData.get('countryState') || '';
		const location = formData.get('location');
		const category = formData.get('category');
		const price = formData.get('price');
		const tagArray = formData.get('tagArray') || [];
		const tag = tagArray.split(",");
		const arrayEmail = formData.get('notificationEmail') || [];
		const notificationEmail = arrayEmail.split(",");
		const infoExtra = formData.get('infoExtra');
		const prodId = formData.get('prodId');

		if (!name || !surname || !title || !descrLong || !eventStartDate || !stockQty || !countryState || !location || !category || !price) {
			return fail(400, { action: 'newCourse', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, productId, layoutId, notes });
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/courses/modify`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prodId,
					userId,
					name,
					surname,
					title,
					descrLong,
					eventStartDate,
					stockQty,
					countryState,
					location,
					category,
					notificationEmail,
					tag,
					price,
					infoExtra
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'modifyCourse', success: true, message: result.message };
			} else {
				return { action: 'modifyCourse', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error creating new modifyCourse:', error);
			return { action: 'modifyCourse', success: false, message: 'Errore creazione modifyCourse' };
		}
	},


	deleteCourse: async ({ request, fetch }) => {

		const formData = await request.formData();
		const prodId = formData.get('prodId');
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/courses/remove`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prodId
				})
			});
			const result = await response.json();
			if (response.ok) {
				return { action: 'deleteCourse', success: true, message: result.message };
			} else {
				return { action: 'deleteCourse', success: false, message: result.message };
			}
		} catch (error) {
			console.error('Error deleteCourse:', error);
			return { action: 'deleteCourse', success: false, message: 'Errore deleteCourse' };
		}
	}

} satisfies Actions;