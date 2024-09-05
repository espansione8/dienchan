import { json } from '@sveltejs/kit';
import { Users } from '$lib/models/Users.model';
import dbConnect from '$lib/database';



export const POST = async ({ request }) => {
    const body = await request.json();

    const {
        id
    } = body;

    try {
        await dbConnect();
        const filter = {
            _id: id,
            'membership.membershipLevel': ''
        };
        const update = {
            'membership.membershipLevel': body.membershipLevel,
            'membership.membershipSignUp': body.membershipSignUp,
            'membership.membershipActivation': body.membershipActivation,
            'membership.membershipStatus': body.membershipStatus,
            'membership.membershipExpiry': body.membershipExpiry
        }

        const newData = await Users.updateOne(filter, update, {
            new: true
        }).lean();

        if (newData.matchedCount == 0) {
            return json({
                message: 'Utente già socio!',
                status: 200
            });
        }

        if (newData.matchedCount == 1) {
            return json({
                message: 'Assocciazione evvenuta con successo',
                status: 200
            });
        }

        return json({
            message: 'POST User update ERR',
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

