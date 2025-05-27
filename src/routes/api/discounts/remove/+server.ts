
// src/routes/api/discounts/remove
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/server/mongo/database';
import { Discount } from '$lib/server/mongo/schema/Discounts.model';

export const DELETE = async ({ request }) => {
    const body = await request.json();
    const { discountId } = body;

    try {
        // Connecting to DB
        await dbConnect();

        // Find and delete the discount with the specified discountId
        const result = await Discount.deleteOne({ discountId });

        if (result.deletedCount == 1) {
            return json(
                {
                    message: 'Sconto eliminato con successo'
                },
                {
                    status: 200
                });
        }

        return json(
            {
                message: 'Nessun sconto trovato con l\'ID specificato'
            },
            {
                status: 400
            });

    } catch (err) {
        console.error('Errore durante l\'eliminazione dello sconto:', err);
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