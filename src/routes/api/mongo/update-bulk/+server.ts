// `${BASE_URL}/api/mongo/update-bulk`
import { APIKEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { Product } from '$lib/server/mongo/schema/Products.model';
import { Order } from '$lib/server/mongo/schema/Orders.model';
import { User } from '$lib/server/mongo/schema/Users.model';
import { Layout } from '$lib/server/mongo/schema/ProductLayouts.model';
import { Discount } from '$lib/server/mongo/schema/Discounts.model';
import dbConnect from '$lib/server/mongo/database';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const {
        apiKey,
        schema,
        update
    } = body;
    const options = { ordered: false }

    let model: any;
    if (schema == 'product') model = Product;
    if (schema == 'order') model = Order;
    if (schema == 'user') model = User;
    if (schema == 'layout') model = Layout;
    if (schema == 'discount') model = Discount;

    if (apiKey !== APIKEY) {
        return json({ message: 'api error' }, { status: 401 });
    }

    if (!update || !Array.isArray(update) || update.length === 0) {
        return json({ message: 'update missing' }, { status: 400 });
    }

    if (!model) {
        return json({ message: `Schema "${schema}" error` }, { status: 400 });
    }

    try {
        await dbConnect();
        const result = await model.bulkWrite(update, options);
        //console.log('result Bulk update', result);

        return json({ message: 'Bulk update ok', result }, { status: 200 });

    } catch (err) {
        console.error('Server error bulk update:', err);
        return json({ error: `Server error: ${err.message}` }, { status: 500 });
    }
};
// FORM ACTION SAMPLE CODE
// uploadCsv: async ({ request, fetch }) => {
//         const formData = await request.formData();
//         const file = formData.get('fileUpload');

//         if (!file || typeof file === 'string' || !(file instanceof Blob)) {
//             return fail(400, { action: 'uploadCsv', success: false, message: 'File CSV mancante o non valido' });
//         }

//         try {
//             const fileContent = await file.text();
//             const csvData = await new Promise((resolve, reject) => {
//                 Papa.parse(fileContent, {
//                     header: true,
//                     dynamicTyping: true,
//                     complete: (results) => {
//                         resolve(results.data);
//                     },
//                     error: (error) => {
//                         reject(error);
//                     },
//                 });
//             });

//             const bulkOperations = csvData.map(row => {
//                 if (!row.prodId) { // IMPORTANT: prodId , userId
//                     console.warn('CSV row skipped', row);
//                     return null; // null skip the row
//                 }

//                 return {
//                     updateOne: {
//                         filter: { prodId: row.prodId },
//                         update: { $set: row },
//                         upsert: true
//                     }
//                 };
//             }).filter(op => op !== null); // remove (null) rows

//             if (bulkOperations.length === 0) {
//                 return { action: 'uploadCsv', success: false, message: 'Nessun dato valido da processare nel CSV.' };
//             }

//             const resFetch = await fetch(`${BASE_URL}/api/mongo/update-bulk`, {
//                 method: 'POST',
//                 body: JSON.stringify({
//                     apiKey: APIKEY,
//                     schema: 'product', // 'user' FOR userId
//                     update: bulkOperations,
//                 }),
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             });
//             const res = await resFetch;

//             if (!res.ok) {
//                 return { action: 'uploadCsv', success: false, message: `res: ${await res.text()}` };
//             }

//             return { action: 'uploadCsv', success: true, message: 'CSV uploaded successfully' };
//         } catch (err) {
//             console.error('Error uploadCsv:', err);
//             return { action: 'uploadCsv', success: false, message: 'Errore server upload' };
//         }
//     },