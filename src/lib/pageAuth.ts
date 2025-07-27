import { redirect } from '@sveltejs/kit';

// STANDARD MODE in +page.server.ts
// import { pageAuth } from '$lib/pageAuth';
// export const load: PageServerLoad = async ({ fetch, locals, url }) => {
// pageAuth(url.pathname, locals.auth, 'route|page'); 

// MANUAL MODE +page.server.ts
// if (!locals.auth) {
// 		throw redirect(302, '/login');
// 	}

const protectedRoutes = [
    '/app',
    '/dashboard',
    // prefix dir
]

const protectedPages = [
    '/cart',
    '/course-table',
    '/discount-table',
    '/layout-table',
    '/membership-table',
    '/order-table',
    '/product-table',
    '/profile-modify',
    '/user-table',
    // page dir
]

export const pageAuth = (url: string, auth: boolean | null, mode: string) => {
    let checkPath = false;
    if (mode == 'route') checkPath = protectedRoutes.some(route => url.startsWith(route))
    if (mode == 'page') checkPath = protectedPages.some(route => url == route)
    if (checkPath && !auth) {
        throw redirect(302, '/login');
    }
}