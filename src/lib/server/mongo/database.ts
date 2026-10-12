import { MONGO_URI } from '$env/static/private';
import mongoose from 'mongoose';
import dns from 'node:dns';

if (!MONGO_URI) {
	throw new Error('Please define the MONGODB_URI environment variable');
}

// WORKAROUND: c-ares 1.34.6 regression on Windows.
// See nodejs/node#62347 and nodejs/node#62748 (upstream c-ares/c-ares#1080).
// When DNS is assigned via DHCP and several interfaces exist with empty DNS,
// c-ares fails to read the system DNS servers and falls back to 127.0.0.1.
// Every dns.resolve*() call then fails with ECONNREFUSED, which breaks the
// SRV/TXT lookups required by `mongodb+srv://` URIs. Node v20.20.2, v22.22.x
// and v24.1x are affected; v20.19.4 (c-ares 1.34.5) is the last good build.
// Only triggers when the broken fallback is actually detected, so it is a
// no-op on healthy machines and on Linux/macOS. Remove once Node ships the fix.
if (process.platform === 'win32' && dns.getServers().every((server) => server === '127.0.0.1')) {
	dns.setServers(['192.168.31.1', '1.1.1.1', '8.8.8.8']);
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