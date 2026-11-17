import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm start` — the Vite dev server. Like Node.js, it strips the types and
// runs what is left: it never checks them. That is `npm run typecheck`'s job.
export default defineConfig({
  plugins: [react()],
});
