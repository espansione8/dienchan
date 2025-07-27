// SCHEMA SAMPLE
import mongoose, { Schema, Types } from 'mongoose';

const orderSchema = new Schema(
	{
		orderId: {
			type: String,
			default: null,
			index: true,
			unique: true,
			dropDups: true
		},
		orderCode: {
			type: String,
			default: null,
			unique: true,
			dropDups: true
		},
		userId: { type: String, default: null, index: true }, // add virtual
		cardId: { type: String, default: null },
		status: {
			type: String,
			enum: ['requested', 'confirmed', 'cancelled', 'exported', 'processed'],
			default: 'confirmed'
		},
		type: { type: String, default: null }, // 'course' 'product' 'membership'
		//tk: { type: String, default: null },
		orderDate: { type: Date, default: Date.now },
		orderConfirmDate: { type: Date, default: Date.now },
		promotionId: { type: String, default: null },
		promotionName: { type: String, default: null },
		promoterId: { type: String, default: null },
		agencyId: { type: String, default: null },
		orderConfirmed: { type: Boolean, default: false },
		totalPoints: { type: Number, default: 0 },
		totalValue: { type: Number, default: 0 },
		totalDiscount: { type: Number, default: 0 },
		totalVAT: { type: Number, default: 0 },
		browser: { type: String, default: null },
		orderIp: { type: String, default: null },
		orderNotes: { type: String, default: null },

		invoicing: {
			name: { type: String, default: null },
			surname: { type: String, default: null },
			businessName: { type: String, default: null },
			vatNumber: { type: String, default: null },
			address: { type: String, default: null },
			city: { type: String, default: null },
			county: { type: String, default: null },
			postalCode: { type: String, default: null },
			state: { type: String, default: null },
			region: { type: String, default: null },
			country: { type: String, default: null },
			invoiceNotes: { type: String, default: null },
			email: { type: String, default: null },
			phone: { type: String, default: null },
			mobilePhone: { type: String, default: null }
		},

		shipping: {
			name: { type: String, default: null },
			surname: { type: String, default: null },
			address: { type: String, default: null },
			city: { type: String, default: null },
			county: { type: String, default: null },
			postalCode: { type: String, default: null },
			state: { type: String, default: null },
			region: { type: String, default: null },
			country: { type: String, default: null },
			deliveryNotes: { type: String, default: null },
			email: { type: String, default: null },
			phone: { type: String, default: null },
			mobilePhone: { type: String, default: null },

			tracking: {
				company: { type: String, default: null },
				trackingNumber: { type: String, default: null },
				trackingLink: { type: String, default: null },
				status: { type: String, default: null },
				estimatedDelivery: { type: Date, default: null }
			}
		},

		payment: {
			method: { type: String, default: null }, // 'Bonifico bancario' 'Contanti' 'Carta di credito'
			statusPayment: {
				type: String,
				enum: ['pending', 'done', 'canceled'],
				default: 'pending'
			},
			transactionId: { type: String, default: null },
			points: { type: Number, default: null },
			value: { type: Number, default: null }
		},

		cart: []
	},
	{
		collection: 'orders',
		timestamps: true,
		toJSON: { virtuals: true }
	}
);
// compound index example other index are in the schema "index: true"
//orderSchema.index({ title: 1, descrLong: 1 });

orderSchema.virtual('userView', {
	ref: 'User', // The model to use
	localField: 'userId', // Find where `localField`
	foreignField: 'userId', // is equal to `foreignField`
	justOne: true
	//match: { isActive: true },
	//count: true // And only get the number of docs
});

//module.exports = mongoose.model('Order', orderSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
