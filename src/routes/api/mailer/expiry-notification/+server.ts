// `${BASE_URL}/api/mailer/expiry-notification`
import type { RequestHandler } from '@sveltejs/kit';
import { BASE_URL, APIKEY, MAILER_HOST, MAILER_PORT, MAILER_SECURE, MAILER_USER, MAILER_PASS } from '$env/static/private';
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
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
	const startOfDayTwoWeeksFromNow = new Date(twoWeeksFromNow.getFullYear(), twoWeeksFromNow.getMonth(), twoWeeksFromNow.getDate());
	const startOfNextDayTwoWeeksFromNow = new Date(startOfDayTwoWeeksFromNow.getTime() + 24 * 60 * 60 * 1000);

	let expiringCount = 0;
	let expiredCount = 0;

	try {
		// PARTE 1: Disattivazione tessere scadute
		
		const resExpiredFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user',
				query: {
					'membership.membershipExpiry': {
						$lt: startOfToday // Scadenza minore di oggi
					},
					'membership.membershipStatus': true // Solo tessere ancora attive
				},
				projection: { _id: 0, password: 0 },
				sort: { createdAt: -1 },
				limit: 10000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!resExpiredFetch.ok) {
			console.error('Expired users fetch error:', resExpiredFetch.status, await resExpiredFetch.text());
		} else {
			const expiredUsers = await resExpiredFetch.json();

			const transporter = nodemailer.createTransport({
				host: MAILER_HOST,
				port: Number(MAILER_PORT),
				secure: MAILER_SECURE === 'true' ? true : false,
				auth: {
					user: MAILER_USER,
					pass: MAILER_PASS
				}
			});

			for (const user of expiredUsers) {
				try {
					// Disattiva la tessera
					const updateRes = await fetch(`${BASE_URL}/api/mongo/update`, {
						method: 'POST',
						body: JSON.stringify({
							apiKey: APIKEY,
							schema: 'user',
							query: { userId: user.userId },
							update: {
								'membership.membershipStatus': false
							}
						}),
						headers: {
							'Content-Type': 'application/json'
						}
					});

					if (!updateRes.ok) {
						console.error(`Failed to deactivate membership for ${user.email}`);
						continue;
					}

					// Invia email di notifica scadenza
					const emailContentHtml = `
						<!DOCTYPE html>
						<html>
						<head>
							<meta charset="utf-8">
							<title>Tessera Scaduta - Riflessologia Dienchan</title>
						</head>
						<body>
							<p>Gentile ${user.name || ''} ${user.surname || ''},</p>
							<p><strong>La tua tessera associativa in Riflessologia Dienchan è scaduta.</strong></p>
							<p>La tua membership è stata disattivata automaticamente.</p>
							<p>Per continuare ad usufruire dei corsi e del negozio riservato agli associati, è necessario rinnovare la tessera.</p>
							<p>Per procedere al rinnovo, clicca sul link: <a href="https://associazione.riflessologiadienchan.it/login">https://associazione.riflessologiadienchan.it/login</a></p>
							<p>Cordiali saluti,</p>
							<p>Riflessologia Dienchan</p>
						</body>
						</html>
					`;

					const mailOptions = {
						from: '"Notifiche Dienchan" <no-reply@riflessologiadienchan.it>',
						to: user.email,
						subject: 'Tessera Associativa Scaduta',
						html: emailContentHtml
					};

					await transporter.sendMail(mailOptions);
					expiredCount++;

				} catch (err) {
					console.error(`Error processing expired user ${user.email}:`, err);
				}
			}
		}

		// PARTE 2: Notifica tessere in scadenza (tra 2 settimane)
		
		const resExpiringFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user',
				query: {
					'membership.membershipExpiry': {
						$gte: startOfDayTwoWeeksFromNow,
						$lt: startOfNextDayTwoWeeksFromNow
					}
				},
				projection: { _id: 0, password: 0 },
				sort: { createdAt: -1 },
				limit: 10000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!resExpiringFetch.ok) {
			console.error('Expiring users fetch error:', resExpiringFetch.status, await resExpiringFetch.text());
		} else {
			const expiringUsers = await resExpiringFetch.json();

			const transporter = nodemailer.createTransport({
				host: MAILER_HOST,
				port: Number(MAILER_PORT),
				secure: MAILER_SECURE === 'true' ? true : false,
				auth: {
					user: MAILER_USER,
					pass: MAILER_PASS
				}
			});

			for (const user of expiringUsers) {
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
							<p>La tua tessera associativa in Riflessologia Dienchan sta per scadere tra 2 settimane.</p>
							<p>Per favore, rinnovala per continuare ad usufruire dei corsi e del negozio riservato agli associati.</p>
							<p>Per procedere al rinnovo della tua tessera, clicca sul link: <a href="https://associazione.riflessologiadienchan.it/login">https://associazione.riflessologiadienchan.it/login</a></p>
							<p>Cordiali saluti,</p>
							<p>Riflessologia Dienchan</p>
						</body>
						</html>
					`;

					const mailOptions = {
						from: '"Notifiche Dienchan" <no-reply@riflessologiadienchan.it>',
						to: user.email,
						subject: 'Aggiornamento sul tuo stato di membership',
						html: emailContentHtml
					};

					await transporter.sendMail(mailOptions);
					expiringCount++;

				} catch (emailError) {
					console.error(`Error sending expiring email to ${user.email}:`, emailError);
				}
			}
		}

		return json({ 
			message: `Process completed successfully`,
			expired: {
				count: expiredCount,
				action: 'Memberships deactivated and notification emails sent'
			},
			expiring: {
				count: expiringCount,
				action: 'Warning emails sent (2 weeks notice)'
			}
		}, { status: 200 });

	} catch (err) {
		console.error('Error in expiry notification cron:', err);
		throw error(500, `Server Error Expiry Cron: ${err.message}`);
	}
};