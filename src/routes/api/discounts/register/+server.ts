import { json } from '@sveltejs/kit';
// src/routes/api/discounts/register
import dbConnect from '$lib/database';
import { Discount } from '$lib/models/Discounts.model';

//import { File } from 'nft.storage';

export const POST = async ({ request }) => {
	const body = await request.json();
	const { discountId, discountCode, discountType, discountValue, discountUserId, discountProductId, discountMemebership } = body;
	// const productElencoEmailNotifica = body.productElencoEmailNotifica;
	// const productCorsoElencoTag = body.productCorsoElencoTag;


	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?
		const ifExists = await Discount.exists({ discountId }).lean().exec();

		if (ifExists) {
			return json(
				{
					message: "Sconto con lo stesso codice già registrato"
				},
				{
					status: 500
				}
			);
		}

		// Add user to DB
		// All database code can only run inside async functions as it uses await
		const newDiscount = new Discount();
		const Id = crypto.randomUUID();
		const code = "ABFK456B3K";
		newDiscount.discountId = Id;
		newDiscount.discountCode = code;
		newDiscount.discountType = discountType;
		newDiscount.discountValue = discountValue;
		newDiscount.discountUserId = discountUserId;
		newDiscount.discountProductId = discountProductId;
		newDiscount.discountMemebership = discountMemebership;

		const discountSave = await newDiscount.save();

		if (discountSave.layoutId == discountId) {
			return json(
				{
					message: 'Nuovo Codice Sconto registrato'
				},
				{
					status: 200
				}
			);
		}

		return json(
			{
				message: 'Codice Sconto registrazione fallita (1)'
			},
			{
				status: 500
			}
		);

	} catch (err) {
		console.log('Layout ERROR:', err);
		return json(
			{
				message: 'Codice Sconto registrazione fallita (2)'
			},
			{
				status: 500
			}
		);
	}
};
