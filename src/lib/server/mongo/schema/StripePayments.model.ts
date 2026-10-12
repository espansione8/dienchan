import mongoose, { Schema } from 'mongoose';

/**
 * Real-time record of every payment Stripe actually captured.
 * This is the "source of truth" mirror used by the reconciliation job:
 * any row here that has no matching order after a grace period is a leaked payment.
 */
const stripePaymentSchema = new Schema(
	{
		// idempotency: the Stripe event id, unique so replays are ignored
		eventId: { type: String, default: null, unique: true, index: true },
		paymentIntentId: { type: String, default: null, unique: true, index: true },
		chargeId: { type: String, default: null, index: true },
		amount: { type: Number, default: 0 }, // in cents
		amountRefunded: { type: Number, default: 0 },
		currency: { type: String, default: 'eur' },
		status: { type: String, default: null },
		paid: { type: Boolean, default: false },
		email: { type: String, default: null, index: true },
		name: { type: String, default: null },
		paymentMethodType: { type: String, default: null },
		threeDSecure: { type: String, default: null },
		// set by the reconciliation job once an order is linked
		orderId: { type: String, default: null, index: true },
		reconciled: { type: Boolean, default: false, index: true },
		stripeCreated: { type: Date, default: null },
		metadata: { type: Schema.Types.Mixed, default: {} }
	},
	{ collection: 'stripe_payments', timestamps: true }
);

export const StripePayment: mongoose.Model<any> =
	mongoose.models.StripePayment || mongoose.model('StripePayment', stripePaymentSchema);
