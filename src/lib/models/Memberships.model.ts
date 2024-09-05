// import mongoose, { Schema, Types } from 'mongoose';
import mongoose from 'mongoose';
const MembershipSchema = new mongoose.Schema(
	{
		membershipId: {
			type: String,
			default: '',
			index: true,
			unique: true,
			dropDups: true
		},

		membershipLevel: {
			type: String,
			// enum:[
			// 	'Socio inattivo', // Membership Type: Life Time || Billing Type: Free
			// 	'Socio sostenitore', // Membership Type: Regular Period || Billing Type: Payment || Price 150 EUR
			// 	'Socio ordinario annuale', // Membership Type: Regular Period || Billing Type: Payment|| Price 25 EUR
			// 	'Socio vitalizio', // Membership Type: Life Time || Billing Type: Payment|| Price 380 EUR
			// 	'Socio contributore', // Membership Type: Life Time || Billing Type: Payment|| Price 1900 EUR
			// 	'Socio riflessologo attivo', // Membership Type: Life Time || Billing Type: Free
			// 	'Riflessologo', // Membership Type: Life Time || Billing Type: Free
			// 	'Master Dien Chan', // Membership Type: Life Time || Billing Type: Free
			// ],
			default: ''
		},
		status: {
			type: String,
			enum: ['enabled', 'disabled'],
			default: 'disabled'
		},
		// membershipSignUp: { type: Date, default: '' }, // La prima volta che è stato attivato
		// membershipActivation: { type: Date, default: '' }, // la data del ultima attivazione
		membershipExpiry: { type: String, default: '' },
		membershipStatus: { type: Boolean, default: false },
		duration: { type: Number, default: 0 },
		title: { type: String, default: '' },
		descrLong: { type: String, default: '' },
		descrShort: { type: String, default: '' },
		cost: { type: Number, default: 0 }, //PDV: cost
		// price: { type: Number, default: 0 }, //PVP: Recommended Price for online channels
		vatValue: { type: Number, default: 0 },
		vatType: { type: String, default: '' },
		uploadfiles: [
			{
				type: { type: String, enum: ['membership-primary', 'membership-gallery'], default: 'none' },
				filetype: { type: String, default: '' },
				filename: { type: String, default: '' },
				fileUrl: { type: String, default: '' }
			}
		],
	},
	{
		collection: 'memberships',
		timestamps: true,
		toJSON: { virtuals: true }
	}
);

export const Membership = mongoose.models.Membership || mongoose.model('Membership', MembershipSchema);