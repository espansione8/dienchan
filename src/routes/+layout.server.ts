import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        //user: locals.user,
        user: locals.user,
        auth: locals.auth,
        //session: locals.session
    };
};