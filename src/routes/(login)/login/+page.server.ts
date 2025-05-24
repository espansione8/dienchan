// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { hash } from '$lib/tools/hash';
import dbConnect from '$lib/db/mongo/database';

const apiKey = import.meta.env.VITE_APIKEY;
const baseURL = import.meta.env.VITE_BASE_URL;
const salt = import.meta.env.VITE_SALT;

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const loginEmail = data.get('loginEmail') as string;
		const loginPassword = data.get('loginPassword') as string;
		const rememberMe = data.get('rememberMe') === 'on'; // Checkbox value is 'on' or null
		const cookieId = crypto.randomUUID()
		let response: any;

		if (!loginEmail || !loginPassword) {
			return fail(400, { action: 'login', success: false, message: 'Dati mancanti' });
		}
		try {
			await dbConnect();
			const query = { email: loginEmail }; //IF USE Products.model -> types: course / product / membership / event
			const projection = { _id: 0, password: 1, email: 1 } // 0: exclude | 1: include
			const sort = { createdAt: -1 } // 1:Sort ascending | -1:Sort descending
			const limit = 1;
			const skip = 0;
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey,
					schema: 'user', //product | order | user | layout | discount
					query,
					projection,
					sort,
					limit,
					skip
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (res.status != 200) {
				const errorText = await res.text();
				console.error('user find failed', res.status, errorText);
				return fail(400, { action: 'login', success: false, message: errorText });
			}
			response = await res.json(); // [{ email, password }]

			if (!response || response.length === 0 || !response[0].email || response[0].password !== hash(loginPassword, salt)) {
				return fail(400, { action: 'login', success: false, message: 'mail o password errate' })
			}

			if (response.length > 0) {
				const query = { email: response[0].email }; //IF USE Products.model -> types: course / product / membership / event
				const update = { $set: { cookieId } };
				const options = { upsert: false }
				const multi = false
				const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey,
						schema: 'user', //product | order | user | layout | discount
						query,
						update,
						options,
						multi
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});
				if (res.status != 200) {
					const errorText = await res.text();
					console.error('product update failed', res.status, errorText);
					return fail(400, { action: 'modify', success: false, message: errorText });
				}
				// const responseUpdate = await res.json();
				// console.log('responseUpdate', responseUpdate);

				cookies.set('session_id', cookieId, {
					httpOnly: true,
					//maxAge: 60 * 60 * 24 * 7 // one week
					//maxAge: 60 * 60 * 24 * 1 // one day
					maxAge: rememberMe ? 60 * 60 * 24 * 365 : 60 * 60 * 24 * 1,
					sameSite: 'strict',
					secure: process.env.NODE_ENV === 'production',
					path: '/'
				});
				return { action: 'new', success: true, message: "login ok", payload: true };
			}

		} catch (error: any) {
			console.error('Error login:', error);
			return fail(400, { action: 'login', success: false, message: 'Error login' });
		}
	},

	register: async ({ request }) => {
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
			const res = await fetch(`${baseURL}/api/auth/sign-up`, { // [cite: 16]
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
		return { action: 'resetPassword', success: true, message: "test ok" };
		const data = await request.formData();
		const resetEmail = data.get('resetEmail') as string;

		if (!resetEmail) {
			return fail(400, { resetEmail, error: 'L\'email è obbligatoria.', form: 'resetPassword' });
		}

		try {
			const res = await fetch(`${baseURL}/api/auth/password-reset`, { // [cite: 20]
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: resetEmail })
			});

			if (res.ok) {
				return { success: true, message: 'Link per il reset della password inviato. Controlla la tua email.', form: 'resetPassword' }; // [cite: 20, 21]
			} else {
				const responseData = await res.json();
				return fail(res.status, { resetEmail, error: responseData.message || 'Impossibile inviare il link di reset.', form: 'resetPassword' }); // [cite: 21]
			}
		} catch (err: any) {
			console.error('Password reset error:', err);
			return fail(500, { resetEmail, error: 'Errore del server. Riprova più tardi.', form: 'resetPassword' }); // [cite: 21, 22]
		}
	}
};
