
import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
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
        productCorsoStatus,
        productCorsoQuantitaPartecipanti,
        productCorsoProvincia,
        productCorsoCategoria,
        productCorsoElencoEmailNotifica,
        productCorsoElencoTag,
        productPriceCorso,
        name,
        surname
    } = body;

    // const productCorsoTitolo = body.productCorsoTitolo;

    // console.log('Corpo della richiesta:', body);
    // console.log('body.prodId', productCorsoID);

    try {
        await dbConnect();
        // console.log('Connessione al database avvenuta con successo');

        const filter = { prodId: productCorsoID, type: 'course' };
        // console.log('Filtro utilizzato:', filter);

        const update = {
            title: productCorsoTitolo,
            infoExtra: productCorsoInfoExtra,
            descrLong: productCorsoDescrizione,
            name,
            surname,
            eventStartDate: productCorsoDataInizioCompleto,
            eventEndDate: productCorsoDataFineCompleto,
            place: productCorsoProvincia,
            notificationEmail: productCorsoElencoEmailNotifica,
            tag: productCorsoElencoTag,
            userId: productCorsoUserId,
            price: productPriceCorso,
            status: productCorsoStatus,
            category: productCorsoCategoria,
            stockQty: productCorsoQuantitaPartecipanti
        };
        // console.log('Oggetto di aggiornamento:', update);

        const result = await Product.updateOne(filter, update);
        // console.log('Risultato dell\'aggiornamento:', result);

        if (result.matchedCount === 1) {
            return json({
                message: 'Corso aggiornato'
            },
                {
                    status: 200
                });
        }

        return json({
            message: 'Nessun corso trovato con l\'ID specificato'
        },
            {
                status: 400
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
