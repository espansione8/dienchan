import { json as json$1 } from '@sveltejs/kit';
// src/routes/api/auth/sign-up.js
import dbConnect from '$lib/database';
import { Product } from '$lib/models/Products.model';
import { File } from 'nft.storage';

export const POST = async ({ request }) => {
	const body = await request.json();
	const productUserId = body.productUserId;
	const productTitle = body.productTitolo;
	const productDescrLong = body.productDescrizione;
	const productStatus = body.productStatus;
	const productStockQty = body.productQuantita;
	const productCategory = body.productCategoria;
	const productCost = body.productCost;
	// const productElencoEmailNotifica = body.productElencoEmailNotifica;
	// const productCorsoElencoTag = body.productCorsoElencoTag;

	const itemArray = [];
	const itemArrayPrimary = [];
	const itemArrayGallery = [];
	const uploadfiles = [];
	const array = body.payloadArray;

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?
		async function isProdIdExists(prodId) {
			return await Product.exists({ prodId })
				.limit(1)
				.lean()
				.exec();
		}

		let isDuplicate;
		let uUID;
		let attempts = 0;
		do {
			attempts++;
			uUID = await crypto.randomUUID();
			isDuplicate = await isProdIdExists(uUID);
			//   console.log('attempts',attempts);
			//   console.log('isDuplicate',isDuplicate);
			if (attempts >= 10) {
				// throw new Error("Errore: Numero massimo di tentativi raggiunto");
				console.log("Errore: Numero massimo di tentativi raggiunto");

				return json$1(
					{
						message: 'Registrazione fallita, ritentare'
					},
					{
						status: 500
					}
				);
			}
		} while (attempts < 10 && isDuplicate)
		// Add user to DB
		// All database code can only run inside async functions as it uses await
		const newProd = new Product();
		newProd.prodId = uUID;
		newProd.userId = productUserId;
		newProd.title = productTitle;
		newProd.descrLong = productDescrLong;
		newProd.status = productStatus;
		newProd.stockQty = productStockQty;
		newProd.category = productCategory;
		newProd.cost = productCost;
		// newProd.notificationEmail = productElencoEmailNotifica;
		// newEvent.tag = productCorsoElencoTag;

		await array.forEach((item) => {
			// console.log('item.type', item.type );
			if (item.type === 'primary') {
				const encodedNewPrimary = Buffer.from(item.base64, 'base64');
				const docfilesPrimary = new File([encodedNewPrimary], item.filename);
				// console.log('forEach docfiles: ', docfilesPrimary);
				uploadfiles.push({ filename: item.filename, type: 'product-primary', fileUrl: `${import.meta.env.VITE_UPLOAD_IMAGE_URL}/files/products/${newProd.prodId}/product-primary/${item.filename}` });
				itemArrayPrimary.push(docfilesPrimary);
			}

			if (item.type === 'gallery') {
				// console.log('item.type gallery', item );
				const encodedNewGallery = Buffer.from(item.base64, 'base64');
				const docfilesGallery = new File([encodedNewGallery], item.filename);
				// console.log('forEach docfiles: ', docfilesGallery);
				uploadfiles.push({ filename: item.filename, type: 'product-gallery', fileUrl: `${import.meta.env.VITE_UPLOAD_IMAGE_URL}/files/products/${newProd.prodId}/product-gallery/${item.filename}` });
				itemArrayGallery.push(docfilesGallery);
			}
		});
		newProd.uploadfiles = await [...uploadfiles]

		await newProd
			.save()
			.then(async (res) => { })
			// .catch(console.error);
			.catch((error) => {
				console.error(error);
				return json$1(
					{
						message: 'Prodotto registrazione fallita'
					},
					{
						status: 500
					}
				);
			});

		////POST file upload//////
		//// product-primary ////
		const formFilePrimary = new FormData();
		formFilePrimary.set('directory', `products/${newProd.prodId}/product-primary`);
		itemArrayPrimary.forEach((item) => {
			formFilePrimary.append('payloadArray', item);
		});
		const responseFilePrimary = await fetch(`${import.meta.env.VITE_UPLOAD_IMAGE_URL}`, {
			method: 'POST',
			// headers: {
			// 	'x-api-key': '6139e718-e1ba-4a1a-b36a-5c2fa664df45'
			// },
			body: formFilePrimary
		});
		const resFilePrimary = await responseFilePrimary.json();
		// console.log('resFilePrimary UPLOAD response', resFilePrimary);

		///// product-gallery ////
		const formFileGallery = new FormData();
		formFileGallery.set('directory', `products/${newProd.prodId}/product-gallery`);
		itemArrayGallery.forEach((item) => {
			formFileGallery.append('payloadArray', item);
		});
		const responseFileGallery = await fetch(`${import.meta.env.VITE_UPLOAD_IMAGE_URL}`, {
			method: 'POST',
			// headers: {
			// 	'x-api-key': '6139e718-e1ba-4a1a-b36a-5c2fa664df45'
			// },
			body: formFileGallery
		});
		const resFileGallery = await responseFileGallery.json();
		// console.log('resFileGallery UPLOAD response', resFileGallery);
		//resFile UPLOAD response { filesUpload: 'ok' }
		///// END file upload

		// Set cookie
		// If you want cookies to be passed alongside user when they redirect to another website using a link, change sameSite to 'lax'
		// If you don't want cookies to be valid everywhere in your app, modify the path property accordingly
		// const headers = {
		// 	'Set-Cookie': serialize('session_id', cookieId, {
		// 		httpOnly: true,
		// 		maxAge: 60 * 60 * 24 * 7, // one week
		// 		sameSite: 'strict',
		// 		path: '/'
		// 	})
		// };
		const findId = await Product.find({ _id: newProd._id });
		// console.log('111111111111', findId);
		if (findId.length > 0) {
			return json$1(
				{
					message: 'Prodotto registrato'
				},
				{
					status: 200
				}
			);
		} else {
			// console.log('Nope');
			return json$1(
				{
					message: 'Prodotto registrazione fallita'
				},
				{
					status: 500
				}
			);
		}
	} catch (err) {
		console.log('Prodotto ERROR:', err);
		return json$1(
			{
				message: 'Prodotto registrazione fallita'
			},
			{
				status: 500
			}
		);
	}
};
