//https://github.com/m-haecker/svelte-kit-todo-app-mongoose
import mongoose from 'mongoose';

const MONGODB_URI: string = import.meta.env.VITE_MONGO_URI;

if (!MONGODB_URI) {
	throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// let cached = global.mongoose;

// if (!cached) {
// 	cached = global.mongoose = { conn: null, promise: null };
// }

async function dbConnect() {
	//console.log('MONGODB_URI', typeof MONGODB_URI, MONGODB_URI);

	await mongoose
		.set('strictQuery', false)
		// .connect(MONGODB_URI, {
		.connect('mongodb://dienadmin:zjuaq66b33iis6d@185.220.247.161:27099/dienchandb', {
			// .connect('mongodb://fastadmin:2Jgsds87VTasAnL@185.220.247.161:27099/fasttrack', {
			// .connect('mongodb://uniadmin:saBZZ3MxvVXU@161.97.69.158:27099/unipromo', {
			bufferCommands: false
		})
		.then((mongoose) => {
			return mongoose;
		});
	// if (cached.conn) {
	// 	return cached.conn;
	// }

	// if (!cached.promise) {
	// 	const opts = {
	// 		bufferCommands: false
	// 	};

	// 	cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
	// 		return mongoose;
	// 	});
	// }
	// cached.conn = await cached.promise;
	// return cached.conn;
}

export default dbConnect;
