import mongoose, { Schema } from 'mongoose';

/**
 * A checkout that has been prepared but not yet paid.
 *
 * The route action validates the form, builds the complete order document and stores it here
 * *before* redirecting the customer to Stripe. The webhook then materialises it, so the order
 * no longer depends on the browser coming back.
 *
 * Two independent idempotency guards:
 *   - `token` is unique and is the key passed to Stripe in metadata
 *   - `orderId` is pre-generated and unique, so even a double webhook cannot create two orders
 */
const pendingCheckoutSchema = new Schema(
	{
		token: { type: String, required: true, unique: true, index: true },
		flow: { type: String, required: true, index: true }, // membership-new | membership-renew | membership-insurance | cart | course | insurance
		status: {
			type: String,
			enum: ['pending', 'completed', 'abandoned', 'failed'],
			default: 'pending',
			index: true
		},

		// pre-generated so the order insert is idempotent
		orderId: { type: String, required: true, unique: true },
		orderCode: { type: String, required: true },

		amount: { type: Number, required: true }, // cents
		currency: { type: String, default: 'eur' },
		email: { type: String, default: null, index: true },
		name: { type: String, default: null },
		surname: { type: String, default: null },

		// everything the materialiser needs to run the flow, including any user to create
		payload: { type: Schema.Types.Mixed, default: {} },

		// Stripe side
		sessionId: { type: String, default: null, index: true },
		paymentIntentId: { type: String, default: null, index: true },
		completedEventId: { type: String, default: null },

		// Binds the post-payment auto-login to the browser that started the checkout:
		// the nonce is stored here and mirrored into an httpOnly cookie, and it is consumed
		// once, so a leaked/guessed success URL cannot be replayed to hijack the new account.
		loginNonce: { type: String, default: null },
		autoLoginConsumed: { type: Boolean, default: false },

		// resulting order, once materialised
		materializedOrderId: { type: String, default: null },
		completedAt: { type: Date, default: null },
		lastError: { type: String, default: null },

		// last time the background sweep asked Stripe about this checkout, so an abandoned one
		// is not re-queried on every pass
		lastSweepAt: { type: Date, default: null }
	},
	{ collection: 'pending_checkouts', timestamps: true }
);

// Explicit Model type: the `models.X || model(...)` idiom otherwise produces a union of two
// incompatible Model types, which makes every query call fail to type-check.
export const PendingCheckout: mongoose.Model<any> =
	mongoose.models.PendingCheckout || mongoose.model('PendingCheckout', pendingCheckoutSchema);
