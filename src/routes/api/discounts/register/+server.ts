// src/routes/api/discounts/register
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/server/mongo/database';
import { Discount } from '$lib/server/mongo/schema/Discounts.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const { code,
		type,
		value,
		selectedApplicability,
		selectId,
		notes } = body;

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?
		const ifExists = await Discount.exists({ code }).lean().exec();

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
		const id = crypto.randomUUID();
		newDiscount.discountId = id;
		newDiscount.code = code;
		newDiscount.type = type;
		newDiscount.value = value;
		newDiscount.selectedApplicability = selectedApplicability;
		newDiscount[selectedApplicability] = selectId;
		newDiscount.notes = notes;

		const discountSave = await newDiscount.save();

		if (discountSave.discountId == id) {
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
				status: 400
			}
		);

	} catch (err) {
		console.log('newDiscount ERROR:', err);
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
