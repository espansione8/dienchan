import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid'
import { pageAuth } from '$lib/pageAuth';
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable = [];
	let getProducts = [];

	const layoutFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'layout', //product | order | user | layout | discount
			query: {},
			projection: {},
			sort: { createdAt: -1 },
			limit: 1000,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	const productFetch = fetch(`${BASE_URL}/api/mongo/find`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: APIKEY,
			schema: 'product', //product | order | user | layout | discount
			query: { type: 'product' }, //types: course / product / membership / event
			projection: {},
			sort: { title: 1 }, // 1:Sort ascending | -1:Sort descending
			limit: 1000,
			skip: 0
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	try {
		const [layoutRes, productRes] = await Promise.all([layoutFetch, productFetch]);
		//const layoutRes = await layoutFetch;
		if (!layoutRes.ok) {
			const errorText = await layoutRes.text();
			console.error('layoutFetch failed', layoutRes.status, errorText);
			throw error(400, errorText);
		}

		const resLayoutTable = await layoutRes.json();
		if (resLayoutTable.length > 0) {
			getTable = resLayoutTable.map((obj: any) => ({
				...obj,
				createdAt: obj.createdAt.substring(0, 10)
			}));
		}

		//const productRes = await productFetch;
		if (!productRes.ok) {
			const errorText = await productRes.text();
			console.error('productFetch failed', productRes.status, errorText);
			throw error(400, errorText);
		}

		getProducts = await productRes.json();
		//console.log('getProducts', getProducts);

	} catch (error) {
		console.log('page fetch error:', error);
		throw error(500, 'Server error');
	}

	return {
		getTable,
		getProducts
	};
}

export const actions: Actions = {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const descr = formData.get('descr');
		const price = formData.get('price') || '';
		const bundle = formData.get('bundleProducts');
		let bundleProducts: any[] = [];
		try {
			bundleProducts = bundle ? JSON.parse(String(bundle)) : [];
		} catch {
			return fail(400, { action: 'new', success: false, message: 'bundleProducts non valido' });
		}
		//const bundleProducts = arryProducts.map(item => String(item.prodId));

		if (!title || !descr || !price) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				newDoc: {
					layoutId: nanoid(),
					title,
					descr,
					price,
					bundleProducts
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
			console.error('Error layout new :', error);
			return { action: 'new', success: false, message: 'Error layout new' };
		}
	},

	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');
		const title = formData.get('title') || '';
		const descr = formData.get('descr') || '';
		const price = formData.get('price') || '';
		const bundle = formData.get('bundleProducts');
		const bundleProducts = JSON.parse(String(bundle)) || [];
		//const bundleProducts = arryProducts.map(item => String(item.prodId));
		// console.log('bundleProducts', bundleProducts);
		// return fail(400, { action: 'modify', success: false, message: 'bundleProducts' });

		if (!layoutId || !title) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				query: { layoutId: layoutId },
				update: {
					$set: {
						title,
						descr,
						price: Number(price),
						bundleProducts
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
				console.error('layout update failed', res.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'modify', success: true, message: result.message };

		} catch (error) {
			console.error('Error layout modify:', error);
			return { action: 'modify', success: false, message: 'Error layout modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');

		const resFetch = fetch(`${BASE_URL}/api/mongo/remove`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				query: { layoutId: layoutId },
				multi: false,
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const updateFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { layoutId: layoutId, type: 'course' },
				update: {
					$set: {
						status: 'disabled'
					}
				},
				options: { upsert: false },
				multi: true
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const res = await resFetch;
			if (!res.ok) {
				const errorText = await res.text();
				console.error('layout delete failed', res.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}
			const result = await res.json();

			const update = await updateFetch
			if (!update.ok) {
				const errorText = await update.text();
				console.error('course deactivating failed', update.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}

			return { action: 'delete', success: true, message: result.message };

		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Error layout delete' };
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const status = formData.get('status');
		const title = formData.get('title');
		const descr = formData.get('descr');
		//const price = formData.get('price');
		//console.log('layoutId', layoutId);

		if (!status && !title && !descr) {
			return fail(400, { action: 'filter', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				query: {
					...(status && { status }),
					...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
					...(descr && { descr: { $regex: `.*${descr}.*`, $options: 'i' } }),
					//...(layoutId && { layoutId: layoutId }),
					//...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
					//...(price && { price }),
				},
				projection: { _id: 0 },
				sort: { createdAt: -1 },
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
				console.error('layout filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const payload = await res.json();

			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error layout filter' };
		}
	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');
		const status = formData.get('status');
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';

		if (!layoutId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				query: { layoutId: layoutId },
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
				console.error('changeStatus layout failed', res.status, errorText);
				return fail(400, { action: 'changeStatus', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'changeStatus', success: true, message: result.message };

		} catch (error) {
			console.error('Error changeStatus:', error);
			return fail(400, { action: 'changeStatus', success: false, message: 'Error layout changeStatus' });
		}
	},

	setProdPic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');
		const file = formData.get('fileUpload');

		if (!layoutId || !file || !file.name) {
			return fail(400, { action: 'setProdPic', success: false, message: 'File mancante' });
		}
		//console.log(layoutId, file);



		try {
			const uploadRes = await fetch(`${BASE_URL}/api/uploads/files`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-file-name': file.name,
					'x-folder-name': `layout/${layoutId}`
				},
				body: file
			});
			// const resImg = await uploadImg.json();

			const updateRes = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'layout', //product | order | user | layout | discount
					query: { layoutId }, // 'course', 'product', 'membership', 'event',
					update: {
						$set: {
							urlPic: `/uploads/layout/${layoutId}/${file.name}`
						}
					},
					options: {
						upsert: false
						// NOTES:
						// arrayFilters: [
						// 	{ "elem.type": "product-primary" } // Check array where 'type' === 'product-primary'
						// ]
					},
					multi: false
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			//const response = await res.json();
			// const [uploadRes, updateRes] = await Promise.all([
			// 	uploadFetch,
			// 	updateFetch
			// ])

			if (!uploadRes.ok) {
				const errorMessage = await uploadRes.text();
				console.log('setProdPic failed 1', uploadRes.status, `uploadRes: ${errorMessage}`);
				return { action: 'setProdPic', success: false, message: `uploadRes: ${errorMessage}` };
			}
			if (!updateRes.ok) {
				const errorMessage = await updateRes.text()
				console.log('setProdPic failed 2', updateRes.status, `updateRes: ${errorMessage}`);
				return { action: 'setProdPic', success: false, message: `updateRes: ${errorMessage}` };
			}

			const update = await updateRes.json();
			return { action: 'setProdPic', success: true, message: update.message };

		} catch (error) {
			console.error('Error upload:', error);
			return { action: 'setProdPic', success: false, message: 'Errore upload' };
		}
	},

	delProdPic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const layoutId = formData.get('layoutId');
		const fileName = formData.get('fileName');
		//console.log('prod filename', layoutId, fileName);

		if (!layoutId || !fileName) {
			return fail(400, { action: 'delProdPic', success: false, message: 'Dati mancanti' });
		}

		const deleteFetch = fetch(`${BASE_URL}/api/uploads/files`, {
			method: 'DELETE',
			body: JSON.stringify({
				dir: `layout/${layoutId}`,
				fileName
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const updateFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'layout', //product | order | user | layout | discount
				query: { layoutId }, // 'course', 'product', 'membership', 'event'
				update: {
					$set: {
						urlPic: ''
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
			const [deleteRes, updateRes] = await Promise.all([
				deleteFetch,
				updateFetch
			])

			if (!deleteRes.ok || !updateRes.ok) {
				const errorText = `deleteRes: ${await deleteRes.text()}, updateRes: ${await updateRes.text()}`;
				console.log('Promise.all failed', deleteRes.status, updateRes.status, errorText);
				return { action: 'delProdPic', success: false, message: 'Errore rimozione' };
			}

			const update = await updateRes.json();
			return { action: 'delProdPic', success: true, message: update.message };

		} catch (error) {
			console.error('Error delProdPic:', error);
			return { action: 'delProdPic', success: false, message: 'Errore rimozione' };
		}
	},
} satisfies Actions;