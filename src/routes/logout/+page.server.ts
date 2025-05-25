import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

const apiKey = import.meta.env.VITE_APIKEY;
const baseApiUrl = import.meta.env.VITE_BASE_URL;

export const actions: Actions = {
    default: async ({ fetch, cookies }) => {
        try {
            const session_id = cookies.get('session_id');
            const query = { cookieId: session_id }; // 'course', 'product', 'membership', 'event'
            const update = { $set: { cookieId: '' } };
            const options = { upsert: false }
            const multi = false

            const res = await fetch(`${baseApiUrl}/api/mongo/update`, {
                method: 'POST',
                body: JSON.stringify({
                    apiKey,
                    schema: 'user', //product | order | user | layout | discount
                    query,
                    update,
                    options,
                    multi
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.status != 200) {
                const errorText = await res.text();
                console.error('sign-out failed', res.status, errorText);
                return fail(400, { action: 'logout', success: false, message: errorText });
            }
            cookies.delete('session_id', { path: '/' });
        } catch (error) {
            console.error('ERROR logout:', error);
            return fail(500, { action: 'logout', success: false, message: 'ERROR logout' });
        }
        throw redirect(303, '/login');
    }
};