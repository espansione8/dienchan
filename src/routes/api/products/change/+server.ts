// src/routes/api/auth/sign-up.js
import { json } from '@sveltejs/kit';
import stringHash from 'string-hash';
import dbConnect from '$lib/database';
import { Product } from '$lib/models/Products.model';
import { File } from 'nft.storage';

export const POST = async ({ request }) => {

	const body = await request.json();
	// const productUserId = body.productUserId;
	const product_id = body.product_id;
	const productProdId = body.productProdId;
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
	const uploadfiles = body.productUploadfiles;

	const array = body.payloadArray;

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?
		// const changeProd = await Product.findOne({ prodId: productProdId })
		// .lean()
		// .exec();
		let changeProd = {
			title: productTitle,
			descrLong: productDescrLong,
			status: productStatus,
			stockQty: productStockQty,
			category: productCategory,
			cost: productCost,
		};
		// Add user to DB
		// All database code can only run inside async functions as it uses await
		// changeProd.userId = productUserId;



		// const findProd = await Product.findOne({ prodId: productProdId });
		// console.log('updateProduct', updateProduct);

		await array.forEach((item) => {
			// console.log('item.type', item.type );
			if (item.type === 'primary') {
				const encodedNewPrimary = Buffer.from(item.base64, 'base64');
				const docfilesPrimary = new File([encodedNewPrimary], item.filename);
				// console.log('forEach docfiles: ', docfilesPrimary);
				uploadfiles.push({ filename: item.filename, type: 'product-primary', fileUrl: `${import.meta.env.VITE_UPLOAD_IMAGE_URL}/files/products/${productProdId}/product-primary/${item.filename}` });
				itemArrayPrimary.push(docfilesPrimary);
			}

			if (item.type === 'gallery') {
				// console.log('item.type gallery', item );
				const encodedNewGallery = Buffer.from(item.base64, 'base64');
				const docfilesGallery = new File([encodedNewGallery], item.filename);
				// console.log('forEach docfiles: ', docfilesGallery);
				uploadfiles.push({ filename: item.filename, type: 'product-gallery', fileUrl: `${import.meta.env.VITE_UPLOAD_IMAGE_URL}/files/products/${productProdId}/product-gallery/${item.filename}` });
				itemArrayGallery.push(docfilesGallery);
			}
		});
		changeProd['uploadfiles'] = await [...uploadfiles]

		const updateProduct = await Product.findOneAndUpdate(
			{ prodId: productProdId },
			{
				$set: changeProd
			},
			{ new: true }
		)
			.lean()
			.exec();


		////POST file upload//////
		//// product-primary ////
		const formFilePrimary = new FormData();
		formFilePrimary.set('directory', `products/${productProdId}/product-primary`);
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
		formFileGallery.set('directory', `products/${productProdId}/product-gallery`);
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

		const findId = await Product.find({ _id: updateProduct._id });
		if (findId.length > 0) {
			return json({ message: 'Prodotto Aggiornato' }, { status: 200 });
		} else {
			// console.log('Nope');
			return json({ message: 'Prodotto aggiornamento fallito' }, { status: 400 });

		}
	} catch (err) {
		console.log('Prodotto ERROR:', err);
		return json({ message: 'server Prodotto aggiornamento fallito' }, { status: 500 });
	}
};
