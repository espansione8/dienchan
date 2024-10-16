// api/membership/
import { json } from '@sveltejs/kit';
import { User } from '$lib/models/Users.model';
import dbConnect from '$lib/database';

export const POST = async ({ request }) => {
    const body = await request.json();

    const {
        id,
        membershipLevel,
        membershipSignUp,
        membershipActivation,
        membershipStatus,
        membershipExpiry
    } = body;

    try {
        await dbConnect();

        // REGISTRARE UTENTE
        //////
        // REGISTRARE membership
        const filter = {
            _id: id,
            'membership.membershipLevel': ''
        };
        const update = {
            'membership.membershipLevel': membershipLevel,
            'membership.membershipSignUp': membershipSignUp,
            'membership.membershipActivation': membershipActivation,
            'membership.membershipStatus': membershipStatus,
            'membership.membershipExpiry': membershipExpiry,
        }

        const newData = await User.updateOne(filter, update, {
            new: true
        }).lean();

        if (newData.matchedCount == 0) {
            return json({
                message: 'Utente già socio!',
            },
                {
                    status: 400
                });
        }

        if (newData.matchedCount == 1) {
            return json(
                {
                    message: 'Assocciazione evvenuta con successo'
                },
                {
                    status: 200
                }
            );
        }

        return json({
            message: 'POST User update ERR',
        },
            {
                status: 400
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
