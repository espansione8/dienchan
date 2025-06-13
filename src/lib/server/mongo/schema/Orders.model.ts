// SCHEMA SAMPLE
import mongoose, { Schema, Types } from 'mongoose';

const orderSchema = new Schema(
	{
		orderId: {
			type: String,
			default: '',
			index: true,
			unique: true,
			dropDups: true
		},
		orderCode: {
			type: String,
			default: '',
			unique: true,
			dropDups: true
		},
		userId: { type: String, default: '', index: true }, // add virtual
		cardId: { type: String, default: '' },
		status: {
			type: String,
			enum: ['requested', 'confirmed', 'cancelled', 'exported', 'processed'],
			default: 'confirmed'
		},
		type: { type: String, enum: ['course', 'product'], default: '' }, // 'course' 'product'
		//tk: { type: String, default: '' },
		orderDate: { type: Date, default: Date.now },
		orderConfirmDate: { type: Date, default: Date.now },
		promotionId: { type: String, default: '' },
		promotionName: { type: String, default: '' },
		promoterId: { type: String, default: '' },
		agencyId: { type: String, default: '' },
		orderConfirmed: { type: Boolean, default: false },
		totalPoints: { type: Number, default: 0 },
		totalValue: { type: Number, default: 0 },
		totalDiscount: { type: Number, default: 0 },
		totalVAT: { type: Number, default: 0 },
		browser: { type: String, default: '' },
		orderIp: { type: String, default: '' },
		orderNotes: { type: String, default: '' },

		invoicing: {
			name: { type: String, default: '' },
			surname: { type: String, default: '' },
			businessName: { type: String, default: '' },
			vatNumber: { type: String, default: '' },
			address: { type: String, default: '' },
			city: { type: String, default: '' },
			county: { type: String, default: '' },
			postalCode: { type: String, default: '' },
			state: { type: String, default: '' },
			region: { type: String, default: '' },
			country: { type: String, default: '' },
			invoiceNotes: { type: String, default: '' },
			email: { type: String, default: '' },
			phone: { type: String, default: '' },
			mobilePhone: { type: String, default: '' }
		},

		shipping: {
			name: { type: String, default: '' },
			surname: { type: String, default: '' },
			address: { type: String, default: '' },
			city: { type: String, default: '' },
			county: { type: String, default: '' },
			postalCode: { type: String, default: '' },
			state: { type: String, default: '' },
			region: { type: String, default: '' },
			country: { type: String, default: '' },
			deliveryNotes: { type: String, default: '' },
			email: { type: String, default: '' },
			phone: { type: String, default: '' },
			mobilePhone: { type: String, default: '' },

			tracking: {
				company: { type: String, default: '' },
				trackingNumber: { type: String, default: '' },
				trackingLink: { type: String, default: '' },
				status: { type: String, default: '' },
				estimatedDelivery: { type: Date, default: '' }
			}
		},

		payment: {
			method: { type: String, default: '' }, // 'Bonifico bancario' 'Contanti' 'Carta di credito'
			statusPayment: {
				type: String,
				enum: ['pending', 'done', 'canceled'],
				default: 'pending'
			},
			transactionId: { type: String, default: '' },
			points: { type: String, default: '' },
			value: { type: String, default: '' }
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
