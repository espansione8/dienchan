import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema(
    {
        prodId: {
            type: String,
            index: true,
            unique: true
        },
        attribute1: { type: String, default: null },
        attribute10: { type: String, default: null },
        attribute2: { type: String, default: null },
        attribute3: { type: String, default: null },
        attribute4: { type: String, default: null },
        attribute5: { type: String, default: null },
        attribute6: { type: String, default: null },
        attribute7: { type: String, default: null },
        attribute8: { type: String, default: null },
        attribute9: { type: String, default: null },
        attributes: [
            {
                attribute: { type: String },
                value: { type: String },
            }
        ],
        brand: { type: String, default: null },
        brandId: { type: String, default: null },
        bundleProduct: [{
            prodId: { type: String, default: null },
            title: { type: String, default: null },
            price: { type: Number, default: 0 }
            // add product category
        }],
        category: [{ type: String, default: 'none', index: true }],
        categoryId: [{ type: String, default: 'none' }],
        cod: { type: String, default: null },
        condition: { type: String, default: null },
        cost: { type: Number, default: 0 }, //PDV: cost
        county: [{ type: String, default: null }],// provincia
        dateAdd: { type: Date, default: Date.now },
        dateUpd: { type: Date, default: Date.now },
        depth: { type: Number, default: 0 },
        descrLong: { type: String, default: null },
        descrShort: { type: String, default: null },
        discount: { type: Number, default: 0 },
        ean13: { type: String, default: null },
        eventStartDate: { type: Date, default: Date.now },
        feature: { type: String, default: null },
        filterPermissionToEdit: [],
        filterPermissionToSee: [],
        height: { type: Number, default: 0 },
        imgFull: { type: String, default: null },
        imgThumb: { type: String, default: null },
        infoExtra: { type: String, default: null },
        layoutId: { type: String, default: null, index: true }, // make index
        certificationStatus: { type: Boolean, default: false },
        listSubscribers: [
            {
                userId: { type: String, default: null },
                name: { type: String, default: null },
                surname: { type: String, default: null },
                email: { type: String, default: null },
                phone: { type: String, default: null },
                mobilePhone: { type: String, default: null },
                paymentMethod: { type: String, default: null },
                paymentStatus: { type: String, default: null },
                promoterId: { type: String, default: null },
                certificationStatus: { type: Boolean, default: false },
                certificationDate: { type: Date, default: null },
                certificationPlace: { type: String, default: null }
            }
        ],
        location: { type: String, default: null },
        manufacturer: { type: String, default: null },
        manufacturerCod: { type: String, default: null },
        manufacturerId: { type: String, default: null },
        name: { type: String, default: null },
        notes: { type: String, default: null },
        notificationEmail: [{ type: String, default: null }],
        points: { type: Number, default: 0 },
        price: { type: Number, default: 0 }, //PVP: Recommended Price for online channels
        priceSetByBundle: { type: Boolean, default: false },
        promoEndDate: { type: Date, default: null },
        promoStartDate: { type: Date, default: null },
        promoStatus: { type: String, default: null },
        promoterProCod: { type: String, default: null },
        promotions: [{ type: String }],
        rating: { type: Number, default: 0 },
        renewalLength: { type: Number, default: 0 }, // in days
        rewardProgramDetails: [
            {
                promotion: { type: Schema.Types.ObjectId, ref: 'Promotion' },
                customStatus: { type: String, default: 'disabled' },
                customNotes: { type: String, default: null },
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
        sku: { type: String, default: null },
        state: { type: String, default: null },
        status: {
            type: String,
            enum: ['enabled', 'disabled'],
            default: 'enabled'
        },
        stockQty: { type: Number, index: true, default: 0 },
        surname: { type: String, default: null },
        tag: [{ type: String }],
        title: { type: String, default: null },
        type: {
            type: String,
            enum: ['course', 'product', 'membership', 'event'],
            default: 'product'
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
        userId: { type: String, default: null, index: true }, // make index
        value1: { type: String, default: null },
        value10: { type: String, default: null },
        value2: { type: String, default: null },
        value3: { type: String, default: null },
        value4: { type: String, default: null },
        value5: { type: String, default: null },
        value6: { type: String, default: null },
        value7: { type: String, default: null },
        value8: { type: String, default: null },
        value9: { type: String, default: null },
        vatType: { type: String, default: null },
        vatValue: { type: Number, default: 0 },
        video: { type: String, default: null },
        weight: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
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