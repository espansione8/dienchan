// src/routes/api/discounts/check
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/db/mongo/database';
import { Discount } from '$lib/db/mongo/schema/Discounts.model.js';

export const POST = async ({ request }) => {
	const body = await request.json();
	const { discountArray } = body;
	console.log('discountArray Check', discountArray);
	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		const discount = await Discount.find({ code: { $in: discountArray } })
			.lean()
			.exec();

		//console.log({ user });
		if (discount) {
			return json(discount, { status: 200 });
		}
		return json({ message: 'sconto non valido' }, { status: 400 });

	} catch (err) {
		console.log('discount ERROR:', err);
		return json({ message: 'discount ERROR' }, { status: 500 });
	}
};
