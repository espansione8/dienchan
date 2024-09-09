
import { json } from '@sveltejs/kit';
import { Course } from '$lib/models/Courses.model';
import dbConnect from '$lib/database';

export const POST = async ({ request }) => {
    const body = await request.json();

    const {
        productCorsoID,
        productCorsoUserId,
        productCorsoTitolo,
        productCorsoInfoExtra,
        productCorsoDescrizione,
        productCorsoDataInizioCompleto,
        productCorsoDataFineCompleto,
        // productCorsoStatus,
        productCorsoQuantitaPartecipanti,
        productCorsoProvincia,
        // productCorsoCategoria,
        productCorsoElencoEmailNotifica,
        productCorsoElencoTag,
        productPriceCorso,
        reflexologistName,
        surname
    } = body;

    // const productCorsoTitolo = body.productCorsoTitolo;

    // console.log('Corpo della richiesta:', body);
    // console.log('body.courseId', productCorsoID);

    try {
        await dbConnect();
        // console.log('Connessione al database avvenuta con successo');

        const filter = { courseId: productCorsoID };
        // console.log('Filtro utilizzato:', filter);

        const update = {
            title: productCorsoTitolo,
            infoExtra: productCorsoInfoExtra,
            descrLong: productCorsoDescrizione,
            reflexologistName,
            surname,
            eventStartDate: productCorsoDataInizioCompleto,
            eventEndDate: productCorsoDataFineCompleto,
            place: productCorsoProvincia,
            notificationEmail: productCorsoElencoEmailNotifica,
            tag: productCorsoElencoTag,
            userId: productCorsoUserId,
            price: productPriceCorso,
            stockQty: productCorsoQuantitaPartecipanti
        };
        console.log('Oggetto di aggiornamento:', update);

        const result = await Course.updateOne(filter, update);
        // console.log('Risultato dell\'aggiornamento:', result);

        if (result.matchedCount === 1) {
            return json({
                message: 'Corso aggiornato',
                status: 200
            });
        }

        return json({
            message: 'Nessun corso trovato con l\'ID specificato',
            status: 404
        });

    } catch (err) {
        console.error('Errore durante l\'aggiornamento del corso:', err);
        return json(
            {
                error: `Errore del server: ${err.message}`
            },
            {
                status: 500
            }
        );
    }
};
