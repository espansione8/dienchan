// api/membership/new-course
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

        const update = {
            'membership.membershipLevel': membershipLevel,
            'membership.membershipSignUp': membershipSignUp,
            'membership.membershipActivation': membershipActivation,
            'membership.membershipExpiry': membershipExpiry,
            'membership.membershipStatus': membershipStatus,
        }

        const newData = await User.updateOne({ userId }, update, {
            new: true
        }).lean();

        if (newData.matchedCount == 0) {
            return json({
                message: 'Utente già socio!',
            },
                {
                    status: 500
                });
        }

        if (newData.matchedCount == 1) {
            return json({
                message: 'Assocciazione evvenuta con successo',
                ok: true,
            },
                {
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
            })
    }
}
