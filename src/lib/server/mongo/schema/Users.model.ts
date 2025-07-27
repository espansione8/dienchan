// import mongoose, { Schema, Types } from 'mongoose';
import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			default: null,
			index: true,
			unique: true
		},
		userCode: {
			type: String,
			default: null,
			unique: false
		},
		status: {
			type: String,
			enum: ['enabled', 'disabled'],
			default: 'enabled'
		},
		token: { type: String, default: null },
		cookieId: { type: String, default: null },
		promotions: [], // virtual {}
		level: {
			type: String,
			enum: [
				'user',
				'formatore base',
				'formatore avanzato',
				'accademia',
				'master',
				'admin',
				'superadmin'
			],
			default: 'user'
		},
		membership:
		{
			senior: { type: String, default: null },
			membershipLevel: {
				type: String,
				enum: [
					'Socio inattivo', // Membership Type: Life Time || Billing Type: Free
					'Socio ordinario', // Membership Type: Regular Period || Billing Type: Payment|| Price 25 EUR
					'Socio formatore', // Membership Type: Regular Period || Billing Type: Payment|| Price 25 EUR
					'Socio vitalizio', // Membership Type: Life Time || Billing Type: Payment|| Price 380 EUR
					'Socio vitalizio formatore', // Membership Type: Life Time || Billing Type: Payment|| Price 380 EUR
					//'Socio sostenitore', // Membership Type: Regular Period || Billing Type: Payment || Price 150 EUR
					//'Socio contributore', // Membership Type: Life Time || Billing Type: Payment|| Price 1900 EUR
					//'Master Dien Chan', // Membership Type: Life Time || Billing Type: Free
				],
				default: 'Socio ordinario'
			},
			membershipSignUp: { type: Date, default: Date.now }, // La prima volta che è stato attivato
			membershipActivation: { type: Date, default: Date.now }, // la data del ultima attivazione - rinnovi
			//membershipExpiry: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }, // quando scade
			membershipExpiry: {
				type: Date, default: () => {
					const date = new Date();
					date.setFullYear(date.getFullYear() + 1);
					return date;
				}
			}, // quando scade
			membershipStatus: { type: Boolean, default: true }
		},
		insurance: {
			insuranceDate: { type: Date, default: Date.now },
			insuranceStatus: { type: Boolean, default: false }
		},
		codeSales: { type: String, default: null },
		codeManager: { type: String, default: null },
		codeSupervisor: { type: String, default: null },
		codeAgency: { type: String, default: null },
		codeSponsor: { type: String, default: null },
		codeAdmin: { type: String, default: null },
		codeSuperAdmin: { type: String, default: null },
		name: { type: String, default: null },
		namePublic: { type: Boolean, default: false },
		surname: { type: String, default: null },
		surnamePublic: { type: Boolean, default: false },
		businessData: {
			businessName: { type: String, default: null },
			vatNumber: { type: String, default: null },
			businessCategory: { type: String, default: null },
			businessAddress: { type: String, default: null },
			businessCity: { type: String, default: null },
			businessPostalCode: { type: String, default: null },
			businessState: { type: String, default: null },
			businessCountry: { type: String, default: null },
			businessCounty: { type: String, default: null },
			numberEmployed: { type: Number, default: 0 },
			grossIncome: { type: String, default: null },
			role: { type: String, default: null }
		},
		category: { type: String, default: null },
		address: { type: String, default: null },
		addressPublic: { type: Boolean, default: false },
		city: { type: String, default: null },
		cityPublic: { type: Boolean, default: false },
		postalCode: { type: String, default: null },
		postalCodePublic: { type: Boolean, default: false },
		county: { type: String, default: null }, // Provincia
		countyPublic: { type: Boolean, default: false },
		region: { type: String, default: null }, // Regione	
		regionPublic: { type: Boolean, default: false },
		country: { type: String, default: null }, // Nazione
		countryPublic: { type: Boolean, default: false },
		language: { type: String, default: null },
		mobilePhone: { type: String, default: null }, // Cellulare
		mobilePhonePublic: { type: Boolean, default: false },
		phone: { type: String, default: null },
		phonePublic: { type: Boolean, default: false },
		email: { type: String, index: true, default: null },
		emailPublic: { type: Boolean, default: false },
		documentUpload: { type: String, default: null },
		photoUpload: { type: String, default: null },
		gender: { type: String, default: null },
		birthdate: { type: String, default: null },
		socialSecurityNumber: { type: String, default: null },
		card: {
			cardId: { type: String, default: null },
			cardCode: { type: String, default: null },
			cardActivation: { type: Date, default: null },
			cardExpiry: { type: Date, default: null },
			cardStatus: { type: Boolean, default: false }
		},

		username: { type: String, default: null },
		password: { type: String, default: null },
		pointsSpent: { type: Number, default: 0 },
		pointsBalance: { type: Number, default: 0 },
		pointsTotal: { type: Number, default: 0 },
		pointsBalanceDate: { type: Date, default: null },
		pointsHistory: [
			{
				points: { type: Number, default: 0 },
				note: { type: String, default: null },
				date: { type: Date, default: Date.now }
			}
		],
		trainingHistory: [
			{
				hours: { type: Number, default: 0 },
				description: { type: String, default: null },
				date: { type: Date, default: Date.now },
				fileName: { type: String, default: 'N/A' },
				fileUrl: { type: String, default: null },
			}
		],
		userAvatar: { type: String, default: null },
		privacyDate: { type: Date, default: null },
		privacyAccept: { type: String, default: null },
		revenue: { type: Number, default: 0 },
		target0: { type: Number, default: 0 },
		target1: { type: Number, default: 0 },
		target2: { type: Number, default: 0 },
		target3: { type: Number, default: 0 },
		target4: { type: Number, default: 0 },
		target5: { type: Number, default: 0 },
		target6: { type: Number, default: 0 },
		target7: { type: Number, default: 0 },
		target8: { type: Number, default: 0 },
		target9: { type: Number, default: 0 },
		target10: { type: Number, default: 0 },
		target11: { type: Number, default: 0 },
		target12: { type: Number, default: 0 },
		extra0: { type: String, default: null },
		extra1: { type: String, default: null },
		extra2: { type: String, default: null },
		extra3: { type: String, default: null },
		extra4: { type: String, default: null },
		extra5: { type: String, default: null },
		extra6: { type: String, default: null },
		extra7: { type: String, default: null },
		extra8: { type: String, default: null },
		extra9: { type: String, default: null },
		extra10: { type: String, default: null },
		extra11: { type: String, default: null },
		extra12: { type: String, default: null },
		extraFieldNumber1: { type: Number, default: 0 },
		extraFieldNumber2: { type: Number, default: 0 },
		extraFieldNumber3: { type: Number, default: 0 },
		extraFieldNumber4: { type: Number, default: 0 },
		extraFieldNumber5: { type: Number, default: 0 },
		extraFieldNumber6: { type: Number, default: 0 },
		extraFieldNumber7: { type: Number, default: 0 },
		extraFieldNumber8: { type: Number, default: 0 },
		extraFieldNumber9: { type: Number, default: 0 },
		extraFieldNumber10: { type: Number, default: 0 },
		extraFieldNumber11: { type: Number, default: 0 },
		extraFieldNumber12: { type: Number, default: 0 },
		extraFieldNumber13: { type: Number, default: 0 },
		extraFieldNumber14: { type: Number, default: 0 },
		extraFieldNumber15: { type: Number, default: 0 },
		extraFieldNumber16: { type: Number, default: 0 },
		extraFieldNumber17: { type: Number, default: 0 },
		extraFieldNumber18: { type: Number, default: 0 },
		extraFieldNumber19: { type: Number, default: 0 },
		extraFieldNumber20: { type: Number, default: 0 },
		extraFieldNumber21: { type: Number, default: 0 },
		extraFieldNumber22: { type: Number, default: 0 },
		extraFieldNumber23: { type: Number, default: 0 },
		extraFieldNumber24: { type: Number, default: 0 },
		extraFieldText1: { type: String, default: null },
		extraFieldText2: { type: String, default: null },
		extraFieldText3: { type: String, default: null },
		extraFieldText4: { type: String, default: null },
		extraFieldText5: { type: String, default: null },
		extraFieldText6: { type: String, default: null },
		extraFieldText7: { type: String, default: null },
		extraFieldText8: { type: String, default: null },
		extraFieldText9: { type: String, default: null },
		extraFieldText10: { type: String, default: null },
		extraFieldText11: { type: String, default: null },
		extraFieldText12: { type: String, default: null },
		extraFieldText13: { type: String, default: null },
		extraFieldText14: { type: String, default: null },
		extraFieldText15: { type: String, default: null },
		extraFieldText16: { type: String, default: null },
		extraFieldText17: { type: String, default: null },
		extraFieldText18: { type: String, default: null },
		extraFieldText19: { type: String, default: null },
		extraFieldText20: { type: String, default: null },
		extraFieldText21: { type: String, default: null },
		extraFieldText22: { type: String, default: null },
		extraFieldText23: { type: String, default: null },
		extraFieldText24: { type: String, default: null },
		lastAccess: { type: Date, default: null },
		counterAccess: { type: Number, default: 0 },
		remoteIP: { type: String, default: null },
		remoteHost: { type: String, default: null },
		remoteBrowser: { type: String, default: null },
		notesOnUser: { type: String, default: null },
		userCart: [],
		userWishList: [],
		documentPageArray: [{ type: String }],
		courseJoined: [],
		courseCreated: [],
		docModifyArray: [
			{
				documentPageId: { type: String, default: null },
				shortDescription: { type: String, default: null },
				updateStatus: {
					type: String,
					enum: ['none', 'sent', 'approved'],
					default: 'none'
				},
				//uploadedFiles: [{ filename: { type: String } }]
				uploadedFiles: [{ type: String }]
			}
		], // list documentPageId
		uploadfiles: [
			{
				_id: false,  // This prevents MongoDB from adding _id to array elements
				type: { type: String, enum: ['id', 'profile'], default: 'none' },
				fileType: { type: String, default: null },
				fileName: { type: String, default: null },
				fileUrl: { type: String, default: null }
			}
		],
	},
	{
		collection: 'users',
		timestamps: true,
		toJSON: { virtuals: true }
	}
);

//module.exports = mongoose.model('User', UserSchema);
// export const User = mongoose.model('User', UserSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
// check for extra fixes https://stackoverflow.com/questions/19051041/cannot-overwrite-model-once-compiled-mongoose

