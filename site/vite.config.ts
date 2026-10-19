import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Vercel sets this during builds; social cards need absolute URLs.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export default defineConfig({
	define: {
		__SITE_URL__: JSON.stringify(
			productionHost ? `https://${productionHost}` : 'https://paper-rs.vercel.app'
		)
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		})
	]
});
