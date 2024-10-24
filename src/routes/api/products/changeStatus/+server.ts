// /api/products/changeStatus
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Product } from '$lib/models/Products.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const { prodId, status } = body;

	try {
		await dbConnect();
		const filter = { prodId, type: 'product' };
		const update = {
			status
		};
		const result = await Product.updateOne(filter, update);

		if (result.modifiedCount == 1) {
			return json({ message: 'change effettuato' }, { status: 200 });
		}

		return json({ message: 'errore change' }, { status: 400 });
	} catch (err) {
		console.log('change ERROR:', err);
		return json({ message: 'server change fallita' }, { status: 500 });
	}
};
