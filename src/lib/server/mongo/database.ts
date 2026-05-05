import { MONGO_URI } from '$env/static/private';
import mongoose from 'mongoose';

if (!MONGO_URI) {
	throw new Error('Please define the MONGODB_URI environment variable');
}

// Cached connection to prevent multiple connections during hot reloads
let cachedConnection: typeof mongoose | null = null;

const dbConnect = async (): Promise<typeof mongoose> => {
	// Return cached connection if already connected
	if (cachedConnection && mongoose.connection.readyState === 1) {
		return cachedConnection;
	}

	// If a connection is being established, wait for it
	if (mongoose.connection.readyState === 2) {
		await new Promise<void>((resolve) => {
			mongoose.connection.once('connected', resolve);
		});
		return mongoose;
	}

	cachedConnection = await mongoose.connect(MONGO_URI, {
		bufferCommands: false
	});

	return cachedConnection;
};

export default dbConnect;