import { delay, http, HttpResponse } from 'msw';
import { people } from '../data/people';

// In the browser, a small delay makes the pending navigations visible. The
// specs run with MODE === 'test' and do not wait for it.
async function latency(): Promise<void> {
  if (import.meta.env.MODE !== 'test') await delay(600);
}

export const handlers = [
  // `GET /api/people?q=sky` filters on the name, case-insensitively.
  http.get('/api/people', async ({ request }) => {
    await latency();
    const q = new URL(request.url).searchParams.get('q')?.trim().toLowerCase() ?? '';
    return HttpResponse.json(people.filter(({ name }) => name.toLowerCase().includes(q)));
  }),

  http.get('/api/people/:id', async ({ params }) => {
    await latency();
    const person = people.find(({ id }) => id === params.id);
    if (!person) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(person);
  }),
];
