// POST `${BASE_URL}/api/stripe/webhook`
//
// Stripe calls this independently of the browser, so it is what actually writes orders now.
//
//   checkout.session.completed -> materialise the pending order (idempotent)
//   payment_intent.succeeded   -> record the captured payment in `stripe_payments`
//   charge.refunded            -> update the recorded refund amount
//
// Setup:
//   1. STRIPE_WEBHOOK_SECRET must be present in .env
//   2. Stripe dashboard -> Developers -> Webhooks -> Add endpoint
//        URL:     https://associazione.riflessologiadienchan.it/api/stripe/webhook
//        Events:  checkout.session.completed, payment_intent.succeeded, charge.refunded
//        API version: pin the same version as STRIPE_API in .env
//   3. copy the signing secret into STRIPE_WEBHOOK_SECRET and redeploy
//
// Until step 1-3 are done this endpoint returns 503 and does nothing else.
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import dbConnect from '$lib/server/mongo/database';
import { StripePayment } from '$lib/server/mongo/schema/StripePayments.model';
import { materializeCheckout } from '$lib/server/checkout';

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

		switch (event.type) {
			// ---- the payment succeeded: create the order ----
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				const token = session.metadata?.pendingCheckoutToken;
				if (!token) {
					console.error('checkout.session.completed without pendingCheckoutToken', session.id);
					break;
				}

				// only materialise once the money is actually there
				if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
					console.warn('checkout.session.completed but payment_status =', session.payment_status);
					break;
				}

				const result = await materializeCheckout(token, {
					sessionId: session.id,
					paymentIntentId:
						typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
					eventId: event.id
				});

				if (!result.ok) {
					if (result.notFound) {
						// The pending record is written *before* the Stripe session is created, so a
						// missing token cannot mean a lost order. Acknowledge it: returning 500 would
						// make Stripe retry forever and eventually disable the endpoint.
						console.error('checkout.session.completed for unknown token', token, session.id);
						break;
					}
					// 500 so Stripe retries rather than dropping the order on the floor
					console.error('materialise failed for token', token, result.error);
					return json({ message: 'materialise failed' }, { status: 500 });
				}
				console.log(
					`checkout.session.completed -> order ${result.orderId}${result.alreadyProcessed ? ' (already processed)' : ''}`
				);
				break;
			}

			// ---- mirror every captured payment, so a leak is always detectable ----
			case 'payment_intent.succeeded': {
				const pi = event.data.object as Stripe.PaymentIntent;
				const charge = pi.latest_charge
					? await stripe.charges.retrieve(
							typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge.id
						)
					: null;

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
				break;
			}

			case 'charge.refunded': {
				const ch = event.data.object as Stripe.Charge;
				const pi = typeof ch.payment_intent === 'string' ? ch.payment_intent : ch.payment_intent?.id;
				if (pi) {
					await StripePayment.updateOne({ paymentIntentId: pi }, { $set: { amountRefunded: ch.amount_refunded } });
				}
				break;
			}

			default:
				break;
		}

		return json({ received: true }, { status: 200 });
	} catch (err) {
		console.error('stripe webhook handler error:', err);
		return json({ message: 'handler error' }, { status: 500 });
	}
};
