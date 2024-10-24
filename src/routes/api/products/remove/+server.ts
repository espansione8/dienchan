// /api/products/remove
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Product } from '$lib/models/Products.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const prodId = body.prodId;
	console.log({ body });

	try {
		await dbConnect();
		const filter = { prodId, type: 'product' };
		const result = await Product.deleteOne(filter);
		console.log('remove', typeof prodId, result);

		if (result.deletedCount == 1) {
			return json({ message: 'rimozione effettuata' }, { status: 200 });
		}

		return json({ message: 'errore rimozione' }, { status: 400 });
	} catch (err) {
		console.log('rimozione ERROR:', err);
		return json({ message: 'server rimozione fallita' }, { status: 500 });
	}
};
