// SCHEMA SAMPLE
import mongoose, { Schema, Types } from 'mongoose';

const discountSchema = new Schema(
	{
		discountId: {
			type: String,
			default: null,
			index: true,
			unique: true,
		},
		code: {
			type: String,
			default: null,
			unique: true,
		},
		type: {
			type: String,
			enum: ['percent', 'amount', 'referral'],
			default: 'percent'
		},
		value: {
			type: Number,
			default: 0
		},
		refDiscount: {
			type: Number,
			default: 0
		},
		refPoints: {
			type: Number,
			default: 0
		},
		selectedApplicability: {
			type: String,
			enum: ['email', 'membershipLevel', 'prodId', 'layoutId', 'referral'],
			default: 'email'
		},
		email: { type: String, default: null },
		prodId: { type: String, default: null },
		layoutId: { type: String, default: null },
		membershipLevel: { type: String, default: null },
		referral: { type: String, default: null }, // email
		notes: { type: String, default: null },
		status: {
			type: String,
			enum: ['enabled', 'disabled'],
			default: 'enabled'
		},
	},
	{
		collection: 'discounts',
		timestamps: true,
		toJSON: { virtuals: true }
	}
);
// compound index example other index are in the schema "index: true"
//orderSchema.index({ title: 1, descrLong: 1 });

// discountSchema.virtual('userView', {
// 	ref: 'Users', // The model to use
// 	localField: 'userId', // Find where `localField`
// 	foreignField: 'userId', // is equal to `foreignField`
// 	justOne: true
// 	//match: { isActive: true },
// 	//count: true // And only get the number of docs
// });

//module.exports = mongoose.model('Order', orderSchema);
export const Discount = mongoose.models.Discount || mongoose.model('Discount', discountSchema);
