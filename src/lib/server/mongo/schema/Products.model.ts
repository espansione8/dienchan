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
        certificationStatus: { type: Boolean, default: false },
        listSubscribers: [
            {
                userId: { type: String, default: '' },
                name: { type: String, default: '' },
                surname: { type: String, default: '' },
                email: { type: String, default: '' },
                phone: { type: String, default: '' },
                mobilePhone: { type: String, default: '' },
                paymentMethod: { type: String, default: '' },
                paymentStatus: { type: String, default: '' },
                certificationStatus: { type: Boolean, default: false },
                certificationDate: { type: Date, default: null },
                certificationPlace: { type: String, default: '' }
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
        promoEndDate: { type: Date, default: null },
        promoStartDate: { type: Date, default: null },
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