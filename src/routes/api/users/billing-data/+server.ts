import { json } from '@sveltejs/kit';
import { User } from '$lib/models/Users.model';
import { Course } from '$lib/models/Courses.model';
import dbConnect from '$lib/database';

///BASE_URL/api/users/billing-data/

export const POST = async ({ request }) => {
	// dichiarato ma non usato
	const body = await request.json();
	// console.log('POST billing data', body);

	// ESEMPIO DESTRUCTURING

	// destructuring
	const {
		userId,
		name,
		surname,
		id
	} = body;

	// const level = body.level;
	// const name = body.name;
	// const surname = body.surname;

	try {
		// apro mongo
		await dbConnect();
		// qua uso il secondo await
		const filter = { _id: id };
		const update = {
			userId: userId,
			level: body.level,
			name,
			surname,
			email: body.email,
			address: body.address,
			city: body.city,
			countryState: body.countryState,
			postalCode: body.postalCode,
			// region: body.region,
			country: body.country,
			phone: body.phone,
			mobilePhone: body.mobilePhone,
			addressPublic: body.addressPublic,
			cityPublic: body.cityPublic,
			statePublic: body.statePublic,
			postalCodePublic: body.postalCodePublic,
			// regionPublic: body.regionPublic,
			countryPublic: body.countryPublic,
			phonePublic: body.phonePublic,
			mobilePhonePublic: body.mobilePhonePublic,
			businessData: {
				businessAddress: body.businessAddress,
				businessCity: body.businessCity,
				businessPostalCode: body.businessPostalCode,
				businessCounty: body.businessCounty,
				businessCountry: body.businessCountry,
				businessName: body.businessName,
				vatNumber: body.vatNumber
			}
		};

		const newData = await User.updateOne(filter, update, {
			new: true
		}).lean();

		// const courseUpdateResult = await Course.updateMany(courseFilter, courseUpdate);

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