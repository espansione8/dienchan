// src/routes/api/find1/
import { json } from '@sveltejs/kit';
import { User } from '$lib/models/Users.model';

export const GET = async ({ request }) => {
    //const body = await request.json();

    // const {
    //     apiKey,
    //     query,
    //     projection,
    //     sort,
    //     limit,
    //     skip
    // } = body;

    const apiKey = '5yGwElqC4!Jgqf74C!aNyu3!'
    const query = { userId: "4184122015" };
    //const projection = { _id: 0, password: 0 } // 0: exclude | 1: include
    //const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
    const limit = 1000;
    const skip = 0;

    if (apiKey !== '5yGwElqC4!Jgqf74C!aNyu3!') {
        return json(
            {
                error: `Errore del server: apiKey non valida`,
            },
            {
                status: 500
            }
        );
    }


    try {
        //res.status(200).json({ response: { apiKey, schema, query, limit }, success: true });
        const response = await User.find(query)
            //.sort(sort)
            .limit(limit)
            .skip(skip)
            .lean().exec();

        if (response) {
            return json({ response, success: true }, { status: 200 });
        } // res.status(200).json({ response, success: true });// return json(find, { status: 200 }); 
        return json({ message: 'search error' }, { status: 400 }); // res.status(400).json({ response, success: false }); // return json({ message: 'search error' }, { status: 400 });
    } catch (error) {
        console.log('find promoattiva ERROR:', error);
        return json({ message: ' error' }, { status: 500 });
        //res.status(500).json({ response: error, success: false });
    }
};
