// src/routes/api/discounts/modify
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Layout } from '$lib/models/ProductLayouts.model';

//import { File } from 'nft.storage';

export const POST = async ({ request }) => {
    const body = await request.json();
    const {
        layoutId,
        title,
        descr,
        urlPic,
        bgColor,
        price,
        bundleProduct
    } = body;
    // const productElencoEmailNotifica = body.productElencoEmailNotifica;
    // const productCorsoElencoTag = body.productCorsoElencoTag;


    try {
        // Connecting to DB
        // All database code can only run inside async functions as it uses await
        await dbConnect();
        // Is there a user with such an email?
        const filter = { layoutId: layoutId, type: 'layout' };

        const update = {
            title,
            descr,
            urlPic,
            bgColor,
            price,
            bundleProduct
        };


        const result = await Layout.updateOne(filter, update);

        if (result.matchedCount === 1) {
            return json({
                message: 'Layout aggiornato',
                status: 200
            });
        }

        return json({
            message: 'Nessun Layout trovato con l\'ID specificato',
            status: 404
        });

    } catch (err) {
        console.error('Errore durante l\'aggiornamento del Layout:', err);
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