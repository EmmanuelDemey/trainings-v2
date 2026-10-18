import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** The fake API, in Node (the specs). `src/tests/setup.ts` starts it. */
export const server = setupServer(...handlers);
