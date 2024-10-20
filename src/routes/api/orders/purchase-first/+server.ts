// src/routes/api/orders/purchase-first
import { json } from '@sveltejs/kit';
import stringHash from 'string-hash';
import dbConnect from '$lib/database';
import { Order } from '$lib/models/Orders.model';
import { User } from '$lib/models/Users.model';

export const POST = async ({ request }) => {
	const body = await request.json();
	const {
		name,
		surname,
		email,
		password1,
		address,
		city,
		countryState,
		postalCode,
		country,
		phone,
		mobilePhone,
		cart,
		paymentType
	} = body;

	let userId = ''
	let membershipOK = false

	const registerEmail = email.replace(/\s+/g, '').toLowerCase();

	try {
		await dbConnect();
		// CHECK IF USER ALREADY EXISTS
		const userCheck = await User.findOne({ email: registerEmail }, { _id: 1, email: 1 })
			.limit(1)
			.lean()
			.exec();

		// If there is, either send status 409 Conflict and inform the user that their email is already taken
		// or send status 202 or 204 and tell them to double-check on their credentials and try again - it is considered more secure
		if (userCheck) {
			return json(
				{
					message: 'Utente esistente'
				},
				{
					status: 409
				}
			);
		}
		// REGISTER USER
		const responseUser = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/sign-up-admin`, {
			method: 'POST',
			body: JSON.stringify({
				name,
				surname,
				email: registerEmail,
				address,
				postalCode,
				city,
				countryState,
				country,
				phone,
				mobilePhone,
				password1
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const resUser = await responseUser.json()
		if (responseUser.status == 200) {
			//console.log('OK first', resUser.userId);
			userId = resUser.userId;
		}
		if (responseUser.status != 200) {
			console.log('KO responseUser');
			return json({ message: 'Sign KO' }, { status: 400 });
		}
		// REGISTER MEMBERSHIP
		if (userId) {
			const responseMembership = await fetch(`${import.meta.env.VITE_BASE_URL}/api/memberships/new`, {
				method: 'POST',
				body: JSON.stringify({
					userId,
					membershipLevel: 'Socio ordinario',
					membershipSignUp: new Date(),
					membershipActivation: new Date(),
					membershipExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
					membershipStatus: true
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const resMembership = await responseMembership.json()
			if (responseMembership.status == 200) {
				membershipOK = resMembership.ok || false;
				// console.log('OK member', resMembership.ok);
			}
			if (responseMembership.status != 200) {
				console.log('KO member', resMembership);
				return json({ message: 'Sign KO member' }, { status: 400 });
			}
		} else {
			return json({ message: 'no user' }, { status: 400 });
		}

		// REGISTER ORDER
		if (membershipOK) {
			const id = crypto.randomUUID();
			const orderId = stringHash(id);
			const newOrder = new Order();
			newOrder.orderId = orderId
			newOrder.orderCode = id
			newOrder.userId = userId;
			newOrder.cart = cart;
			newOrder.payment.method = paymentType;

			const order = await newOrder.save()

			if (order.orderId == orderId) {
				return json({ message: 'Ordine inviato con successo' }, { status: 200 });
			}
			if (order.orderId != orderId) {
				console.log('KO order', order);
				return json({ message: 'Order KO' }, { status: 400 });
			}
		} else {
			return json({ message: 'no membership' }, { status: 400 });
		}
		return json({ message: 'Sign Up failed' }, { status: 400 });
	} catch (err) {
		console.log('order purchase ERROR:', err);
		return json({ message: `order purchase ERR: ${err}` }, { status: 500 });
	}
};
