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
		discountCode: {
			type: String,
			default: '',
			unique: true,
			dropDups: true
		},
        discountType: {
            type: String,
            enum: ['percent', 'amount'],
            default: 'percent'
        },
        discountValue: {
            type: Number,
            default: 0
        },
        discountUserId: { type: String, default: '' },
        discountProductId: { type: String, default: '' },
        discountMemebership: { type: String, default: '' },
		discountNotes: { type: String, default: '' },
		userId: { type: String, default: '', index: true }, // add virtual
		status: {
			type: String,
			enum: ['requested', 'confirmed', 'cancelled', 'exported', 'processed'],
			default: 'confirmed'
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

discountSchema.virtual('userView', {
	ref: 'Users', // The model to use
	localField: 'userId', // Find where `localField`
	foreignField: 'userId', // is equal to `foreignField`
	justOne: true
	//match: { isActive: true },
	//count: true // And only get the number of docs
});

//module.exports = mongoose.model('Order', orderSchema);
export const Discount = mongoose.models.Discounts || mongoose.model('Discounts', discountSchema);
