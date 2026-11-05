import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { people } from '../data/people';
import type { Person } from '../model/person';
import { memoryStorage } from '../tests/memoryStorage';
import type { PeopleApi } from './api';
import { SEARCH_DEBOUNCE_MS } from './searchSaga';
import { searchRequested } from './searchSlice';
import { makeStore } from './store';

const luke = people.find(({ name }) => name === 'Luke Skywalker')!;
const leia = people.find(({ name }) => name === 'Leia Organa')!;

/** A promise the test resolves or rejects when it decides to. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Runs the pending promise callbacks, without moving the clock. */
const flush = () => vi.advanceTimersByTimeAsync(0);

describe('the search saga', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(searchPeople: PeopleApi['searchPeople']) {
    const api = { searchPeople: vi.fn(searchPeople) };
    const store = makeStore({ api, storage: memoryStorage() });
    return { api, store };
  }

  it('waits for the debounce delay before calling the API', async () => {
    const { api, store } = setup(async () => [luke]);

    store.dispatch(searchRequested('luke'));
    expect(store.getState().search.status).toBe('loading');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS - 1);
    expect(api.searchPeople).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(api.searchPeople).toHaveBeenCalledExactlyOnceWith('luke', expect.any(AbortSignal));
    expect(store.getState().search).toMatchObject({ status: 'succeeded', results: [luke] });
  });

  it('only searches for the last query when they come in quick succession', async () => {
    const { api, store } = setup(async () => []);

    for (const query of ['l', 'lu', 'luk']) {
      store.dispatch(searchRequested(query));
      await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS / 3);
    }
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);

    expect(api.searchPeople).toHaveBeenCalledExactlyOnceWith('luk', expect.any(AbortSignal));
  });

  it('aborts the request that a newer search replaced', async () => {
    const { api, store } = setup(() => new Promise(() => {}));

    store.dispatch(searchRequested('luke'));
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    store.dispatch(searchRequested('leia'));

    const [, signal] = api.searchPeople.mock.calls[0]!;
    expect(signal?.aborted).toBe(true);
  });

  it('ignores the answer of a request that a newer search replaced', async () => {
    const first = deferred<Person[]>();
    const second = deferred<Person[]>();
    const { store } = setup(vi.fn<PeopleApi['searchPeople']>().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise));

    store.dispatch(searchRequested('luke'));
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    store.dispatch(searchRequested('leia'));
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    // The OLD request answers last: without cancellation it would win.
    second.resolve([leia]);
    await flush();
    first.resolve([luke]);
    await flush();

    expect(store.getState().search).toMatchObject({ query: 'leia', results: [leia] });
  });

  it('stores the message when the API fails', async () => {
    const { store } = setup(async () => {
      throw new Error('The Force is down');
    });

    store.dispatch(searchRequested('luke'));
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);

    expect(store.getState().search).toMatchObject({ status: 'failed', error: 'The Force is down' });
  });
});
