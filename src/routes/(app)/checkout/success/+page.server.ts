import type { PageServerLoad } from './$types';
import Stripe from 'stripe';
// $env/static/private ONLY — see the note in lib/server/checkout.ts. The dynamic form is empty at
// runtime in production, which silently disabled this reconcile and lost the order.
import { STRIPE_KEY_BACK } from '$env/static/private';
import dbConnect from '$lib/server/mongo/database';
import { PendingCheckout } from '$lib/server/mongo/schema/PendingCheckouts.model';
import {
	claimAutoLogin,
	reconcileCheckoutFromStripe,
	CHECKOUT_NONCE_COOKIE,
	STRIPE_API_VERSION
} from '$lib/server/checkout';

/**
 * Landing page after Stripe redirects the customer back.
 *
 * The order itself is written by the webhook, which may still be in flight, so this page
 * reports what it knows rather than assuming success — and if the webhook never arrived at all,
 * it reconciles the payment directly from Stripe before reporting (see `reconcileCheckoutFromStripe`).
 *
 * Auto-login is bound to the browser that started the checkout: the httpOnly nonce cookie must
 * match the nonce recorded on the pending checkout, and the claim is single-use. A leaked or
 * guessed `?session_id=` therefore cannot be replayed to take over the new account.
 */
export const load: PageServerLoad = async ({ url, cookies, locals }) => {
	const sessionId = url.searchParams.get('session_id');

	let state: 'unknown' | 'processing' | 'done' = 'unknown';
	let flow: string | null = null;
	// What Stripe actually reported: null when we could not ask, so the page never claims a
	// payment happened on the strength of a pending record alone.
	let paid: boolean | null = null;

	if (sessionId) {
		try {
			await dbConnect();
			let pending = await PendingCheckout.findOne({ sessionId }).lean<any>();

			// The webhook normally writes the order. If it never arrived, the payment would be
			// recorded nowhere at all, so use the second chance the returning customer gives us
			// and reconcile straight from Stripe before reporting a state.
			if (pending && !pending.materializedOrderId) {
				const outcome = await reconcileCheckoutFromStripe(
					sessionId,
					new Stripe(STRIPE_KEY_BACK, { apiVersion: STRIPE_API_VERSION })
				);
				if (outcome.reconciled) console.log('checkout success: reconciled', sessionId, outcome.reason);
				if (outcome.paymentStatus !== undefined) {
					paid = outcome.paymentStatus === 'paid' || outcome.paymentStatus === 'no_payment_required';
				}
				pending = await PendingCheckout.findOne({ sessionId }).lean<any>();
			}

			if (pending) {
				flow = pending.flow ?? null;
				if (pending.materializedOrderId) {
					state = 'done';
					paid = true;
				} else {
					state = 'processing';
				}
			}

			if (!locals.auth) {
				const claimed = await claimAutoLogin(sessionId, cookies.get(CHECKOUT_NONCE_COOKIE));
				if (claimed) {
					cookies.set('session_id', claimed.cookieId, {
						httpOnly: true,
						maxAge: 60 * 60 * 24,
						sameSite: 'lax',
						secure: process.env.NODE_ENV === 'production',
						path: '/'
					});
					cookies.delete(CHECKOUT_NONCE_COOKIE, { path: '/checkout' });
				}
			}
		} catch (err) {
			console.error('checkout success load error:', err);
		}
	}

	return { state, flow, sessionId, paid };
};
