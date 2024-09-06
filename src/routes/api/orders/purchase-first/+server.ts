import { json } from '@sveltejs/kit';
import stringHash from 'string-hash';
import { serialize } from 'cookie';
import dbConnect from '$lib/database';
import { Order } from '$lib/models/Orders.model';
// src/routes/api/orders/purchaes-first.
//import nodemailer from 'nodemailer';

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
		// REGISTRARE UTENTE
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
			return json(
				{
					message: 'Sign KO'
				},
				{
					status: 500
				})
		}
		// REGISTRARE membership
		if (userId) {
			const responseMembership = await fetch(`${import.meta.env.VITE_BASE_URL}/api/memberships/new-course`, {
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
				return json(
					{
						message: 'Sign KO member'
					},
					{
						status: 500
					})
			}
		} else {
			return json(
				{
					message: 'no user'
				},
				{
					status: 500
				})
		}

		// REGISTRARE order
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
				////console.log('OK order', order);
				// // Set cookie
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
						message: 'Corso ordinato con successo',
					},
					{
						status: 200,
						//headers
					}
				);
			}
			if (order.orderId != orderId) {
				console.log('KO order', order);
				return json(
					{
						message: 'order KO'
					},
					{
						status: 500,
					})
			}
		} else {
			return json(
				{
					message: 'no membership'
				},
				{
					status: 500
				})
		}

		return json({
			message: 'Sign Up failed'
		},
			{
				status: 500
			});
	} catch (err) {
		console.log('order purchase ERROR:', err);
		return json({
			message: `order purchase ERR: ${err}`
		},
			{
				status: 500
			});

	}
};
