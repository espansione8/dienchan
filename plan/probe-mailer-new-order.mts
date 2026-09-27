// plan/probe-mailer-new-order.mts — probe T-3: esegue il VERO handler POST di /api/mailer/new-order
// (bundlato con esbuild e $env/static/private sostituito da plan/probe-env-stub.mjs), con trasporto SMTP
// e lookup MongoDB stubbati: nessuna mail reale inviata. Artefatto di verifica, non codice di produzione.
// Uso: node plan/probe-mailer-new-order.mts
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

const here = (relative) => fileURLToPath(new URL(relative, import.meta.url));

await build({
	// PROBE_ENTRY permette di puntare a una variante (es. la versione pre-fix per verificare che il probe la bocci)
	entryPoints: [here(process.env.PROBE_ENTRY ?? '../src/routes/api/mailer/new-order/+server.ts')],
	bundle: true,
	platform: 'node',
	format: 'esm',
	packages: 'external',
	outfile: here('./.probe-new-order.mjs'),
	logLevel: 'warning',
	plugins: [
		{
			name: 'env-stub',
			setup(build) {
				build.onResolve({ filter: /^\$env\/static\/private$/ }, () => ({ path: here('./probe-env-stub.mjs') }));
			}
		}
	]
});

const { APIKEY } = await import(new URL('./probe-env-stub.mjs', import.meta.url).href);
const { POST } = await import(new URL('./.probe-new-order.mjs', import.meta.url).href);

const sent = [];
nodemailer.createTransport = () => ({
	sendMail: async (options) => {
		sent.push(options);
		return { messageId: 'probe' };
	}
});

// DB finta: il titolare reale del corso è OWNER1; VICTIM è un altro socio con contatto privato.
// Il carrello arriva dal client, quindi userId nel carrello NON è attendibile: il titolare va ricavato
// dal prodotto (prodId) e poi caricato dallo schema user.
const PRODUCT_OWNER = { PROBE_COURSE: 'OWNER1' };
const USERS = {
	OWNER1: { name: 'Mario', surname: 'Rossi', phone: '3331234567' },
	VICTIM: { name: 'Vittima', surname: 'Segreta', phone: '3990000000' }
};
const resetOwner = () => {
	USERS.OWNER1 = { name: 'Mario', surname: 'Rossi', phone: '3331234567' };
};
let lookupThrows = false;
let lookupCalls = 0;
const lookupSchemas = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
	if (!String(url).includes('/api/mongo/find')) return realFetch(url);
	lookupCalls++;
	if (lookupThrows) throw new Error('lookup down');
	const body = JSON.parse(init.body);
	lookupSchemas.push(body.schema);
	if (body.schema === 'product') {
		const ownerId = PRODUCT_OWNER[body.query.prodId];
		return new Response(JSON.stringify(ownerId ? [{ userId: ownerId }] : []), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	// schema user: risponde con il contatto dell'utente richiesto, come farebbe il DB
	const found = USERS[body.query.userId];
	return new Response(JSON.stringify(found ? [found] : []), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

const order = (cart) => ({
	orderId: 'PROBE01',
	createdAt: new Date().toISOString(),
	totalValue: 25,
	totalDiscount: 0,
	type: cart[0]?.type ?? 'product',
	invoicing: {
		name: 'Luca',
		surname: 'Bianchi',
		address: 'Via Roma 1',
		postalCode: '25015',
		city: 'Desenzano del Garda',
		county: 'BS',
		country: 'Italia',
		email: 'luca@example.com',
		phone: '030000000',
		mobilePhone: '333000000'
	},
	shipping: {
		name: 'Luca',
		surname: 'Bianchi',
		address: 'Via Roma 1',
		postalCode: '25015',
		city: 'Desenzano del Garda',
		county: 'BS',
		country: 'Italia',
		email: 'luca@example.com',
		phone: '030000000',
		mobilePhone: '333000000'
	},
	payment: { method: 'Carta di credito' },
	orderNotes: '',
	cart
});

const send = async (cart) => {
	lookupCalls = 0;
	lookupSchemas.length = 0;
	const response = await POST({
		request: new Request('http://probe.local/api/mailer/new-order', {
			method: 'POST',
			body: JSON.stringify({ apiKey: APIKEY, email: ['probe@example.com'], order: order(cart) }),
			headers: { 'Content-Type': 'application/json' }
		})
	});
	assert.equal(response.status, 200, `handler status ${response.status}`);
	assert.equal(sent.length > 0, true, 'nessuna mail passata al trasporto');
	const mail = sent.at(-1);
	return { html: String(mail.html), subject: String(mail.subject) };
};

const course = (extra = {}) => [
	{ prodId: 'PROBE_COURSE', type: 'course', ...extra, layoutView: { title: 'Corso Probe', price: 25 }, price: 25 }
];
const product = [{ prodId: 'P1', type: 'product', title: 'Prodotto Probe', price: 25, orderQuantity: 1 }];

let html;

// 1) carrello contraffatto: userId del client punta a un altro socio -> non deve trapelare
({ html } = await send(course({ userId: 'VICTIM' })));
assert.doesNotMatch(html, /Vittima|Segreta|3990000000/, 'il contatto del socio indicato dal client NON deve trapelare');
assert.match(html, /Mario Rossi/, 'il titolare reale va mostrato anche se il carrello mente');
assert.equal(lookupSchemas[0], 'product', 'il titolare deve venire dal prodotto, non dal client');

// 2) corso regolare: titolare dal prodotto, contatto mostrato una volta sola
({ html } = await send(course({ userId: 'OWNER1' })));
assert.match(html, /Il tuo Riflessologo:/, 'blocco riflessologo mancante');
assert.match(html, /Mario Rossi/, 'nome e cognome del riflessologo mancanti');
assert.match(html, /Tel: 3331234567/, 'telefono del riflessologo mancante');
assert.deepEqual(lookupSchemas, ['product', 'user'], 'prima il prodotto, poi il titolare');
assert.equal(lookupCalls, 2, 'due lookup per un ordine corso');

// 3) ordine senza corso: nessun lookup
({ html } = await send(product));
assert.doesNotMatch(html, /Il tuo Riflessologo:/, 'nessun blocco per ordini senza corso');
assert.equal(lookupCalls, 0, 'nessun lookup inutile senza corso');

// 4) titolare con solo cellulare
resetOwner();
USERS.OWNER1 = { name: 'Mario', surname: 'Rossi', mobilePhone: '3409999999' };
({ html } = await send(course({ userId: 'OWNER1' })));
assert.match(html, /Mario Rossi/, 'blocco mancante con solo cellulare');
assert.match(html, /Tel: 3409999999/, 'fallback su mobilePhone mancante');
assert.doesNotMatch(html, /Tel: undefined/, 'il telefono non deve renderizzare undefined');

// 5) corso senza prodId: niente da risolvere
resetOwner();
({ html } = await send([{ type: 'course', userId: 'OWNER1', layoutView: { title: 'Corso Probe', price: 25 }, price: 25 }]));
assert.doesNotMatch(html, /Il tuo Riflessologo:/, 'nessun blocco senza prodId');
assert.equal(lookupCalls, 0, 'nessun lookup senza prodId');

// 6) prodId inesistente a DB: un solo lookup (prodotto), nessun blocco
({ html } = await send([{ prodId: 'GHOST', type: 'course', userId: 'VICTIM', layoutView: { title: 'Corso Probe', price: 25 }, price: 25 }]));
assert.doesNotMatch(html, /Il tuo Riflessologo:/, 'nessun blocco se il prodotto non esiste');
assert.deepEqual(lookupSchemas, ['product'], 'nessun lookup utente se il prodotto non esiste');

// 7) lookup fallito: la mail parte comunque, senza blocco
lookupThrows = true;
const failed = await send(course({ userId: 'OWNER1' }));
assert.doesNotMatch(failed.html, /Il tuo Riflessologo:/, 'lookup fallito: nessun blocco');
assert.match(failed.subject, /PROBE01/, 'mail inviata comunque dopo un lookup fallito');
lookupThrows = false;

console.log('OK - blocco riflessologo con nome, cognome e telefono (anche con solo mobilePhone)');
console.log('OK - titolare ricavato dal prodotto: carrello contraffatto non fa trapelare altri contatti');
console.log('OK - nessun blocco per ordini senza corso, prodId assente/inesistente o lookup fallito');
console.log(`OK - ${sent.length} mail costruite, nessuna inviata (trasporto stubbato)`);
