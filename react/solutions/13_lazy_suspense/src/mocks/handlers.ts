import { delay, http, HttpResponse } from 'msw';
import { people } from '../data/people';

// In the browser, a small delay makes the loading states visible. The specs
// run with MODE === 'test' and do not wait for it.
async function latency(): Promise<void> {
  if (import.meta.env.MODE !== 'test') await delay(800);
}

export const handlers = [
  http.get('/api/people', async () => {
    await latency();
    return HttpResponse.json(people);
  }),

  http.get('/api/people/:id', async ({ params }) => {
    await latency();
    const person = people.find(({ id }) => id === params.id);
    if (!person) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(person);
  }),
];
