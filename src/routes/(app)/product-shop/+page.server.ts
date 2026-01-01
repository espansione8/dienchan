import type { PageServerLoad, Actions } from './$types'
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';
import PdfPrinter from 'pdfmake';

const idRemove = ["VEM139CGQ", "CL9USQKDE"];

const fonts = {
	Roboto: {
		normal: path.join(process.cwd(), 'uploads/fonts/Roboto/Roboto-Regular.ttf'),
		bold: path.join(process.cwd(), 'uploads/fonts/Roboto/Roboto-Medium.ttf'),
	}
};

export const load: PageServerLoad = async ({ fetch, locals }) => {
	let getTable = [];
	let getCategories = {};
	let itemCount = 0;
	//const user = locals.user

	try {
		//Count
		const countFetch = await fetch(`${BASE_URL}/api/mongo/count`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product', //product | order | user | layout | discount
				query: { type: 'product', status: 'enabled', prodId: { $nin: idRemove } },
				option: { hint: { prodId: 1 } },// optional:use index            
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});


		// get product
		const productFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product',
				query: {
					status: 'enabled',
					type: 'product',
					prodId: { $nin: idRemove }
				},
				projection: { _id: 0 },
				sort: { title: 1 },
				limit: 20,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});



		// Aggregate to get categories and count
		const AggregateFetch = fetch(`${BASE_URL}/api/mongo/aggregate`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'product',
				pipeline: [
					{ "$match": { "status": "enabled", "type": "product", "category": { "$exists": true, "$ne": null }, "prodId": { "$nin": idRemove } } },
					//{ "$match": { "status": "enabled", "type": "product", "category": { "$exists": true, "$ne": null } } },
					{ "$unwind": "$category" }, // Deconstructs the category array field from the input documents to output a document for each element.
					{ "$group": { "_id": "$category", "count": { "$sum": 1 } } }, // Group by category and count
					{ "$sort": { "_id": 1 } } // Sort by category name alphabetically
				]
			}),
			headers: { 'Content-Type': 'application/json' }
		});

		const [countRes, productRes, AggregateRes] = await Promise.all([
			countFetch,
			productFetch,
			AggregateFetch
		]);

		if (!countRes.ok) {
			throw error(400, 'Product count fetch failed');
		}
		itemCount = await countRes.json()

		if (!productRes.ok) {
			const errorText = await productRes.text();
			console.error('Product find failed', productRes.status, errorText);
			throw error(400, `Product find failed: ${errorText}`);
		}
		const resTable = await productRes.json();
		const filteredArray = resTable.filter(
			(object) => !idRemove.includes(object.prodId)
		);
		getTable = filteredArray

		if (!AggregateRes.ok) {
			const errorText = await AggregateRes.text();
			console.error('Categories aggregate fetch failed', AggregateRes.status, errorText);
			throw error(400, `Categories aggregate fetch failed: ${errorText}`);
		}
		const aggregateData = await AggregateRes.json();
		getCategories = aggregateData.reduce((acc: { [key: string]: number }, item: { _id: string, count: number }) => {
			acc[item._id] = item.count;
			return acc;
		}, {});

		// getTable = resGetTable.map((obj: any) => ({
		// 	...obj,
		// 	createdAt: obj.createdAt.substring(0, 10),
		// 	eventStartDate: obj.eventStartDate.substring(0, 10),
		// 	timeStartDate: obj.eventStartDate.substring(11, 16),
		// }));
	} catch (err) {
		console.log('product find error:', err);
		throw error(500, 'Server error during product load')
	}

	return {
		getTable,
		getCategories,
		itemCount,
		auth: locals.auth,
		user: locals.user
	};
}

export const actions: Actions = {
	filter: async ({ request, fetch }) => {
		const formData = await request.formData();
		const category = formData.get('category') as string;
		//console.log('category', category);

		try {
			// Count filtered items
			const countFetch = fetch(`${BASE_URL}/api/mongo/count`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: {
						status: 'enabled',
						type: 'product',
						category: category,
						prodId: { $nin: idRemove }
					},
					option: { hint: { prodId: 1 } }, // optional: define index to use { hint: { prodId: 1 } }
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			// Get items (first page)
			const productFetch = fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: {
						status: 'enabled',
						type: 'product',
						category: category,
						prodId: { $nin: idRemove }
					},
					sort: { title: 1 },
					projection: { _id: 0 },
					limit: 20,
					skip: 0
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			const [countRes, productRes] = await Promise.all([countFetch, productFetch]);

			if (!countRes.ok) {
				const errorText = await countRes.text();
				console.error('Filtered product count fetch failed', countRes.status, errorText);
				return fail(400, { action: 'filter', success: false, message: `countRes: ${errorText}` });
			}
			const itemCount = await countRes.json();

			if (!productRes.ok) {
				const errorText = await productRes.text();
				console.error('Filtered product fetch failed', productRes.status, errorText);
				return fail(400, { action: 'filter', success: false, message: `productRes: ${errorText}` });
			}

			const getTable = await productRes.json();

			return {
				action: 'filter',
				success: true,
				payload: { getTable, itemCount, currentPage: 1, category }
			};
		} catch (e) {
			console.error('Error product filter:', e);
			return fail(500, { action: 'filter', success: false, message: 'Error product filter' });
		}
	},

	searchName: async ({ request, fetch }) => {
		const formData = await request.formData();
		const searchTerm = formData.get('searchTerm') as string;

		try {
			// Count filtered items
			const countFetch = fetch(`${BASE_URL}/api/mongo/count`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: {
						status: 'enabled',
						type: 'product',
						title: { $regex: searchTerm, $options: 'i' },
						prodId: { $nin: idRemove }
					},
					option: { hint: { prodId: 1 } },
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			// Get items
			const productFetch = fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: {
						status: 'enabled',
						type: 'product',
						title: { $regex: searchTerm, $options: 'i' },
						prodId: { $nin: idRemove }
					},
					sort: { title: 1 },
					projection: { _id: 0 },
					limit: 20,
					skip: 0
				}),
				headers: { 'Content-Type': 'application/json' }
			});

			const [countRes, productRes] = await Promise.all([countFetch, productFetch]);

			if (!countRes.ok) {
				const errorText = await countRes.text();
				console.error('Search count fetch failed', countRes.status, errorText);
				return fail(400, { action: 'searchName', success: false, message: `countRes: ${errorText}` });
			}
			const itemCount = await countRes.json();

			if (!productRes.ok) {
				const errorText = await productRes.text();
				console.error('Search product fetch failed', productRes.status, errorText);
				return fail(400, { action: 'searchName', success: false, message: `productRes: ${errorText}` });
			}

			const getTable = await productRes.json();

			const filteredArray = getTable.filter(
				(object) => !idRemove.includes(object.prodId)
			);
			//console.log('filteredArray', filteredArray);


			return {
				action: 'searchName',
				success: true,
				payload: { getTable: filteredArray, itemCount, currentPage: 1, searchTerm }
			};
		} catch (e) {
			console.error('Error product search:', e);
			return fail(500, { action: 'searchName', success: false, message: 'Error product search' });
		}
	},

	changePage: async ({ request, fetch }) => {
		const formData = await request.formData();
		const navigation = formData.get('navigation') as string;
		const itemsPerPage = Number(formData.get('itemsPerPage'));
		const category = formData.get('category') as string;
		let currentPage = Number(formData.get('currentPage'));

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
					schema: 'product',
					query: {
						status: 'enabled',
						type: 'product',
						...(category && { category: category })
					},
					sort: { title: 1 },
					projection: { _id: 0 },
					limit: itemsPerPage,
					skip: skipItems
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!res.ok) {
				const errorText = await res.text();
				console.error('changePage failed', res.status, errorText);
				return fail(400, { action: 'changePage', success: false, message: `changePage Error: ${errorText}` });
			}
			const getTable = await res.json();

			return { action: 'changePage', success: true, payload: { getTable, currentPage, category } };

		} catch (error) {
			console.error('Error changePage:', error);
			return { action: 'changePage', success: false, message: 'Error changePage' };
		}
	},

	downloadCatalog: async ({ request, fetch }) => {
		const formData = await request.formData();
		const category = formData.get('category') as string;
		const searchTerm = formData.get('searchTerm') as string;

		const currentDate = new Date().toLocaleDateString('it-IT', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		const currentTime = new Date().toLocaleTimeString('it-IT', {
			hour: '2-digit',
			minute: '2-digit'
		});


		const query: any = { status: 'enabled', type: 'product' };
		if (category) query.category = category;
		if (searchTerm) query.title = { $regex: searchTerm, $options: 'i' };

		try {

			const response = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query,
					sort: { title: 1 },
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const products = await response.json();
			//console.log('products', products);

			const printer = new PdfPrinter(fonts);
			const productContent: any[] = [
				{
					columns: [{
						stack: [
							{
								columns: [
									// LOGO A SINISTRA
									{
										image: path.join(process.cwd(), 'uploads/dienchan_logo.jpg'),
										fit: [50, 50],
										alignment: 'left',
										width: 70
									},
									// TITOLO AL CENTRO
									{
										text: 'CATALOGO PRODOTTI',
										fontSize: 22,
										bold: true,
										alignment: 'center',
										color: '#000000',
										margin: [0, 10, 0, 0]
									},
									{
										text: `${currentDate} - ${currentTime}`,
										fontSize: 9,
										color: '#999999',
										alignment: 'right',
										width: 80
									},

								],
								margin: [30, 0, 30, 8]
							},
							{
								canvas: [
									{
										type: 'line',
										x1: 30,
										y1: 0,
										x2: 480,
										y2: 0,
										lineWidth: 1.5,
										lineColor: '#666666'
									}
								],
								margin: [0, 3, 0, 0]
							}
						]
					}]
				}
			];

			let productsOnCurrentPage = 0;
			let isFirstPage = true;

			products.forEach((product: any, i: number) => {
				const productId = product.prodId.toString();
				const primaryFile = product.uploadfiles?.find((f: any) => f.type === 'product-primary')?.fileName;

				// NOTA SIMONE REFACTOR PATH DIRETTO (Massima velocità, niente Base64, niente chiamata http accesso diretto al file)
				const imgPath = primaryFile
					? path.join(process.cwd(), 'uploads/product', productId, primaryFile)
					: path.join(process.cwd(), 'uploads/no_img.jpg');
				//const description = product.descrLong || product.descrShort || 'Nessuna descrizione disponibile';
				productContent.push({
					columns: [
						{
							image: fs.existsSync(imgPath) ? imgPath : path.join(process.cwd(), 'uploads/no_img.jpg'),
							fit: [80, 80],
							width: 85
						},
						{
							stack: [
								{
									text: product.title || 'N/A',
									fontSize: 12,
									bold: true,
									color: '#000000',
									margin: [10, 0, 0, 5],
									// Previeni overflow del titolo
									width: 415
								},
								{ text: `Categoria: ${product.category?.[0] || 'N/A'}`, fontSize: 8.5, color: '#333333', margin: [10, 0, 0, 3] },
								{ text: `Codice Prodotto: ${product.prodId || 'N/A'} - SKU: ${product.sku || 'N/A'}`, fontSize: 7.5, color: '#555555', margin: [10, 0, 0, 2] },
								//	{ text: `SKU: ${product.sku || 'N/A'}`, fontSize: 7.5, color: '#555555', margin: [0, 0, 0, 2] },
								{
									text: `Disponibilità: ${product.stockQty || 0}`,
									fontSize: 8.5,
									bold: true,
									color: product.stockQty > 0 ? '#008000' : '#FF0000',
									margin: [10, 0, 10, 4]
								},
								{ text: `€ ${(product.price || 0).toFixed(2)}`, fontSize: 14, bold: true, color: '#008000', margin: [10, 0, 0, 5] },
								// {
								// 	text: description.length > 150 ? description.substring(0, 150) + '...' : description,
								// 	fontSize: 7,
								// 	color: '#444444',
								// 	lineHeight: 1.2,
								// 	// Previeni overflow della descrizione
								// 	width: 415
								// }
							],
						}
					],
					margin: [0, 5, 0, 3]
				});

				// if ((i + 1) % 6 === 0 && i < products.length - 1) {
				// 	productContent.push({ text: '', pageBreak: 'after' });
				// }
				productsOnCurrentPage++;
				const limit = isFirstPage ? 8 : 9;

				if (productsOnCurrentPage === limit && i < products.length - 1) {
					productContent.push({ text: '', pageBreak: 'after' });
					productsOnCurrentPage = 0;
					isFirstPage = false;
				}
			});

			const docDefinition = {
				pageSize: 'A4',
				pageOrientation: 'portrait',
				pageMargins: [30, 15, 30, 30],
				content: productContent,
				defaultStyle: { font: 'Roboto' }
			};

			const pdfDoc = printer.createPdfKitDocument(docDefinition);
			pdfDoc.end();

			// Convertiamo in Buffer per l'invio
			const chunks: any[] = [];
			for await (const chunk of pdfDoc) {
				chunks.push(chunk);
			}
			const pdfBuffer = Buffer.concat(chunks);

			// Restituiamo il PDF come stringa base64 solo per il trasporto finale 
			// o salviamo su file. Qui usiamo un trucco per il download:
			// return {
			// 	success: true,
			// 	pdf: pdfBuffer.toString('base64'),
			// 	fileName: `catalogo_${category || 'generale'}.pdf`
			// };
			return {
				action: 'downloadCatalog',
				success: true,
				pdf: pdfBuffer.toString('base64'),
				payload: { pdf: pdfBuffer.toString('base64'), fileName: `catalogo_${category || 'generale'}.pdf` }
			};

		} catch (err) {
			console.error(err);
			return fail(500, { message: "Errore durante la creazione del PDF" });
		}
	}
} satisfies Actions;