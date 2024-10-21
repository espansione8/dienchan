import { redirect } from '@sveltejs/kit';

// in +page.server.ts
// import { checkAuth } from '$lib/auth';
// export const load: PageServerLoad = async ({ fetch, locals, url }) => {
// checkAuth(url.pathname, locals.auth, 'route|page'); 

const protectedRoutes = [
    '/app',
    '/dashboard',
    // prefix dir
]

const protectedPages = [
    '/product-table',
    '/profile',
    // prefix dir
]

export const checkAuth = (url: string, auth: boolean, mode: string) => {
    let checkPath = false;
    if (mode == 'route') checkPath = protectedRoutes.some(route => url.startsWith(route))
    if (mode == 'page') checkPath = protectedPages.some(route => url == route)
    if (checkPath && !auth) {
        throw redirect(302, '/login');
    }
}