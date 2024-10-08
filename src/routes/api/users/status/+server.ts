// src/routes/api/users/status
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { User } from '$lib/models/Users.model';

//import { File } from 'nft.storage';

export const POST = async ({ request }) => {
    const body = await request.json();
    const {
        userId,
        status,
    } = body;


    try {
        // Connecting to DB
        // All database code can only run inside async functions as it uses await
        await dbConnect();
        // Is there a user with such an email?
        const filter = { userId };

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


        const result = await User.updateOne(filter, update);

        if (result.matchedCount == 1) {
            return json({
                message: 'Status utente aggiornato',
                status: 200
            });
        }

        return json({
            message: 'Nessun utente trovato con l\'ID specificato',
            status: 404
        });

    } catch (err) {
        console.error('Errore durante l\'aggiornamento dello status utente:', err);
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