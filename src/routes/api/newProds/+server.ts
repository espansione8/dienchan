// src/routes/api/courses/register
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Product } from '$lib/models/Products.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	// no destructuring to set default values
	// membership
	const type = body.type;
	const title = body.title;
	const descrShort = body.descrShort;
	const price = body.price;
	const renewalLength = body.renewalLength;
	const userId = body.userId;
	const status = 'enabled'
	// course
	// const productCorsoUserId = body.productCorsoUserId;
	// const productCorsoTitle = body.productCorsoTitolo;
	// const productCorsoDescrLong = body.productCorsoDescrizione;
	// const productCorsoInfoExtra = body.productCorsoInfoExtra;
	// const productCorsoEventStartDate = body.productCorsoDataInizioCompleto;
	// const productCorsoEventEndDate = body.productCorsoDataFineCompleto;
	// const productCorsoStatus = body.productCorsoStatus;
	// const productCorsoQuantitaPartecipanti = body.productCorsoQuantitaPartecipanti;
	// const productCorsoPlace = body.productCorsoProvincia;
	// const productCorsoCategory = body.productCorsoCategoria;
	// const productCorsoElencoEmailNotifica = body.productCorsoElencoEmailNotifica;
	// const productCorsoElencoTag = body.productCorsoElencoTag;
	// const productPriceCorso = body.productPriceCorso;
	// const name = body.name;
	// const surname = body.surname;
	// product

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();

		// const cookieId = crypto.randomUUID();
		const newProduct = new Product();
		newProduct.prodId = crypto.randomUUID();
		newProduct.type = type;
		newProduct.title = title;
		newProduct.descrShort = descrShort;
		newProduct.price = price;
		newProduct.renewalLength = renewalLength;
		newProduct.userId = userId;
		newProduct.status = status;
		const save = await newProduct.save();

		if (save.userId == userId) {
			return json(
				{
					message: `Prodotto ${type} registrato`
				},
				{
					status: 200
				}
			);
		}

		return json(
			{
				message: `Prodotto ${type} NON registrato`
			},
			{
				status: 500
			}
		);
	} catch (err) {
		console.log('Registrazione ERROR:', err);
		return json(
			{
				message: `Registrazione prodotto ${type} fallita`
			},
			{
				status: 500
			}
		);
	}
};
