
// src/routes/api/courses/remove
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Product } from '$lib/models/Products.model';

export const DELETE = async ({ request }) => {
    const body = await request.json();
    const { prodId } = body;
    try {
        // Connecting to DB
        await dbConnect();
        // Find and delete the discount with the specified userId
        const result = await Product.deleteOne({ prodId });

        if (result.deletedCount == 1) {
            return json({
                message: 'Corso eliminato con successo',
                status: 200
            });
        }

        return json({
            message: 'Nessun corso trovato con l\'ID specificato',
            status: 404
        });

    } catch (err) {
        console.error('Errore durante l\'eliminazione del corso:', err);
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