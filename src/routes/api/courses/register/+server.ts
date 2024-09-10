import { json } from '@sveltejs/kit';
// src/routes/api/auth/sign-up.js
import dbConnect from '$lib/database';
import { Course } from '$lib/models/Courses.model.js';

export const POST = async ({ request }) => {
	const body = await request.json();
	const productCorsoUserId = body.productCorsoUserId;
	const productCorsoTitle = body.productCorsoTitolo;
	const productCorsoDescrLong = body.productCorsoDescrizione;
	const productCorsoInfoExtra = body.productCorsoInfoExtra;
	const productCorsoEventStartDate = body.productCorsoDataInizioCompleto;
	const productCorsoEventEndDate = body.productCorsoDataFineCompleto;
	const productCorsoStatus = body.productCorsoStatus;
	const productCorsoQuantitaPartecipanti = body.productCorsoQuantitaPartecipanti;
	const productCorsoPlace = body.productCorsoProvincia;
	const productCorsoCategory = body.productCorsoCategoria;
	const productCorsoElencoEmailNotifica = body.productCorsoElencoEmailNotifica;
	const productCorsoElencoTag = body.productCorsoElencoTag;
	const productPriceCorso = body.productPriceCorso;
	const name = body.name;
	const surname = body.surname;

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?

		// Add user to DB
		// All database code can only run inside async functions as it uses await
		// const cookieId = crypto.randomUUID();
		const newEvent = new Course();
		newEvent.prodId = crypto.randomUUID();
		newEvent.userId = productCorsoUserId;
		newEvent.name = name;
		newEvent.surname = surname;
		newEvent.title = productCorsoTitle;
		newEvent.descrLong = productCorsoDescrLong;
		newEvent.eventStartDate = productCorsoEventStartDate;
		newEvent.eventEndDate = productCorsoEventEndDate;
		newEvent.status = productCorsoStatus;
		newEvent.stockQty = productCorsoQuantitaPartecipanti;
		newEvent.place = productCorsoPlace;
		newEvent.category = productCorsoCategory;
		newEvent.notificationEmail = productCorsoElencoEmailNotifica;
		newEvent.tag = productCorsoElencoTag;
		newEvent.price = productPriceCorso;
		newEvent.infoExtra = productCorsoInfoExtra;

		const saveCourse = await newEvent.save();

		if (saveCourse.userId == productCorsoUserId) {

			// console.log('surname', surname)
			return json(
				{
					message: "Corso registrato"
				},
				{
					status: 200
				}
			);
		}

		return json(
			{
				message: "Corso NON registrato"
			},
			{
				status: 500
			}
		);
	} catch (err) {
		console.log('registerUser ERROR:', err);
		return json(
			{
				message: 'Registrazione corso fallita'
			},
			{
				status: 500
			}
		);
	}
};
