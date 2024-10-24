// src/routes/api/products/modify
import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
import dbConnect from '$lib/database';

export const POST = async ({ request }) => {
	const body = await request.json();
	const {
		prodId,
		title,
		descrShort,
		stockQty,
		category,
		price,
	} = body;

	try {
		await dbConnect();
		const filter = { prodId, type: 'product' };

		const update = {
			title,
			descrShort,
			stockQty,
			category,
			price,
		};

		const result = await Product.updateOne(filter, update);

		if (result.matchedCount == 1) {
			return json({ message: 'modifica effettuata' }, { status: 200 });
		}

		return json({ message: 'errore modifica' }, { status: 400 });

	} catch (err) {
		console.error('Errore durante l\'aggiornamento del corso:', err);
		return json({ message: 'server errore modifica' }, { status: 500 });
	}
};
