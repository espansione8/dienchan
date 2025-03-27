// // api/membership/update
import { json } from '@sveltejs/kit';
import { User } from '$lib/models/Users.model';
import dbConnect from '$lib/database';

export const POST = async ({ request }) => {
    const body = await request.json();

    const {
        userId,
        membershipLevel,
        membershipSignUp,
        membershipActivation,
        membershipExpiry,
        membershipStatus,
    } = body;

    try {
        await dbConnect();

        // Trova l'utente per ID
        const existingUser = await User.findOne({ userId });

        // Controlla se l'utente esiste
        if (!existingUser) {
            return json({
                message: 'Utente non trovato!',
                ok: false,
            }, {
                status: 400
            });
        }

        // Controlla se l'utente ha già un'associazione attiva
        if (existingUser.membership && existingUser.membership.membershipStatus === 'active') {
            return json({
                message: 'Utente già associato!',
                ok: false,
                action: 'rinnovo', // Aggiunta di un messaggio per il rinnovo
            }, {
                status: 400
            });
        }

        // Aggiorna i dettagli della membership
        const update = {
            'membership.membershipLevel': membershipLevel,
            'membership.membershipSignUp': membershipSignUp,
            'membership.membershipActivation': membershipActivation,
            'membership.membershipExpiry': membershipExpiry,
            'membership.membershipStatus': membershipStatus,
        };

        const updatedUser = await User.updateOne({ userId }, update, {
            new: true
        }).lean();

        if (updatedUser.matchedCount === 0) {
            return json({
                message: 'Errore durante l\'aggiornamento. Utente non trovato!',
                ok: false,
            }, {
                status: 400
            });
        }

        return json({
            message: 'Associazione aggiornata con successo',
            ok: true,
        }, {
            status: 200
        });

    } catch (err) {
        console.log('POST User update ERROR:', err);
        return json({
            error: `Errore del server: ${err}`,
            ok: false,
        }, {
            status: 500
        });
    }
}
