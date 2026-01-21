// `${BASE_URL}/api/mailer/new-insurance`
import type { RequestHandler } from '@sveltejs/kit';
import { APIKEY, MAILER_HOST, MAILER_PORT, MAILER_SECURE, MAILER_USER, MAILER_PASS, BASE_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const {
        apiKey,
        email,
        order
    } = body;

    const { orderId, createdAt, totalValue, invoicing, shipping, payment, cart, type, totalDiscount, orderNotes = '' } = order;

    if (apiKey !== APIKEY) {
        return json({ message: 'api error' }, { status: 401 });
    }

    if (!email || !order) {
        return json({ message: 'Data missing' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
        host: MAILER_HOST,
        port: Number(MAILER_PORT),
        secure: MAILER_SECURE === 'true' ? true : false,
        auth: {
            user: MAILER_USER,
            pass: MAILER_PASS
        }
    });

    try {
        // Contenuto email per tipo INSURANCE (Contributo Socio Praticante)
        const emailContentInsurance = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Contributo Socio Praticante - Ordine Ricevuto</title>
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
                .hero .highlight { color: #000; font-weight: 700; }
                .hero .paragraph { color: rgba(0,0,0,.7); }
                .margin-top-lg { margin-top: 2em; }
                .text-black { color: #000; }
                .list-address { list-style: none; padding: 0; margin: 1em 0; }
                .margin-bottom-sm { margin-bottom: 1em; }
                .table-cell-style { padding: 8px; border: 1px solid #ddd; color: #000; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .alert-box { background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .alert-title { color: #856404; font-weight: 700; font-size: 18px; margin-bottom: 10px; }
                .alert-text { color: #856404; font-size: 15px; line-height: 1.6; }
                .step-box { background: #e7f3ff; border-left: 4px solid #0b5ed7; padding: 15px; margin: 10px 0; }
                .step-number { color: #0b5ed7; font-weight: 700; font-size: 18px; }
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
                                    <h2>Ciao ${invoicing.name} ${invoicing.surname},</h2>
                                    <h1 class="logo-title">Richiesta Contributo Socio Praticante Ricevuta! 📋</h1>
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td valign="top" class="hero bg_white padding-bottom-md padding-x-lg">
                                <h2 class="main-title">Abbiamo ricevuto la tua richiesta per il Contributo Socio Praticante (Ordine #${orderId}).</h2>

                                <div class="alert-box">
                                    <div class="alert-title">⚠️ IMPORTANTE - AZIONE RICHIESTA</div>
                                    <p class="alert-text">
                                        Per completare la tua adesione e attivare il contributo socio praticante, 
                                        è <strong>OBBLIGATORIO</strong> completare i seguenti passaggi:
                                    </p>
                                </div>

                                <h3 class="margin-top-lg text-black">📝 Cosa devi fare ora:</h3>

                                <div class="step-box">
                                    <p style="margin: 0;"><span class="step-number">1.</span> <strong>Scarica il modulo da questo <a href="https://riflessologiadienchan.it/wp-content/uploads/2026/01/MODULO-ADESIONE-CON-TUTELA.pdf">LINK</a> </strong> (MODULO ADESIONE CON TUTELA.pdf)</p>
                                </div>

                                <div class="step-box">
                                    <p style="margin: 0;"><span class="step-number">2.</span> <strong>Stampa il modulo</strong></p>
                                </div>

                                <div class="step-box">
                                    <p style="margin: 0;"><span class="step-number">3.</span> <strong>Compila e firma il modulo</strong> in tutte le sezioni indicate</p>
                                </div>

                                <div class="step-box">
                                    <p style="margin: 0;"><span class="step-number">4.</span> <strong>Invia il modulo firmato</strong> via email a: <a href="mailto:amministrazionedienchan@gmail.com" style="color: #0b5ed7; font-weight: 700;">amministrazionedienchan@gmail.com</a></p>
                                </div>

                                <div class="alert-box" style="background: #f8d7da; border-color: #dc3545;">
                                    <div class="alert-title" style="color: #721c24;">🔒 Il tuo contributo sarà attivato SOLO dopo la ricezione del modulo firmato</div>
                                </div>

                                <h4 class="margin-top-lg subtitle">Riepilogo del tuo ordine:</h4>
                                <ul>
                                    <li><strong>Numero d'ordine:</strong> #${orderId}</li>
                                    <li><strong>Data dell'ordine:</strong> ${createdAt.substring(0, 10)}</li>
                                    <li><strong>Totale ordine:</strong> ${totalValue.toFixed(2)}€</li>
                                    <li style="margin-bottom: 0.5em;"><strong>Metodo di pagamento:</strong> ${payment.method}</li>
                                </ul>

                                ${payment.method === 'Bonifico bancario' ? `
                                <div class="alert-box">
                                    <div class="alert-title">💳 Dettagli per il Bonifico Bancario</div>
                                    <p class="alert-text" style="margin-bottom: 10px;">
                                        Effettua il bonifico alle seguenti coordinate bancarie:
                                    </p>
                                    <p class="alert-text" style="line-height: 1.8;">
                                        <strong>IBAN:</strong> IT93 R076 0111 5000 0102 3646 647<br>
                                        <strong>BIC/SWIFT:</strong> BPPIITRRXXX<br>
                                        <strong>INTESTATO A:</strong> ASSOCIAZIONE DIEN CHAN BUI QUOC CHAU Italia<br>
                                        <strong>INDIRIZZO:</strong> VIA TICINO 12F, 25015, DESENZANO DEL GARDA, BRESCIA<br>
                                        <strong>CAUSALE:</strong> Ordine #${orderId}
                                    </p>
                                </div>
                                ` : ''}

                                <h4 class="margin-top-lg text-black">Indirizzo ricevuta:</h4>
                                <ul class="list-address">
                                    <li style="margin-bottom: 0.5em;">${invoicing.name} ${invoicing.surname}</li>
                                    <li style="margin-bottom: 0.5em;">${invoicing.address}</li>
                                    <li style="margin-bottom: 0.5em;">${invoicing.postalCode} ${invoicing.city} ${invoicing.county}</li>
                                    <li style="margin-bottom: 0.5em;">${invoicing.country}</li>
                                </ul>



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

        // Contenuto email standard per altri tipi di ordini
        //         const emailContentStandard = `
        // 				<!DOCTYPE html>
        // <html lang="it">
        // <head>
        //     <meta charset="utf-8">
        //     <meta name="viewport" content="width=device-width, initial-scale=1">
        //     <meta http-equiv="X-UA-Compatible" content="IE=edge">
        //     <title>Notifica automatica</title>
        //     <link href="https://fonts.googleapis.com/css?family=Poppins:200,300,400,500,600,700" rel="stylesheet">
        //     <style>
        //         /* CSS Reset & Basic Styles */
        //         body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; background: #f1f1f1; font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 15px; line-height: 1.8; color: rgba(0,0,0,.7); }
        //         * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        //         div[style*="margin: 16px 0"] { margin: 0 !important; }
        //         table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
        //         table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; }
        //         img { -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; display: block; }
        //         a { text-decoration: none; color: #0b5ed7; }

        //         /* Layout & Component Classes */
        //         .email-container { max-width: 600px; margin: 0 auto; }
        //         .bg_white { background: #ffffff; }
        //         .text-center { text-align: center; }
        //         .padding-top-sm { padding-top: 1em; }
        //         .padding-bottom-md { padding-bottom: 2.5em; } /* Adjusted from 4em to ensure enough space */
        //         .padding-x-lg { padding-left: 2.5em; padding-right: 2.5em; }

        //         /* Header/Logo Specific */
        //         .logo h1 { margin: 0; }
        //         .logo h1 a { color: #0b5ed7; font-size: 24px; font-weight: 700; font-family: 'Poppins', sans-serif; }
        //         .logo-img { width: 300px; margin: auto; } /* Specific for the logo image */

        //         /* Hero Section Specific */
        //         .hero .main-title { color: #000; font-size: 18px; margin-bottom: 0; font-weight: 200; line-height: 1.4; }
        //         .hero .subtitle { color: rgba(0,0,0,.7); font-size: 16px; font-weight: 300; }
        //         .hero .highlight { color: #000; font-weight: 700; } /* For the password highlight */
        //         .hero .paragraph { color: rgba(0,0,0,.7); }

        //         /* New Utility Classes for improved email layout */
        //         .margin-top-lg { margin-top: 2em; }
        //         .text-black { color: #000; } /* This class exists, but table-cell-style is more specific for cells */
        //         .list-address { list-style: none; padding: 0; margin: 1em 0; }
        //         .margin-bottom-sm { margin-bottom: 1em; } /* For product table */

        //         /* Table Cell Specific Styles */
        //         .table-cell-style {
        //             padding: 8px;
        //             border: 1px solid #ddd;
        //             color: #000;
        //         }
        //         .text-left { text-align: left; }
        //         .text-right { text-align: right; }
        //         .font-bold { font-weight: bold; }

        //         /* Responsive Styles */
        //         @media screen and (max-width: 500px) {
        //             .email-container { width: 100% !important; }
        //             .hero .main-title { font-size: 18px !important; }
        //             .hero .subtitle { font-size: 16px !important; }
        //             .padding-x-lg { padding-left: 1.5em; padding-right: 1.5em; } /* Adjust padding for smaller screens */
        //         }
        //     </style>
        // </head>
        // <body style="mso-line-height-rule: exactly;">
        //     <center style="width: 100%; background-color: #ffffff; padding: 1em;">
        //         <div class="email-container">
        //             <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="main-table">
        //                 <tr>
        //                     <td valign="top" class="bg_white text-center padding-top-sm padding-x-lg">
        //                         <a href="https://associazione.riflessologiadienchan.it" class="logo-link">
        //                             <img src="https://riflessologiadienchan.it/wp-content/uploads/2025/06/Associazione_Dien_Chan_BQC_LOGO.png" alt="logo" class="logo-img">
        //                             <h2>Ciao ${invoicing.name} ${invoicing.surname},</h2>
        //                             <h1 class="logo-title">Il tuo Ordine ${orderId} è Confermato! 🎉</h1>
        //                         </a>
        //                     </td>
        //                 </tr>
        //                 <tr>
        //                     <td valign="top" class="hero bg_white padding-bottom-md padding-x-lg">
        //                         <h2 class="main-title">Il tuo ordine ${orderId} è stato confermato con successo e lo stiamo preparando.</h2>
        //                         <h4 class="subtitle">Riepilogo del tuo ordine:</h4>
        //                         <ul>
        //                             <li><strong>Numero d'ordine:</strong> #${orderId}</li>
        //                             <li><strong>Data dell'ordine:</strong> ${createdAt.substring(0, 10)}</li>
        //                             <li><strong>Totale ordine:</strong> ${totalValue.toFixed(2)}€</li>
        //                             <li style="margin-bottom: 0.5em;"><strong>Metodo di pagamento:</strong> ${payment.method}</li>
        //                         </ul>
        //                         <h4 class="margin-top-lg text-black">Indirizzo ricevuta:</h4>
        //                         <ul class="list-address">
        //                             <li style="margin-bottom: 0.5em;">${invoicing.name} ${invoicing.surname}</li>
        //                             <li style="margin-bottom: 0.5em;">${invoicing.address}</li>
        //                             <li style="margin-bottom: 0.5em;">${invoicing.postalCode} ${invoicing.city} ${invoicing.county}</li>
        //                             <li style="margin-bottom: 0.5em;">${invoicing.country}</li>
        //                         </ul>
        //                      <h4 class="margin-top-lg text-black">Prodotti acquistati:</h4>
        // <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="margin-bottom-sm">
        //     <tr>
        //         <th class="table-cell-style text-left" width="50%">Prodotto</th>
        //         <th class="table-cell-style text-right" width="25%">Quantità</th>
        //         <th class="table-cell-style text-right" width="25%">Prezzo</th>
        //     </tr>
        //     ${type === 'course' ?
        //                 cart.map(item => `
        //             <tr>
        //                 <td class="table-cell-style text-left">${item.type == 'course' ? item.layoutView.title : item.title}</td>
        //                 <td class="table-cell-style text-right">${item.orderQuantity || 1}</td>
        //                 <td class="table-cell-style text-right"></td>
        //             </tr>
        //         `).join('')
        //                 : type === 'product' || type === 'membership' ?
        //                     cart.map(item => `
        //             <tr>
        //                 <td class="table-cell-style text-left">
        //                     <div style="display: flex; align-items: center; gap: 12px;">
        //                         <img src="${BASE_URL}${item.uploadfiles[0].fileUrl || 'https://riflessologiadienchan.it/images/placeholder.jpg'}" 
        //                              alt="${item.title}" 
        //                              width="80" 
        //                              height="80" 
        //                              style="width: 80px; height: 80px; object-fit: contain; border-radius: 4px; border: 1px solid #e0e0e0; flex-shrink: 0;">
        //                         <span>${item.title}</span>
        //                     </div>
        //                 </td>
        //                 <td class="table-cell-style text-right">${item.orderQuantity || 1}</td>
        //                 <td class="table-cell-style text-right">${item.price.toFixed(2)}€</td>
        //             </tr>
        //         `).join('')
        //                     :
        //                     cart.map(item => `
        //             <tr>
        //                 <td class="table-cell-style text-left">${item.type == 'course' ? item.layoutView.title : item.title}</td>
        //                 <td class="table-cell-style text-right">${item.orderQuantity || 1}</td>
        //                 <td class="table-cell-style text-right">${item.price.toFixed(2)}€</td>
        //             </tr>
        //         `).join('')
        //             }
        //     <tr>
        //         <td colspan="2" class="table-cell-style text-right font-bold">Spedizione</td>
        //         <td class="table-cell-style text-right font-bold">
        //             ${totalValue === 0
        //                 ? 'Gratuita'
        //                 : (type === 'product' && (totalValue + totalDiscount) < 100)
        //                     ? '9.00 €'
        //                     : 'Gratuita'
        //             }
        //         </td>
        //     </tr>
        //     <tr>
        //         <td colspan="2" class="table-cell-style text-right font-bold">Sconti</td>
        //         <td class="table-cell-style text-right font-bold">${totalDiscount > 0 ? totalDiscount.toFixed(2) : '0'} €</td>
        //     </tr>
        //     <tr>
        //         <td colspan="2" class="table-cell-style text-right font-bold">Totale</td>
        //         <td class="table-cell-style text-right font-bold">${totalValue.toFixed(2)} €</td>
        //     </tr>
        // </table>



        //                         <h4 class="margin-top-lg text-black">IMPORTANTE: scaricare il MODULO DI ADESIONE da questo <a href="http://riflessologiadienchan.it/wp-content/uploads/2025/12/MODULO-ADESIONE-CON-TUTELA-1.docx">LINK</a> </h4>
        //                         <h4 class="margin-top-lg text-black">e inviarlo compilato a amministrazionedienchan@gmail.com</h4>

        //                         <h4 class="margin-top-lg text-black">Metodo di pagamento:</h4>
        //                         <p style="margin-top: 0.5em;">${payment.method}</p>
        //                         ${payment.method === 'Bonifico bancario' ?
        //                 `<p style="margin-top: 0.5em;">L'evasione dell'ordine verrà effettuata dopo la ricezione del pagamento a queste COORDINATE BANCARIE <br />
        //                             IBAN: IT93 R076 0111 5000 0102 3646 647 <br />
        //                             BIC/SWIFT: BPPIITRRXXX <br />
        //                             INTESTATO A: ASSOCIAZIONE DIEN CHAN BUI QUOC CHAU Italia <br />
        //                             VIA TICINO 12F, 25015, DESENZANO DEL GARDA, BRESCIA <br />
        //                         </p>`
        //                 : ''}

        //                         <p class="margin-top-lg">
        //                             Puoi visualizzare i dettagli completi del tuo ordine in qualsiasi momento
        //                             accedendo alla tua area personale
        //                         </p>
        //                         <h4 class="subtitle">A presto,</h4>
        //                         <p class="paragraph">Il team di Riflessologia Dienchan</p>
        //                         <p class="paragraph"><a href="https://riflessologiadienchan.it/">https://riflessologiadienchan.it/</a></p>
        //                     </td>
        //                 </tr>
        //             </table>
        //         </div>
        //     </center>
        // </body>
        // </html>
        // 		`;

        // Scegli il contenuto email in base al tipo
        //const emailContentHtml = type === 'insurance' ? emailContentInsurance : emailContentStandard;

        // Configurazione base email
        const mailOptions: any = {
            from: '"Notifiche Dienchan" <no-reply@riflessologiadienchan.it>',
            to: email,
            subject: `Richiesta Contributo Socio Praticante #${orderId} con LINK Modulo da Firmare`,
            html: emailContentInsurance
        };

        // Aggiungi allegato solo per tipo insurance
        // if (type === 'insurance') {
        //     const attachmentPath = path.join(process.cwd(), 'static', 'MODULO ADESIONE CON TUTELA.pdf');

        //     // Verifica che il file esista
        //     if (fs.existsSync(attachmentPath)) {
        //         mailOptions.attachments = [
        //             {
        //                 filename: 'MODULO ADESIONE CON TUTELA.pdf',
        //                 path: attachmentPath,
        //                 contentType: 'application/pdf'
        //             }
        //         ];
        //     } else {
        //         console.error('ATTENZIONE: File MODULO ADESIONE CON TUTELA.pdf non trovato in /static');
        //         // Continua comunque con l'invio dell'email anche se manca l'allegato
        //     }
        // }

        const checkMail = await transporter.sendMail(mailOptions);
        if (!checkMail.messageId) return json({ message: 'New order mailing error', status: 400 });
        return json({ message: 'New order sent', status: 200 });

    } catch (err) {
        console.log('New order mailing ERROR:', err);
        return json({ message: 'New order mailing ERROR' }, { status: 500 });
    }
};