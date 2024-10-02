import { json } from '@sveltejs/kit';
// src/routes/api/auth/sign-up.js
import dbConnect from '$lib/database';
import { Layout } from '$lib/models/ProductLayouts.model';
//import { File } from 'nft.storage';

export const POST = async ({ request }) => {
	const body = await request.json();
	const { title, descr, urlPic, bgColor, price, bundleProduct } = body;
	// const productElencoEmailNotifica = body.productElencoEmailNotifica;
	// const productCorsoElencoTag = body.productCorsoElencoTag;


	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?
		const ifExists = await Layout.exists({ title }).lean().exec();

		if (ifExists) {
			return json(
				{
					message: "Modello con lo stesso nome già registrato"
				},
				{
					status: 500
				}
			);
		}

		// Add user to DB
		// All database code can only run inside async functions as it uses await
		const newLayout = new Layout();
		const layoutId = crypto.randomUUID();
		newLayout.layoutId = layoutId
		newLayout.descr = descr;
		newLayout.urlPic = urlPic;
		newLayout.bgColor = bgColor;
		newLayout.price = price;
		newLayout.bundleProduct = bundleProduct;

		const layoutSave = await newLayout.save();

		if (layoutSave.layoutId == layoutId) {
			return json(
				{
					message: 'Nuovo Modello registrato'
				},
				{
					status: 200
				}
			);
		}

		return json(
			{
				message: 'Layout registrazione fallita (1)'
			},
			{
				status: 500
			}
		);

	} catch (err) {
		console.log('Layout ERROR:', err);
		return json(
			{
				message: 'Layout registrazione fallita (2)'
			},
			{
				status: 500
			}
		);
	}
};
