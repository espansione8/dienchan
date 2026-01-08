// $lib/server/mongo/schema/Videos.model.ts
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
	{
		videoId: {
			type: String,
			default: null,
			index: true,
			unique: true
		},
		status: {
			type: String,
			enum: ['enabled', 'disabled'],
			default: 'enabled'
		},
		title: { type: String, required: true },
		url: { type: String, required: true },
		visibility: [{
			type: String,
			enum: [
				'user',
				'riflessologo',
				'formatore base',
				'master',
				'formatore avanzato',
				'admin',
				'superadmin'
			]
		}]
	},
	{
		collection: 'videos',
		timestamps: true
	}
);

export const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);