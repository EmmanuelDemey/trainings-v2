import { http } from 'msw';
import { server } from '../mocks/server';

/**
 * Holds every `GET /api/people/:id` until the returned `release()` is called —
 * so a spec can look at the screen WHILE a person is loading. The held request
 * then falls through to the regular handler (a resolver that returns nothing
 * hands the request to the next matching handler).
 */
export function holdPersonRequests(): () => void {
  let release = () => {};
  const released = new Promise<void>((resolve) => (release = resolve));
  server.use(
    http.get('/api/people/:id', async () => {
      await released;
    }),
  );
  return release;
}
