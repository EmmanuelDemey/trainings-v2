import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// The `.ts` extensions on the imports the config pulls in let Vite load it
// natively, without bundling it first.
import { fakeApi } from './server/fakeApi.ts';

export default defineConfig({
  plugins: [react(), fakeApi()],
  // Cypress' baseUrl points here: fail loudly if the port is taken, instead of
  // silently moving to 5174 and leaving the tests knocking on the wrong door.
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
