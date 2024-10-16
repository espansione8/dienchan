import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
import { User } from '$lib/models/Users.model';				// for populate userView
import { Layout } from '$lib/models/ProductLayouts.model';	// for populate layoutView
import dbConnect from '$lib/database';
//import type { RequestHandler } from '@sveltejs/kit';

///BASE_URL/api/courses/find/:value

export const GET = async ({ params }) => {
	try {
		await dbConnect();
		const findCourse = await Product.findOne({ prodId: params.value, type: 'course' })
			.lean()
			.populate('userView')
			.populate('layoutView')
			.exec();
		//console.log({ findCourse });
		if (findCourse) {
			return json(findCourse, { status: 200 });
		}

		return json({ message: 'Course not found' }, { status: 400 });
	} catch (err) {
		console.log('GET Course ERROR:', err);
		return json({ message: `Server error: ${err}` }, { status: 500 });
	}
};
