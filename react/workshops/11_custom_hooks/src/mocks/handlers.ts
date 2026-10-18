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
  // GET /api/people?search=sky — a case-insensitive "name contains".
  http.get('/api/people', async ({ request }) => {
    await delay();
    const search = new URL(request.url).searchParams.get('search')?.trim().toLowerCase() ?? '';
    return HttpResponse.json(people.filter(({ name }) => name.toLowerCase().includes(search)));
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
