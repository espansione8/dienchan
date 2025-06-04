// src/routes/login/+page.server.ts
import type { Actions } from './$types';
import { BASE_URL, APIKEY, SALT } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import { hash } from '$lib/tools/hash';
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6)

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const loginEmail = data.get('loginEmail') as string;
		const loginPassword = data.get('loginPassword') as string;
		const rememberMe = data.get('rememberMe') === 'on'; // Checkbox value is 'on' or null
		const cookieId = crypto.randomUUID()

		let response: any;

		const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { email: loginEmail }, //IF USE Products.model -> types: course / product / membership / event
				projection: { email: 1, password: 1 }, // 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1,
				skip: 0,
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		const updateFetch = (userEmail: string) => fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { email: userEmail }, //IF USE Products.model -> types: course / product / membership / event,
				update: { $set: { cookieId } },
				options: { upsert: false },
				multi: false,
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		});

		if (!loginEmail || !loginPassword) {
			return fail(400, { action: 'login', success: false, message: 'Dati mancanti' });
		}

		try {
			// MEMO
			// const [userRes, updateRes] = await Promise.all([ for
			// 	userFetch,
			// 	updateFetch(response[0].email)
			// ]);

			const userRes = await userFetch;

			if (!userRes.ok) {
				const errorText = await userRes.text();
				console.error('user find failed', userRes.status, errorText);
				return fail(400, { action: 'login', success: false, message: errorText });
			}
			response = await userRes.json(); // [{ email, password }]

			if (!response || response.length === 0 || !response[0].email || response[0].password !== hash(loginPassword, SALT)) {
				return fail(400, { action: 'login', success: false, message: 'mail o password errate' })
			}

			const updateRes = await updateFetch(response[0].email);

			if (!updateRes.ok) {
				const errorText = await updateRes.text();
				console.error('product update failed', updateRes.status, errorText);
				return fail(400, { action: 'modify', success: false, message: errorText });
			}

			cookies.set('session_id', cookieId, {
				httpOnly: true,
				//maxAge: 60 * 60 * 24 * 7 // one week
				//maxAge: 60 * 60 * 24 * 1 // one day
				maxAge: rememberMe ? 60 * 60 * 24 * 365 : 60 * 60 * 24 * 1,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				path: '/'
			});
			return { action: 'login', success: true, message: "login ok", payload: true };

		} catch (error: any) {
			console.error('Error login:', error);
			return fail(400, { action: 'login', success: false, message: 'Error login' });
		}
	},

	register: async ({ request }) => {
		// TODO
		return { action: 'register', success: true, message: "test ok" };
		const data = await request.formData();
		const registerEmail = data.get('registerEmail') as string;
		const password = data.get('password') as string;
		const passwordConfirm = data.get('passwordConfirm') as string;

		if (!registerEmail || !password || !passwordConfirm) {
			return fail(400, { registerEmail, error: 'Tutti i campi sono obbligatori.', form: 'register' });
		}

		if (password !== passwordConfirm) {
			return fail(400, { registerEmail, error: 'Le password non corrispondono.', form: 'register' }); // [cite: 15]
		}

		try {
			const res = await fetch(`${BASE_URL}/api/auth/sign-up`, { // [cite: 16]
				method: 'POST',
				body: JSON.stringify({ registerEmail, password1: password }), // Assuming API expects 'password1' [cite: 16]
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				// const responseData = await res.json(); // If API sends data on success
				throw redirect(303, '/profile-modify'); // [cite: 17]
			} else {
				const responseData = await res.json();
				return fail(res.status, { registerEmail, error: responseData.message || 'Registrazione fallita.', form: 'register' }); // [cite: 17]
			}
		} catch (err: any) {
			if (err.status === 303) throw err; // Re-throw redirects
			console.error('Registration error:', err);
			return fail(500, { registerEmail, error: 'Errore del server di autenticazione.', form: 'register' }); // [cite: 18]
		}
	},

	resetPassword: async ({ request }) => {
		const data = await request.formData();
		const resetEmail = data.get('resetEmail') as string;
		const newPass = nanoid();
		const hashed = hash(newPass, SALT);

		//console.log('newPass', newPass);


		if (!resetEmail) {
			return fail(400, { action: 'resetPassword', success: false, message: 'L\'email è obbligatoria.' });
		}

		const userFetch = fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { email: resetEmail },
				projection: { email: 1 }, // 0: exclude | 1: include
				sort: { createdAt: -1 }, // 1:Sort ascending | -1:Sort descending
				limit: 1,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const resFetch = fetch(`${BASE_URL}/api/mongo/update`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'user', //product | order | user | layout | discount
				query: { email: resetEmail },
				update: {
					$set: {
						password: hashed
					}
				},
				options: { upsert: false },
				multi: false
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const mailFetch = fetch(`${BASE_URL}/api/mailer/recover-password`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				email: resetEmail,
				password: newPass
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const userRes = await userFetch;
			if (!userRes.ok) {
				return fail(400, { action: 'resetPassword', success: false, message: "Errore controllo utente" });
			}
			const user = await userRes.json();

			if (user.length == 0 || user[0].email != resetEmail) {
				return fail(400, { action: 'resetPassword', success: false, message: "Utente non trovato" });
			}

			const res = await resFetch;
			if (!res.ok) {
				return fail(400, { action: 'resetPassword', success: false, message: 'Errore reset password' });
			}

			const mailRes = await mailFetch;
			if (!mailRes.ok) {
				return fail(400, { action: 'resetPassword', success: false, message: "Errore invio Email" });
			}
			//const getMailer = await mailRes.json();

			return { action: 'resetPassword', success: true, message: 'Nuova password inviata. Controllate l\'email' };

		} catch (err: any) {
			console.error('Password reset error:', err);
			return fail(500, { resetEmail, error: 'Errore del server. Riprova più tardi.', form: 'resetPassword' }); // [cite: 21, 22]
		}
	}
};
