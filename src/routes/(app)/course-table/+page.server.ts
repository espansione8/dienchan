import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ fetch, locals }) => {
	// console.log('locals', locals);
	if (!locals.auth) {
		throw redirect(302, '/login');
	}

	let getTable = [];
	let getTableNames = [];
	let getLayout = [];
	const userId = locals.user.userId || ''

	try {
		let arrayField: any[] = [];
		let arrayValue: any[] = [];

		// GET COURSES
		// let path = `${import.meta.env.VITE_BASE_URL}/api/products/find/type/course/0/0`
		// if (locals.user.level == 'formatore') path = `${import.meta.env.VITE_BASE_URL}/api/courses/user-id/${userId}`

		if (locals.user.level == 'formatore') {
			arrayField = ['type', 'userId'];
			arrayValue = ['course', userId];
		} else {
			arrayField = ['type'];
			arrayValue = ['course'];
		}
		const resCourse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
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
		const resGetCourse = await resCourse.json();
		//console.log(resGetCourse)

		getTable = resGetCourse.map((obj: any) => ({
			...obj,
			createdAt: obj.createdAt.substring(0, 10),
			eventStartDate: obj.eventStartDate,
			timeStartDate: obj.eventStartDate.substring(11, 16),
			//timeEndDate: obj.eventEndDate.substring(11, 16),
		}));

		// LISTA NOMI RIFLESSOLOGI
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
		//console.log('getTableNames', getTableNames);

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
		//console.log('getLayout', getLayout);


	} catch (error) {
		console.log('course table fetch error:', error);
	}
	const user = locals.user
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
		const userId = locals.user.userId;
		const name = locals.user.name;
		const surname = locals.user.surname;
		const title = formData.get('title') || '';
		const descrLong = formData.get('descrLong') || '';
		const eventStartDate = formData.get('eventStartDate');
		const stockQty = formData.get('stockQty') || 0;
		const countryState = formData.get('countryState') || '';
		const location = formData.get('location');
		const layoutId = formData.get('layoutId');
		const price = formData.get('price');
		const tagArray = formData.get('tagArray') || "";
		const tag = tagArray.split(",");
		const arrayEmail = formData.get('notificationEmail') || "";
		const notificationEmail = arrayEmail.split(",");
		const infoExtra = formData.get('infoExtra');
		//console.log({ name }, { surname }, { title }, { descrLong }, { eventStartDate }, { stockQty }, { countryState }, { location }, { price }, { notificationEmail }, { tag }, { infoExtra });

		if (!name || !surname || !title || !descrLong || !eventStartDate || !stockQty || !countryState || !location || !price) {
			return fail(400, { action: 'newCourse', success: false, message: 'Dati mancantrrri' });
		}

		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/courses/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					layoutId,
					userId,
					name,
					surname,
					title,
					descrLong,
					eventStartDate,
					stockQty,
					countryState,
					location,
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
		const userId = locals.user.userId;
		const name = locals.user.name;
		const surname = locals.user.surname;
		const title = formData.get('title') || '';
		const descrLong = formData.get('descrLong') || '';
		const eventStartDate = formData.get('eventStartDate');
		const stockQty = formData.get('stockQty') || 0;
		const countryState = formData.get('countryState') || '';
		const location = formData.get('location');
		const layoutId = formData.get('layoutId');
		const price = formData.get('price');
		const tagArray = formData.get('tagArray') || "";
		const tag = tagArray.split(",");
		const arrayEmail = formData.get('notificationEmail') || "";
		const notificationEmail = arrayEmail.split(",");
		const infoExtra = formData.get('infoExtra');
		const prodId = formData.get('prodId');

		if (!name || !surname || !title || !descrLong || !eventStartDate || !stockQty || !countryState || !location || !layoutId || !price) {
			return fail(400, { action: 'newCourse', success: false, message: 'Dati mancanti' });
		}

		// console.log({ code, type, value, userId, membershipLevel, prodId, layoutId, notes });
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
					layoutId,
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
	},

	filterCourse: async ({ request, fetch }) => {
		const formData = await request.formData();
		const countryState = formData.get('countryState');
		const layoutId = formData.get('layoutId');
		const userId = formData.get('userId');
		// console.log('layoutId', layoutId);

		const arrayField = ['countryState', 'layoutId', 'userId', 'type'];
		const arrayValue = [countryState, layoutId, userId, 'course'];
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/finds/0/0`, {
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
			//console.log('response', response);
			const result = await response.json();

			if (response.status == 200) {
				const filterTableList = result.map((obj: any) => ({
					...obj,
					createdAt: obj.createdAt.substring(0, 10),
					eventStartDate: obj.eventStartDate.substring(0, 10),
					timeStartDate: obj.eventStartDate.substring(11, 16)
				}));
				return { action: 'filterCourse', success: true, message: 'Filtro applicato', filterTableList };

			} else {
				return { action: 'filterCourse', success: false, message: 'Corso non trovato' };
			}
		} catch (error) {
			console.error('Error filterCourse:', error);
			return { action: 'filterCourse', success: false, message: 'Errore filterCourse' };
		}
	}
} satisfies Actions;