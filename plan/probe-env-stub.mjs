// plan/probe-env-stub.mjs — sostituisce $env/static/private nel probe di /api/mailer/new-order.
// Legge .env (project convention: chiavi con spazio prima di "="). Artefatto di verifica, non codice di produzione.
import { readFileSync } from 'node:fs';

const parsed = Object.fromEntries(
	readFileSync(new URL('../.env', import.meta.url), 'utf8')
		.split(/\r?\n/)
		.filter((line) => line.includes('=') && !line.trim().startsWith('#'))
		.map((line) => {
			const index = line.indexOf('=');
			return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, '')];
		})
);

export const APIKEY = parsed.APIKEY;
export const BASE_URL = 'http://probe.local';
export const MAILER_HOST = parsed.MAILER_HOST;
export const MAILER_PORT = parsed.MAILER_PORT;
export const MAILER_SECURE = parsed.MAILER_SECURE;
export const MAILER_USER = parsed.MAILER_USER;
export const MAILER_PASS = parsed.MAILER_PASS;
