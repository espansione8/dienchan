// src/routes/login/+page.server.js
import { fail, error as svelteKitError } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    login: async ({ request, fetch }) => {
        const formData = await request.formData();
        const username = formData.get('username')?.toString();
        const password = formData.get('password')?.toString();
        const position = formData.get('position')?.toString();

        // Basic validation
        if (!username || !password || !position || position === 'SELECT') {
            return fail(400, {
                missing: true,
                message: 'Username, password, and position are required.',
                username: username ?? '',
                position: position ?? ''
            });
        }

        try {
            // Prepare data for the external API
            const apiPayload = {
                username,
                password,
                position
            };

            // Make the POST request to your external login API
            // Assuming '/api/auth/login' is relative to your SvelteKit app's origin.
            // If it's a different domain, use the full URL.
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiPayload)
            });

            // Check if the API call was successful
            if (!response.ok) {
                let errorMessage = `Login failed with status: ${response.status}`;
                try {
                    const errorBody = await response.json();
                    errorMessage = errorBody.message || errorMessage;
                } catch (e) {
                    // Ignore if response body is not JSON or empty
                    errorMessage = await response.text() || errorMessage;
                }
                return fail(response.status, {
                    apiError: true,
                    message: errorMessage,
                    username,
                    position
                });
            }

            // --- Successful Login ---
            // IMPORTANT: In a real application, the API would likely return
            // a session token or user data. You would then handle this here,
            // maybe by setting a cookie or redirecting.
            // For this example, we'll just return a success message.

            const result = await response.json(); // Assuming API returns JSON on success

            // Example: Redirect on success (uncomment and adjust as needed)
            // import { redirect } from '@sveltejs/kit';
            // throw redirect(303, '/dashboard');

            return {
                success: true,
                message: 'Login successful!',
                apiResponse: result // Pass along API response if needed
            };

        } catch (err) {
            console.error('Login action error:', err);
            // Use SvelteKit's error helper for unexpected server errors
            // Throwing here will trigger the nearest +error.svelte boundary
            throw svelteKitError(500, { message: 'An internal server error occurred during login.' });
            // Or return fail if you want to handle it on the page directly:
            // return fail(500, { serverError: true, message: 'An internal server error occurred.', username, position });
        }
    },

    register: async ({ request }) => {
        // Placeholder for registration logic
        const formData = await request.formData();
        const username = formData.get('username');
        console.log('Registration attempt for:', username);
        // In a real app, you would process registration here, possibly POSTing to a different API endpoint.
        return fail(501, { // 501 Not Implemented
            registering: true,
            message: 'Registration functionality is not yet implemented.',
            username: username ?? ''
        });
    }
};

