import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema(
    {
        prodId: {
            type: String,
            index: true,
            unique: true
        },
        attribute1: { type: String, default: '' },
        attribute10: { type: String, default: '' },
        attribute2: { type: String, default: '' },
        attribute3: { type: String, default: '' },
        attribute4: { type: String, default: '' },
        attribute5: { type: String, default: '' },
        attribute6: { type: String, default: '' },
        attribute7: { type: String, default: '' },
        attribute8: { type: String, default: '' },
        attribute9: { type: String, default: '' },
        attributes: [
            {
                attribute: { type: String, default: '' },
                value: { type: String, default: '' },
            }
        ],
        brand: { type: String, default: '' },
        brandId: { type: String, default: '' },
        bundleProduct: [{
            prodId: { type: String, default: '' },
            title: { type: String, default: '' },
            price: { type: Number, default: 0 }
            // add product category
        }],
        category: [{ type: String, default: 'none', index: true }],
        categoryId: [{ type: String, default: 'none' }],
        cod: { type: String, default: '' },
        condition: { type: String, default: '' },
        cost: { type: Number, default: 0 }, //PDV: cost
        county: [{ type: String, default: '' }],// provincia
        dateAdd: { type: String, default: '' },
        dateUpd: { type: String, default: '' },
        depth: { type: Number, default: 0 },
        descrLong: { type: String, default: '' },
        descrShort: { type: String, default: '' },
        discount: { type: Number, default: 0 },
        ean13: { type: String, default: '' },
        eventStartDate: { type: Date, default: Date.now },
        feature: { type: String, default: '' },
        filterPermissionToEdit: [],
        filterPermissionToSee: [],
        height: { type: Number, default: 0 },
        imgFull: { type: String, default: '' },
        imgThumb: { type: String, default: '' },
        infoExtra: { type: String, default: '' },
        layoutId: { type: String, default: '', index: true }, // make index
        listSubscribers: [
            {
                userId: { type: String, default: '' },
                name: { type: String, default: '' },
                surname: { type: String, default: '' },
                email: { type: String, default: '' },
                phone: { type: String, default: '' },
                mobilePhone: { type: String, default: '' },
            }
        ],
        location: { type: String, default: '' },
        manufacturer: { type: String, default: '' },
        manufacturerCod: { type: String, default: '' },
        manufacturerId: { type: String, default: '' },
        name: { type: String, default: '' },
        notes: { type: String, default: '' },
        notificationEmail: [{ type: String, default: '' }],
        points: { type: Number, default: 0 },
        price: { type: Number, default: 0 }, //PVP: Recommended Price for online channels
        priceSetByBundle: { type: Boolean, default: false },
        promoEndDate: { type: Date, default: '' },
        promoStartDate: { type: Date, default: '' },
        promoStatus: { type: String, default: '' },
        promoterProCod: { type: String, default: '' },
        promotions: [{ type: String }],
        rating: { type: Number, default: 0 },
        renewalLength: { type: Number, default: 0 }, // in days
        rewardProgramDetails: [
            {
                promotion: { type: Schema.Types.ObjectId, ref: 'Promotion' },
                customStatus: { type: String, default: 'disabled' },
                customNotes: { type: String, default: '' },
                customPrice: { type: Number, default: 0 },
                reducedPointsFee: { type: Number, default: 0 },
                requiredPoints1: { type: Number, default: 0 },
                requiredPoints2: { type: Number, default: 0 },
                requiredPoints3: { type: Number, default: 0 },
                requiredPoints4: { type: Number, default: 0 },
                requiredPoints5: { type: Number, default: 0 },
                requiredPoints6: { type: Number, default: 0 },
                requiredPoints7: { type: Number, default: 0 },
                requiredPoints8: { type: Number, default: 0 },
                requiredPoints9: { type: Number, default: 0 }
            }
        ],
        shippingCost: { type: Number, default: 0 },
        sku: { type: String, default: '' },
        state: { type: String, default: '' },
        status: {
            type: String,
            enum: ['enabled', 'disabled'],
            default: 'enabled'
        },
        stockQty: { type: Number, index: true, default: 0 },
        surname: { type: String, default: '' },
        tag: [{ type: String, default: '' }],
        title: { type: String, default: '' },
        type: {
            type: String,
            enum: ['course', 'product', 'membership', 'event'],
            default: 'product'
        },
        uploadfiles: [
            {
                _id: false,  // This prevents MongoDB from adding _id to array elements
                type: { type: String, enum: ['product-primary', 'product-gallery', 'membership', 'course'], default: 'none' },
                fileType: { type: String, default: '' },
                fileName: { type: String, default: '' },
                fileUrl: { type: String, default: '' }
            }
        ],
        userId: { type: String, default: '', index: true }, // make index
        value1: { type: String, default: '' },
        value10: { type: String, default: '' },
        value2: { type: String, default: '' },
        value3: { type: String, default: '' },
        value4: { type: String, default: '' },
        value5: { type: String, default: '' },
        value6: { type: String, default: '' },
        value7: { type: String, default: '' },
        value8: { type: String, default: '' },
        value9: { type: String, default: '' },
        vatType: { type: String, default: '' },
        vatValue: { type: Number, default: 0 },
        video: { type: String, default: '' },
        weight: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        //baseId
        // supplierCod: { type: String, required: true, default: '' }, 
        // cod: { type: String, default: '' },
        // manufacturerCod: { type: String, default: '' },
        // promoterProCod: { type: String, default: '' },
        // sku: { type: String, default: '' },
        // ean13: { type: String, default: '' },
        // title: { type: String, default: '' },
        // descrLong: { type: String, default: '' },
        // descrShort: { type: String, default: '' },
        // promoStatus: { type: String, default: '' },
        // promoStartDate: { type: Date, default: '' },
        // promoEndDate: { type: Date, default: '' },
        // imgThumb: { type: String, default: '' },
        // imgFull: { type: String, default: '' },
        // rating: { type: Number, default: 0 },
        // notes: { type: String, default: '' },
        // // status: { type: String, default: 'disabled' },
        // status: {
        //     type: String,
        //     enum: ['enabled', 'disabled'],
        //     default: 'enabled'
        // },
        // condition: { type: String, default: '' },
        // feature: { type: String, default: '' },
        // attributes: [
        //     {
        //         attribute: { type: String, default: '' },
        //         value: { type: String, default: '' },
        //     }
        // ],
        // attribute1: { type: String, default: '' },
        // value1: { type: String, default: '' },
        // attribute2: { type: String, default: '' },
        // value2: { type: String, default: '' },
        // attribute3: { type: String, default: '' },
        // value3: { type: String, default: '' },
        // attribute4: { type: String, default: '' },
        // value4: { type: String, default: '' },
        // attribute5: { type: String, default: '' },
        // value5: { type: String, default: '' },
        // attribute6: { type: String, default: '' },
        // value6: { type: String, default: '' },
        // attribute7: { type: String, default: '' },
        // value7: { type: String, default: '' },
        // attribute8: { type: String, default: '' },
        // value8: { type: String, default: '' },
        // attribute9: { type: String, default: '' },
        // value9: { type: String, default: '' },
        // attribute10: { type: String, default: '' },
        // value10: { type: String, default: '' },

        // rewardProgramDetails: [
        //     {
        //         promotion: { type: Schema.Types.ObjectId, ref: 'Promotion' },
        //         customStatus: { type: String, default: 'disabled' },
        //         customNotes: { type: String, default: '' },
        //         customPrice: { type: Number, default: 0 },
        //         reducedPointsFee: { type: Number, default: 0 },
        //         requiredPoints1: { type: Number, default: 0 },
        //         requiredPoints2: { type: Number, default: 0 },
        //         requiredPoints3: { type: Number, default: 0 },
        //         requiredPoints4: { type: Number, default: 0 },
        //         requiredPoints5: { type: Number, default: 0 },
        //         requiredPoints6: { type: Number, default: 0 },
        //         requiredPoints7: { type: Number, default: 0 },
        //         requiredPoints8: { type: Number, default: 0 },
        //         requiredPoints9: { type: Number, default: 0 }
        //     }
        // ],

        // promotions: [{ type: String }],
        // points: { type: Number, default: 0 },

        // cost: { type: Number, default: 0 }, //PDV: cost
        // price: { type: Number, default: 0 }, //PVP: Recommended Price for online channels
        // // msrp: { type: Number, default: 0 }, //PRICE: Retail price (off line shops)
        // vatValue: { type: Number, default: 0 },
        // discount: { type: Number, default: 0 },
        // vatType: { type: String, default: '' },

        // stockQty: { type: Number, index: true, default: 0 },

        // video: { type: String, default: '' },

        // manufacturerId: { type: String, default: '' },
        // manufacturer: { type: String, default: '' },
        // brandId: { type: String, default: '' },
        // brand: { type: String, default: '' },
        // categoryId: [{ type: String, default: 'none' }],
        // category: [{ type: String, default: 'none', index: true }],


        // // shippingDetails: {
        // //     price: { type: Number, default: 0 },
        // //     weight: { type: Number, default: 0 },
        // //     width: { type: Number, default: 0 },
        // //     height: { type: Number, default: 0 },
        // //     depth: { type: Number, default: 0 }
        // // },

        // shippingCost: { type: Number, default: 0 },
        // width: { type: Number, default: 0 },
        // height: { type: Number, default: 0 },
        // weight: { type: Number, default: 0 },
        // depth: { type: Number, default: 0 },

        // dateAdd: { type: String, default: '' },
        // dateUpd: { type: String, default: '' },

        // uploadfiles: [
        //     {
        //         _id: false,  // This prevents MongoDB from adding _id to array elements
        //         type: { type: String, enum: ['product-primary', 'product-gallery', 'membership', 'course'], default: 'none' },
        //         fileType: { type: String, default: '' },
        //         fileName: { type: String, default: '' },
        //         fileUrl: { type: String, default: '' }
        //     }
        // ],
        // type: {
        //     type: String,
        //     enum: ['course', 'product', 'membership', 'event'],
        //     default: 'product'
        // },
        // //type: { type: String, default: '' }, //types: course / product / membership / event
        // /** new addons */
        // // course
        // infoExtra: { type: String, default: '' },
        // name: { type: String, default: '' },
        // surname: { type: String, default: '' },
        // //eventStartDate: { type: String, default: '' },
        // eventStartDate: { type: Date, default: Date.now },
        // // eventStartTime: { type: Date, default: Date.now }, //deprecated
        // //eventEndDate: { type: Date, default: Date.now }, // deprecated
        // state: { type: String, default: '' },
        // // countryState: [{ type: String, default: '' }],// provincia
        // county: [{ type: String, default: '' }],// provincia
        // location: { type: String, default: '' },
        // notificationEmail: [{ type: String, default: '' }],
        // listSubscribers: [
        //     {
        //         userId: { type: String, default: '' },
        //         name: { type: String, default: '' },
        //         surname: { type: String, default: '' },
        //         email: { type: String, default: '' },
        //         phone: { type: String, default: '' },
        //         mobilePhone: { type: String, default: '' },
        //     }
        // ],
        // filterPermissionToSee: [],
        // filterPermissionToEdit: [],
        // tag: [{ type: String, default: '' }],
        // priceSetByBundle: { type: Boolean, default: false },
        // bundleProduct: [{
        //     prodId: { type: String, default: '' },
        //     title: { type: String, default: '' },
        //     price: { type: Number, default: 0 }
        //     // add product category
        // }],
        // // membership
        // renewalLength: { type: Number, default: 0 }, // in days
        // /** end addons */
        // // joind
        // userId: { type: String, default: '', index: true }, // make index
        // layoutId: { type: String, default: '', index: true }, // make index
    },
    {
        collection: 'products',
        timestamps: true,
        toJSON: { virtuals: true }
    }
);

productSchema.virtual('userView', {
    ref: 'User', // The model to use
    localField: 'userId', // FIND WHERE `localField` 
    foreignField: 'userId', // IS EQUAL TO `foreignField` 
    justOne: true,
    //match: { isActive: true },
    //count: true // And only get the number of docs
});
productSchema.virtual('layoutView', {
    ref: 'Layout', // The model to use
    localField: 'layoutId', // FIND WHERE `localField` 
    foreignField: 'layoutId', // IS EQUAL TO `foreignField` 
    justOne: true,
    //match: { isActive: true },
    //count: true // And only get the number of docs
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);