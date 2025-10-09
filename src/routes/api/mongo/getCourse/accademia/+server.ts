
import { json } from '@sveltejs/kit';
import { Product } from '$lib/server/mongo/schema/Products.model';
import { User } from '$lib/server/mongo/schema/Users.model';
import { Layout } from '$lib/server/mongo/schema/ProductLayouts.model';
import dbConnect from '$lib/server/mongo/database';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {

	try {
		await dbConnect();

		// Query per gli ultimi 10 corsi con i criteri specificati
		const courses = await Product.find({
			type: 'event',
			layoutId: '5G98NH2XQ',
			status: 'enabled'
		})
			.sort({ createdAt: -1 }) // Ordina per data di creazione decrescente (ultimi inseriti)
			.limit(10)
			.populate({
				path: 'userView',
				options: { strictPopulate: false }
			})
			.populate({
				path: 'layoutView',
				options: { strictPopulate: false }
			})
			.lean()
			.exec();

		return json(courses, { status: 200 });

	} catch (err) {
		console.log('search ERROR:', err);
		return json({ message: `search ERROR: ${err}` }, { status: 500 });
	}
};