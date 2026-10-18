import { describe, expect, it, vi } from 'vitest';
import { people } from '../data/people';
import { loadPeople, loadPeopleSettled } from './async';

// A fake fetch, answering after `delay` ms: later ids answer FIRST, so a
// sequential or order-losing implementation shows.
const fetchPerson = vi.fn(async (id: string) => {
  const person = people.find((candidate) => candidate.id === id);
  await new Promise((resolve) => setTimeout(resolve, person ? 30 - Number(id) * 5 : 1));
  if (!person) throw new Error(`No person ${id}`);
  return person;
});

describe('loadPeople', () => {
  it('returns the people in the order of the ids', async () => {
    const loaded = await loadPeople(['1', '4', '5'], fetchPerson);

    expect(loaded.map(({ name }) => name)).toEqual(['Luke Skywalker', 'Darth Vader', 'Leia Organa']);
  });

  it('starts every request before the first one answers', async () => {
    fetchPerson.mockClear();
    const pending = loadPeople(['1', '2', '3'], fetchPerson);

    // Synchronously after the call, nothing has answered yet.
    expect(fetchPerson).toHaveBeenCalledTimes(3);
    await pending;
  });

  it('rejects as soon as one person cannot be fetched', async () => {
    await expect(loadPeople(['1', '404'], fetchPerson)).rejects.toThrow('No person 404');
  });
});

describe('loadPeopleSettled', () => {
  it('keeps the people that could be fetched, and the ids that could not', async () => {
    const { people: loaded, failedIds } = await loadPeopleSettled(['1', '404', '5', '405'], fetchPerson);

    expect(loaded.map(({ name }) => name)).toEqual(['Luke Skywalker', 'Leia Organa']);
    expect(failedIds).toEqual(['404', '405']);
  });

  it('never rejects, even when everything fails', async () => {
    await expect(loadPeopleSettled(['404'], fetchPerson)).resolves.toEqual({ people: [], failedIds: ['404'] });
  });
});
