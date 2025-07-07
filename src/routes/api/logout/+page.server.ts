import type { Actions } from './$types';
import { BASE_URL, APIKEY } from '$env/static/private';
import { redirect, error } from '@sveltejs/kit';

// NOTE USE THIS FOR FORM ACTION
export const actions: Actions = {
    default: async ({ fetch, cookies }) => {
        const session_id = cookies.get('session_id')

        if (!session_id) {
            throw error(400, 'No active session found');
        }

        cookies.delete('session_id', { path: '/' });

        try {
            const res = await fetch(`${BASE_URL}/api/mongo/update`, {
                method: 'POST',
                body: JSON.stringify({
                    apiKey: APIKEY,
                    schema: 'user', //product | order | user | layout | discount
                    query: { cookieId: session_id }, // 'course', 'product', 'membership', 'event'
                    update: { $set: { cookieId: '' } },
                    options: { upsert: false },
                    multi: false
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error('sign-out failed', res.status, errorText);
                throw error(400, errorText);
            }
        } catch (err) {
            console.error('ERROR logout:', err);
            throw error(500, 'ERROR logout');
        }
        throw redirect(303, '/login');
    }
};