// api/memberships/new
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

        if (newData.matchedCount == 1) {
            return json(
                {
                    message: 'membership evvenuta con successo',
                    ok: true,
                },
                {
                    status: 200
                });
        }

        return json({
            message: 'membership ERR',
        },
            {
                status: 400
            });
    } catch (err) {
        console.log('membership ERROR:', err);
        return json(
            {
                error: `Server error: ${err}`
            },
            {
                status: 500
            })
    }
}
