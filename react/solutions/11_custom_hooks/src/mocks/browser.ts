import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** The fake API for `npm run dev`: a Service Worker served from public/mockServiceWorker.js. */
export const worker = setupWorker(...handlers);
