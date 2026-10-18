import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** The fake API for the specs: started by src/tests/setup.ts, overridden per test with `server.use()`. */
export const server = setupServer(...handlers);
