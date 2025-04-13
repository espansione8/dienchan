// src/routes/api/products/new
import { json } from '@sveltejs/kit';
//import stringHash from 'string-hash';
import dbConnect from '$lib/db/mongo/database';
import { Product } from '$lib/db/mongo/schema/Products.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const { prodId, title, descrShort, stockQty, category, price } = body;

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();

		const newProd = new Product();
		//const prodId = stringHash(crypto.randomUUID());
		newProd.prodId = prodId;
		newProd.title = title;
		newProd.descrShort = descrShort;
		newProd.stockQty = stockQty;
		newProd.category = category;
		newProd.price = price;

		const saveProd = await newProd.save();

		if (saveProd.prodId == prodId) {
			return json({ message: "Prodotto registrato" }, { status: 200 });
		}
		return json({ message: "Corso NON registrato" }, { status: 400 });
	} catch (err) {
		console.log('Prodotto ERROR:', err);
		return json({ message: 'Prodotto registrazione fallita' }, { status: 500 });
	}
};
