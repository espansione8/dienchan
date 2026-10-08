// POST `${BASE_URL}/api/stripe/webhook`
//
// Stripe calls this the moment a payment is captured, independently of the browser.
// It records every captured payment in `stripe_payments`, so a payment can never again
// exist only in Stripe. The reconciliation job then flags any recorded payment that
// never got an order.
//
// Setup:
//   1. add STRIPE_WEBHOOK_SECRET to .env   (from the Stripe dashboard / CLI)
//   2. Stripe dashboard -> Developers -> Webhooks -> Add endpoint
//        URL:     https://associazione.riflessologiadienchan.it/api/stripe/webhook
//        Events:  payment_intent.succeeded, charge.succeeded, charge.refunded
//   3. copy the signing secret into STRIPE_WEBHOOK_SECRET and redeploy
//
// Until step 1-3 are done this endpoint returns 503 and does nothing else.
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import dbConnect from '$lib/server/mongo/database';
import { StripePayment } from '$lib/server/mongo/schema/StripePayments.model';

const stripe = new Stripe(env.STRIPE_KEY_BACK);

export const POST: RequestHandler = async ({ request }) => {
	const secret = env.STRIPE_WEBHOOK_SECRET;
	if (!secret) {
		console.error('stripe webhook: STRIPE_WEBHOOK_SECRET not configured');
		return json({ message: 'webhook not configured' }, { status: 503 });
	}

	const signature = request.headers.get('stripe-signature');
	if (!signature) return json({ message: 'missing signature' }, { status: 400 });

	const raw = await request.text(); // raw body is required for signature verification

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(raw, signature, secret);
	} catch (err: any) {
		console.error('stripe webhook signature error:', err.message);
		return json({ message: 'invalid signature' }, { status: 400 });
	}

	try {
		await dbConnect();

		if (event.type === 'payment_intent.succeeded') {
			const pi = event.data.object as Stripe.PaymentIntent;
			const charge = pi.latest_charge
				? await stripe.charges.retrieve(typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge.id)
				: null;

			// upsert on paymentIntentId; the unique eventId makes replays a no-op
			await StripePayment.updateOne(
				{ paymentIntentId: pi.id },
				{
					$setOnInsert: { eventId: event.id },
					$set: {
						chargeId: charge?.id ?? null,
						amount: pi.amount_received || pi.amount,
						amountRefunded: charge?.amount_refunded ?? 0,
						currency: pi.currency,
						status: pi.status,
						paid: charge?.paid ?? true,
						email: (pi.metadata?.email || charge?.billing_details?.email || '').toLowerCase() || null,
						name: pi.metadata?.name || charge?.billing_details?.name || null,
						paymentMethodType: charge?.payment_method_details?.type ?? null,
						threeDSecure: charge?.payment_method_details?.card?.three_d_secure?.result ?? null,
						stripeCreated: new Date(pi.created * 1000),
						metadata: pi.metadata ?? {}
					}
				},
				{ upsert: true }
			);
		} else if (event.type === 'charge.refunded') {
			const ch = event.data.object as Stripe.Charge;
			const pi = typeof ch.payment_intent === 'string' ? ch.payment_intent : ch.payment_intent?.id;
			if (pi) await StripePayment.updateOne({ paymentIntentId: pi }, { $set: { amountRefunded: ch.amount_refunded } });
		}
		// charge.succeeded is covered by payment_intent.succeeded; add handlers here if needed.

		return json({ received: true }, { status: 200 });
	} catch (err) {
		// Return 500 so Stripe retries instead of silently dropping the event.
		console.error('stripe webhook handler error:', err);
		return json({ message: 'handler error' }, { status: 500 });
	}
};
