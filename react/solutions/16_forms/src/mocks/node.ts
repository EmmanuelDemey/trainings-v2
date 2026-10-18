import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** The same handlers as the browser, for the specs. `server.use()` overrides one in a test. */
export const server = setupServer(...handlers);
