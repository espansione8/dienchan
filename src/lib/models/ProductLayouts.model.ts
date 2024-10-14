import mongoose, { Schema, Types } from 'mongoose';

const LayoutSchema = new Schema(
    {
        layoutId: {
            type: String,
            index: true,
            unique: true,
            dropDups: true
        },

        title: { type: String, default: '' },
        descr: { type: String, default: '' },
        urlPic: { type: String, default: '' },
        bgColor: { type: String, default: '' },
        price: { type: Number, default: 0 }, // in days

        bundleProduct: [{
            _id: false,  // This prevents MongoDB from adding _id to array elements
            prodId: { type: String, default: '' },
            title: { type: String, default: '' },
            price: { type: Number, default: 0 }
            // add product category
        }],

    },
    {
        collection: 'layouts',
        timestamps: true,
        toJSON: { virtuals: true }
    }
);

// layoutSchema.virtual('userView', {
//     ref: 'Users', // The model to use
//     localField: 'userId', // FIND WHERE `localField` 
//     foreignField: 'userId', // IS EQUAL TO `foreignField` 
//     justOne: true,
//     //match: { isActive: true },
//     //count: true // And only get the number of docs
// });

export const Layout = mongoose.models.Layout || mongoose.model('Layout', LayoutSchema);