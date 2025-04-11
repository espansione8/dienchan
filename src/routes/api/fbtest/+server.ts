///BASE_URL/api/fbtest/
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { User } from '$lib/models/Users.model';
import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path'

const DATA_DIR = 'uploads';
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const DEBUG_FILE = path.join(DATA_DIR, 'debug.json');


const WEBHOOK_VERIFY_TOKEN = '0CmwKKAjolM1';//cert?
const GRAPH_API_TOKEN = 'EAANixdumps4BO904Ig36yaMhZBiiFsnZBgsqsvwAHTtqTVaMqmZC6kAvEbt5IDo0Skyi2g1TFAZCRd1RqzjXmzuqeYdRQL7ZCB2AR1DRADqv7ZBznx5ZCMYAHaH3dp0W4zHjqqtLXv9zMaEwM6V5L6ZA3xhy2qqiNQmcBxF1KKTZBJiChgBj5mx3esDT9tBMKR7OsKAZDZD'; // temp from https://developers.facebook.com/apps/953026863343310/whatsapp-business/wa-dev-console/?business_id=1778609712700379

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
			id: Date.now().toString(),
			...messageData,
			savedAt: new Date().toISOString()
		};

		messages.push(newMessage);

		// Write back to file
		fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
		console.log('Message saved to file:', newMessage.id);

		return newMessage;
	} catch (error) {
		console.error('Error saving message to file:', error);
		throw error;
	}
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
	try {
		const body = await request.json();
		const debugData = {
			timestamp: new Date().toISOString(),
			body: body
		};

		// Save message to JSON file

		try {
			await saveMessageToFile({ body });
			await dbConnect();
			const query = { userId: '4184122015', email: 'admin@admin.admin' };
			const update = {
				$set: {
					extraFieldText1: JSON.stringify(body),
				}
			};
			const options = { upsert: false }
			const result = await User.updateOne(query, update, options).lean().exec();

			if (result.matchedCount < 1) {
				return json({ message: 'insert error', status: 500 });
			}

		} catch (err) {
			console.log('insert ERROR:', err);
			return json({ message: 'insert ERROR' }, { status: 505 });
		}
		//fs.writeFileSync(DEBUG_FILE, JSON.stringify(debugData, null, 2));

		console.log('Incoming webhook message:', JSON.stringify(body, null, 2));
		//throw new Error(`WEBHOOK BODY DEBUG: ${JSON.stringify(body, null, 2)}`);
		// check if the webhook request contains a message: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
		const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
		console.log('message', message);

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

			console.log('business_phone_number_id', business_phone_number_id);
			console.log('apiUrl', apiUrl);
			console.log('headers', headers);

			// send a reply message
			const res = await fetch(apiUrl, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					to: message.from,
					text: { body: 'Echo: ' + body },
					//text: { body: 'Echo: ' + message.text.body },
					// context: {
					// 	message_id: message.id, // shows the message as a reply to the original user message
					// },
				}),
				// body: JSON.stringify({
				// 	messaging_product: "whatsapp",
				// 	to: "393407288501",
				// 	type: "template",
				// 	template: {
				// 		name: "hello_world",
				// 		language: { "code": "en_US" }
				// 	}
				// }),
			});
			const response = await res.json();
			console.log('res', res);
			console.log('response', response);


			// mark incoming message as read
			await fetch(apiUrl, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					status: 'read',
					message_id: message.id,
				}),
			});

			// ORIGINAL
			// // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
			// await axios({
			// 	method: "POST",
			// 	url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
			// 	headers: {
			// 	  Authorization: `Bearer ${GRAPH_API_TOKEN}`,
			// 	},
			// 	data: {
			// 	  messaging_product: "whatsapp",
			// 	  to: message.from,
			// 	  text: { body: "Echo: " + message.text.body },
			// 	  context: {
			// 		message_id: message.id, // shows the message as a reply to the original user message
			// 	  },
			// 	},
			//   });

			//   // mark incoming message as read
			//   await axios({
			// 	method: "POST",
			// 	url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
			// 	headers: {
			// 	  Authorization: `Bearer ${GRAPH_API_TOKEN}`,
			// 	},
			// 	data: {
			// 	  messaging_product: "whatsapp",
			// 	  status: "read",
			// 	  message_id: message.id,
			// 	},
			//   });
		}
		return json({ status: 200 });
		//return new Response(null, { status: 200 }); // Respond with 200 OK
	} catch (error) {
		console.error('Error handling webhook:', error);
		return json({ status: 500 });
		//return new Response(null, { status: 500 }); // Respond with 500 for errors
	}
};