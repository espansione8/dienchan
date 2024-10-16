// src/routes/api/orders/purchase
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
//import nodemailer from 'nodemailer';
// const Stripe = require('stripe');
import stringHash from 'string-hash';

import { Order } from '$lib/models/Orders.model';
// import Stripe from 'stripe';

// const stripe = new Stripe(
// 	'sk_test_51LpVjwBlFxSU04Fgeyo8NfdCXh2niPLZDGqTJOg9wtIlVsh3DujLCtGO5RVB7doh41L1BJdE8cXkrN7FmD1SE3qA00Kj6kbzTC',
// 	{
// 		apiVersion: '2022-08-01'
// 	}
// );

export const POST = async ({ request }) => {
	const body = await request.json();
	const {
		userId,
		paymentType,
		cart,
	} = body
	try {
		await dbConnect();
		// const session = await stripe.checkout.sessions.create({
		// 	line_items: [
		// 		{
		// 			// Provide the exact Price ID (for example, pr_1234) of the product you want to sell
		// 			price: 'price_1LzONmBlFxSU04FgnRU6wR04',
		// 			quantity: 1
		// 		}
		// 	],
		// 	mode: 'payment',
		// 	success_url: `${import.meta.env.VITE_BASE_URL}/my-docs`,
		// 	cancel_url: `${import.meta.env.VITE_BASE_URL}/profile`,
		// 	automatic_tax: { enabled: true }
		// });
		// console.log('order session', session, session.url);

		// const mailer = async () => {
		// 	// create reusable transporter object using the default SMTP transport
		// 	const transporter = nodemailer.createTransport({
		// 		host: 'smtp-relay.sendinblue.com',
		// 		port: 587,
		// 		secure: false, // true for 465, false for other ports
		// 		auth: {
		// 			user: import.meta.env.VITE_MAILER_USER,
		// 			pass: import.meta.env.VITE_MAILER_PASS
		// 		}
		// 	});

		// 	// send mail with defined transport object
		// 	const info = await transporter.sendMail({
		// 		from: '"Recupero password Unipromo" <noreply@websystem.cloud>', // sender address
		// 		to: body.registerEmail, // list of receivers
		// 		subject: 'Unipromo: conferma iscrizione',
		// 		text: "gentile utente. \r\n ci risulta una iscrizione per ${body.registerEmail} \r\n per confermare l'iscrizione copiare e incollare sul browser questo questo link:\r\n https://unipromo.click/confirm?check=123abc \r\n Una volta effettuato il login è necessario compilare i dati del profilo per permettere la spedizione della merce. \r\n \r\n Se invece l'iscrizione non è vostra contattate immediatamente support@unipromo.click \r\n Cordiali Saluti \r\n Unipromo Staff \r\n ",
		// 		html: `<p>gentile utente</p>
		// 		<p>ci risulta una iscrizione per ${body.registerEmail} </p>
		// 		<p>per confermare l'iscrizione cliccare su questo link:</p>
		// 		<p><a href="https://unipromo.click/confirm?check=123abc">https://unipromo.click/confirm?check=123abc</a></p>
		// 		<p>oppure copiare e incollare sul browser questo questo link: </p>
		// 		<pre>https://unipromo.click/confirm?check=123abc </pre>
		// 		<p>Una volta effettuato il login è necessario compilare i dati del profilo per permettere la spedizione della merce.</p>
		// 		</ hr>
		// 		<p>Se invece l'iscrizione non è vostra contattate immediatamente support@unipromo.click</p>
		// 		<p>Cordiali Saluti</p>
		// 		<p>Unipromo Staff</p>
		// 		` // html body
		// 	});

		// 	//console.log('Message sent: %s', info.messageId);
		// 	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
		// 	return info.messageId;
		// };
		// mailer().catch(console.error);

		const id = crypto.randomUUID();
		const orderId = stringHash(id);
		const newOrder = new Order();
		newOrder.orderId = orderId
		newOrder.orderCode = id
		newOrder.userId = userId;
		newOrder.cart = cart;
		newOrder.payment.method = paymentType;
		newOrder.totalValue = cart.reduce((total: number, item: any) => total + item.price, 0);

		const order = await newOrder.save()

		if (order.orderId == orderId) {
			return json(
				{
					message: 'Ordine inviato con successo',
				},
				{
					status: 200,
				}
			);
		}

		return json(
			{
				message: 'Ordine fallito',
			},
			{
				status: 400,
			}
		);
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
