// `${import.meta.env.VITE_BASE_URL}api/mongo/remove`
import { json } from '@sveltejs/kit';
import { Product } from '$lib/models/Products.model';
import { Order } from '$lib/models/Orders.model';
import { User } from '$lib/models/Users.model';
import { Layout } from '$lib/models/ProductLayouts.model';
import { Discount } from '$lib/models/Discounts.model';
import dbConnect from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';

// const email = emailToCheck.replace(/\s+/g, '').toLowerCase();
// INSTRUCTION
// const query = { type: 'product', price: 0 };
// const options = { justOne: true | false }
// const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/remove`, {
//     method: 'POST',
//     body: JSON.stringify({
//         schema: 'product', //product | order | user | layout | discount
//         query,
//         options,
//     }),
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });
// const response = await res.json();

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const {
        schema,
        query,
        options,
    } = body;

    let model: any;
    if (schema == 'product') model = Product;
    if (schema == 'order') model = Order;
    if (schema == 'user') model = User;
    if (schema == 'layout') model = Layout;
    if (schema == 'discount') model = Discount;

    try {
        await dbConnect();
        const result = await model.remove(query, options).lean().exec();

        if (result.matchedCount == 1) return json({ message: 'delete ok' }, { status: 200 });
        return json({ message: 'delete error' }, { status: 400 });

    } catch (err) {
        console.error('delete error server', err);
        return json({ error: `delete error server: ${err.message}` }, { status: 500 });
    }
};
