// src/routes/api/auth/change-password
import { json as json$1 } from '@sveltejs/kit';
//import { serialize } from 'cookie';

import dbConnect from '$lib/database';
import { Users } from '$lib/models/Users.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const registerUserId = body.registerUserId;
	const registerEmail = body.registerEmail.replace(/\s+/g, '').toLowerCase();
	const registerNome = body.registerNome;
	const registerCognome = body.registerCognome;
	const registerIndirizzo = body.registerIndirizzo;
	const registerCAP = body.registerCAP;
	const registerCitta = body.registerCitta;
	const registerProvincia = body.registerProvincia;
	const registerNazione = body.registerNazione;
	const registerTelefono = body.registerTelefono;
	const registerCellulare = body.registerCellulare;
	const registerAddressPublic = body.registerAddressPublic;
	const registerCityPublic = body.registerCityPublic;
	const registerStatePublic = body.registerStatePublic;
	const registerPostalCodePublic = body.registerPostalCodePublic;
	const registerCountryPublic = body.registerCountryPublic;
	const registerPhonePublic = body.registerPhonePublic;
	const registerMobilePhonePublic = body.registerMobilePhonePublic;
	//console.log('change pass', currentPass);

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await "userId" : "1356033273"
		await dbConnect();

		const userCheck = await Users.exists({ userId: registerUserId })
			.limit(1)
			.lean()
			.exec();
		console.log(!userCheck);

		if (!userCheck) {
			return json$1(
				{
					message: 'Change incorrect user'
				},
				{
					status: 401
				}
			);
		}

		await Users.updateOne(
			{ userId: registerUserId },
			{
				$set: {
					email: registerEmail,
					name: registerNome,
					surname: registerCognome,
					address: registerIndirizzo,
					postalCode: registerCAP,
					city: registerCitta,
					state: registerProvincia,
					country: registerNazione,
					phone: registerTelefono,
					mobilePhone: registerCellulare,
					addressPublic: registerAddressPublic,
					cityPublic: registerCityPublic,
					statePublic: registerStatePublic,
					postalCodePublic: registerPostalCodePublic,
					countryPublic: registerCountryPublic,
					phonePublic: registerPhonePublic,
					mobilePhonePublic: registerMobilePhonePublic,
				}
			}
		);

		//console.log('session_id', cookieId);
		return new Response(JSON.stringify({ message: 'Profilo aggiornato' }), {
			status: 200
			//headers
		});
	} catch (err) {
		console.error('reset ERROR:', err);
		return new Response(JSON.stringify({ message: '(500) profile update failed' }), {
			status: 500,
			headers: {
				'content-type': 'application/json; charset=utf-8'
			}
		});
	}
};
