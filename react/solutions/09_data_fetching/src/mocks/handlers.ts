import { delay, http, HttpResponse } from 'msw';
import { people } from '../data/people';

/**
 * The fake Star Wars API. The same handlers serve the browser in dev
 * (src/mocks/browser.ts, a Service Worker) and the specs (src/mocks/server.ts,
 * Node interception): the app's `fetch` cannot tell the difference.
 *
 * `delay()` waits 100–400 ms in the browser — long enough to SEE the loading
 * states — and only a few milliseconds under Node, so the specs stay fast.
 */
export const handlers = [
  http.get('/api/people', async () => {
    await delay();
    return HttpResponse.json(people);
  }),

  http.get<{ id: string }>('/api/people/:id', async ({ params }) => {
    await delay();
    const person = people.find(({ id }) => id === params.id);
    if (!person) {
      return HttpResponse.json({ message: `No person with id ${params.id}` }, { status: 404 });
    }
    return HttpResponse.json(person);
  }),
];
