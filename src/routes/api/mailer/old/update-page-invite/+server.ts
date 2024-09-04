// /api/mailer/update-page-invite
import { json as json$1 } from '@sveltejs/kit';
import nodemailer from 'nodemailer';

export const POST = async ({ request }) => {
	const body = await request.json();
	console.log('body.pageUrl', body.pageUrl);

	try {
		const mailer = async () => {
			// create reusable transporter object using the default SMTP transport
			const transporter = nodemailer.createTransport({
				host: import.meta.env.VITE_MAILER_HOST,
				port: import.meta.env.VITE_MAILER_PORT,
				secure: true, // true for 465, false for other ports
				auth: {
					user: import.meta.env.VITE_MAILER_USER,
					pass: import.meta.env.VITE_MAILER_PASS
				}
			});

			// send mail with defined transport object
			const info = await transporter.sendMail({
				from: '"Fast Track IP System" <info@fast-track-ip.com>', // sender address
				to: body.shareEmail, // list of receivers
				subject: `Invitation for QR page ${body.title}`, // Subject line
				text: `You have been invited from  ${body.userEmail} to complete a dynamic QR ${body.pageUrl} using the following password ASD6787DADFA`, // plain text body
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
								border-radius: 50%;
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
															src="https://portal.fast-track-ip.com/images/fast-track_logo_dark.png"
															alt="logo"
															style="
																width: 100px;
																max-width: 600px;
																height: auto;
																margin: auto;
																display: block;
															"
														/>
														<h1><a href="https://portal.fast-track-ip.com">Fast Track IP</a></h1>
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
															<h2>You have been invited by</h2>
															<h2><b>${body.userEmail}</b></h2>
															<h2>to complete a dynamic QR</h2>
														</div>
													</td>
												</tr>
												<tr>
													<td style="text-align: center">
														<div class="text-author">
															<h3 class="name">${body.title}</h3>
															<span class="position">ID ${body.documentPageId}</span>
															<h4>Login anche check your PROFILE</h4>
															<p>
																<a href="https://portal.fast-track-ip.com/login/" class="btn btn-primary"
																	>User Login</a
																>
															</p>
															<h4>OR <br /><b>ONLY FOR NEW USERS<b></h4>
															<p>
																<a href="${body.pageUrl}" class="btn btn-primary">Guest Access</a>
															</p>
															<h4>
																Guest access will enable <b>AUTOMATICALLY a new account</b><br>
																with password ${body.newPass}
															</h4>
															<h4>
																 use normal LOGIN next time with the provided pass or set your new password from profile section
															</h4>
														</div>
													</td>
												</tr>
											</table>
										</td>
									</tr>
									<!-- end tr -->
									<!-- 1 Column Text + Button : END -->
								</table>
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
										<td valign="middle" class="bg_light footer email-section">
											<table>
												<tr>
													<td valign="top" width="33.333%" style="padding-top: 20px">
														<table
															role="presentation"
															cellspacing="0"
															cellpadding="0"
															border="0"
															width="100%"
														>
															<tr>
																<td style="text-align: left; padding-right: 10px">
																	<h3 class="heading">About</h3>
																	<p>
																		FAST TRACK IP is building trust in the online environment as a key to
																		the economic and social development.
																	</p>
																</td>
															</tr>
														</table>
													</td>
													<td valign="top" width="33.333%" style="padding-top: 20px">
														<table
															role="presentation"
															cellspacing="0"
															cellpadding="0"
															border="0"
															width="100%"
														>
															<tr>
																<td style="text-align: left; padding-left: 5px; padding-right: 5px">
																	<h3 class="heading">Contact Info</h3>
																	<ul>
																		<li>
																			<span class="text">7V Stefan Karadzha, Sofia, 1000, Bulgaria</span>
																		</li>
																		<li><span class="text">floor 2, office 25</span></li>
																	</ul>
																</td>
															</tr>
														</table>
													</td>
													<td valign="top" width="33.333%" style="padding-top: 20px">
														<table
															role="presentation"
															cellspacing="0"
															cellpadding="0"
															border="0"
															width="100%"
														>
															<tr>
																<td style="text-align: left; padding-left: 10px">
																	<h3 class="heading">Useful Links</h3>
																	<ul>
																		<li><a href="https://www.fast-track-ip.com/">Home</a></li>
																		<li><a href="https://portal.fast-track-ip.com/login/">Services</a></li>
																	</ul>
																</td>
															</tr>
														</table>
													</td>
												</tr>
											</table>
										</td>
									</tr>
									<!-- end: tr -->
								</table>
							</div>
						</center>
					</body>
				</html>
				` // html body
			});

			console.log('Message sent: %s', info.messageId);
			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
		};
		mailer().catch(console.error);

		return json$1(
			{
				message: `invitation sent`
			},
			{
				status: 200
			}
		);
	} catch (err) {
		console.log('invite ERROR:', err);
		//throw new Error("@1migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		return new Response(JSON.stringify({ errors: `invite ERR: ${err}` }), {
			status: 500,
			headers: {
				'content-type': 'application/json; charset=utf-8'
			}
		});
		//////
		//return Promise.reject(new Error(`recoverUser ERR: ${err}`));
	}
};
