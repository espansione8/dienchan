# Why orders are still not recorded after the Stripe refactor

Investigation date: **2026-10-15**  
Scope: `src/lib/server/checkout.ts`, `src/routes/api/stripe/*`, `src/routes/(app)/checkout/success/*`  
Method: read-only probes against the **live** Stripe account and the **production** MongoDB  
(`plan/probe-missing-orders.mjs`, `plan/probe-prod-webhook.mjs`, `plan/probe-leak-scale.mjs`).

---

## 1. Verdict

The order-writing pipeline is dead in production **in all three of its paths**, from one cause:

> **`$env/dynamic/private` is empty in the built Node server, so `STRIPE_KEY_BACK` and  
> `STRIPE_WEBHOOK_SECRET` are `undefined` at runtime.**

Three files read Stripe config from `$env/dynamic/private` while the rest of the app reads it from  
`$env/static/private`. `$env/static/private` is **inlined at build time**; `$env/dynamic/private` is  
read from `process.env` **at runtime** — and the production service does not export the `.env` file  
into its environment. The result:

| Path                   | Code                                                                                           | Observed production behaviour                                                                                                                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Webhook                | `webhook/+server.ts:26` — `const stripe = new Stripe(env.STRIPE_KEY_BACK)` at **module scope** | `new Stripe(undefined)` **throws while the module is being loaded** → SvelteKit answers **500 `{"message":"Internal Error"}` to every request**, including unsigned ones. Stripe has been getting a 500 on every delivery since the endpoint was created on 2026-10-08. |
| Success page reconcile | `checkout/success/+page.server.ts:36` — `... && env.STRIPE_KEY_BACK`                           | Falsy → **the reconcile block is skipped entirely**. The customer sees *"Pagamento ricevuto — stiamo registrando il tuo ordine"* and the order is never written.                                                                                                        |
| Background sweep       | `checkout.ts:411` — `env.STRIPE_KEY_BACK ? new Stripe(...) : null`                             | `client === null` → **silent early return** `{checked:0,reconciled:0,failed:0}`. It has never swept a single record in production.                                                                                                                                      |

Note the asymmetry that made this invisible: every **checkout-creating** route uses  
`$env/static/private` (`cart`, `course-detail`, `membership-new`, `insurance-new`), so *payments keep  
being created normally* while *nothing records them*.

### Proof

1. **Webhook is dead** — a signed request with an unknown token, a tampered signature, and **no  
   signature header at all** all return the same generic 500:
   ```
   500  valid signature        {"message":"Internal Error"}
   500  tampered signature     {"message":"Internal Error"}
   500  no signature header    {"message":"Internal Error"}
   ```
   The handler returns **400** for a missing signature and **400** for a bad one. It can only 500  
   before running, and the only statement that can throw at module load is  
   `new Stripe(env.STRIPE_KEY_BACK)` — verified: `new Stripe(undefined)` → *"Neither apiKey nor  
   config.authenticator provided"*.
2. **Sweep is a no-op** — `POST /api/stripe/reconcile` on production returns  
   `{"checked":0,"reconciled":0,"failed":0}` **while 12 paid, unmaterialised `pending_checkouts`  
   records exist inside the 48 h window**. It can only return `checked:0` if `client` was `null`.
3. **Success page never reconciles** — `GET /checkout/success?session_id=<a real paid, unmaterialised
   session>` renders the `state === 'processing'` branch ("Stiamo registrando il tuo ordine") and  
   **not** the `paid === false` branch. `paid` stays `null`, which is only possible when the  
   reconcile block is skipped.
4. **`stripe_payments` is empty (0 documents)** even though Stripe has delivered  
   `payment_intent.succeeded` events (latest 2026-10-15 09:30). The mirror collection has never  
   received a single write. Its indexes exist, so the model loaded — the endpoint simply never  
   reached the handler.

---

## 2. Damage (live data)

Scan of the last 184 live Checkout Sessions:

|                                                                       |                  |
| --------------------------------------------------------------------- | ---------------- |
| Paid + complete **Checkout Sessions** with no order                    | **21**           |
| — of which this app's, recovered automatically (have a `pending_checkouts` row) | **11** (€431.70) |
| — of which **another application's** (see the correction below)        | 10 (€471.00)     |
| Total across those 21 sessions                                        | €902.70          |

By flow: `membership-renew` 7 · `course` 2 · `cart` 2 · other application 10.  
By month: 2026-05 (6, €195.00) · 2026-07 (1, €25.00) · 2026-09 (1, €25.00) · **2026-10 (13, €657.70)**.

> **Correction (added 2026-10-15, later the same day).** The 10 non-recovered sessions are **not
> this app's orders.** The Stripe account is shared: 170 of its 184 Checkout Sessions carry metadata
> this app never writes (`type: booking|membership|course`, a UUID `reference_id`, a Supabase-style
> UUID `user_id`), and a third webhook endpoint in the account points at a Supabase function. This
> app's own sessions all carry `metadata.pendingCheckoutToken`, and the oldest of them is
> **2026-10-08** — the day the pending-checkout refactor shipped. None of the 10 has any counterpart
> in this app's `orders` (same email + same amount ±3 days). **Do not backfill them.**
>
> The real backlog is separate and much larger: before 2026-10-08 this app charged bare
> PaymentIntents with **no Checkout Session**, so those payments are invisible to every recovery
> path here. See `plan/stripe-legacy-recovery-2026-10-15.md` — **159 payments / €8 322.42** are this
> app's, and Stripe holds only the amount, date and customer for them, not the cart.


All 11 recoverable records are identical in shape — which is itself the signature of the bug:

```
status: 'pending'   materializedOrderId: null   lastError: null   lastSweepAt: null
```

`lastError: null` and `status: 'pending'` mean **`materializeCheckout()` was never called at all**  
(if it had thrown, it would have written `lastError` and reset the status). `lastSweepAt: null` on  
every one of them means the sweep has not run once since 2026-10-13. The old record from 2026-10-12  
*does* carry `lastSweepAt` — it was set by the **dev** run during the earlier verification, not by  
production.

The customers affected include the payments in the attached screenshots  
(`luciaboieri70@gmail.com` €25.00, `dorit_rudolph@yahoo.de` €25.00, `g.stefania89@hotmail.it` €30.00  
and €35.00 — all `complete/paid`, all with no order).

---

## 3. Ruled out (checked, not the cause)

- **Restricted live key permissions.** `rk_live_…` can read everything the code needs:  
  `charges.retrieve`, `checkout.sessions.retrieve`, `paymentIntents.retrieve`, `events.list`,  
  `customers.list` all PASS.
- **Signature secret mismatch.** Cannot be compared directly (a restricted key cannot read  
  `endpoint.secret`), but signature verification itself is correct — an HMAC computed with the  
  `.env` secret is accepted and a tampered one rejected by `stripe.webhooks.constructEvent`.
- **Endpoint registration / event subscription.** `we_1UOMgqJDDlqf7CoEmOeInPY3`,  
  `status: enabled`, `livemode: true`, events = `checkout.session.completed,
  payment_intent.succeeded, charge.refunded`. Correct.
- **Route auth gating.** The `(app)` group has no `+layout.server.ts`, so `/checkout/success` is  
  publicly reachable (confirmed: 200).
- **Pending records not being written.** They are written correctly and before the redirect —  
  every post-refactor session has one, with the right `flow`, `amount`, `email`, `sessionId`.

---

## 4. Secondary defects (real, but not the cause of this outage)

### 4.1 `once()` is not atomic — concurrent reclaim can double side effects

`checkout.ts:646-654` does read-flag → run → set-flag. The stale-claim reclaim  
(`STALE_CLAIM_MS = 15 min`, `checkout.ts:257-279`) exists precisely so a second caller can take over  
a claim whose owner died. If the first caller is merely *slow* (not dead), both run the handler, and  
both pass the `if (p[flag]) return` guard → **stock decremented twice, referral/promoter points  
awarded twice**. The order itself stays safe (`upsertOrder` is keyed on the unique `orderId`).  
The handler has no outbound timeout (`postMailer`, the n8n webhook, `mongoUpdate` are bare `fetch`  
calls), so a hanging dependency is the realistic way to reach 15 minutes.

### 4.2 The stale-claim reclaim window can fire before the first attempt finishes

Same root: `status` is set to `'completed'` **before** the flow handler runs  
(`checkout.ts:257-279`), so "claimed" and "done" are indistinguishable in the record. `STALE_CLAIM_MS`  
is the only thing separating them.

### 4.3 "Never attempted" is indistinguishable from "in progress"

`lastError` is written only on throw, and there is no attempt counter or timestamp. This is why the  
production outage looked like healthy `pending` records. There is no way to alert on "paid session,  
no order, N minutes old".

### 4.4 `payment_intent.succeeded` can 500 the whole event on a lookup failure

`webhook/+server.ts:95-99` calls `stripe.charges.retrieve()` unguarded. A transient failure makes the  
whole event return 500 → Stripe retries the event for up to 3 days → and the mirror row is never  
written. The lookup is also unnecessary: `latest_charge` is already expanded in the event object in  
most cases.

### 4.5 The "leak detector" is inert

`StripePayments.model.ts` documents itself as the source of truth for reconciliation and carries  
`orderId` / `reconciled` fields, but **no code anywhere sets them** (grep: only the two `updateOne`  
calls in the webhook). Nothing compares the mirror against `orders`. The detection layer the model  
promises does not exist.

### 4.6 The sweep's hard 48 h lookback silently drops orders

`checkout.ts:423` — `createdAt: { $lte: now-10min, $gte: now-48h }`. Any outage longer than 48 h  
makes those payments **permanently unrecoverable by the sweep**. This is live right now: of the 11  
recoverable payments, the two oldest (`2026-10-13 13:59` cart €96.30 and `2026-10-13 09:35`  
membership-renew €25.00) are already 50–54 h old and fall outside the window.

### 4.7 Duplicate/out-of-order events

`stripe_payments` has unique indexes on `eventId` **and** `paymentIntentId`, and the upsert keys on  
`paymentIntentId` with `$setOnInsert: { eventId }`. A replayed event is correctly ignored. Two  
*concurrent* `payment_intent.succeeded` for the same intent can still race on the unique index and  
throw E11000 → 500 → retry (self-healing, but noisy).

### 4.8 Missed events

`checkout.session.async_payment_succeeded` is not handled — only relevant for delayed payment  
methods, and the code is card-only (`payment_method_types: ['card']`), so low risk today.  
`checkout.session.expired` is not handled either, so abandoned checkouts stay `pending` forever and  
are re-polled by the sweep every hour for 48 h. Cosmetic/cost only.

### 4.9 API version inconsistency (informational)

The dashboard endpoint is pinned to `2026-03-25.dahlia`; `.env` `STRIPE_API` and the installed SDK  
default (`stripe@22.1.1` → `2026-04-22.dahlia`) are both `2026-04-22.dahlia`. So the webhook  
receives objects shaped by the *endpoint's* version while the code is written against a newer one.  
None of the fields used here (`payment_status`, `metadata`, `payment_intent`, `latest_charge`,  
`amount_received`, `amount_refunded`) are affected, but it should be pinned consistently.

---

## 5. Affected events and code paths

| Event                        | Handler                                                                         | Order written?                          | Status in production                         |
| ---------------------------- | ------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------- |
| `checkout.session.completed` | `webhook/+server.ts:53-90` → `materializeCheckout()`                            | **yes — this is the only order writer** | **500, never runs**                          |
| `payment_intent.succeeded`   | `webhook/+server.ts:93-123`                                                     | no (mirror only)                        | **500, never runs**; `stripe_payments` empty |
| `charge.refunded`            | `webhook/+server.ts:125-132`                                                    | no (mirror only)                        | never observed (0 refund events)             |
| —                            | `checkout/success/+page.server.ts:36-43` → `reconcileCheckoutFromStripe()`      | yes (fallback)                          | **skipped** (`env.STRIPE_KEY_BACK` falsy)    |
| —                            | `checkout.ts:410-452` `sweepPendingCheckouts()` (timer in `hooks.server.ts:13`) | yes (fallback)                          | **silent no-op** (`client === null`)         |
| —                            | `POST /api/stripe/reconcile`                                                    | yes (manual)                            | **silent no-op**, returns `checked:0`        |


All six flows are affected: `membership-new`, `membership-renew`, `membership-insurance`, `cart`,  
`course`, `insurance`. Offline (bank transfer / cash) orders are **unaffected** — they never touch  
Stripe; `createOfflineCheckout()` calls `materializeCheckout()` directly.

---

## 6. Concrete fixes

### P0 — 6.1 Read Stripe config from `$env/static/private` (the actual fix)

`src/routes/api/stripe/webhook/+server.ts`

```diff
-import { env } from '$env/dynamic/private';
+import { STRIPE_KEY_BACK, STRIPE_WEBHOOK_SECRET, STRIPE_API } from '$env/static/private';
...
-const stripe = new Stripe(env.STRIPE_KEY_BACK);
+const stripe = new Stripe(STRIPE_KEY_BACK, { apiVersion: STRIPE_API });
...
-	const secret = env.STRIPE_WEBHOOK_SECRET;
+	const secret = STRIPE_WEBHOOK_SECRET;
```

`src/lib/server/checkout.ts:411`

```diff
-	const client = stripe ?? (env.STRIPE_KEY_BACK ? new Stripe(env.STRIPE_KEY_BACK) : null);
+	const client = stripe ?? new Stripe(STRIPE_KEY_BACK, { apiVersion: STRIPE_API });
```

`src/routes/(app)/checkout/success/+page.server.ts`

```diff
-import { env } from '$env/dynamic/private';
+import { STRIPE_KEY_BACK, STRIPE_API } from '$env/static/private';
...
-			if (pending && !pending.materializedOrderId && env.STRIPE_KEY_BACK) {
-				const outcome = await reconcileCheckoutFromStripe(sessionId, new Stripe(env.STRIPE_KEY_BACK));
+			if (pending && !pending.materializedOrderId) {
+				const outcome = await reconcileCheckoutFromStripe(sessionId, new Stripe(STRIPE_KEY_BACK, { apiVersion: STRIPE_API }));
```

After this, `env` from `$env/dynamic/private` is unused in all three files — drop the import.  
`STRIPE_KEY_BACK` is already imported from `$env/static/private` in `checkout.ts`, so add  
`STRIPE_API` there.

> **Alternative**, if runtime env injection is preferred over build-time inlining: keep  
> `$env/dynamic/private` and make the service actually receive the variables — systemd  
> `EnvironmentFile=/home/<user>/<app>/.env` (the existing `SSH/deploy-node/liberamagia.service`  
> template has **no** `EnvironmentFile`, only literal `Environment=` lines), or start with  
> `node --env-file=.env build`. Doing **both** is safest.

### P0 — 6.2 Fail loudly instead of silently

Add a boot-time assertion in `hooks.server.ts` (next to `startCheckoutSweep()`):

```ts
for (const [name, value] of Object.entries({ STRIPE_KEY_BACK, STRIPE_WEBHOOK_SECRET, MONGO_URI, BASE_URL, APIKEY })) {
	if (!value) console.error(`FATAL: required env var ${name} is missing — Stripe order writing is disabled`);
}
```

And make the failure observable rather than a silent `{checked:0}`:

```diff
-	if (!client) return { checked: 0, reconciled: 0, failed: 0 };
+	if (!client) {
+		console.error('sweepPendingCheckouts: Stripe client not configured — sweep is a NO-OP');
+		return { checked: 0, reconciled: 0, failed: 0, error: 'stripe client not configured' };
+	}
```

Also wrap the webhook's module-scope client in a guard so a missing key produces an explicit 503  
instead of a generic 500 (see 6.3).

### P0 — 6.3 Never let the webhook route 500 before the handler

```ts
let stripe: Stripe | null = null;
try {
	stripe = new Stripe(STRIPE_KEY_BACK, { apiVersion: STRIPE_API });
} catch (err) {
	console.error('stripe webhook: cannot construct Stripe client:', err);
}
```

then at the top of `POST`: `if (!stripe) return json({ message: 'webhook not configured' }, { status: 503 });`

### P1 — 6.4 Make `once()` an atomic claim

```ts
async function once(pending: any, flag: string, fn: () => Promise<void>) {
	const claimed = await PendingCheckout.findOneAndUpdate(
		{ token: pending.token, [`payload.${flag}`]: { $ne: true } },
		{ $set: { [`payload.${flag}`]: true } }
	);
	if (!claimed) return;
	try {
		await fn();
	} catch (err) {
		// roll back so a retry can run the side effect again
		await PendingCheckout.updateOne({ token: pending.token }, { $set: { [`payload.${flag}`]: false } });
		throw err;
	}
}
```

### P1 — 6.5 Make the sweep age-unbounded for un-reconciled records

Replace the hard 48 h floor with "anything not yet materialised", keeping the 10 min minimum age and  
the 1 h re-visit throttle, and add a `sweepPasses` counter so a permanently unrecoverable record  
stops being polled after, say, 20 passes:

```diff
-		createdAt: { $lte: new Date(now - SWEEP_MIN_AGE_MS), $gte: new Date(now - SWEEP_LOOKBACK_MS) },
+		createdAt: { $lte: new Date(now - SWEEP_MIN_AGE_MS) },
+		sweepPasses: { $lt: 20 },
```

### P1 — 6.6 Make `payment_intent.succeeded` non-fatal

```diff
-			const charge = pi.latest_charge
-				? await stripe.charges.retrieve(...)
-				: null;
+			let charge: Stripe.Charge | null = null;
+			if (pi.latest_charge) {
+				try {
+					charge = await stripe.charges.retrieve(
+						typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge.id
+					);
+				} catch (err) {
+					console.error('payment_intent.succeeded: charge lookup failed, recording what we have', pi.id, err);
+				}
+			}
```

### P1 — 6.7 Turn the mirror into the leak detector it claims to be

- Add `attempts` (Number) and `lastAttemptAt` (Date) to `PendingCheckouts`, incremented at the top of  
  `materializeCheckout`, so "never attempted" is distinguishable from "in progress".
- In `materializeCheckout`, after the order is written, link the mirror:  
  `await StripePayment.updateOne({ paymentIntentId: info.paymentIntentId }, { $set: { orderId, reconciled: true } })`.
- Add a daily job: for every `stripe_payments` row older than 24 h with `reconciled: false` and no  
  order, alert.

### P2 — 6.8 Housekeeping

- Add timeouts to every outbound `fetch` in the materialiser (`postMailer`, `mongoUpdate`,  
  `decrementStock`, the n8n webhook) — `AbortSignal.timeout(10_000)` — so a hang cannot hold a claim  
  past `STALE_CLAIM_MS`.
- Handle `checkout.session.expired` → set the pending record to `abandoned` and stop sweeping it.
- Pin the dashboard endpoint to `2026-04-22.dahlia` to match `STRIPE_API` and the SDK.
- Consider splitting the webhook into its own route per event type, or at least returning 200 for  
  events you deliberately ignore, so a single failing case cannot stall the whole endpoint.

---

## 7. Verification plan

**Before deploying**

1. `npm run check` — confirm no new errors vs the current baseline.
2. Build with the production-shaped environment and run the webhook test against the **built** server  
   (this is the test that would have caught it):  
   `node build` then `node plan/webhook-httptest.mjs` pointed at the built port.  
   Expected: **400** for no signature / tampered / stale, and **not 400** for a valid signature.  
   Re-run it once with `STRIPE_*` stripped from `process.env` to prove the build-time inlining is what  
   supplies the values.

**After deploying**

1. `POST /api/stripe/webhook` with a valid signature and an unknown token → expect  
   **200 `{"received":true}`** (was 500).
2. `POST /api/stripe/reconcile` → expect **`checked > 0`** (was 0) and `reconciled` equal to the number  
   of recoverable records still inside the window.
3. Confirm `pending_checkouts.lastSweepAt` becomes non-null within ~5 minutes of boot **without any  
   manual call** — this is the only way to prove the in-process timer is alive.
4. Make one real live purchase (lowest-value product) → the order must appear on `/order-table`  
   within seconds, `payment.statusPayment === 'done'`, `payment.transactionId` = the PaymentIntent,  
   and `/checkout/success` must render the **`state === 'done'`** branch ("Pagamento completato … il  
   tuo ordine è stato registrato"), **not** "Stiamo registrando".
5. Confirm `stripe_payments` count goes from **0** to ≥ 1 after the next real  
   `payment_intent.succeeded`, with `reconciled: true` and `orderId` set.
6. Negative test: open a checkout and abandon it → no order, record stays `pending`, then becomes  
   `abandoned` after the session expires.

**Ongoing (the guard that would have caught this in hours, not days)**

1. A daily check: *paid live Checkout Sessions in the last 24 h with no order = 0*, and  
   *`stripe_payments` rows older than 24 h with `reconciled: false` = 0*. Either condition should  
   page. This is the single highest-value addition — every failure mode here was silent.
2. Alert if `pending_checkouts` grows while `lastSweepAt` stays null on new records (sweep dead).

---

## 8. Recovering the already-lost orders

Two groups, and they need different treatment.

**Group A — 11 payments with a `pending_checkouts` row (€431.70).**  
Do **not** hand-insert orders. Fix 6.1 + 6.2 + 6.5 first, then let the real path do it:

- `POST /api/stripe/reconcile` will pick up the **9** records younger than 48 h.
- The remaining **2** are already outside the current 48 h window  
  (`2026-10-13 13:59` cart €96.30, `2026-10-13 09:35` membership-renew €25.00) and need either the  
  widened window from fix 6.5 or a direct `reconcileCheckoutFromStripe(sessionId, stripe)` call.
- Verify afterwards: `materializedOrderId` set on all 11, `status: 'completed'`, and each order  
  present on `/order-table`.

**Group B — CORRECTED.** This section originally said "10 pre-refactor payments". That was wrong:
those 10 are **another application's** orders, not this app's (see the correction in section 2).

The real backlog is much larger and has a different shape. Before 2026-10-08 this app did not use
hosted Checkout at all — it charged bare PaymentIntents, so those payments have **no Checkout
Session**, and neither the sweep nor the success-page reconcile can ever see them. Full analysis:
`plan/stripe-legacy-recovery-2026-10-15.md` and `plan/gen-legacy-recovery.mjs`.

| group | payments | € | recoverable? |
|---|---|---|---|
| this app (`PI metadata {email,name}`) | 159 | 8 322.42 | **financially only** — Stripe holds amount, date, customer, PI, charge; **not** the cart |
| WooCommerce (`metadata.order_id` / `site_url = riflessologiadienchan.it`) | 105 | 13 985.00 | yes, but in **WordPress**, not here |
| unattributable (no metadata) | 23 | 994.00 | financially only |

Rebuild tool: `plan/rebuild-legacy-orders.mjs` (dry-run by default, `--apply` to write,
idempotent, every generated orderId starts with `RCV`). Its dry run also finds **15 groups of
probable duplicate charges — 19 extra payments** where the same customer was charged 2–4 times
within minutes, because the old flow charged the card *before* validating the order. Those should
be refunded, not turned into orders.


---

## 9. Open questions

1. ~~How is the production service started?~~ **Answered** — the fix uses `$env/static/private`, which
   is inlined at build time, so nothing else is needed. Deploying `build/` is the only step left.
2. ~~Should I apply fixes 6.1–6.3?~~ **Done.**
3. ~~Should I run the recovery for Group A?~~ **Done** — 11 orders, €431.70, written and verified.
4. **The legacy backlog: rebuild or refund?** `plan/rebuild-legacy-orders.mjs` is written and
   dry-run-verified (151 payments, €7,482.20, all matched to an account here). It writes nothing
   without `--apply`. Two decisions before running it:
   - the **15 duplicate groups / 19 extra charges** — refund rather than rebuild?
   - the 107 × €25,00 rows are almost certainly annual membership renewals; should the rebuild also
     **extend `membership.membershipExpiry`**, or write the order only?
5. **Is the `rk_live_` restricted key intentional?** It works, but it cannot read
   `webhookEndpoints.secret`, which is why the signing secret could not be verified end-to-end. If a
   full `sk_live_` key is available for server use, verification gets stronger.

