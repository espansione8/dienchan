import type { PageServerLoad, Actions } from './$types'
import type { Product } from '$lib/types';
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid'
import { pageAuth } from '$lib/pageAuth';
import Papa from 'papaparse';
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 9)

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	pageAuth(url.pathname, locals.auth, 'page');

	let getTable: Product[] = [];
	//let categories: string[] = [];


	try {
		const resFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { type: 'product' },//types: course / product / membership / event
				projection: { _id: 0 }, // 0: exclude | 1: include
				sort: { title: 1 }, // 1:Sort ascending | -1:Sort descending
				limit: 50,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!resFetch.ok) {
			const errorText = await resFetch.text();
			console.error('products-table fetch failed', resFetch.status, errorText);
			throw error(400, { message: `Products fetch failed: ${errorText}` });
		}
		getTable = await resFetch.json();
		//categories = [...new Set(getTable.flatMap((item: any) => item.category))] as string[];
		//console.log('products-table getTable', getTable);


	} catch (err) {
		console.log('products-table fetch error:', err);
		throw error(500, { message: `Products server failed: ${err}` });
	}

	return {
		getTable,
		itemCount: getTable.length
		//categories
	};
}

export const actions: Actions = {
	new: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = nanoid()
		//const prodId = stringHash(crypto.randomUUID());
		const title = formData.get('title') || '';
		const descrShort = formData.get('descrShort') || '';
		const descrLong = formData.get('descrLong') || '';
		const stockQty = formData.get('stockQty');
		const category = formData.get('category') || '';
		const weight = formData.get('weight');
		const price = formData.get('price');
		const sku = formData.get('sku');

		const newDoc = {
			prodId,
			title,
			descrShort,
			descrLong,
			stockQty,
			weight,
			category: [category],
			price,
			sku
		};

		if (!title || !stockQty || !price) {
			return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/create`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				newDoc,
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
			console.error('Error new :', error);
			return { action: 'new', success: false, message: 'Error new' };
		}
	},

	modify: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const title = formData.get('title') || '';
		const descrShort = formData.get('descrShort') || '';
		const descrLong = formData.get('descrLong') || '';
		const stockQty = formData.get('stockQty');
		const price = formData.get('price');
		const weight = formData.get('weight');
		const category = formData.get('category') || '';
		const sku = formData.get('sku');

		if (!prodId) {
			return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { prodId, type: 'product' },
				update: {
					$set: {
						title,
						descrShort,
						descrLong,
						stockQty,
						price,
						weight,
						category,
						sku
					}
				},
				options: {
					upsert: false,
				},
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
				console.error('discount update failed', res.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}
			const result = await res.json();
			return { action: 'modify', success: true, message: result.message };

		} catch (error) {
			console.error('Error creating new modify:', error);
			return { action: 'modify', success: false, message: 'Error modify' };
		}
	},

	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');

		const resFetch = fetch(`${BASE_URL}/api/mongo/remove`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { prodId: prodId },
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
				console.error('discount delete failed', res.status, errorText);
				return fail(400, { action: 'delete', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'delete', success: true, message: result.message };

		} catch (error) {
			console.error('Error delete:', error);
			return { action: 'delete', success: false, message: 'Error delete' };
		}
	},

	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const title = formData.get('title');
		const category = formData.get('category');
		const status = formData.get('status');
		const sku = formData.get('sku');

		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: {
					type: 'product',
					...(prodId && { prodId }),
					...(sku && { sku }),
					...(title && { title: { $regex: `.*${title}.*`, $options: 'i' } }),
					...(category && { category }),
					...(status && { status }),
				},
				projection: { _id: 0 },
				sort: { title: 1 },
				limit: 10000,
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
				console.error('discount filter failed', res.status, errorText);
				return fail(400, { action: 'filter', success: false, message: errorText });
			}
			const payload = await res.json();

			return { action: 'filter', success: true, message: 'Filtro attivato', payload };

		} catch (error) {
			console.error('Error filter:', error);
			return { action: 'filter', success: false, message: 'Error filter' };
		}
	},

	changeStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const status = formData.get('status');
		const newStatus = status == 'enabled' ? 'disabled' : 'enabled';
		if (!prodId || !status) {
			return fail(400, { action: 'changeStatus', success: false, message: 'Dati mancanti' });
		}

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { prodId: prodId },
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
				console.error('changeStatus update failed', res.status, errorText);
				return fail(400, { action: 'changeStatus', success: false, message: errorText });
			}
			const result = await res.json();

			return { action: 'changeStatus', success: true, message: result.message };

		} catch (error) {
			console.error('Error changeStatus:', error);
			return fail(400, { action: 'changeStatus', success: false, message: 'Error changeStatus' });
		}
	},

	setProdPic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const file = formData.get('fileUpload') as File;

		if (!prodId || !file || !file.name) {
			return fail(400, { action: 'setProdPic', success: false, message: 'File mancante' });
		}

		try {
			const uploadImg = fetch(`${BASE_URL}/api/uploads/files`, {
				method: 'POST',
				headers: {
					//'Content-Type': 'application/json',
					'Content-Type': file.type || 'application/octet-stream',
					'x-file-name': file.name,
					'x-folder-name': `product/${prodId}`
				},
				body: file
			});
			// const resImg = await uploadImg.json();

			const query = { prodId, type: 'product' }; // 'course', 'product', 'membership', 'event'
			const update = {
				$push: {
					uploadfiles: [
						{
							_id: false,
							type: 'product-primary', //'product-primary', 'product-gallery', 'membership', 'course'
							fileType: file.type,
							fileName: file.name,
							fileUrl: `/uploads/product/${prodId}/${file.name}`
						}
					],
				}
			};
			const options = {
				upsert: false
				// NOTES:
				// arrayFilters: [
				// 	{ "elem.type": "product-primary" } // Check array where 'type' === 'product-primary'
				// ]
			}
			const multi = false
			const res = fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product', //product | order | user | layout | discount
					query,
					update,
					options,
					multi
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			//const response = await res.json();

			const [resImg, response] = await Promise.all([
				uploadImg,
				res
			])

			if (!resImg.ok) return { action: 'setProdPic', success: false, message: `resImg: ${await resImg.text()}` }
			if (!response.ok) return { action: 'setProdPic', success: false, message: `response: ${await response.text()}` };

			const updateJson = await response.json();

			return { action: 'setProdPic', success: true, message: updateJson.message };

		} catch (err) {
			console.error('Error upload:', err);
			return { action: 'setProdPic', success: false, message: 'Errore server upload' };
		}
	},

	delProdPic: async ({ request, fetch }) => {
		const formData = await request.formData();
		const prodId = formData.get('prodId');
		const fileName = formData.get('fileName');
		//console.log('prod filename', prodId, fileName);

		if (!prodId || !fileName) {
			return fail(400, { action: 'delProdPic', success: false, message: 'Dati mancanti' });
		}

		try {
			const responseDelete = await fetch(`${BASE_URL}/api/uploads/files`, {
				method: 'DELETE',
				body: JSON.stringify({
					dir: `product/${prodId}`,
					fileName
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			//console.log('responseDelete', responseDelete);

			const resDel = await responseDelete.json();
			if (responseDelete.status != 200) return { action: 'delProdPic', success: false, message: resDel.message };

			const res = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product', //product | order | user | layout | discount
					query: { prodId, type: 'product' },
					update: {
						$pull:
							{ uploadfiles: { type: 'product-primary', fileName: fileName } }
					},
					options: { upsert: false },
					multi: false
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!res.ok) return { action: 'delProdPic', success: false, message: `res: ${await res.text()}` };
			const response = await res.json();

			return { action: 'delProdPic', success: true, message: response.message };

		} catch (error) {
			console.error('Error delProdPic:', error);
			return { action: 'delProdPic', success: false, message: 'Errore rimozione' };
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

			const bulkOperations = csvData.map(row => {
				if (!row.prodId) { // IMPORTANT: prodId , userId
					console.warn('CSV row skipped', row);
					return null; // null skip the row
				}

				return {
					updateOne: {
						filter: { prodId: row.prodId },
						update: { $set: row },
						upsert: true
					}
				};
			}).filter(op => op !== null); // remove (null) rows

			if (bulkOperations.length === 0) {
				return { action: 'uploadCsv', success: false, message: 'Nessun dato valido da processare nel CSV.' };
			}

			const res = await fetch(`${BASE_URL}/api/mongo/update-bulk`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product', // 'user' FOR userId
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
	changePage: async ({ request, fetch }) => {
		const formData = await request.formData();
		const navigation = formData.get('navigation');
		const itemsPerPage = Number(formData.get('itemsPerPage'));
		let currentPage = Number(formData.get('currentPage'));
		const category = formData.get('category');

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
					schema: 'product', //product | order | user | layout | discount
					query: {
						type: 'product',
						...(category && { category })
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
				console.error('product changePage failed', res.status, errorText);
				return fail(400, { action: 'changePage', success: false, message: `changePage Error: ${errorText}` });
			}
			const result = await res.json();
			// console.log('changePage result', result);
			return { action: 'changePage', success: true, message: result.message, payload: { result, currentPage } };

		} catch (error) {
			console.error('Error changePage:', error);
			return { action: 'changePage', success: false, message: 'Error changePage' };
		}
	},

	downloadCsv: async ({ request, fetch }) => {
		try {
			const resFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product', //product | order | user | layout | discount
					query: { type: 'product' },
					projection: { _id: 0 }, // 0: exclude | 1: include
					sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
					limit: 10000,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!resFetch.ok) {
				const errorText = await resFetch.text();
				console.error('downloadCsv fetch failed', resFetch.status, errorText);
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

	productSalesByMonth: async ({ fetch }) => {
		const currentYear = new Date().getFullYear();

		try {
			const orderFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'order',
					query: {},
					projection: { _id: 0, orderDate: 1, cart: 1 },
					sort: { orderDate: 1 },
					limit: 0,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!orderFetch.ok) {
				const errorText = await orderFetch.text();
				console.error('order fetch failed', orderFetch.status, errorText);
				return fail(400, { action: 'productSalesByMonth', success: false, message: errorText });
			}

			const orders = await orderFetch.json();

			// Filter orders for current year
			const yearOrders = orders.filter(order => {
				const orderYear = new Date(order.orderDate).getFullYear();
				return orderYear === currentYear;
			});

			// Initialize product map
			const productSales: Record<string, { title: string; price: number; months: number[] }> = {};

			// Process each order
			yearOrders.forEach(order => {
				const orderMonth = new Date(order.orderDate).getMonth(); // 0-11

				order.cart.forEach(item => {
					if (item.type === 'product') {
						const prodId = item.prodId;
						const title = item.title;
						const price = item.price;
						const quantity = item.orderQuantity || 1;

						if (!productSales[prodId]) {
							productSales[prodId] = {
								title: title,
								price: price,
								months: new Array(12).fill(0)
							};
						}

						productSales[prodId].months[orderMonth] += quantity;
					}
				});
			});

			// Convert to array
			const payload = Object.entries(productSales).map(([prodId, data]) => ({
				prodId,
				title: data.title,
				price: data.price,
				months: data.months
			}));

			// Sort by prodId
			payload.sort((a, b) => a.prodId.localeCompare(b.prodId));

			return {
				action: 'productSalesByMonth',
				success: true,
				message: 'Dati recuperati',
				payload
			};

		} catch (error) {
			console.error('Error productSalesByMonth:', error);
			return fail(400, { action: 'productSalesByMonth', success: false, message: 'Error fetching data' });
		}
	}
} satisfies Actions;
