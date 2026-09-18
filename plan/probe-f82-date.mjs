// plan/probe-f82-date.mjs — one-off read-only probe (delete or keep under plan/, gitignored)
// run: node --env-file=.env plan/probe-f82-date.mjs
import mongoose from 'mongoose';

const conn = await mongoose.createConnection(process.env.MONGO_URI).asPromise();
const doc = await conn.db
	.collection('products')
	.findOne(
		{ prodId: 'F82B3JBZT' },
		{
			projection: {
				_id: 0,
				prodId: 1,
				type: 1,
				status: 1,
				userId: 1,
				layoutId: 1,
				eventStartDate: 1,
				'layoutView.title': 1,
				'layoutView.price': 1
			}
		}
	);

console.log(JSON.stringify({ found: !!doc, ...doc, when: doc?.eventStartDate ? new Date(doc.eventStartDate).toISOString() : null }, null, 2));
await conn.close();
