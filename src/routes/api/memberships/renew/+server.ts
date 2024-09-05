// api/membership/new
import { json } from '@sveltejs/kit';
import { User } from '$lib/models/Users.model';
import dbConnect from '$lib/database';

export const POST = async ({ request }) => {
    const body = await request.json();

    const {
        id,
        membershipActivation,
        membershipStatus,
        membershipExpiry
    } = body;

    try {
        await dbConnect();
        const filter = {
            _id: id,
            'membership.membershipSignUp': { $ne: '' }
        };

        // Costruiamo l'update usando l'operatore $set per aggiornare campi specifici all'interno dell'array
        const update = {
            $set: {
                'membership.membershipActivation': membershipActivation,
                'membership.membershipStatus': membershipStatus,
                'membership.membershipExpiry': membershipExpiry
            }
        };

        const newData = await Users.updateOne(filter, update, {
            new: true
        }).lean();

        if (newData.matchedCount == 0) {
            return json({
                message: 'Rinnovo NON effettuato!',
                status: 200
            });
        }

        if (newData.matchedCount == 1) {
            return json({
                message: 'Rinnovo evvenuto con successo',
                status: 200
            });
        }

        return json({
            message: 'POST Rinnovo update ERR',
            status: 500
        });
    } catch (err) {
        console.log('POST User update ERROR:', err);
        return json(
            {
                error: `Server error: ${err}`
            },
            {
                status: 500
            }
        );
    }
}

