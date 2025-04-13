// src/routes/api/users/modify
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/db/mongo/database';
import { User } from '$lib/db/mongo/schema/Users.model';

//import { File } from 'nft.storage';

export const POST = async ({ request }) => {
    const body = await request.json();
    const {
        userId,
        name,
        surname,
        email,
        address,
        postalCode,
        city,
        countryState,
        country,
        phone,
        mobilePhone,
        level,
        namePublic,
        surnamePublic,
        emailPublic,
        addressPublic,
        cityPublic,
        statePublic,
        postalCodePublic,
        countryPublic,
        phonePublic,
        mobilePhonePublic
    } = body;


    try {

        // console.log('body', body);
        // Connecting to DB
        // All database code can only run inside async functions as it uses await
        await dbConnect();
        // Is there a user with such an email?
        const filter = { userId };

        const update = {
            name,
            surname,
            email,
            address,
            postalCode,
            city,
            countryState,
            country,
            phone,
            mobilePhone,
            level,
            namePublic,
            surnamePublic,
            emailPublic,
            addressPublic,
            cityPublic,
            statePublic,
            postalCodePublic,
            countryPublic,
            phonePublic,
            mobilePhonePublic
        };


        const result = await User.updateOne(filter, update);

        if (result.matchedCount == 1) {
            return json({
                message: 'Utente aggiornato'
            },
                {
                    status: 200
                });
        }

        return json({
            message: 'Nessun utente trovato con l\'ID specificato'
        },
            {
                status: 400
            });


    } catch (err) {
        console.error('Errore durante l\'aggiornamento dell utente:', err);
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