import mongoose, { Schema, Types } from 'mongoose';

const productSchema = new Schema(
    {
        prodId: {
            type: String,
            index: true,
            unique: true,
            dropDups: true
        },
        // supplierCod: { type: String, required: true, default: '' }, 
        cod: { type: String, default: '' },
        manufacturerCod: { type: String, default: '' },
        promoterProCod: { type: String, default: '' },
        sku: { type: String, default: '' },
        ean13: { type: String, default: '' },
        title: { type: String, default: '' },
        descrLong: { type: String, default: '' },
        descrShort: { type: String, default: '' },
        promoStatus: { type: String, default: '' },
        promoStartDate: { type: Date, default: '' },
        promoEndDate: { type: Date, default: '' },
        imgThumb: { type: String, default: '' },
        imgFull: { type: String, default: '' },
        rating: { type: Number, default: 0 },
        notes: { type: String, default: '' },
        // status: { type: String, default: 'disabled' },
        status: {
            type: String,
            enum: ['enabled', 'disabled'],
            default: 'disabled'
        },
        condition: { type: String, default: '' },
        feature: { type: String, default: '' },
        // attributes: [
        //     {
        //         attribute: { type: String, default: '' },
        //         value: { type: String, default: '' },
        //     }
        // ],
        attribute1: { type: String, default: '' },
        value1: { type: String, default: '' },
        attribute2: { type: String, default: '' },
        value2: { type: String, default: '' },
        attribute3: { type: String, default: '' },
        value3: { type: String, default: '' },
        attribute4: { type: String, default: '' },
        value4: { type: String, default: '' },
        attribute5: { type: String, default: '' },
        value5: { type: String, default: '' },
        attribute6: { type: String, default: '' },
        value6: { type: String, default: '' },
        attribute7: { type: String, default: '' },
        value7: { type: String, default: '' },
        attribute8: { type: String, default: '' },
        value8: { type: String, default: '' },
        attribute9: { type: String, default: '' },
        value9: { type: String, default: '' },
        attribute10: { type: String, default: '' },
        value10: { type: String, default: '' },

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

        promotions: [{ type: String }],
        points: { type: Number, default: 0 },

        cost: { type: Number, default: 0 }, //PDV: cost
        // price: { type: Number, default: 0 }, //PVP: Recommended Price for online channels
        // msrp: { type: Number, default: 0 }, //PRICE: Retail price (off line shops)
        vatValue: { type: Number, default: 0 },
        vatType: { type: String, default: '' },

        stockQty: { type: Number, index: true, default: 0 },

        video: { type: String, default: '' },

        manufacturerId: { type: String, default: '' },
        manufacturer: { type: String, default: '' },
        brandId: { type: String, default: '' },
        brand: { type: String, default: '' },
        categoryId: [{ type: String, default: 'none' }],
        category: { type: String, default: 'none', index: true },

        // shippingDetails: {
        //     price: { type: Number, default: 0 },
        //     weight: { type: Number, default: 0 },
        //     width: { type: Number, default: 0 },
        //     height: { type: Number, default: 0 },
        //     depth: { type: Number, default: 0 }
        // },

        shippingCost: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
        depth: { type: Number, default: 0 },

        dateAdd: { type: String, default: '' },
        dateUpd: { type: String, default: '' },

        uploadfiles: [
            {
                type: { type: String, enum: ['product-primary', 'product-gallery'], default: 'none' },
                filetype: { type: String, default: '' },
                filename: { type: String, default: '' },
                fileUrl: { type: String, default: '' }
            }
        ],

    },
    {
        collection: 'products',
        timestamps: true,
        toJSON: { virtuals: true }
    }
);

export const Products = mongoose.models.Products || mongoose.model('Products', productSchema);