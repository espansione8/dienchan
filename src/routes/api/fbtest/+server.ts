///BASE_URL/api/fbtest/
import { json } from '@sveltejs/kit';
import dbConnectMongo from '$lib/db/mongo/database';
import { User } from '$lib/db/mongo/schema/Users.model';
import { dbConnect } from '$lib/db/sqlite/database';
import { Message } from '$lib/db/sqlite/schema/messages';
import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path'

const DATA_DIR = 'uploads/whatsapp';
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const DEBUG_FILE = path.join(DATA_DIR, 'debug.json');

const WEBHOOK_VERIFY_TOKEN = import.meta.env.VITE_WEBHOOK_VERIFY_TOKEN
const GRAPH_API_TOKEN = import.meta.env.VITE_GRAPH_API_TOKEN

if (!fs.existsSync(DATA_DIR)) { // Ensure data directory exists
	fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(MESSAGES_FILE)) { // Initialize messages file if it doesn't exist
	fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
}

const saveMessageToFile = async (messageData: any) => {
	try {
		// Read existing messages
		const messagesRaw = fs.readFileSync(MESSAGES_FILE, 'utf8');
		const messages = JSON.parse(messagesRaw);

		// Add new message with ID and timestamp
		const newMessage = {
			...messageData,
		};

		messages.push(newMessage);

		// Write back to file
		fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
		console.log('Message saved to file');

		return newMessage;
	} catch (error) {
		console.error('Error saving message to file:', error);
		throw error;
	}
};

// Queries
///////////
// INSERT
//const resInsert = await insertData(idWhatsapp, from, text, date);
const insertData = async (idWhatsapp: string, from: string, text: string, date: number) => {
	return await dbConnect.insert(Message)
		.values({
			idWhatsapp, from, text, date
		});
};
export const GET: RequestHandler = async ({ url }) => {
	// https://www.your-clever-domain-name.com/webhooks?
	// hub.mode=subscribe&
	// hub.challenge=1158201444&
	// hub.verify_token=0CmwKKAjolM1
	const mode = url.searchParams.get('hub.mode');
	const token = url.searchParams.get('hub.verify_token');
	const challenge = url.searchParams.get('hub.challenge');
	console.log({ mode, token, challenge });

	if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
		console.log('Webhook verified successfully!');
		return new Response(challenge, { status: 200 });
		//return json(challenge, { status: 200 });
	} else {
		return new Response(null, { status: 403 });
		//return json({ message: 'api error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	try {

		//fs.writeFileSync(DEBUG_FILE, JSON.stringify(body, null, 2));

		//throw new Error(`WEBHOOK BODY DEBUG: ${JSON.stringify(body, null, 2)}`);
		// check if the webhook request contains a message: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
		const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
		const message1 = body.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
		console.log('message1', message1);
		console.log('message', message);
		//console.log('Incoming webhook message:', JSON.stringify(body, null, 2));

		// check if the incoming message contains text
		if (message?.type === 'text') {
			// extract the business number to send the reply from it
			const business_phone_number_id =
				body?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

			const apiUrl = `https://graph.facebook.com/v22.0/${business_phone_number_id}/messages`;
			const headers = {
				Authorization: `Bearer ${GRAPH_API_TOKEN}`,
				'Content-Type': 'application/json',
			};

			// console.log('business_phone_number_id', business_phone_number_id);
			// console.log('apiUrl', apiUrl);
			// console.log('headers', headers);

			// send a reply message
			//const res = await fetch(apiUrl, {
			// //////// STOP POST
			// await fetch(apiUrl, {
			// 	method: 'POST',
			// 	headers: headers,
			// 	body: JSON.stringify({
			// 		messaging_product: 'whatsapp',
			// 		to: message.from,
			// 		//text: { body: 'Echo: ' + JSON.stringify(body, null, 2) },
			// 		//text: { body: 'ricevuto: ' + message.text.body + '\n' + "hai vinto/non hai vinto" },
			// 		text: { body: "Complimeti hai vinto / Ci dispiace non hai vinto" },
			// 		context: {
			// 			message_id: message.id, // shows the message as a reply to the original user message
			// 		},
			// 	}),
			// });

			// const response = await res.json();
			// console.log('res', res);
			// console.log('response', response);

			//SQLITE
			const idWhatsapp = message.id;
			const from = message.from;
			const text = message.text.body;
			const date = Number(message.timestamp)
			const resInsert = await insertData(idWhatsapp, from, text, date);
			console.log('resInsert', resInsert);

			if (resInsert?.changes == 1) {
				console.log('success submit', resInsert);
				fs.writeFileSync(DEBUG_FILE, JSON.stringify(body, null, 2));
			} else {
				console.log('fail submit', resInsert);
				fs.writeFileSync(DEBUG_FILE, JSON.stringify(body, null, 2));
			}

			// save to JSON file
			await saveMessageToFile({ body });

			//MONGO
			await dbConnectMongo();
			const query = { userId: '4184122015', email: 'admin@admin.admin' };
			const update = {
				$set: {
					extraFieldText1: JSON.stringify(body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0].text.body),
				}
			};
			const options = { upsert: false }
			const result = await User.updateOne(query, update, options).lean().exec();

			if (result.matchedCount < 1) {
				return json({ message: 'insert error', status: 500 });
			}

			// //////// STOP UPDATE
			// mark incoming message as read
			// await fetch(apiUrl, {
			// 	method: 'POST',
			// 	headers: headers,
			// 	body: JSON.stringify({
			// 		messaging_product: 'whatsapp',
			// 		status: 'read',
			// 		message_id: message.id,
			// 	}),
			// });			
		}
		//return json({ status: 200 });
		return new Response(null, { status: 200 }); // Respond with 200 OK
	} catch (error) {
		console.error('Error handling webhook:', error);
		//return json({ status: 500 });
		return new Response(null, { status: 500 }); // Respond with 500 for errors
	}
};