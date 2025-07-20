// `${BASE_URL}/api/mailer/default`
import type { RequestHandler } from '@sveltejs/kit';
import { APIKEY, MAILER_HOST, MAILER_PORT, MAILER_SECURE, MAILER_USER, MAILER_PASS } from '$env/static/private';
import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const {
        apiKey,
        email,
        content
    } = body;

    if (apiKey !== APIKEY) {
        return json({ message: 'api error' }, { status: 401 });
    }

    if (!email) {
        return json({ message: 'Data missing' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
        host: MAILER_HOST,
        port: Number(MAILER_PORT),
        secure: MAILER_SECURE === 'true' ? true : false, // true for 465, false for other ports
        auth: {
            user: MAILER_USER,
            pass: MAILER_PASS
        }
    });

    try {
        const emailContentHtml = `
				<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Notifica automatica</title>
    <link href="https://fonts.googleapis.com/css?family=Poppins:200,300,400,500,600,700" rel="stylesheet">
    <style>
        /* CSS Reset & Basic Styles */
        body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; background: #f1f1f1; font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 15px; line-height: 1.8; color: rgba(0,0,0,.7); }
        * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        div[style*="margin: 16px 0"] { margin: 0 !important; }
        table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
        table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; }
        img { -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; display: block; }
        a { text-decoration: none; color: #0b5ed7; }

        /* Layout & Component Classes */
        .email-container { max-width: 600px; margin: 0 auto; }
        .bg_white { background: #ffffff; }
        .text-center { text-align: center; }
        .padding-top-sm { padding-top: 1em; }
        .padding-bottom-md { padding-bottom: 2.5em; } /* Adjusted from 4em to ensure enough space */
        .padding-x-lg { padding-left: 2.5em; padding-right: 2.5em; }

        /* Header/Logo Specific */
        .logo h1 { margin: 0; }
        .logo h1 a { color: #0b5ed7; font-size: 24px; font-weight: 700; font-family: 'Poppins', sans-serif; }
        .logo-img { width: 300px; margin: auto; } /* Specific for the logo image */

        /* Hero Section Specific */
        .hero .main-title { color: #000; font-size: 18px; margin-bottom: 0; font-weight: 200; line-height: 1.4; }
        .hero .subtitle { color: rgba(0,0,0,.7); font-size: 16px; font-weight: 300; }
        .hero .highlight { color: #000; font-weight: 700; } /* For the password highlight */
        .hero .paragraph { color: rgba(0,0,0,.7); }

        /* New Utility Classes for improved email layout */
        .margin-top-lg { margin-top: 2em; }
        .text-black { color: #000; } /* This class exists, but table-cell-style is more specific for cells */
        .list-address { list-style: none; padding: 0; margin: 1em 0; }
        .margin-bottom-sm { margin-bottom: 1em; } /* For product table */

        /* Table Cell Specific Styles */
        .table-cell-style {
            padding: 8px;
            border: 1px solid #ddd;
            color: #000;
        }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }

        /* Responsive Styles */
        @media screen and (max-width: 500px) {
            .email-container { width: 100% !important; }
            .hero .main-title { font-size: 18px !important; }
            .hero .subtitle { font-size: 16px !important; }
            .padding-x-lg { padding-left: 1.5em; padding-right: 1.5em; } /* Adjust padding for smaller screens */
        }
    </style>
</head>
<body style="mso-line-height-rule: exactly;">
    <center style="width: 100%; background-color: #ffffff; padding: 1em;">
        <div class="email-container">
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="main-table">
                <tr>
                    <td valign="top" class="bg_white text-center padding-top-sm padding-x-lg">
                        <a href="https://associazione.riflessologiadienchan.it" class="logo-link">
                            <img src="https://riflessologiadienchan.it/wp-content/uploads/2025/06/Associazione_Dien_Chan_BQC_LOGO.png" alt="logo" class="logo-img">
                            <h2>Ciao ${email},</h2>
                        </a>
                    </td>
                </tr>
                <tr>
                    <td valign="top" class="hero bg_white padding-bottom-md padding-x-lg">
                        <h2 class="main-title">${content}</h2>
                        
                        <h4 class="subtitle">A presto,</h4>
                        <p class="paragraph">Il team di Riflessologia Dienchan</p>
                        <p class="paragraph"><a href="https://riflessologiadienchan.it/">https://riflessologiadienchan.it/</a></p>
                    </td>
                </tr>
            </table>
        </div>
    </center>
</body>
</html>
		`
        const mailOptions = {
            from: '"Notifiche Dienchan" <no-reply@riflessologiadienchan.it>', // sender address
            to: email, // list of receivers
            subject: `Notifica Dienchan 🎉`, // Subject line
            html: emailContentHtml
        };

        const checkMail = await transporter.sendMail(mailOptions);
        if (!checkMail.messageId) return json({ message: 'New mailing error', status: 400 });
        return json({ message: 'New mail sent', status: 200 });

    } catch (err) {
        console.log('New mailing ERROR:', err);
        return json({ message: 'New mailing ERROR' }, { status: 500 });
    }
};
