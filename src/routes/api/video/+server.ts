import { json } from '@sveltejs/kit';
import { APIKEY, BASE_URL } from '$env/static/private';

import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, fetch }) => {
    const { level } = await request.json();

    if (!level) {
        return json([], { status: 200 });
    }

    try {
        const res = await fetch(`${BASE_URL}/api/mongo/find`, {
            method: 'POST',
            body: JSON.stringify({
                apiKey: APIKEY,
                schema: 'video',
                query: {
                    status: 'enabled',
                    visibility: { $in: [level] }
                },
                projection: { _id: 0 },
                sort: { createdAt: 1 },
                limit: 100,
                skip: 0
            }),
            headers: {
                'Content-Type': 'application/json',
                'x-internal-call': 'true'
            }
        });

        if (!res.ok) {
            console.error('Failed to fetch videos:', await res.text());
            return json([], { status: 200 });
        }

        const videos = await res.json();
        return json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return json([], { status: 200 });
    }
};