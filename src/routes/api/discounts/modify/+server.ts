// src/routes/api/discounts/modify
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Discount } from '$lib/models/Discounts.model';

//import { File } from 'nft.storage';

export const POST = async ({ request }) => {
    const body = await request.json();
    const {
        discountId,
        code,
        type,
        value,
        userId,
        productId,
        layoutId,
        membershipLevel,
        notes
    } = body;
    // const productElencoEmailNotifica = body.productElencoEmailNotifica;
    // const productCorsoElencoTag = body.productCorsoElencoTag;


    try {
        // Connecting to DB
        // All database code can only run inside async functions as it uses await
        await dbConnect();
        // Is there a user with such an email?
        const filter = { discountId };

        const update = {
            code: code,
            type: type,
            value: value,
            userId: userId,
            membershipLevel: membershipLevel,
            productId: productId,
            layoutId: layoutId,
            notes: notes
        };


        const result = await Discount.updateOne(filter, update);

        if (result.matchedCount === 1) {
            return json({
                message: 'Sconto aggiornato',
                status: 200
            });
        }

        return json({
            message: 'Nessun sconto trovato con l\'ID specificato',
            status: 404
        });

    } catch (err) {
        console.error('Errore durante l\'aggiornamento dello sconto:', err);
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