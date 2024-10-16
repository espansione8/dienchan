// src/routes/api/users/remove
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { User } from '$lib/models/Users.model';

export const DELETE = async ({ request }) => {
    const body = await request.json();
    const { userId } = body;
    try {
        // Connecting to DB
        await dbConnect();
        // Find and delete the discount with the specified userId
        const result = await User.deleteOne({ userId });

        if (result.deletedCount == 1) {
            return json({
                message: 'Utente eliminato con successo',
            },
                {
                    status: 200
                });
        }

        return json({
            message: 'Nessun utente trovato con l\'ID specificato',
        },
            {
                status: 400
            });

    } catch (err) {
        console.error('Errore durante l\'eliminazione dell utente:', err);
        return json(
            {
                error: `Errore del server: ${err.message}`
            },
            {
                status: 500
            });
    }
};