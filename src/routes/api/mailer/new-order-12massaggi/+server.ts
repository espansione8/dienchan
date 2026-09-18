// `${BASE_URL}/api/mailer/new-order`
import type { RequestHandler } from '@sveltejs/kit';
import { APIKEY, MAILER_HOST, MAILER_PORT, MAILER_SECURE, MAILER_USER, MAILER_PASS } from '$env/static/private';
import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const {
        apiKey,
        email,
        order
    } = body;

    const { orderId, createdAt, totalValue, invoicing, payment, cart, type, totalDiscount, orderNotes = '' } = order;
    const { name, surname, address, city, county, postalCode, country } = invoicing

    // corso richiesto: dal carrello leggo il corso (type course/event) per branchare il template sul suo prodId
    const courseItem = (cart || []).find((item: any) => item.type === 'course' || item.type === 'event');
    const courseProdId = courseItem?.prodId || '';
    const courseTitle = courseItem?.layoutView?.title || '';
    const courseDate = courseItem?.eventStartDate ? new Date(courseItem.eventStartDate).toLocaleDateString('it-IT') : '';
    // F82B3JBZT = corso ricorrente del 15 di ogni mese (Van Tri Truong): template dedicato con link di registrazione Zoom
    const isF82B3JBZT = courseProdId === 'F82B3JBZT';
    const zoomLinkF82B3JBZT = 'https://us06web.zoom.us/meeting/register/Q3OGh5aFSrinZi3sHbDS1A#/registration';
    const coursePrice = (() => {
        const lv: any = courseItem?.layoutView || {};
        const isPromo = lv.promoStatus === 'enabled' && lv.promoPrice > 0 && (!lv.promoEndDate || new Date(lv.promoEndDate) >= new Date());
        return isPromo ? lv.promoPrice : (lv.price ?? 0);
    })();

    if (apiKey !== APIKEY) {
        return json({ message: 'api error' }, { status: 401 });
    }

    if (!email || !order) {
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
        // F82B3JBZT (corso ricorrente del 15 di ogni mese, Van Tri Truong): template dedicato con testo proprio e link di registrazione Zoom
        if (isF82B3JBZT) {
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
        body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; background: #f1f1f1; font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 15px; line-height: 1.8; color: rgba(0,0,0,.7); }
        * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        div[style*="margin: 16px 0"] { margin: 0 !important; }
        table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
        table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; }
        img { -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; display: block; }
        a { text-decoration: none; color: #0b5ed7; }
        .email-container { max-width: 600px; margin: 0 auto; }
        .bg_white { background: #ffffff; }
        .text-center { text-align: center; }
        .padding-top-sm { padding-top: 1em; }
        .padding-bottom-md { padding-bottom: 2.5em; }
        .padding-x-lg { padding-left: 2.5em; padding-right: 2.5em; }
        .logo h1 { margin: 0; }
        .logo h1 a { color: #0b5ed7; font-size: 24px; font-weight: 700; font-family: 'Poppins', sans-serif; }
        .logo-img { width: 300px; margin: auto; }
        .hero .main-title { color: #000; font-size: 18px; margin-bottom: 0; font-weight: 200; line-height: 1.4; }
        .hero .subtitle { color: rgba(0,0,0,.7); font-size: 16px; font-weight: 300; }
        .hero .paragraph { color: rgba(0,0,0,.7); }
        .margin-top-lg { margin-top: 2em; }
        .text-black { color: #000; }
        .list-address { list-style: none; padding: 0; margin: 1em 0; }
        .margin-bottom-sm { margin-bottom: 1em; }
        .table-cell-style { padding: 8px; border: 1px solid #ddd; color: #000; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        @media screen and (max-width: 500px) {
            .email-container { width: 100% !important; }
            .hero .main-title { font-size: 18px !important; }
            .hero .subtitle { font-size: 16px !important; }
            .padding-x-lg { padding-left: 1.5em; padding-right: 1.5em; }
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
                            <h2>Ciao ${name} ${surname},</h2>
                            <h1 class="logo-title">Iscrizione Confermata! 🎉</h1>
                        </a>
                    </td>
                </tr>
                <tr>
                    <td valign="top" class="hero bg_white padding-bottom-md padding-x-lg">
                        <h2 class="main-title">La tua iscrizione al corso è stata confermata con successo.</h2>
                        <p class="margin-top-md margin-bottom-md">
                            <strong>${courseTitle}</strong> si svolge <strong>il 15 di ogni mese</strong>${courseDate ? `, prima data: <strong>${courseDate}</strong>` : ''}.<br>
                            <strong>Per partecipare registrati al meeting Zoom utilizzando il seguente link:</strong><br>
                            <a href="${zoomLinkF82B3JBZT}" style="color: #0066cc;">${zoomLinkF82B3JBZT}</a>
                        </p>
                        <h4 class="subtitle">Riepilogo del tuo ordine:</h4>
                        <ul>
                            <li><strong>Numero d'ordine:</strong> #${orderId}</li>
                            <li><strong>Data dell'ordine:</strong> ${createdAt.substring(0, 10)}</li>
                            <li><strong>Totale ordine:</strong> ${totalValue.toFixed(2)}€</li>
                            <li style="margin-bottom: 0.5em;"><strong>Metodo di pagamento:</strong> ${payment.method}</li>
                        </ul>
                        <h4 class="margin-top-lg text-black">Prodotti acquistati:</h4>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="margin-bottom-sm">
                            <tr>
                                <th class="table-cell-style text-left">Prodotto</th>
                                <th class="table-cell-style text-right">Quantità</th>
                                <th class="table-cell-style text-right">Prezzo</th>
                            </tr>
                            <tr>
                                <td class="table-cell-style text-left"> ${courseTitle} </td>
                                <td class="table-cell-style text-right"> 1 </td>
                                <td class="table-cell-style text-right"> ${coursePrice} €</td>
                            </tr>
                            <tr>
                                <td colspan="2" class="table-cell-style text-right font-bold">Spedizione</td>
                                <td class="table-cell-style text-right font-bold">Gratuita</td>
                            </tr>
                            <tr>
                                <td colspan="2" class="table-cell-style text-right font-bold">Sconti</td>
                                <td class="table-cell-style text-right font-bold">${totalDiscount > 0 ? totalDiscount.toFixed(2) : '0'} €</td>
                            </tr>
                            <tr>
                                <td colspan="2" class="table-cell-style text-right font-bold">Totale</td>
                                <td class="table-cell-style text-right font-bold">${totalValue.toFixed(2)} €</td>
                            </tr>
                        </table>

                        <h4 class="margin-top-lg text-black">Indirizzo di spedizione:</h4>
                        <ul class="list-address">
                            <li style="margin-bottom: 0.5em;">${name} ${surname}</li>
                            <li style="margin-bottom: 0.5em;">${address}</li>
                            <li style="margin-bottom: 0.5em;">${postalCode} ${city} ${county}</li>
                            <li style="margin-bottom: 0.5em;">${country}</li>
                        </ul>

                        <h4 class="margin-top-lg text-black">Note ordine :</h4>
                        <p style="margin-top: 0.5em;">${orderNotes}</p>

                        <p class="margin-top-lg">
                            Puoi visualizzare i dettagli completi del tuo ordine in qualsiasi momento
                            accedendo alla tua area personale
                        </p>
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
		`;
            const mailOptions = {
                from: '"Notifiche Dienchan" <no-reply@riflessologiadienchan.it>', // sender address
                to: email, // list of receivers
                subject: `Conferma iscrizione: ${courseTitle} 🎉`, // Subject line
                html: emailContentHtml
            };

            const checkMail = await transporter.sendMail(mailOptions);
            if (!checkMail.messageId) return json({ message: 'New order mailing error', status: 400 });
            return json({ message: 'New order sent', status: 200 });
        }

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
                            <h2>Ciao ${name} ${surname},</h2>
                            <h1 class="logo-title">Il tuo Ordine ${orderId} è Confermato! 🎉</h1>
                        </a>
                    </td>
                </tr>
                <tr>
                    <td valign="top" class="hero bg_white padding-bottom-md padding-x-lg">
                        <h2 class="main-title">Il tuo ordine ${orderId} è stato confermato con successo e lo stiamo preparando.</h2>
                        <p class="margin-top-md margin-bottom-md">
                            <strong>Per accedere al corso utilizza il seguente link:</strong><br>
                            <a href="https://us05web.zoom.us/j/89846778370?pwd=BKS2Tbi0eqjYHv1rwPQWdjWzpPBytl.1" style="color: #0066cc;">https://us05web.zoom.us/j/89846778370?pwd=BKS2Tbi0eqjYHv1rwPQWdjWzpPBytl.1</a><br>
                            <strong>ID riunione:</strong> 898 4677 8370<br>
                            <strong>Codice d'accesso:</strong> cq3BHp
                        </p>
                        <h4 class="subtitle">Riepilogo del tuo ordine:</h4>
                        <ul>
                            <li><strong>Numero d'ordine:</strong> #${orderId}</li>
                            <li><strong>Data dell'ordine:</strong> ${createdAt.substring(0, 10)}</li>
                            <li><strong>Totale ordine:</strong> ${totalValue.toFixed(2)}€</li>
                            <li style="margin-bottom: 0.5em;"><strong>Metodo di pagamento:</strong> ${payment.method}</li>
                        </ul>
                        <h4 class="margin-top-lg text-black">Prodotti acquistati:</h4>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="margin-bottom-sm">
                            <tr>
                                <th class="table-cell-style text-left">Prodotto</th>
                                <th class="table-cell-style text-right">Quantità</th>
                                <th class="table-cell-style text-right">Prezzo</th>
                            </tr>
                             <tr>
                                                <td class="table-cell-style text-left"> Workshop: 12 Massaggi mattutini </td>
                                                <td class="table-cell-style text-right"> 1 </td>
                                                <td class="table-cell-style text-right"> 0 €</td>
                                            </tr>
                          <tr>
    <td colspan="2" class="table-cell-style text-right font-bold">Spedizione</td>
    <td class="table-cell-style text-right font-bold">
     ${totalValue === 0
                ? 'Gratuita'
                : (type === 'product' && (totalValue + totalDiscount) < 100)
                    ? '9.00 €'
                    : 'Gratuita'
            }
    </td>
</tr>
                            <tr>
                                <td colspan="2" class="table-cell-style text-right font-bold">Sconti</td>
                                <td class="table-cell-style text-right font-bold">${totalDiscount > 0 ? totalDiscount.toFixed(2) : '0'} €</td>
                            </tr>
                            <tr>
                                <td colspan="2" class="table-cell-style text-right font-bold">Totale</td>
                                <td class="table-cell-style text-right font-bold">${totalValue.toFixed(2)} €</td>
                            </tr>
                        </table>

                        <h4 class="margin-top-lg text-black">Indirizzo di spedizione:</h4>
                        <ul class="list-address">
                            <li style="margin-bottom: 0.5em;">${name} ${surname}</li>
                            <li style="margin-bottom: 0.5em;">${address}</li>
                            <li style="margin-bottom: 0.5em;">${postalCode} ${city} ${county}</li>
                            <li style="margin-bottom: 0.5em;">${country}</li>
                        </ul>

                        <h4 class="margin-top-lg text-black">Note ordine :</h4>
                        <p style="margin-top: 0.5em;">${orderNotes}</p>

                

                        <p class="margin-top-lg">
                            Puoi visualizzare i dettagli completi del tuo ordine in qualsiasi momento
                            accedendo alla tua area personale
                        </p>
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
            subject: `Il tuo Ordine #${orderId} è Confermato! 🎉`, // Subject line
            html: emailContentHtml
        };

        const checkMail = await transporter.sendMail(mailOptions);
        if (!checkMail.messageId) return json({ message: 'New order mailing error', status: 400 });
        return json({ message: 'New order sent', status: 200 });

    } catch (err) {
        console.log('New order mailing ERROR:', err);
        return json({ message: 'New order mailing ERROR' }, { status: 500 });
    }
};
