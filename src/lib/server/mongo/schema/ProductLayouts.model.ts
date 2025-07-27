import mongoose, { Schema, Types } from 'mongoose';

const LayoutSchema = new Schema(
    {
        layoutId: {
            type: String,
            index: true,
            unique: true,
            dropDups: true
        },

        title: { type: String, default: null },
        descr: { type: String, default: null },
        urlPic: { type: String, default: null },
        bgColor: { type: String, default: null },
        price: { type: Number, default: 0 },

        bundleProducts: [],

        // bundleProducts: [{
        //     _id: false,  // This prevents MongoDB from adding _id to array elements
        //     prodId: { type: String, default: null },
        //     title: { type: String, default: null },
        //     price: { type: Number, default: 0 }
        //     // add product category
        // }],

        status: {
            type: String,
            enum: ['enabled', 'disabled'],
            default: 'enabled'
        },

        uploadfiles: [
            {
                _id: false,  // This prevents MongoDB from adding _id to array elements
                type: { type: String, enum: ['product-primary', 'product-gallery', 'membership', 'course'], default: 'none' },
                fileType: { type: String, default: null },
                fileName: { type: String, default: null },
                fileUrl: { type: String, default: null }
            }
        ],
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