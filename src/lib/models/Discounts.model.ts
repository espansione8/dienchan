// SCHEMA SAMPLE
import mongoose, { Schema, Types } from 'mongoose';

const discountSchema = new Schema(
	{
		discountId: {
			type: String,
			default: '',
			index: true,
			unique: true,
			dropDups: true
		},
		code: {
			type: String,
			default: '',
			unique: true,
			dropDups: true
		},
		type: {
			type: String,
			enum: ['percent', 'amount'],
			default: 'percent'
		},
		value: {
			type: Number,
			default: 0
		},
		userId: { type: String, default: '' },
		productId: { type: String, default: '' },
		layoutId: { type: String, default: '' },
		membershipLevel: { type: String, default: '' },
		notes: { type: String, default: '' },
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
export const Discount = mongoose.models.Discounts || mongoose.model('Discounts', discountSchema);
