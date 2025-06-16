// `${BASE_URL}/api/mailer/expiry-notification`
import type { RequestHandler } from '@sveltejs/kit';
import { BASE_URL, APIKEY, MAILER_HOST, MAILER_PORT, MAILER_USER, MAILER_PASS } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import nodemailer from 'nodemailer';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const {
		apiKey
	} = body;

	if (apiKey !== APIKEY) {
		return json({ message: 'CRON api error' }, { status: 401 });
	}

	const now = new Date();
	const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
	const startOfDayTwoWeeksFromNow = new Date(twoWeeksFromNow.getFullYear(), twoWeeksFromNow.getMonth(), twoWeeksFromNow.getDate());
	const startOfNextDayTwoWeeksFromNow = new Date(startOfDayTwoWeeksFromNow.getTime() + 24 * 60 * 60 * 1000);

	try {
		const resFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				//product | order | user | layout | discount
				schema: 'user',
				//IF USE Products.model -> types: course / product / membership / event
				query: {
					'membership.membershipExpiry': {
						$gte: startOfDayTwoWeeksFromNow, // bigger OR equal target day
						$lt: startOfNextDayTwoWeeksFromNow // smaller than next day
					}
				},

				projection: { _id: 0, password: 0 },  // 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 10000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const transporter = nodemailer.createTransport({
			host: MAILER_HOST,
			port: Number(MAILER_PORT),
			secure: false, // true for 465, false for other ports
			auth: {
				user: MAILER_USER,
				pass: MAILER_PASS
			}
		});

		const res = await resFetch;
		if (!res.ok) {
			console.error('user fetch error:', res.status, await res.text());
			return json({ message: 'CRON api error: user fetch error' }, { status: 500 });
		}
		const users = await res.json();
		console.log(`Found ${users.length} membership.membershipStatus: false. Sending emails...`);

		for (const user of users) {
			try {
				const emailContentHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Notifica da Riflessologia Dienchan</title>
                    </head>
                    <body>
                        <p>Gentile ${user.name || ''} ${user.surname || ''},</p>
                        <p>La tua tessera associativa in Riflessologia Dienchan sta per scadere.</p>
                        <p>Per favore, rinnovala per continuare ad usufruire dei corsi e del negozio riservato agli associati.</p>
                        <p>Cordiali saluti,</p>
                        <p>Riflessologiadienchan.it</p>
                    </body>
                    </html>
                `;

				const mailOptions = {
					from: '"Notifiche Dienchan" <no-reply@riflessologiadienchan.it>', // sender address
					to: user.email, // list of receivers
					subject: 'Aggiornamento sul tuo stato di membership', // Subject line
					html: emailContentHtml
				};

				// Send email
				await transporter.sendMail(mailOptions);
				//console.log(`Expiry email sent: ${user.email}`);

			} catch (emailError) {
				console.error(`Error sedning Expiry email to ${user.email}:`, emailError);
			}
		}

		return json({ message: `Expiry email sent. Processed ${users.length} users.` }, { status: 200 });

	} catch (err) {
		console.error('Error sending Expiry email:', err);
		throw error(500, `Server Error Expiry Cron: ${err.message}`);
	}
};
