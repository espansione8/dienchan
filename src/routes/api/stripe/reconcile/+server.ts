// POST `${BASE_URL}/api/stripe/reconcile`
//
// Runs the checkout sweep on demand: finds checkouts that were paid but never became orders,
// and writes them. The same sweep also runs on a timer inside the server (see
// `startCheckoutSweep`), so this endpoint is only needed to trigger it manually or from an
// external scheduler.
//
//   curl -X POST https://<site>/api/stripe/reconcile \
//        -H 'Content-Type: application/json' -d '{"apiKey":"<APIKEY>"}'
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { APIKEY } from '$env/static/private';
import { timingSafeEqual } from 'crypto';
import { sweepPendingCheckouts } from '$lib/server/checkout';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}) as any);

	const provided = Buffer.from(String(body?.apiKey ?? ''));
	const expected = Buffer.from(APIKEY);
	if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
		return json({ message: 'api error' }, { status: 401 });
	}

	const result = await sweepPendingCheckouts();
	return json({ message: 'sweep done', ...result }, { status: 200 });
};
