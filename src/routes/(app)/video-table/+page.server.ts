import type { PageServerLoad, Actions } from './$types';
import { BASE_URL, APIKEY } from '$env/static/private';
import { fail, error } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
    pageAuth(url.pathname, locals.auth, 'page');

    let getTable = [];

    const videoFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
        method: 'POST',
        body: JSON.stringify({
            apiKey: APIKEY,
            schema: 'video',
            query: {},
            projection: { _id: 0 },
            sort: { createdAt: 1 },  
            limit: 0,
            skip: 0
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    try {
        if (videoFetch.status !== 200) {
            const errorText = await videoFetch.text();
            console.error('Video fetch failed', videoFetch.status, errorText);
            throw error(400, errorText);
        }

        getTable = await videoFetch.json();

    } catch (error) {
        console.log('page fetch error:', error);
        throw error(500, 'Server error');
    }

    return {
        getTable,
        auth: locals.auth
    };
};

export const actions: Actions = {
    new: async ({ request, fetch }) => {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const url = formData.get('url') as string;
        const visibility = formData.getAll('visibility') as string[];

        if (!title || !url || !visibility.length) {
            return fail(400, { action: 'new', success: false, message: 'Dati mancanti' });
        }

        const videoId = Math.random().toString(36).substring(2, 15).toUpperCase();

        try {
            const resInsert = await fetch(`${BASE_URL}/api/mongo/create`, {
                method: 'POST',
                body: JSON.stringify({
                    apiKey: APIKEY,
                    schema: 'video',
                    newDoc: {
                        videoId,
                        title,
                        url,
                        visibility,
                        status: 'enabled'
                    }
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!resInsert.ok) {
                const errorText = await resInsert.text();
                console.error('video insert failed', resInsert.status, errorText);
                return fail(400, { action: 'new', success: false, message: errorText });
            }

            const result = await resInsert.json();
            return { action: 'new', success: true, message: 'Video creato con successo' };

        } catch (error) {
            console.error('Error video new:', error);
            return fail(400, { action: 'new', success: false, message: 'Error video new' });
        }
    },

    modify: async ({ request, fetch }) => {
        const formData = await request.formData();
        const videoId = formData.get('videoId') as string;
        const title = formData.get('title') as string;
        const url = formData.get('url') as string;
        const status = formData.get('status') as string;
        const visibility = formData.getAll('visibility') as string[];

        if (!videoId) {
            return fail(400, { action: 'modify', success: false, message: 'Dati mancanti' });
        }

        try {
            const resUpdate = await fetch(`${BASE_URL}/api/mongo/update`, {
                method: 'POST',
                body: JSON.stringify({
                    apiKey: APIKEY,
                    schema: 'video',
                    query: { videoId },
                    update: {
                        $set: {
                            ...(title && { title }),
                            ...(url && { url }),
                            ...(status && { status }),
                            ...(visibility.length && { visibility })
                        }
                    },
                    options: { upsert: false },
                    multi: false
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!resUpdate.ok) {
                const errorText = await resUpdate.text();
                console.error('video update failed', resUpdate.status, errorText);
                return fail(400, { action: 'modify', success: false, message: errorText });
            }

            const result = await resUpdate.json();
            return { action: 'modify', success: true, message: result.message };

        } catch (error) {
            console.error('Error video modify:', error);
            return fail(400, { action: 'modify', success: false, message: 'Error video modify' });
        }
    },

    delete: async ({ request, fetch }) => {
        const formData = await request.formData();
        const videoId = formData.get('videoId') as string;

        if (!videoId) {
            return fail(400, { action: 'delete', success: false, message: 'Dati mancanti' });
        }

        try {
            const resFetch = await fetch(`${BASE_URL}/api/mongo/remove`, {
                method: 'POST',
                body: JSON.stringify({
                    apiKey: APIKEY,
                    schema: 'video',
                    query: { videoId },
                    multi: false
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!resFetch.ok) {
                const errorText = await resFetch.text();
                console.error('video delete failed', resFetch.status, errorText);
                return fail(400, { action: 'delete', success: false, message: errorText });
            }

            const result = await resFetch.json();
            return { action: 'delete', success: true, message: result.message };

        } catch (error) {
            console.error('Error video delete:', error);
            return fail(400, { action: 'delete', success: false, message: 'Error video delete' });
        }
    },

    toggleStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const videoId = formData.get('videoId') as string;
		const status = formData.get('status') as string;

		if (!videoId || !status) {
			return fail(400, { action: 'toggleStatus', success: false, message: 'Dati mancanti' });
		}

		try {
			const resUpdate = await fetch(`${BASE_URL}/api/mongo/update`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'video',
					query: { videoId },
					update: {
						$set: { status }
					},
					options: { upsert: false },
					multi: false
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!resUpdate.ok) {
				const errorText = await resUpdate.text();
				console.error('video status toggle failed', resUpdate.status, errorText);
				return fail(400, { action: 'toggleStatus', success: false, message: errorText });
			}

			const result = await resUpdate.json();
			return { action: 'toggleStatus', success: true, message: 'Status aggiornato' };

		} catch (error) {
			console.error('Error video toggleStatus:', error);
			return fail(400, { action: 'toggleStatus', success: false, message: 'Error toggleStatus' });
		}
	}
} satisfies Actions;