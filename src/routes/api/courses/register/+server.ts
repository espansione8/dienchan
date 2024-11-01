// src/routes/api/courses/register
import { json } from '@sveltejs/kit';
import stringHash from 'string-hash';
import dbConnect from '$lib/database';
import { Product } from '$lib/models/Products.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const {
		layoutId,
		userId,
		name,
		surname,
		eventStartDate,
		stockQty,
		countryState,
		location,
		notificationEmail,
		tag,
		infoExtra,
	} = body;

	try {
		await dbConnect();
		const newEvent = new Product();

		newEvent.prodId = stringHash(crypto.randomUUID());
		newEvent.layoutId = layoutId;
		newEvent.userId = userId;
		newEvent.name = name;
		newEvent.surname = surname;
		newEvent.eventStartDate = eventStartDate;
		newEvent.stockQty = stockQty;
		newEvent.countryState = countryState;
		newEvent.location = location;
		newEvent.notificationEmail = notificationEmail;
		newEvent.tag = tag;
		newEvent.infoExtra = infoExtra;
		newEvent.type = 'course';

		const saveCourse = await newEvent.save();

		if (saveCourse.userId == userId) {
			return json({ message: "Corso registrato" }, { status: 200 });
		}

		return json({ message: "Corso NON registrato" }, { status: 400 });
	} catch (err) {
		console.log('registerUser ERROR:', err);
		return json({ message: 'Registrazione corso fallita' }, { status: 500 });
	}
};
