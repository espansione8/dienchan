import { paraglide } from '@inlang/paraglide-sveltekit/vite'
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { searchForWorkspaceRoot } from 'vite'

export default defineConfig({
	plugins: [paraglide({ project: './project.inlang', outdir: './src/lib/paraglide' }),sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		// port: 5173,
		// strictPort: true,
		// host: '127.0.0.1',
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd()), "/uploads/"]
		}
	},
});
