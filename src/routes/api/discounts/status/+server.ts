// src/routes/api/discounts/status
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Discount } from '$lib/models/Discounts.model';

//import { File } from 'nft.storage';

export const POST = async ({ request }) => {
    const body = await request.json();
    const {
        discountId,
        status,
    } = body;


    try {
        // Connecting to DB
        // All database code can only run inside async functions as it uses await
        await dbConnect();
        // Is there a user with such an email?
        const filter = { discountId };

        let update

        if (status == 'enabled') {
            update = {
                status: 'disabled',
            };
        } else {
            update = {
                status: 'enabled',
            };
        }


        const result = await Discount.updateOne(filter, update);

        if (result.matchedCount == 1) {
            return json(
                {
                    message: 'Status Sconto aggiornato'
                },
                {
                    status: 200
                }
            );
        }

        return json(
            {
                message: 'Nessun sconto trovato con l\'ID specificato'
            },
            {
                status: 400
            }
        );

    } catch (err) {
        console.error('Errore durante l\'aggiornamento dello status sconto:', err);
        return json(
            {
                error: `Errore Sconto server: ${err.message}`
            },
            {
                status: 500
            }
        );
    }
};