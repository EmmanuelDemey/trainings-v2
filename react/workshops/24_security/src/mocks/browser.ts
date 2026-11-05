import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** The fake API, in the browser (`npm run dev`). `src/main.tsx` starts it. */
export const worker = setupWorker(...handlers);
