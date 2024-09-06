// src/routes/api/auth/sign-up-admin
import { json } from '@sveltejs/kit';
import stringHash from 'string-hash';
//import { serialize } from 'cookie';
import dbConnect from '$lib/database';
import { User } from '$lib/models/Users.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const {
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
		password1
	} = body;
	const newPass = stringHash(password1);

	// const registerNome = body.registerNome;
	// const registerCognome = body.registerCognome;
	// const registerEmail = body.registerEmail.replace(/\s+/g, '').toLowerCase();
	// const registerIndirizzo = body.registerIndirizzo;
	// const registerCAP = body.registerCAP;
	// const registerCitta = body.registerCitta;
	// const registerProvincia = body.registerProvincia;
	// const registerNazione = body.registerNazione;
	// const registerTelefono = body.registerTelefono;
	// const registerCellulare = body.registerCellulare;
	// const password1 = body.password1;
	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?
		const user = await User.findOne({ email }, { _id: 1, email: 1 })
			.limit(1)
			.lean()
			.exec();

		// If there is, either send status 409 Conflict and inform the user that their email is already taken
		// or send status 202 or 204 and tell them to double-check on their credentials and try again - it is considered more secure
		if (user) {
			return json(
				{
					message: 'User already registered'
				},
				{
					status: 409
				}
			);
		}

		// Add user to DB
		// All database code can only run inside async functions as it uses await
		const cookieId = crypto.randomUUID();
		const newUser = new User();
		newUser.name = name;
		newUser.surname = surname;
		newUser.email = email;
		newUser.address = address;
		newUser.postalCode = city;
		newUser.city = countryState;
		newUser.countryState = postalCode;
		newUser.country = country;
		newUser.phone = phone;
		newUser.mobilePhone = mobilePhone;
		newUser.password = newPass;
		newUser.userId = stringHash(cookieId);
		newUser.cookieId = cookieId;
		await newUser
			.save()
			.then(async (res) => {
				//console.log('res', res);
				if (res?.cookieId === cookieId) {
					await fetch(`${import.meta.env.VITE_BASE_URL}/api/mailer/sign-up-confirm`, {
						method: 'POST',
						body: JSON.stringify({ email }),
						headers: {
							'Content-Type': 'application/json'
						}
					});
				}
			})
			.catch(console.error);

		// Set cookie
		// If you want cookies to be passed alongside user when they redirect to another website using a link, change sameSite to 'lax'
		// If you don't want cookies to be valid everywhere in your app, modify the path property accordingly
		// const headers = {
		// 	'Set-Cookie': serialize('session_id', cookieId, {
		// 		httpOnly: true,
		// 		maxAge: 60 * 60 * 24 * 7, // one week
		// 		sameSite: 'strict',
		// 		path: '/'
		// 	})
		// };

		return json(
			{
				message:
					"Iscrizione fatta! controllale email (anche in SPAM) per la conferma.",
				userId: newUser.userId
			},
			{
				status: 200
			}
		);
	} catch (err) {
		console.log('registerUser ERROR:', err);
		return json(
			{
				message: 'Sign Up failed'
			},
			{
				status: 500
			}
		);
	}
};
