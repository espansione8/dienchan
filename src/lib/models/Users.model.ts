// import mongoose, { Schema, Types } from 'mongoose';
import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			default: '',
			index: true,
			unique: true,
			dropDups: true
		},
		userCode: {
			type: String,
			default: '',
			index: true,
			unique: false,
			dropDups: true
		},
		status: {
			type: String,
			enum: ['enabled', 'disabled'],
			default: 'enabled'
		},
		token: { type: String, default: '' },
		cookieId: { type: String, default: '' },
		promotions: [], // virtual {}
		level: {
			type: String,
			enum: [
				'user',
				'formatore',
				'admin',
				'superadmin'
			],
			default: 'user'
		},
		membership:
		{
			senior: { type: String, default: '' },
			membershipLevel: {
				type: String,
				enum: [
					'Socio inattivo', // Membership Type: Life Time || Billing Type: Free
					'Socio ordinario', // Membership Type: Regular Period || Billing Type: Payment|| Price 25 EUR
					'Socio sostenitore', // Membership Type: Regular Period || Billing Type: Payment || Price 150 EUR
					'Socio vitalizio', // Membership Type: Life Time || Billing Type: Payment|| Price 380 EUR
					'Socio contributore', // Membership Type: Life Time || Billing Type: Payment|| Price 1900 EUR
					'Master Dien Chan', // Membership Type: Life Time || Billing Type: Free
				],
				default: 'Socio ordinario'
			},
			membershipSignUp: { type: Date, default: Date.now }, // La prima volta che è stato attivato
			membershipActivation: { type: Date, default: Date.now }, // la data del ultima attivazione - rinnovi
			membershipExpiry: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }, // quando scade
			membershipStatus: { type: Boolean, default: true }
		},
		codeSales: { type: String, default: '' },
		codeManager: { type: String, default: '' },
		codeSupervisor: { type: String, default: '' },
		codeAgency: { type: String, default: '' },
		codeSponsor: { type: String, default: '' },
		codeAdmin: { type: String, default: '' },
		codeSuperAdmin: { type: String, default: '' },
		name: { type: String, default: '' },
		namePublic: { type: Boolean, default: false },
		surname: { type: String, default: '' },
		surnamePublic: { type: Boolean, default: false },
		businessData: {
			businessName: { type: String, default: '' },
			vatNumber: { type: String, default: '' },
			businessCategory: { type: String, default: '' },
			businessAddress: { type: String, default: '' },
			businessCity: { type: String, default: '' },
			businessPostalCode: { type: String, default: '' },
			businessState: { type: String, default: '' },
			businessCountry: { type: String, default: '' },
			businessCounty: { type: String, default: '' },
			numberEmployed: { type: Number, default: 0 },
			grossIncome: { type: String, default: '' },
			role: { type: String, default: '' }
		},
		category: { type: String, default: '' },
		address: { type: String, default: '' },
		addressPublic: { type: Boolean, default: false },
		city: { type: String, default: '' },
		cityPublic: { type: Boolean, default: false },
		postalCode: { type: String, default: '' },
		postalCodePublic: { type: Boolean, default: false },
		countryState: { type: String, default: '' }, // Provincia
		statePublic: { type: Boolean, default: false },
		region: { type: String, default: '' }, // Regione	
		regionPublic: { type: Boolean, default: false },
		country: { type: String, default: '' }, // Nazione
		countryPublic: { type: Boolean, default: false },
		language: { type: String, default: '' },
		mobilePhone: { type: String, default: '' }, // Cellulare
		mobilePhonePublic: { type: Boolean, default: false },
		phone: { type: String, default: '' },
		phonePublic: { type: Boolean, default: false },
		email: { type: String, default: '' },
		emailPublic: { type: Boolean, default: false },
		documentUpload: { type: String, default: '' },
		photoUpload: { type: String, default: '' },
		gender: { type: String, default: '' },
		birthdate: { type: String, default: '' },
		socialSecurityNumber: { type: String, default: '' },
		card: {
			cardId: { type: String, default: '' },
			cardCode: { type: String, default: '' },
			cardActivation: { type: Date, default: '' },
			cardExpiry: { type: Date, default: '' },
			cardStatus: { type: Boolean, default: false }
		},

		username: { type: String, default: '' },
		password: { type: String, default: '' },
		pointsSpent: { type: Number, default: 0 },
		pointsBalance: { type: Number, default: 0 },
		pointsTotal: { type: Number, default: 0 },
		pointsBalanceDate: { type: Date, default: '' },
		userAvatar: { type: String, default: '' },
		privacyDate: { type: Date, default: '' },
		privacyAccept: { type: String, default: '' },
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
		extra0: { type: String, default: '' },
		extra1: { type: String, default: '' },
		extra2: { type: String, default: '' },
		extra3: { type: String, default: '' },
		extra4: { type: String, default: '' },
		extra5: { type: String, default: '' },
		extra6: { type: String, default: '' },
		extra7: { type: String, default: '' },
		extra8: { type: String, default: '' },
		extra9: { type: String, default: '' },
		extra10: { type: String, default: '' },
		extra11: { type: String, default: '' },
		extra12: { type: String, default: '' },
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
		extraFieldText1: { type: String, default: '' },
		extraFieldText2: { type: String, default: '' },
		extraFieldText3: { type: String, default: '' },
		extraFieldText4: { type: String, default: '' },
		extraFieldText5: { type: String, default: '' },
		extraFieldText6: { type: String, default: '' },
		extraFieldText7: { type: String, default: '' },
		extraFieldText8: { type: String, default: '' },
		extraFieldText9: { type: String, default: '' },
		extraFieldText10: { type: String, default: '' },
		extraFieldText11: { type: String, default: '' },
		extraFieldText12: { type: String, default: '' },
		extraFieldText13: { type: String, default: '' },
		extraFieldText14: { type: String, default: '' },
		extraFieldText15: { type: String, default: '' },
		extraFieldText16: { type: String, default: '' },
		extraFieldText17: { type: String, default: '' },
		extraFieldText18: { type: String, default: '' },
		extraFieldText19: { type: String, default: '' },
		extraFieldText20: { type: String, default: '' },
		extraFieldText21: { type: String, default: '' },
		extraFieldText22: { type: String, default: '' },
		extraFieldText23: { type: String, default: '' },
		extraFieldText24: { type: String, default: '' },
		lastAccess: { type: Date, default: '' },
		counterAccess: { type: Number, default: 0 },
		remoteIP: { type: String, default: '' },
		remoteHost: { type: String, default: '' },
		remoteBrowser: { type: String, default: '' },
		notesOnUser: { type: String, default: '' },
		userCart: [],
		userWishList: [],
		documentPageArray: [{ type: String }],
		storicoCorsiPartecipati: [],
		storicoCorsiCreati: [],
		docModifyArray: [
			{
				documentPageId: { type: String, default: '' },
				shortDescription: { type: String, default: '' },
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
				type: { type: String, enum: ['id', 'avatar'], default: 'none' },
				filetype: { type: String, default: '' },
				filename: { type: String, default: '' },
				fileUrl: { type: String, default: '' }
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
export const User = mongoose.models.Users || mongoose.model('Users', UserSchema);
// check for extra fixes https://stackoverflow.com/questions/19051041/cannot-overwrite-model-once-compiled-mongoose

