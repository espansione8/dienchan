import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { searchForWorkspaceRoot } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		// port: 5173,
		// strictPort: true,
		// host: '127.0.0.1',
		fs: {
			//allow: [searchForWorkspaceRoot(process.cwd()), "/uploads/"]
			allow: [searchForWorkspaceRoot(process.cwd()), path.resolve(process.cwd(), 'uploads')]
		}
	},
});
