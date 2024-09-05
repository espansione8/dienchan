// src\routes\api\order\purchase-bank-transfer\+server.ts
import { json as json$1 } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
// import { loadStripe } from '@stripe/stripe-js';
// import Stripe from 'stripe';
import stringHash from 'string-hash';
import dbConnect from '$lib/database';
import { Order } from '$lib/models/Orders.model';
//import { User } from '$lib/models/Users.model';
export const POST = async ({ request }) => {
	const body = await request.json();
	try {
		//console.log('order session', body);
		await dbConnect();
		// const user = await Users.findOne({ userId: body.userId })
		// 	.limit(1)
		// 	.lean()
		// 	.exec();
		// Add user to DB
		// All database code can only run inside async functions as it uses await
		const idUuidv4 = crypto.randomUUID();
		const newOrder = new Order();
		const vatPerc = 20;
		const vatValue = (Number(body.totalValue) * vatPerc) / 100;
		const totalInvoice = vatValue + body.totalValue;
		newOrder.orderId = stringHash(idUuidv4);
		newOrder.orderCode = idUuidv4;
		newOrder.userId = body.userId;
		newOrder.status = body.status;
		newOrder.invoicing.name = body.name;
		newOrder.invoicing.surname = body.surname;
		newOrder.invoicing.email = body.email;
		newOrder.invoicing.phone = body.phone;
		newOrder.invoicing.address = body.businessAddress;
		newOrder.invoicing.city = body.businessCity;
		newOrder.invoicing.postalCode = body.businessPostalCode;
		newOrder.invoicing.state = body.businessState;
		newOrder.invoicing.county = body.businessCounty;
		newOrder.invoicing.country = body.businessCountry;
		newOrder.invoicing.businessName = body.businessName;
		newOrder.invoicing.vatNumber = body.vatNumber;
		newOrder.orderNotes = body.orderNotes;
		newOrder.payment.method = body.paymentType;
		newOrder.payment.statusPayment = 'pending';
		newOrder.payment.points = body.totalPoints;
		newOrder.payment.value = body.totalValue;
		newOrder.totalPoints = body.totalPoints;
		newOrder.totalValue = body.totalValue;
		newOrder.totalVAT = vatValue;

		await newOrder
			.save()
			.then(async (res) => {
				//console.log('newOrder ok', res);
				const data = {
					email: res.invoicing.email,
					idUuidv4: res.orderCode,
					name: res.invoicing.name,
					surname: res.invoicing.surname,
					totalPoints: res.totalPoints,
					totalInvoice: totalInvoice
				};
				const mailRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mailer/order-bank-mail`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(data)
				});
				const response = await mailRes.json();
				if (mailRes.ok) {
					console.log('mailing status:', response);
				} else {
					console.log('Error mail bank purchase 1', res);
				}
			})
			.catch(console.error);
		return json$1({
			message: 'order sent',
			status: 200
		});
	} catch (err) {
		console.log('order purchase ERROR:', err);
		//throw new Error("@1migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		return new Response(JSON.stringify({ message: `order purchase ERR` }), {
			status: 500,
			headers: {
				'content-type': 'application/json; charset=utf-8'
			}
		});
		//
		//return Promise.reject(new Error(`ERR: ${err}`));
	}
};
