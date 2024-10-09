// src/routes/api/layouts/remove
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Layout } from '$lib/models/ProductLayouts.model';

export const DELETE = async ({ request }) => {
    const body = await request.json();
    const { layoutId } = body;

    try {
        // Connecting to DB
        await dbConnect();
        console.log('layoutId', layoutId);
        // Find and delete the discount with the specified discountId
        const result = await Layout.deleteOne({ layoutId: layoutId });

        if (result.deletedCount === 1) {
            return json(
                {
                    message: 'Layout eliminato con successo'
                },
                {
                    status: 200
                });
        }

        return json(
            {
                message: 'Nessun Layout trovato con l\'ID specificato'
            },
            {
                status: 500
            }
        );

    } catch (err) {
        console.error('Errore durante l\'eliminazione del Layout:', err);
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