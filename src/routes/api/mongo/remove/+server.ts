// `${import.meta.env.VITE_BASE_URL}api/mongo/remove`
import { json } from '@sveltejs/kit';
import { Product } from '$lib/db/mongo/schema/Products.model';
import { Order } from '$lib/db/mongo/schema/Orders.model';
import { User } from '$lib/db/mongo/schema/Users.model';
import { Layout } from '$lib/db/mongo/schema/ProductLayouts.model';
import { Discount } from '$lib/db/mongo/schema/Discounts.model';
import dbConnect from '$lib/db/mongo/database';
import type { RequestHandler } from '@sveltejs/kit';

// const email = emailToCheck.replace(/\s+/g, '').toLowerCase();
// INSTRUCTION
// const apiKey = import.meta.env.VITE_APIKEY;
// const query = { type: 'product', price: 0 };
// const multi = false | true
// const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/remove`, {
//     method: 'POST',
//     body: JSON.stringify({
//         apiKey,
//         schema: 'product', //product | order | user | layout | discount
//         query,
//         multi,
//     }),
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });
// const response = await res.json();

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const {
        apiKey,
        schema,
        query,
        multi,
    } = body;

    if (apiKey !== import.meta.env.VITE_APIKEY) {
        return json({ message: 'api error' }, { status: 401 });
    }

    let model: any;
    if (schema == 'product') model = Product;
    if (schema == 'order') model = Order;
    if (schema == 'user') model = User;
    if (schema == 'layout') model = Layout;
    if (schema == 'discount') model = Discount;

    try {
        await dbConnect();
        //const result = await model.remove(query, options).lean().exec();
        let result
        if (multi) {
            result = await model.deleteMany(query).exec();
        } else {
            result = await model.deleteOne(query).exec();
        }

        if (result.deletedCount > 0) return json({ message: 'delete ok' }, { status: 200 });
        return json({ message: 'delete error' }, { status: 400 });

    } catch (err) {
        console.error('delete error server', err);
        return json({ error: `delete error server: ${err.message}` }, { status: 500 });
    }
};
