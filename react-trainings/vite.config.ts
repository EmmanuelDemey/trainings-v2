import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteEnvs } from 'vite-envs';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tsconfigPaths(),
		viteEnvs({
			declarationFile: '.env',
		}),
	],
});
