// src/routes/api/mailer/sign-up-confirm.js
import { BASE_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';

export const POST = async ({ request }) => {
	const body = await request.json();

	const {
		email
	} = body;

	try {
		const mailer = async () => {
			// create reusable transporter object using the default SMTP transport
			const transporter = nodemailer.createTransport({
				host: import.meta.env.VITE_MAILER_HOST,
				port: import.meta.env.VITE_MAILER_PORT,
				secure: true, // true for 465 or 587, false for other ports
				auth: {
					user: import.meta.env.VITE_MAILER_USER,
					pass: import.meta.env.VITE_MAILER_PASS
				}
			});

			// send mail with defined transport object
			const info = await transporter.sendMail({
				from: '"Riflessologia Dien Chan" <info@riflessologiadienchan.it>', // sender address
				to: email, // list of receivers
				subject: 'Registrazione nuovo utente Dien Chan',
				text: `Gentile utente, \r\n ${email
					} sei stato registrato sulla nostra app \r\n per completare la registrazione effettua il <a href="${BASE_URL
					}">LOG IN</a> e compila i dati nella sezione "Profilo" \r\n oppure copia e incolla nel tuo browser il seguente link per il primo accesso: \r\n ${BASE_URL
					} \r\n \r\n Questo è un messaggio automatico NON RISPONDERE a questa comunicazione \r\n Distinti saluti \r\n Staff Dien Chan \r\n `,
				html: `
				<!DOCTYPE html>
				<html
					lang="en"
					xmlns="http://www.w3.org/1999/xhtml"
					xmlns:v="urn:schemas-microsoft-com:vml"
					xmlns:o="urn:schemas-microsoft-com:office:office"
				>
					<head>
						<meta charset="utf-8" />
						<!-- utf-8 works for most cases -->
						<meta name="viewport" content="width=device-width" />
						<!-- Forcing initial-scale shouldn't be necessary -->
						<meta http-equiv="X-UA-Compatible" content="IE=edge" />
						<!-- Use the latest (edge) version of IE rendering engine -->
						<meta name="x-apple-disable-message-reformatting" />
						<!-- Disable auto-scale in iOS 10 Mail entirely -->
						<title></title>
						<!-- The title tag shows in email notifications, like Android 4.4. -->

						<link
							href="https://fonts.googleapis.com/css?family=Poppins:200,300,400,500,600,700"
							rel="stylesheet"
						/>

						<!-- CSS Reset : BEGIN -->
						<style>
							/* What it does: Remove spaces around the email design added by some email clients. */
							/* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
							html,
							body {
								margin: 0 auto !important;
								padding: 0 !important;
								height: 100% !important;
								width: 100% !important;
								background: #f1f1f1;
							}

							/* What it does: Stops email clients resizing small text. */
							* {
								-ms-text-size-adjust: 100%;
								-webkit-text-size-adjust: 100%;
							}

							/* What it does: Centers email on Android 4.4 */
							div[style*='margin: 16px 0'] {
								margin: 0 !important;
							}

							/* What it does: Stops Outlook from adding extra spacing to tables. */
							table,
							td {
								mso-table-lspace: 0pt !important;
								mso-table-rspace: 0pt !important;
							}

							/* What it does: Fixes webkit padding issue. */
							table {
								border-spacing: 0 !important;
								border-collapse: collapse !important;
								table-layout: fixed !important;
								margin: 0 auto !important;
							}

							/* What it does: Uses a better rendering method when resizing images in IE. */
							img {
								-ms-interpolation-mode: bicubic;
							}

							/* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
							a {
								text-decoration: none;
							}

							/* What it does: A work-around for email clients meddling in triggered links. */
							*[x-apple-data-detectors],  /* iOS */
				.unstyle-auto-detected-links *,
				.aBn {
								border-bottom: 0 !important;
								cursor: default !important;
								color: inherit !important;
								text-decoration: none !important;
								font-size: inherit !important;
								font-family: inherit !important;
								font-weight: inherit !important;
								line-height: inherit !important;
							}

							/* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
							.a6S {
								display: none !important;
								opacity: 0.01 !important;
							}

							/* What it does: Prevents Gmail from changing the text color in conversation threads. */
							.im {
								color: inherit !important;
							}

							/* If the above doesn't work, add a .g-img class to any image in question. */
							img.g-img + div {
								display: none !important;
							}

							/* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
							/* Create one of these media queries for each additional viewport size you'd like to fix */

							/* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
							@media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
								u ~ div .email-container {
									min-width: 320px !important;
								}
							}
							/* iPhone 6, 6S, 7, 8, and X */
							@media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
								u ~ div .email-container {
									min-width: 375px !important;
								}
							}
							/* iPhone 6+, 7+, and 8+ */
							@media only screen and (min-device-width: 414px) {
								u ~ div .email-container {
									min-width: 414px !important;
								}
							}
						</style>

						<!-- CSS Reset : END -->

						<!-- Progressive Enhancements : BEGIN -->
						<style>
							.primary {
								background: #0b5ed7;
							}
							.bg_white {
								background: #ffffff;
							}
							.bg_light {
								background: #f7fafa;
							}
							.bg_black {
								background: #000000;
							}
							.bg_dark {
								background: rgba(0, 0, 0, 0.8);
							}
							.email-section {
								padding: 2.5em;
							}

							/*BUTTON*/
							.btn {
								padding: 10px 15px;
								display: inline-block;
							}
							.btn.btn-primary {
								border-radius: 5px;
								background: #0b5ed7;
								color: #ffffff;
							}
							.btn.btn-white {
								border-radius: 5px;
								background: #ffffff;
								color: #000000;
							}
							.btn.btn-white-outline {
								border-radius: 5px;
								background: transparent;
								border: 1px solid #fff;
								color: #fff;
							}
							.btn.btn-black-outline {
								border-radius: 0px;
								background: transparent;
								border: 2px solid #000;
								color: #000;
								font-weight: 700;
							}
							.btn-custom {
								color: rgba(0, 0, 0, 0.3);
								text-decoration: underline;
							}

							h1,
							h2,
							h3,
							h4,
							h5,
							h6 {
								font-family: 'Poppins', sans-serif;
								color: #000000;
								margin-top: 0;
								font-weight: 400;
							}

							body {
								font-family: 'Poppins', sans-serif;
								font-weight: 400;
								font-size: 15px;
								line-height: 1.8;
								color: rgba(0, 0, 0, 0.4);
							}

							a {
								color: #0b5ed7;
							}

							table {
							}
							/*LOGO*/

							.logo h1 {
								margin: 0;
							}
							.logo h1 a {
								color: #0b5ed7;
								font-size: 24px;
								font-weight: 700;
								font-family: 'Poppins', sans-serif;
							}

							/*HERO*/
							.hero {
								position: relative;
								z-index: 0;
							}

							.hero .text {
								color: rgba(0, 0, 0, 0.3);
							}
							.hero .text h2 {
								color: #000;
								font-size: 34px;
								margin-bottom: 0;
								font-weight: 200;
								line-height: 1.4;
							}
							.hero .text h3 {
								font-size: 24px;
								font-weight: 300;
							}
							.hero .text h2 span {
								font-weight: 600;
								color: #000;
							}

							.text-author {
								border: 1px solid rgba(0, 0, 0, 0.05);
								max-width: 50%;
								margin: 0 auto;
								padding: 2em;
							}
							.text-author img {
								border-radius: 0%;
								padding-bottom: 20px;
							}
							.text-author h3 {
								margin-bottom: 0;
							}
							ul.social {
								padding: 0;
							}
							ul.social li {
								display: inline-block;
								margin-right: 10px;
							}

							/*FOOTER*/

							.footer {
								border-top: 1px solid rgba(0, 0, 0, 0.05);
								color: rgba(0, 0, 0, 0.5);
							}
							.footer .heading {
								color: #000;
								font-size: 20px;
							}
							.footer ul {
								margin: 0;
								padding: 0;
							}
							.footer ul li {
								list-style: none;
								margin-bottom: 10px;
							}
							.footer ul li a {
								color: rgba(0, 0, 0, 1);
							}

							@media screen and (max-width: 500px) {
							}
						</style>
					</head>

					<body
						width="100%"
						style="
							margin: 0;
							padding: 0 !important;
							mso-line-height-rule: exactly;
							background-color: #f1f1f1;
						"
					>
						<center style="width: 100%; background-color: #f1f1f1">
							<div
								style="
									display: none;
									font-size: 1px;
									max-height: 0px;
									max-width: 0px;
									opacity: 0;
									overflow: hidden;
									mso-hide: all;
									font-family: sans-serif;
								"
							>
								&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
							</div>
							<div style="max-width: 600px; margin: 0 auto" class="email-container">
								<!-- BEGIN BODY -->
								<table
									align="center"
									role="presentation"
									cellspacing="0"
									cellpadding="0"
									border="0"
									width="100%"
									style="margin: auto"
								>
									<tr>
										<td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em">
											<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
												<tr>
													<td class="logo" style="text-align: center">
														<img
															src="https://testlive.riflessologiadienchan.it/images/logo-dien-chan-new-e1569697794109.jpg"
															alt="logo"
															style="
																width: 100px;
																max-width: 600px;
																height: auto;
																margin: auto;
																display: block;
															"
														/>
														<h1><a href="https://testlive.riflessologiadienchan.it">DIỆN CHẨN BÙI QUỐC CHÂU®</a></h1>
													</td>
												</tr>
											</table>
										</td>
									</tr>
									<!-- end tr -->
									<tr>
										<td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0">
											<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
												<tr>
													<td style="padding: 0 2.5em; text-align: center; padding-bottom: 3em">
														<div class="text">
															<h2>Gentile utente,</h2>
															<h4>${email} sei stato registrato sulla nostra app</h4>
															<h4>per completare la registrazione effettua il <a href="${BASE_URL
					}">LOG IN</a> e compila i dati nella sezione "Profilo"</h4>
															<p>oppure copia e incolla nel tuo browser il seguente link per il primo accesso: </p>
														<pre>${BASE_URL}</pre>
														<hr/>
														
														<h4>Distinti saluti</h4>
														<h4>Staff Dien Chan</h4>
														</div>
													</td>
												</tr>
												<tr>
													<td style="text-align: center">
														<div class="text-author">														
															<p>
																<a href="${BASE_URL}" class="btn btn-primary"
																	>Login</a
																>
															</p>
														</div>
													</td>
												</tr>
											</table>
										</td>
									</tr>
									<!-- end tr -->
									<!-- 1 Column Text + Button : END -->
								</table>
							</div>
						</center>
					</body>
				</html>
				`
				// html: `<p>Dear user</p>
				// <p>${email} have been registered on our app</p>
				// <p>to complete the registration please <a href="${
				// 	BASE_URL
				// }">LOG IN</a> and fill in the data in "Profile" section</p>
				// <p>or copy and paste in your browser the following link for the first login: </p>
				// <pre>${BASE_URL}</pre>
				// </ hr>
				// <p>This is an automated message DO NOT REPLY to this communication, for questions and assistance please write to support@fast-track-ip.com</p>
				// <p>Best regards</p>
				// <p>Fast Track IP</p>
				// `
				// html body
			});

			//console.log('Message sent: %s', info.messageId);
			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
			//return info.messageId;
			return json(
				{
					message: 'mail di conferma inviata',
					info: info.messageId
				},
				{
					status: 200
				}
			);
		};
		mailer().catch(console.error);

		return json(
			{
				message: 'mail di conferma NON inviata'
			},
			{
				status: 400
			}
		);
	} catch (err) {
		console.log('registerUser ERROR:', err);
		return json(
			{
				message: `registerUser ERR: ${err}`,
			},
			{
				status: 500
			}
		);
		// return new Response(JSON.stringify({ message: `registerUser ERR: ${err}` }), {
		// 	status: 500,
		// 	headers: {
		// 		'content-type': 'application/json; charset=utf-8'
		// 	}
		// });
	}
};
