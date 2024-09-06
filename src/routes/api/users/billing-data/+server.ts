///BASE_URL/api/users/billing-data/
import { json } from '@sveltejs/kit';
import { User } from '$lib/models/Users.model';
import { Course } from '$lib/models/Courses.model';
import dbConnect from '$lib/database';

export const POST = async ({ request }) => {
	const body = await request.json();
	// console.log('POST billing data', body);
	const {
		userId,
		name,
		surname,
		email,
		address,
		city,
		countryState,
		postalCode,
		country,
		phone,
		mobilePhone,
		namePublic,
		surnamePublic,
		emailPublic
	} = body;
	const level = body.level; // DA CONTROLLARE: alcune pagine non pasasno valore
	const addressPublic = body.addressPublic || false;
	const cityPublic = body.cityPublic || false;
	const statePublic = body.statePublic || false;
	const postalCodePublic = body.postalCodePublic || false;
	const countryPublic = body.countryPublic || false;
	const phonePublic = body.phonePublic || false;
	const mobilePhonePublic = body.mobilePhonePublic || false;

	try {
		await dbConnect();
		const filter = { userId };
		const update = {
			level,
			name,
			surname,
			email: email.replace(/\s+/g, '').toLowerCase(),
			address,
			city,
			countryState,
			postalCode,
			country,
			phone,
			mobilePhone,
			// privacy
			namePublic,
			surnamePublic,
			emailPublic,
			addressPublic,
			cityPublic,
			statePublic,
			postalCodePublic,
			countryPublic,
			phonePublic,
			mobilePhonePublic,
			// regionPublic: body.regionPublic,
			// businessData: {
			// 	businessAddress: body.businessAddress,
			// 	businessCity: body.businessCity,
			// 	businessPostalCode: body.businessPostalCode,
			// 	businessCounty: body.businessCounty,
			// 	businessCountry: body.businessCountry,
			// 	businessName: body.businessName,
			// 	vatNumber: body.vatNumber
			// }
		};

		const newData = await User.updateOne(filter, update, {
			new: true
		}).lean();

		if (newData.matchedCount == 1) {
			const courseFilter = { userId };
			const courseUpdate = {
				reflexologistName: name,
				reflexologistSurname: surname
			};
			// Aggiungo un log per verificare il numero di corsi trovati
			const coursesToUpdate = await Course.find(courseFilter);
			// console.log(`Trovati ${coursesToUpdate.length} corsi da aggiornare per user_Id: ${body.userId}. nome ${body.name} surname ${body.surname}`);
			if (coursesToUpdate.length > 0) {
				// TODO: sbaglia apposta e agggiorna condizione dell IF
				const courseUpdateResult = await Course.updateMany(courseFilter, courseUpdate);
				//console.log('courseUpdateResult', courseUpdateResult)
				// console.log(`Numero di corsi aggiornati: ${courseUpdateResult.modifiedCount}`);

				if (!courseUpdateResult) {
					return json({
						message: 'Profilo corsi non aggiornato',
						status: 500
					});
				}
			}

			return json({
				message: 'Profilo aggiornato',
				status: 200
			});
		}

		return json({
			message: 'POST User update ERR',
			status: 500
		});
	} catch (err) {
		console.log('POST User update ERROR:', err);
		return json(
			{
				error: `Server error: ${err}`
			},
			{
				status: 500
			}
		);
	}
};