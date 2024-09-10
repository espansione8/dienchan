// src/routes/api/auth/sign-up-admin
import { json } from '@sveltejs/kit';
import stringHash from 'string-hash';
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
		password1,
		membershipLevel,
		membershipExpiry
	} = body;
	const newPass = stringHash(password1);

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?
		const userCheck = await User.findOne({ email }, { _id: 1, email: 1 })
			.limit(1)
			.lean()
			.exec();

		// If there is, either send status 409 Conflict and inform the user that their email is already taken
		// or send status 202 or 204 and tell them to double-check on their credentials and try again - it is considered more secure
		if (userCheck) {
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
		const id = stringHash(cookieId);
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
		newUser.userId = id;
		newUser.cookieId = cookieId;
		newUser.membership.membershipLevel = membershipLevel;
		newUser.membership.membershipExpiry = membershipExpiry;
		const user = await newUser.save()

		if (user.userId == id) {
			// const mail = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mailer/sign-up-confirm`, {
			// 	method: 'POST',
			// 	body: JSON.stringify({ email }),
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	}
			// });
			await fetch(`${import.meta.env.VITE_BASE_URL}/api/mailer/sign-up-confirm`, {
				method: 'POST',
				body: JSON.stringify({ email }),
				headers: {
					'Content-Type': 'application/json'
				}
			});
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
		}

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
