import type { RequestHandler } from '@sveltejs/kit';
import { APIKEY, MAILER_HOST, MAILER_PORT, MAILER_SECURE, MAILER_USER, MAILER_PASS, BASE_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const {
        apiKey,
        email,
        membershipOrder,
        insuranceOrder,
        userName,
        userSurname
    } = body;

    if (apiKey !== APIKEY) {
        return json({ message: 'api error' }, { status: 401 });
    }

    if (!email || !membershipOrder || !insuranceOrder) {
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
        const emailContentHtml = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Benvenuto in Associazione Dien Chan</title>
    <link href="https://fonts.googleapis.com/css?family=Poppins:200,300,400,500,600,700" rel="stylesheet">
    <style>
        body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; background: #f1f1f1; font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 15px; line-height: 1.8; color: rgba(0,0,0,.7); }
        * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
        table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; }
        img { -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; display: block; }
        a { text-decoration: none; color: #0b5ed7; }
        .email-container { max-width: 600px; margin: 0 auto; }
        .bg_white { background: #ffffff; }
        .text-center { text-align: center; }
        .section-box { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #0b5ed7; }
        .section-box-green { background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #22c55e; }
        .section-box-orange { background: #fff7ed; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f97316; }
        .step-number { display: inline-block; width: 28px; height: 28px; background: #0b5ed7; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 10px; }
        .highlight-box { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .btn-primary { display: inline-block; padding: 12px 24px; background: #0b5ed7; color: white !important; border-radius: 8px; font-weight: 600; text-decoration: none; }
        @media screen and (max-width: 500px) {
            .email-container { width: 100% !important; }
        }
    </style>
</head>
<body style="mso-line-height-rule: exactly;">
    <center style="width: 100%; background-color: #f1f1f1; padding: 20px 0;">
        <div class="email-container">
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                    <td style="padding: 30px 40px; text-align: center; );">
                        <img src="https://riflessologiadienchan.it/wp-content/uploads/2025/06/Associazione_Dien_Chan_BQC_LOGO.png" alt="logo" style="width: 250px; margin: 0 auto 20px;">
                        <h1 style="color: black; margin: 0; font-size: 28px;">Benvenuto/a nell'Associazione!</h1>
                    </td>
                </tr>

                <!-- Content -->
                <tr>
                    <td style="padding: 40px;">
                        
                        <!-- Saluto -->
                        <h2 style="color: #1e293b; margin-top: 0;">Ciao ${userName} ${userSurname}!  </h2>
                        <p style="color: #475569; font-size: 16px;">
                            Grazie per aver scelto di unirti alla nostra comunità! Abbiamo ricevuto la tua richiesta di iscrizione come <strong>Socio Ordinario</strong> con <strong>Contributo Socio Praticante</strong>.
                        </p>

                        <!-- Riepilogo Ordini -->
                        <div class="section-box-green">
                            <h3 style="color: #166534; margin-top: 0;">✅ Riepilogo dei tuoi ordini</h3>
                            <table width="100%" cellpadding="8" cellspacing="0" style="margin-top: 15px;">
                                <tr style="background: #dcfce7; border-radius: 8px;">
                                    <td style="padding: 12px; border-radius: 8px 0 0 8px;"><strong>Tessera Socio Ordinario</strong></td>
                                    <td style="padding: 12px; text-align: right; border-radius: 0 8px 8px 0;">€ 25,00</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px;"><strong>Contributo Socio Praticante</strong></td>
                                    <td style="padding: 12px; text-align: right;">€ 70,00</td>
                                </tr>
                                <tr style="background: #166534; color: white;">
                                    <td style="padding: 12px; border-radius: 8px 0 0 8px;"><strong>TOTALE</strong></td>
                                    <td style="padding: 12px; text-align: right; border-radius: 0 8px 8px 0;"><strong>€ 95,00</strong></td>
                                </tr>
                            </table>
                            <p style="margin-bottom: 0; margin-top: 15px; font-size: 14px; color: #166534;">
                                <strong>N° Ordine Tessera Socio:</strong> #${membershipOrder.orderId}<br>
                                <strong>N° Ordine Praticante:</strong> #${insuranceOrder.orderId}<br>
                                <strong>Metodo di pagamento:</strong> ${membershipOrder.payment?.method || 'N/A'}
                            </p>
                        </div>

                        ${membershipOrder.payment?.method === 'Bonifico bancario' ? `
                        <!-- Istruzioni Bonifico -->
                        <div class="section-box-orange">
                            <h3 style="color: #c2410c; margin-top: 0;">🏦 Istruzioni per il Bonifico</h3>
                            <p style="color: #9a3412;">Per completare l'iscrizione, effettua un bonifico di <strong>€ 95,00</strong> alle seguenti coordinate:</p>
                            <div class="highlight-box" style="background: #ffedd5;">
                                <p style="margin: 0; color: #9a3412;">
                                    <strong>IBAN:</strong> IT93 R076 0111 5000 0102 3646 647<br>
                                    <strong>BIC/SWIFT:</strong> BPPIITRRXXX<br>
                                    <strong>Intestato a:</strong> ASSOCIAZIONE DIEN CHAN BUI QUOC CHAU Italia<br>
                                    <strong>Causale:</strong> Membership + Praticante - ${membershipOrder.orderId}
                                </p>
                            </div>
                        </div>
                        ` : ''}
 
                        

                        <!-- Sezione Assicurazione - AZIONE RICHIESTA -->
                        <div class="section-box-orange">
                            <h3 style="color: #c2410c; margin-top: 0;">⚠️ AZIONE RICHIESTA: Attivazione Praticante</h3>
                            <p style="color: #9a3412; font-weight: 600;">
                                Per attivare la tua copertura assicurativa come Socio Praticante, è necessario completare i seguenti passaggi:
                            </p>
                            
                            <div style="margin: 20px 0;">
                                <p style="margin: 15px 0; color: #1e293b;">
                                    <span class="step-number">1</span>
                                    <strong>Scarica il modulo di adesione</strong><br>
                                    <span style="margin-left: 38px; color: #475569;">Trovi il modulo in allegato a questa email</span>
                                </p>
                                
                                <p style="margin: 15px 0; color: #1e293b;">
                                    <span class="step-number">2</span>
                                    <strong>Compila e firma il modulo</strong><br>
                                    <span style="margin-left: 38px; color: #475569;">Completa tutte le sezioni indicate nel documento</span>
                                </p>
                                
                                <p style="margin: 15px 0; color: #1e293b;">
                                    <span class="step-number">3</span>
                                    <strong>Invia il modulo firmato via email</strong><br>
                                    <span style="margin-left: 38px; color: #475569;">Invia a: <a href="mailto:amministrazionedienchan@gmail.com" style="color: #0b5ed7; font-weight: 600;">amministrazionedienchan@gmail.com</a></span>
                                </p>
                            </div>

                            <div class="highlight-box" style="background: #fef3c7; border: 1px solid #f59e0b;">
                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                    <strong>📋 Importante:</strong> La tua assicurazione sarà attivata SOLO dopo aver ricevuto il modulo firmato. 
                                    Fino ad allora, lo stato risulterà "In attesa di documentazione".
                                </p>
                            </div>
                        </div>

                        <!-- Vantaggi Socio Praticante 
                        <div class="section-box">
                            <h3 style="color: #0b5ed7; margin-top: 0;">🛡️ Vantaggi del Socio Praticante</h3>
                            <p style="color: #475569;">Una volta attivata l'assicurazione, potrai godere di:</p>
                            <ul style="color: #475569; margin-top: 5px;">
                                <li><strong>Polizza RC Civile e Penale</strong> dell'associazione</li>
                                <li><strong>Utilizzo sale</strong> con tariffa agevolata</li>
                                <li>Accesso alle <strong>attività riservate</strong> ai soci praticanti</li>
                                <li><strong>Copertura per eventi e fiere</strong> in luoghi pubblici</li>
                            </ul>
                        </div> -->

                        <!-- CTA Area Personale -->
                        <div style="text-align: center; margin: 30px 0;">
                            <p style="color: #475569; margin-bottom: 20px;">
                                Accedi alla tua area personale per monitorare lo stato dei tuoi ordini e scaricare la tessera:
                            </p>
                            <a href="https://associazione.riflessologiadienchan.it/profile-area" class="btn-primary">
                                Vai all'Area Personale
                            </a>
                        </div>

                        <!-- Footer -->
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                            <p style="color: #64748b; font-size: 14px; margin-bottom: 5px;">
                                Hai domande? Contattaci a <a href="mailto:info@riflessologiadienchan.it" style="color: #0b5ed7;">info@riflessologiadienchan.it</a>
                            </p>
                            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
                                A presto,<br>
                                <strong>Il team di Riflessologia Diện Chẩn</strong>
                            </p>
                            <p style="color: #94a3b8; font-size: 12px;">
                                <a href="https://riflessologiadienchan.it/" style="color: #94a3b8;">www.riflessologiadienchan.it</a>
                            </p>
                        </div>

                    </td>
                </tr>
            </table>
        </div>
    </center>
</body>
</html>
        `;

        const mailOptions = {
            from: '"Associazione Dien Chan" <no-reply@riflessologiadienchan.it>',
            to: email,
            subject: `🎉 Benvenuto/a! Tessera #${membershipOrder.orderId} + Assicurazione #${insuranceOrder.orderId}`,
            html: emailContentHtml,
            attachments: [
                {
                    filename: 'Modulo_Adesione_Socio_Praticante.pdf',
                    path: 'https://riflessologiadienchan.it/wp-content/uploads/2026/01/MODULO-ADESIONE-CON-TUTELA.pdf'
                }
            ]
        };

        const checkMail = await transporter.sendMail(mailOptions);
        if (!checkMail.messageId) return json({ message: 'Email sending error', status: 400 });
        return json({ message: 'Email sent successfully', status: 200 });

    } catch (err) {
        console.log('Membership+Insurance email ERROR:', err);
        return json({ message: 'Email sending ERROR' }, { status: 500 });
    }
};