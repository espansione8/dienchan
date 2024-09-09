import mongoose, { Schema, Types } from 'mongoose';

// const productSchema = new Schema(
//   {
//     productId: {
// 			type: Number,
// 			default: 0,
// 			index: true,
// 			unique: true,
// 			dropDups: true
// 		},
//   }
// );

// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const ProductCorsoSchema = new Schema(
	{
		//prodCorsoId: { OLD
		courseId: {
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
		infoExtra: { type: String, default: '' },
		name: { type: String, default: '' },
		surname: { type: String, default: '' },
		/** aggiunta */
		eventStartDate: { type: Date, default: Date.now },
		eventEndDate: { type: Date, default: Date.now },
		state: { type: String, default: '' },
		place: { type: String, default: '' },
		notificationEmail: [{ type: String, default: '' }],
		listSubscribers: [
			{
				userId: { type: String, default: '' },
				name: { type: String, default: '' },
				surname: { type: String, default: '' },
				email: { type: String, default: '' },
				confirmDate: { type: Date, default: Date.now }
			}
		],
		filterPermissionToSee: [],
		filterPermissionToEdit: [],
		userId: { type: String, default: '', index: true }, // make index
		tag: [{ type: String, default: '' }],
		priceSetByBundle: { type: Boolean, default: false },
		bundleProduct: [{
			prodId: { type: String, default: '' },
			title: { type: String, default: '' },
			price: { type: Number, default: 0 }
			// aggiungere categoria prodotto
		}],
		/** fine aggiunta */
		promoStatus: { type: String, default: '' },
		promoStartDate: { type: Date, default: '' },
		promoEndDate: { type: Date, default: '' },
		imgThumb: { type: String, default: '' },
		imgFull: { type: String, default: '' },
		rating: { type: Number, default: 0 },
		notes: { type: String, default: '' },
		status: {
			type: String,
			enum: ['enabled', 'disabled', 'draft'],
			default: 'enabled'
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
		price: { type: Number, default: 0 }, //PVP: Recommended Price for online channels
		msrp: { type: Number, default: 0 }, //PRICE: Retail price (off line shops)
		vatValue: { type: Number, default: 0 },
		vatType: { type: String, default: '' },

		stockQty: { type: Number, index: true, default: 0 },

		video: { type: String, default: '' },

		manufacturerId: { type: String, default: '' },
		manufacturer: { type: String, default: '' },
		brandId: { type: String, default: '' },
		brand: { type: String, default: '' },
		categoryId: [{ type: String, default: 'none' }],
		category: [{ type: String, index: true }],

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

		image1: { type: String, default: '' },
		image2: { type: String, default: '' },
		image3: { type: String, default: '' },
		image4: { type: String, default: '' },
		image5: { type: String, default: '' },
		image6: { type: String, default: '' },
		image7: { type: String, default: '' },
		image8: { type: String, default: '' },
		orderQuantity: { type: Number, default: 0 },
	},
	{
		collection: 'courses',
		timestamps: true,
		toJSON: { virtuals: true }
	}
);


// compound index example other index are in the schema "index: true"
//productSchema.index({ title: 1, descrLong: 1 });
// productSchema.index({ createdAt: -1, dateAdd: -1 });

// join SQL

ProductCorsoSchema.virtual('userView', {
	ref: 'Users', // The model to use
	localField: 'userId', // FIND WHERE `localField` 
	foreignField: 'userId', // IS EQUAL TO `foreignField` 
	//justOne: true,
	//match: { isActive: true },
	//count: true // And only get the number of docs
});



// productSchema.virtual('brandView', {
// 	ref: 'Brand', // The model to use
// 	localField: 'brand', // Find where `localField`
// 	foreignField: 'brandId', // is equal to `foreignField`
// 	justOne: true,
// 	//match: { isActive: true },
// 	//count: true // And only get the number of docs
// });
// productSchema.virtual('manufacturerView', {
// 	ref: 'Manufacturer', // The model to use
// 	localField: 'manufacturer', // Find where `localField`
// 	foreignField: 'manufacturerId', // is equal to `foreignField`
// 	//justOne: false,
// 	//match: { isActive: true },
// 	//count: true // And only get the number of docs
// });

// const Product = mongoose.model('Product', productSchema);
// Product.on('index', error => {
//     if (error != undefined)
//         console.log('Product index error: ', error);
// });

export const Course = mongoose.models.Courses || mongoose.model('Courses', ProductCorsoSchema);
