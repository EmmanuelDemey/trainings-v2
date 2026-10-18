import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../mocks/server';
import { fetchPeople, fetchPerson } from './people';

describe('fetchPeople', () => {
  it('resolves with the characters the API returns', async () => {
    const people = await fetchPeople();

    expect(people).toHaveLength(6);
    expect(people[0]).toMatchObject({ id: '1', name: 'Luke Skywalker' });
  });

  it('rejects when the server answers 500 — fetch alone would resolve', async () => {
    server.use(http.get('/api/people', () => new HttpResponse(null, { status: 500 })));

    await expect(fetchPeople()).rejects.toThrow('Request failed with status 500');
  });

  it('rejects with an AbortError once its signal is aborted', async () => {
    const controller = new AbortController();
    const request = fetchPeople(controller.signal);

    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('fetchPerson', () => {
  it('resolves with one character', async () => {
    const person = await fetchPerson('5');

    expect(person).toMatchObject({ id: '5', name: 'Leia Organa', birthYear: '19BBY' });
  });

  it('rejects when the character does not exist', async () => {
    await expect(fetchPerson('999')).rejects.toThrow('Request failed with status 404');
  });
});
