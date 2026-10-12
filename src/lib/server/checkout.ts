/**
 * Shared Stripe hosted-Checkout plumbing.
 *
 * Lifecycle:
 *   1. a route action validates the form and calls `createCheckoutSession()`
 *   2. the customer pays on Stripe and is redirected back
 *   3. the webhook calls `materializeCheckout()`, which creates the order and runs
 *      the flow's side effects exactly once
 *
 * The order is therefore written by Stripe's webhook, never by the browser. A customer who
 * closes the tab after paying still gets their order.
 */
import { BASE_URL, APIKEY } from '$env/static/private';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
import dbConnect from '$lib/server/mongo/database';
import { Order } from '$lib/server/mongo/schema/Orders.model';
import { User } from '$lib/server/mongo/schema/Users.model';
import { PendingCheckout } from '$lib/server/mongo/schema/PendingCheckouts.model';

// The existing model modules export `models.X || model(...)`, which TypeScript widens to a union
// of two incompatible Model types. Narrow them here so the queries below type-check.
const UserModel = User as mongoose.Model<any>;
const OrderModel = Order as mongoose.Model<any>;

const nanoid9 = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 9);
const nanoid12 = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12);
const tokenId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 24);

export type CheckoutFlow =
	| 'membership-new'
	| 'membership-renew'
	| 'membership-insurance'
	| 'cart'
	| 'course'
	| 'insurance';

export interface CreateCheckoutArgs {
	flow: CheckoutFlow;
	amountCents: number;
	email: string;
	name?: string;
	surname?: string;
	/** everything the materialiser needs; must be JSON-serialisable */
	payload: Record<string, any>;
	successPath?: string;
	cancelPath?: string;
	stripe: Stripe;
}

export interface CheckoutSessionResult {
	url: string;
	token: string;
	sessionId: string;
	/** mirrored into an httpOnly cookie so the success page can prove which browser paid */
	loginNonce: string;
}

/**
 * Persist the prepared checkout, then open a Stripe Checkout Session for it.
 * Returns the URL to redirect the customer to.
 */
export async function createCheckoutSession(args: CreateCheckoutArgs): Promise<CheckoutSessionResult> {
	const { flow, amountCents, email, name, surname, payload, stripe } = args;
	if (!Number.isInteger(amountCents) || amountCents < 50) {
		throw new Error(`Invalid checkout amount: ${amountCents}`);
	}

	await dbConnect();

	const token = tokenId();
	const orderId = nanoid12();
	const orderCode = crypto.randomUUID();
	const loginNonce = tokenId();

	const base = BASE_URL.replace(/\/$/, '');
	const successPath = args.successPath ?? '/checkout/success';
	const cancelPath = args.cancelPath ?? '/checkout/cancel';

	// Persist first: if anything fails after this point we still have a record of the intent,
	// and the webhook can always find the token. The reverse order could orphan a real payment.
	await PendingCheckout.create({
		token,
		flow,
		status: 'pending',
		orderId,
		orderCode,
		amount: amountCents,
		currency: 'eur',
		email: (email || '').toLowerCase(),
		name: name ?? null,
		surname: surname ?? null,
		payload,
		loginNonce
	});

	const session = await stripe.checkout.sessions.create(
		{
			mode: 'payment',
			// card only: the hosted page handles SCA/3DS itself
			payment_method_types: ['card'],
			customer_email: email || undefined,
			line_items: [
				{
					quantity: 1,
					price_data: {
						currency: 'eur',
						unit_amount: amountCents,
						product_data: {
							name: payload.productTitle || 'Associazione Diện Chẩn'
						}
					}
				}
			],
			metadata: { pendingCheckoutToken: token, flow },
			// also on the PaymentIntent, so the webhook can find it from either event
			payment_intent_data: { metadata: { pendingCheckoutToken: token, flow } },
			success_url: `${base}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${base}${cancelPath}?flow=${flow}`
		},
		{ idempotencyKey: `checkout-${token}` }
	);

	await PendingCheckout.updateOne({ token }, { $set: { sessionId: session.id } });

	return { url: session.url!, token, sessionId: session.id, loginNonce };
}

// --------------------------------------------------------------------------- offline orders

/**
 * Create the order straight away for a payment method that is not paid online (bank transfer),
 * by running exactly the same flow handler the webhook would.
 *
 * Routing the offline path through the same materialiser keeps both paths behaviourally
 * identical — stock, points, subscribers, emails — instead of duplicating that logic.
 */
export async function createOfflineCheckout(args: {
	flow: CheckoutFlow;
	amountCents: number;
	email: string;
	name?: string;
	surname?: string;
	payload: Record<string, any>;
}): Promise<{ orderId: string; cookieId: string | null }> {
	await dbConnect();

	const token = tokenId();
	const orderId = nanoid12();
	const orderCode = crypto.randomUUID();

	await PendingCheckout.create({
		token,
		flow: args.flow,
		status: 'pending',
		orderId,
		orderCode,
		amount: args.amountCents,
		currency: 'eur',
		email: (args.email || '').toLowerCase(),
		name: args.name ?? null,
		surname: args.surname ?? null,
		payload: args.payload
	});

	const result = await materializeCheckout(token);
	if (!result.ok) throw new Error(result.error ?? 'offline checkout failed');

	const pending = await PendingCheckout.findOne({ token }).lean<any>();
	return { orderId: result.orderId!, cookieId: pending?.payload?.createdCookieId ?? null };
}

// --------------------------------------------------------------------------- auto-login binding

export const CHECKOUT_NONCE_COOKIE = 'checkout_nonce';

/** Mirror the nonce into an httpOnly cookie scoped to the checkout return path. */
export function setCheckoutNonceCookie(cookies: Cookies, nonce: string) {
	cookies.set(CHECKOUT_NONCE_COOKIE, nonce, {
		httpOnly: true,
		maxAge: 60 * 60,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/checkout'
	});
}

/**
 * Consume the nonce exactly once and hand back the freshly created account, but only if the
 * caller's cookie matches the nonce recorded for this checkout. Returns null when the caller
 * cannot prove it is the browser that paid.
 */
export async function claimAutoLogin(
	sessionId: string | null,
	cookieNonce: string | undefined
): Promise<{ cookieId: string } | null> {
	if (!sessionId || !cookieNonce) return null;
	await dbConnect();

	const pending = await PendingCheckout.findOne({ sessionId }).lean<any>();
	if (!pending || pending.loginNonce !== cookieNonce) return null;

	const cookieId = pending.payload?.createdCookieId;
	if (!cookieId) return null;

	// atomic single-use claim
	const claimed = await PendingCheckout.findOneAndUpdate(
		{ sessionId, loginNonce: cookieNonce, autoLoginConsumed: { $ne: true } },
		{ $set: { autoLoginConsumed: true } }
	);
	if (!claimed) return null;

	return { cookieId };
}

// --------------------------------------------------------------------------- materialise

export interface MaterializeInfo {
	sessionId?: string | null;
	paymentIntentId?: string | null;
	eventId?: string | null;
}

export interface MaterializeResult {
	ok: boolean;
	alreadyProcessed: boolean;
	/** the token has no pending record at all — retrying cannot help */
	notFound?: boolean;
	orderId?: string;
	error?: string;
}

/** A claim older than this is assumed dead and may be reclaimed by a later attempt. */
const STALE_CLAIM_MS = 15 * 60 * 1000;

/**
 * Create the order for a completed checkout, exactly once.
 *
 * Idempotent on two levels: the pending record is claimed atomically (only one caller can move
 * it from 'pending' to 'completed'), and the pre-generated orderId is unique in `orders`.
 */
export async function materializeCheckout(
	token: string,
	info: MaterializeInfo = {}
): Promise<MaterializeResult> {
	await dbConnect();

	// atomic claim — a concurrent/replayed webhook gets null and stops here.
	//
	// A claim can also be reclaimed once it is stale. The record is marked 'completed' before the
	// flow handler runs, so a process that dies in between (deploy, OOM) would otherwise strand
	// the payment for good: every later attempt sees 'completed', reports "already processed" and
	// never writes the order. 15 minutes is far longer than any real materialisation.
	const claimed = await PendingCheckout.findOneAndUpdate(
		{
			token,
			$or: [
				{ status: 'pending' },
				{
					status: 'completed',
					materializedOrderId: null,
					completedAt: { $lt: new Date(Date.now() - STALE_CLAIM_MS) }
				}
			]
		},
		{
			$set: {
				status: 'completed',
				completedAt: new Date(),
				...(info.sessionId ? { sessionId: info.sessionId } : {}),
				...(info.paymentIntentId ? { paymentIntentId: info.paymentIntentId } : {}),
				...(info.eventId ? { completedEventId: info.eventId } : {})
			}
		},
		{ new: true }
	);

	if (!claimed) {
		const existing = await PendingCheckout.findOne({ token }).lean<any>();
		if (!existing) {
			return { ok: false, alreadyProcessed: false, notFound: true, error: 'pending checkout not found' };
		}
		return { ok: true, alreadyProcessed: true, orderId: existing.materializedOrderId ?? undefined };
	}

	try {
		const handler = FLOW_HANDLERS[claimed.flow as CheckoutFlow];
		if (!handler) throw new Error(`No materialiser for flow "${claimed.flow}"`);

		const orderId = await handler(claimed);

		await PendingCheckout.updateOne({ token }, { $set: { materializedOrderId: orderId } });
		return { ok: true, alreadyProcessed: false, orderId };
	} catch (err: any) {
		// release the claim so Stripe's retry can try again
		await PendingCheckout.updateOne(
			{ token },
			{ $set: { status: 'pending', lastError: String(err?.message || err) } }
		);
		console.error('materializeCheckout failed:', err);
		return { ok: false, alreadyProcessed: false, error: String(err?.message || err) };
	}
}

/**
 * Record a completed checkout that the webhook never delivered.
 *
 * The webhook is the primary writer, but a delivery can be missed outright — no endpoint is
 * registered for the Stripe mode in use, the endpoint was disabled after repeated failures, or
 * Stripe simply failed to reach the site. When that happens the payment succeeds and the order
 * is silently lost, which is exactly how payments leaked before.
 *
 * The customer still holds their `session_id` on the success URL, so the payment can be looked
 * up directly and materialised. This is idempotent for the same reason the webhook is: both go
 * through `materializeCheckout()`, which claims the pending record atomically.
 *
 * Never throws — a Stripe outage must not break the page the customer lands on.
 */
export interface ReconcileResult {
	reconciled: boolean;
	reason: string;
	orderId?: string;
	/**
	 * Stripe's `payment_status` for the session, when it could be read at all. Lets the caller
	 * tell "paid but not written yet" apart from "the customer never paid" instead of guessing.
	 */
	paymentStatus?: string | null;
}

export async function reconcileCheckoutFromStripe(
	sessionId: string,
	stripe: Stripe
): Promise<ReconcileResult> {
	await dbConnect();

	const pending = await PendingCheckout.findOne({ sessionId }).lean<any>();
	if (!pending) return { reconciled: false, reason: 'no pending checkout for this session' };
	if (pending.materializedOrderId) {
		return { reconciled: false, reason: 'already materialised', orderId: pending.materializedOrderId };
	}

	let session: Stripe.Checkout.Session;
	try {
		session = await stripe.checkout.sessions.retrieve(sessionId);
	} catch (err: any) {
		return { reconciled: false, reason: `stripe lookup failed: ${err?.message ?? err}` };
	}

	// never create an order for money that was not actually taken
	if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
		return { reconciled: false, reason: `not paid (${session.payment_status})`, paymentStatus: session.payment_status };
	}

	const token = session.metadata?.pendingCheckoutToken ?? pending.token;

	const result = await materializeCheckout(token, {
		sessionId,
		paymentIntentId:
			typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null
	});

	if (!result.ok) {
		return { reconciled: false, reason: result.error ?? 'materialisation failed', paymentStatus: session.payment_status };
	}
	if (result.alreadyProcessed) {
		return { reconciled: false, reason: 'already processed', orderId: result.orderId, paymentStatus: session.payment_status };
	}

	return { reconciled: true, reason: 'materialised from the Stripe session', orderId: result.orderId };
}

// --------------------------------------------------------------------------- background sweep

/** Let the webhook have first refusal: a checkout must be at least this old before the sweep looks. */
const SWEEP_MIN_AGE_MS = 10 * 60 * 1000;
/** Older than this and the checkout was simply abandoned — not worth a Stripe call. */
const SWEEP_LOOKBACK_MS = 48 * 60 * 60 * 1000;
/** Ask Stripe about the same checkout at most this often. */
const SWEEP_REVISIT_MS = 60 * 60 * 1000;
/** How often the sweep runs once the server is up. */
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
/** Delay before the first run, so a boot does not immediately hammer the API. */
const SWEEP_FIRST_DELAY_MS = 60 * 1000;

export interface SweepResult {
	checked: number;
	reconciled: number;
	failed: number;
}

/**
 * Look for checkouts that were paid but never became orders, and write them.
 *
 * This closes the last gap. The webhook is the primary writer, and the success page reconciles
 * when the customer comes back — but a customer who pays and then closes the tab before the
 * redirect is covered by neither, and the money would sit there with no order.
 *
 * Deliberately bounded so it cannot run away:
 *   - only the last 48 hours are considered
 *   - a checkout must be at least 10 minutes old, so a webhook still in flight wins
 *   - each checkout is asked about at most once an hour (`lastSweepAt`)
 *   - at most 50 per pass
 *
 * It only ever materialises a session Stripe reports as `paid`, so an abandoned checkout costs
 * one API call and nothing else.
 */
export async function sweepPendingCheckouts(stripe?: Stripe): Promise<SweepResult> {
	const client = stripe ?? (env.STRIPE_KEY_BACK ? new Stripe(env.STRIPE_KEY_BACK) : null);
	if (!client) return { checked: 0, reconciled: 0, failed: 0 };

	await dbConnect();

	const now = Date.now();
	const candidates = await PendingCheckout.find({
		// 'completed' is included on purpose: it means a claim was taken, not that the order was
		// written. A claim abandoned mid-flight (see STALE_CLAIM_MS) is only reachable here.
		status: { $in: ['pending', 'completed'] },
		materializedOrderId: null,
		sessionId: { $nin: [null, ''] },
		createdAt: { $lte: new Date(now - SWEEP_MIN_AGE_MS), $gte: new Date(now - SWEEP_LOOKBACK_MS) },
		lastSweepAt: { $not: { $gte: new Date(now - SWEEP_REVISIT_MS) } }
	})
		.sort({ createdAt: -1 })
		.limit(50)
		.lean<any>();

	let reconciled = 0;
	let failed = 0;

	for (const pending of candidates) {
		// claim this pass before the API call, so two overlapping sweeps do not both ask
		await PendingCheckout.updateOne({ token: pending.token }, { $set: { lastSweepAt: new Date() } });

		try {
			const outcome = await reconcileCheckoutFromStripe(pending.sessionId, client);
			if (outcome.reconciled) {
				reconciled++;
				console.log(
					`checkout sweep: recovered order ${outcome.orderId} for session ${pending.sessionId} (flow ${pending.flow})`
				);
			}
		} catch (err) {
			failed++;
			console.error('checkout sweep failed for session', pending.sessionId, err);
		}
	}

	return { checked: candidates.length, reconciled, failed };
}

/**
 * Run the sweep on a timer for the lifetime of the process.
 *
 * Safe to call repeatedly (module reloads under HMR): the guard lives on globalThis, so only
 * one timer is ever created. The timers are unref'd so they never hold the process open.
 */
export function startCheckoutSweep() {
	const g = globalThis as any;
	if (g.__dienchanCheckoutSweep) return;
	g.__dienchanCheckoutSweep = true;

	const run = () => {
		sweepPendingCheckouts()
			.then((result) => {
				if (result.checked) console.log('checkout sweep:', JSON.stringify(result));
			})
			.catch((err) => console.error('checkout sweep error:', err));
	};

	(setTimeout(run, SWEEP_FIRST_DELAY_MS) as any).unref?.();
	(setInterval(run, SWEEP_INTERVAL_MS) as any).unref?.();
}

// --------------------------------------------------------------------------- helpers

async function postMailer(path: string, email: string | string[], order: any) {
	try {
		const res = await fetch(`${BASE_URL}/api/mailer/${path}`, {
			method: 'POST',
			body: JSON.stringify({ apiKey: APIKEY, email, order }),
			headers: { 'Content-Type': 'application/json' }
		});
		if (!res.ok) console.error(`mailer ${path} failed:`, await res.text());
	} catch (err) {
		// never let a mail failure break order creation
		console.error(`mailer ${path} threw:`, err);
	}
}

/**
 * Apply a side-effect update through the internal API.
 *
 * Deliberately NON-FATAL. The order has already been written by the time these run, and the
 * internal route answers 400 when nothing matches (e.g. the account was deleted between
 * checkout and webhook). Throwing here would fail the whole materialisation, so Stripe would
 * retry forever and eventually disable the endpoint — losing *all* orders. Failures are logged
 * with the query so they can be reconciled instead.
 */
async function mongoUpdate(schema: string, query: any, update: any) {
	try {
		const res = await fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({ apiKey: APIKEY, schema, query, update, options: { upsert: false }, multi: false }),
			headers: { 'Content-Type': 'application/json' }
		});
		if (!res.ok) {
			console.error(`mongo update ${schema} failed (${res.status}):`, await res.text(), JSON.stringify(query));
			return null;
		}
		return res.json();
	} catch (err) {
		console.error(`mongo update ${schema} threw:`, err);
		return null;
	}
}

export interface NewUserData {
	name: string;
	surname: string;
	address: string;
	postalCode: string;
	city: string;
	county: string;
	country: string;
	phone: string;
	mobilePhone: string;
	passwordHash: string;
	howDidYouKnow?: string;
	eventDetails?: string;
}

export interface ResolveUserInput {
	/** already authenticated — the order simply belongs to this user */
	userId?: string | null;
	email: string;
	/** present only for guest checkouts that must create an account */
	newUser?: NewUserData | null;
	/** true when the membership should be active immediately (i.e. paid online now) */
	activateMembership?: boolean;
	withInsurance?: boolean;
}

/**
 * Resolve the account an order belongs to, creating one for a guest if needed.
 *
 * Policy: guests whose email is already registered are stopped *before* payment by the calling
 * route, which asks them to log in rather than silently attaching an order to an account they
 * may not control.
 *
 * The `existing` branch below is therefore a last-resort safety net, not the normal path. It
 * only triggers if the account appeared between the route check and the webhook (or on a retry).
 * In that rare case attaching to the existing account is deliberately preferred over throwing,
 * because throwing would mean a customer had paid and their order was dropped — the exact
 * failure this refactor exists to eliminate.
 */
export async function resolveOrCreateUser(
	input: ResolveUserInput
): Promise<{ userId: string; cookieId: string | null }> {
	await dbConnect();

	if (input.userId) return { userId: input.userId, cookieId: null };

	const email = (input.email || '').toLowerCase();
	const existing = await UserModel.findOne({ email }).lean<any>();
	if (existing) return { userId: existing.userId, cookieId: null };

	const newUser = input.newUser;
	if (!newUser) throw new Error('Guest checkout without user data');

	const userId = nanoid9();
	const cookieId = crypto.randomUUID();

	await UserModel.create({
		userId,
		userCode: crypto.randomUUID(),
		name: newUser.name,
		surname: newUser.surname,
		email,
		address: newUser.address,
		postalCode: newUser.postalCode,
		city: newUser.city,
		county: newUser.county,
		country: newUser.country,
		phone: newUser.phone,
		mobilePhone: newUser.mobilePhone,
		password: newUser.passwordHash,
		cookieId,
		'membership.membershipSignUp': new Date(),
		'membership.membershipStatus': input.activateMembership === true,
		...(input.withInsurance ? { 'insurance.insuranceStatus': false } : {}),
		extraFieldText1: newUser.howDidYouKnow,
		extraFieldText2: newUser.eventDetails
	});

	return { userId, cookieId };
}

function buildOrderDoc(pending: any, userId: string, cart: any[]) {
	const p = pending.payload ?? {};
	// Flows that prepare a full order document (cart, course) pass it as `baseDoc`; the
	// server-computed values below stay authoritative, baseDoc only supplies the rest.
	const base = p.baseDoc ?? {};
	return {
		orderId: pending.orderId,
		orderCode: pending.orderCode,
		userId,
		status: base.status ?? 'requested',
		type: p.orderType ?? base.type ?? 'membership',
		orderDate: base.orderDate ?? new Date(),
		orderConfirmDate: base.orderConfirmDate ?? null,
		promotionId: base.promotionId ?? '',
		promotionName: base.promotionName ?? '',
		promoterId: p.promoterId ?? base.promoterId ?? '',
		agencyId: base.agencyId ?? '',
		orderConfirmed: base.orderConfirmed ?? false,
		totalPoints: base.totalPoints ?? 0,
		totalValue: pending.amount / 100,
		totalDiscount: base.totalDiscount ?? 0,
		totalVAT: base.totalVAT ?? 0,
		browser: base.browser ?? '',
		orderIp: base.orderIp ?? '',
		orderNotes: p.orderNotes ?? base.orderNotes ?? '',
		invoicing: p.invoicing ?? base.invoicing,
		shipping: p.shipping ?? base.shipping ?? p.invoicing ?? base.invoicing,
		storePickUp: base.storePickUp ?? false,
		payment: {
			// offline (bank transfer) orders go through the same materialiser, so the method and
			// status must come from the payload rather than being assumed to be a paid card
			method: p.paymentMethod ?? 'Carta di credito',
			statusPayment: p.statusPayment ?? 'done',
			transactionId: pending.paymentIntentId ?? '',
			points: '',
			value: ''
		},
		cart
	};
}

/**
 * Run a non-idempotent side effect at most once, even if the materialiser is retried after a
 * later step failed. The flag is persisted immediately after the operation succeeds.
 */
async function once(pending: any, flag: string, fn: () => Promise<void>) {
	const p = pending.payload ?? {};
	if (p[flag]) return;

	await fn();

	await PendingCheckout.updateOne({ token: pending.token }, { $set: { [`payload.${flag}`]: true } });
	p[flag] = true;
}

/**
 * Resolve the account for a checkout, reusing one already resolved by a previous attempt.
 * Persisting the id immediately is what makes the whole materialisation retry-safe.
 */
async function resolveUserResumable(
	pending: any,
	opts: { activateMembership?: boolean; withInsurance?: boolean } = {}
) {
	const p = pending.payload ?? {};

	let userId: string | null = p.createdUserId ?? null;
	let cookieId: string | null = p.createdCookieId ?? null;

	if (!userId) {
		const resolved = await resolveOrCreateUser({
			userId: p.userId,
			email: pending.email,
			newUser: p.newUser,
			...opts
		});
		userId = resolved.userId;
		cookieId = resolved.cookieId;

		await PendingCheckout.updateOne(
			{ token: pending.token },
			{ $set: { 'payload.createdUserId': userId, 'payload.createdCookieId': cookieId } }
		);
	}

	return { userId, cookieId };
}

/** Idempotent upsert by the pre-generated orderId. */
async function upsertOrder(pending: any, userId: string, cart: any[]) {
	return OrderModel.findOneAndUpdate(
		{ orderId: pending.orderId },
		{ $setOnInsert: buildOrderDoc(pending, userId, cart) },
		{ upsert: true, new: true }
	);
}

async function decrementStock(cart: any[]) {
	await Promise.all(
		cart.map(async (item) => {
			if (!item?.prodId) return;
			// Courses, events and memberships hold no stock, and the cancel path deliberately
			// does not restore them — decrementing here would leak stock the other way.
			if (item.type === 'course' || item.type === 'event' || item.type === 'membership') return;
			try {
				const res = await fetch(`${BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'product',
						query: { prodId: item.prodId },
						update: { $inc: { stockQty: -(item.orderQuantity ?? 1) } },
						options: { upsert: false },
						multi: false
					}),
					headers: { 'Content-Type': 'application/json' }
				});
				if (!res.ok) console.error(`stock update failed for ${item.prodId}:`, await res.text());
			} catch (err) {
				console.error(`stock update threw for ${item.prodId}:`, err);
			}
		})
	);
}

/** Award referral points for the discount codes used on an order. */
async function awardReferralPoints(codes: string[], totalValue: number) {
	if (!codes?.length) return;
	try {
		const res = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'discount',
				query: { code: { $in: codes }, type: 'referral' },
				projection: { _id: 0 },
				sort: { createdAt: -1 },
				limit: 1,
				skip: 0
			}),
			headers: { 'Content-Type': 'application/json' }
		});
		if (!res.ok) return;
		const discount = await res.json();
		if (!discount.length || !discount[0].referral) return;

		const calcPoint = Math.round((totalValue * discount[0].refPoints) / 100);
		await mongoUpdate('user', { email: discount[0].referral }, {
			$inc: { pointsBalance: calcPoint },
			$push: { pointsHistory: { points: calcPoint, note: `punti per codice formatore: ${discount[0].code}` } }
		});
	} catch (err) {
		console.error('referral points failed:', err);
	}
}

// --------------------------------------------------------------------------- flow handlers

type FlowHandler = (pending: any) => Promise<string>;

/**
 * Every step below is safe to run more than once, because a failed materialisation releases
 * the claim and Stripe retries the webhook:
 *   - the account is resolved once and its id persisted, so a retry cannot mint a second user
 *   - the order is upserted by its unique orderId, so a retry cannot hit the unique index
 *   - the membership update is a plain $set
 *   - the confirmation email is guarded by a mailSent flag
 */
const membershipHandler: FlowHandler = async (pending) => {
	const p = pending.payload ?? {};
	const { userId } = await resolveUserResumable(pending, {
		activateMembership: true,
		withInsurance: p.withInsurance === true
	});

	const cart = [p.membershipProduct, ...(p.extraCart ?? [])].filter(Boolean);
	const order = await upsertOrder(pending, userId, cart);

	if (p.membershipUpdate) {
		const { level, expiryYears, setActivation } = p.membershipUpdate;
		const now = new Date();
		const expiry = new Date();
		expiry.setFullYear(expiry.getFullYear() + (expiryYears ?? 1));

		await mongoUpdate('user', { userId }, {
			$set: {
				'membership.membershipLevel': level,
				'membership.membershipStatus': true,
				...(setActivation ? { 'membership.membershipSignUp': now, 'membership.membershipActivation': now } : {}),
				'membership.membershipExpiry': expiry
			}
		});
	}

	if (!p.mailSent) {
		await postMailer(p.mailTemplate ?? 'new-order', p.mailTo ?? [pending.email], order.toJSON?.() ?? order);
		await PendingCheckout.updateOne({ token: pending.token }, { $set: { 'payload.mailSent': true } });
	}

	return pending.orderId;
};

/**
 * Insurance contribution (70 €). The buyer is always authenticated, so no account is created
 * and no auto-login is needed. The insurance only becomes active once the association confirms
 * it, so `insuranceStatus` stays false here — same as the original flow.
 */
const insuranceHandler: FlowHandler = async (pending) => {
	const p = pending.payload ?? {};
	const userId: string | undefined = p.userId;
	if (!userId) throw new Error('insurance checkout without userId');

	const cart = [p.insuranceProduct, ...(p.extraCart ?? [])].filter(Boolean);

	const order = await OrderModel.findOneAndUpdate(
		{ orderId: pending.orderId },
		{ $setOnInsert: buildOrderDoc(pending, userId, cart) },
		{ upsert: true, new: true }
	);

	await mongoUpdate('user', { userId }, { $set: { 'insurance.insuranceStatus': false } });

	if (!p.mailSent) {
		await postMailer(p.mailTemplate ?? 'new-insurance', p.mailTo ?? [pending.email], order.toJSON?.() ?? order);
		await PendingCheckout.updateOne({ token: pending.token }, { $set: { 'payload.mailSent': true } });
	}

	return pending.orderId;
};

/**
 * Product cart. Mirrors the original side effects: stock decrement, referral points, points
 * spent on the order, then the confirmation email. Guests get an account, as before.
 */
const cartHandler: FlowHandler = async (pending) => {
	const p = pending.payload ?? {};
	const { userId } = await resolveUserResumable(pending);

	const cart = p.cartItem ?? [];
	const order = await upsertOrder(pending, userId, cart);

	await once(pending, 'stockDecremented', () => decrementStock(cart));
	await once(pending, 'referralAwarded', () => awardReferralPoints(p.discountArray ?? [], pending.amount / 100));

	// points spent on this order — the payload carries the SERVER-computed redemption. The old
	// key names are still read so a checkout prepared before this change cannot silently zero
	// the buyer's balance.
	if (p.usePoint) {
		const spent = Number(p.pointsUsed ?? p.usedPoints ?? 0);
		const balanceAfter = Number(p.pointsBalanceAfter ?? p.newPointsBalance ?? 0);

		await once(pending, 'pointsApplied', () =>
			mongoUpdate('user', { userId }, {
				$set: { pointsBalance: Math.round(balanceAfter) },
				$push: {
					pointsHistory: {
						points: -spent,
						note: `punti utilizzati per ordine: ${pending.orderId}`
					}
				}
			})
		);
	}

	if (!p.mailSent) {
		await postMailer(p.mailTemplate ?? 'new-order', p.mailTo ?? [pending.email], order.toJSON?.() ?? order);
		await PendingCheckout.updateOne({ token: pending.token }, { $set: { 'payload.mailSent': true } });
	}

	return pending.orderId;
};

/**
 * Course / event enrolment. Mirrors the original side effects: membership activation, course
 * subscriber list, bundle stock, promoter commission, the dedicated 12-massaggi email, the
 * internal notification email and the n8n marketing webhook.
 */
const courseHandler: FlowHandler = async (pending) => {
	const p = pending.payload ?? {};
	const { userId } = await resolveUserResumable(pending, { activateMembership: true });

	const cart = p.cart ?? [];
	const order = await upsertOrder(pending, userId, cart);

	if (p.membershipUpdate) {
		const expiry = new Date();
		expiry.setFullYear(expiry.getFullYear() + 1);
		await mongoUpdate('user', { userId }, {
			$set: {
				'membership.membershipLevel': 'Socio ordinario',
				'membership.membershipExpiry': expiry,
				'membership.membershipStatus': true
			}
		});
	}

	// recurring courses repeat monthly and are not tracked as a subscription
	if (!p.isRecurring) {
		await once(pending, 'courseJoinedAdded', () =>
			mongoUpdate('user', { userId }, { $addToSet: { courseJoined: p.cartItemProdId } })
		);

		await once(pending, 'subscriberAdded', async () => {
			try {
				const res = await fetch(`${BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'product',
						query: { type: { $in: ['course', 'event'] }, prodId: p.cartItemProdId },
						// userId comes from the resolved account: for a guest it only exists by now
						update: { $addToSet: { listSubscribers: { ...p.subscriber, userId } } },
						options: { upsert: false },
						multi: false
					}),
					headers: { 'Content-Type': 'application/json' }
				});
				if (!res.ok) console.error('subscriber update failed:', await res.text());
			} catch (err) {
				console.error('subscriber update threw:', err);
			}
		});

		await once(pending, 'bundleStockDecremented', () => decrementStock(p.bundleProducts ?? []));
	}

	// promoter commission
	if (p.promoterId && p.promoterPoints) {
		await once(pending, 'promoterPaid', async () => {
			try {
				await mongoUpdate('user', { email: p.promoterId }, {
					$inc: { pointsBalance: p.promoterPoints },
					$push: {
						pointsHistory: {
							points: p.promoterPoints,
							note: `Commissione ${p.productTitle} - Ordine ${pending.orderId}`
						}
					}
				});
			} catch (err) {
				console.error('promoter points failed:', err);
			}
		});
	}

	if (!p.mailSent) {
		await postMailer(p.mailTemplate ?? 'new-order', p.mailTo ?? [pending.email], order.toJSON?.() ?? order);

		if (p.notificationEmail) {
			try {
				const res = await fetch(`${BASE_URL}/api/mailer/default`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						email: p.notificationEmail,
						content: `${p.buyerName}: iscrizione al corso ${p.productTitle}<br>email: ${pending.email}.`
					}),
					headers: { 'Content-Type': 'application/json' }
				});
				if (!res.ok) console.error('notification mail failed:', await res.text());
			} catch (err) {
				console.error('notification mail threw:', err);
			}
		}

		await PendingCheckout.updateOne({ token: pending.token }, { $set: { 'payload.mailSent': true } });
	}

	// marketing automation
	try {
		await fetch('https://nehemias-n8n-prod.brayanjeshua.com/webhook/977bae79-413c-4a54-bf7a-199b7b435eb8', {
			method: 'POST',
			body: JSON.stringify({
				orderId: pending.orderId,
				date: new Date(),
				courseDate: p.courseDate,
				courseName: p.productTitle,
				totalValue: pending.amount / 100,
				statusPayment: 'done',
				userId,
				userEmail: p.invoicing?.email,
				name: p.invoicing?.name,
				surname: p.invoicing?.surname
			}),
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('n8n webhook failed:', err);
	}

	return pending.orderId;
};

const FLOW_HANDLERS: Record<string, FlowHandler> = {
	'membership-new': membershipHandler,
	'membership-renew': membershipHandler,
	'membership-insurance': membershipHandler,
	insurance: insuranceHandler,
	cart: cartHandler,
	course: courseHandler
};

export { FLOW_HANDLERS };
