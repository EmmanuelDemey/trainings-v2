import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import { useFetch } from '@/composables/useFetch';
import type { Product } from '@/api/fakeApi';
import { installFetchMock } from './fetchMock';
import { flushPromises, withSetup } from './helpers';

/**
 * STEP 1 — the executable spec of `useFetch`.
 *
 * These tests are given: they are the contract the README describes, written
 * down. Run them in watch mode while you fill in `src/composables/useFetch.ts`
 * and let them go green one by one:
 *
 *   npm run test:watch
 *
 * `fetch` is mocked with a version that only settles when a test says so — that
 * is the only way to observe `loading` mid-flight and to prove that a URL change
 * really aborts the request in progress.
 */

const COFFEE = '/api/products?category=Coffee';
const COOKWARE = '/api/products?category=Cookware';

const espresso = { id: 1, name: 'Espresso machine 1', category: 'Coffee', price: 199, photo: '' };
const pan = { id: 2, name: 'Cast-iron pan 1', category: 'Cookware', price: 89, photo: '' };

describe('useFetch', () => {
  it('fetches the URL and exposes the payload', async () => {
    using http = installFetchMock();
    using ctx = withSetup(() => useFetch<Product[]>(COFFEE));
    const { data, error, loading } = ctx.result;

    expect(http.requests).toHaveLength(1);
    expect(http.last().url).toBe(COFFEE);
    expect(loading.value).toBe(true);
    expect(data.value).toBeNull();

    http.last().json([espresso]);
    await flushPromises();

    expect(data.value).toEqual([espresso]);
    expect(error.value).toBeNull();
    expect(loading.value).toBe(false);
  });

  it('turns a non-2xx response into an error', async () => {
    using http = installFetchMock();
    using ctx = withSetup(() => useFetch<Product[]>(COFFEE));
    const { data, error, loading } = ctx.result;

    http.last().status(500);
    await flushPromises();

    expect(error.value).toBeInstanceOf(Error);
    expect(data.value).toBeNull();
    expect(loading.value).toBe(false);
  });

  it('reports a network failure as an error', async () => {
    using http = installFetchMock();
    using ctx = withSetup(() => useFetch<Product[]>(COFFEE));
    const { error, loading } = ctx.result;

    http.last().fail(new TypeError('Failed to fetch'));
    await flushPromises();

    expect(error.value).toBeInstanceOf(Error);
    expect(loading.value).toBe(false);
  });

  it('re-fetches when the URL is a ref', async () => {
    using http = installFetchMock();
    const url = ref(COFFEE);
    using ctx = withSetup(() => useFetch<Product[]>(url));
    const { data } = ctx.result;

    http.last().json([espresso]);
    await flushPromises();

    url.value = COOKWARE;
    await nextTick();

    expect(http.requests).toHaveLength(2);
    expect(http.last().url).toBe(COOKWARE);

    http.last().json([pan]);
    await flushPromises();

    expect(data.value).toEqual([pan]);
  });

  it('re-fetches when the URL is a getter', async () => {
    using http = installFetchMock();
    const category = ref('Coffee');
    using ctx = withSetup(() =>
      useFetch<Product[]>(() => `/api/products?category=${category.value}`),
    );
    void ctx;

    expect(http.last().url).toBe(COFFEE);

    // `toValue()` must be read INSIDE the effect, otherwise the getter is called
    // once, the dependency is never tracked, and this second request never happens.
    category.value = 'Cookware';
    await nextTick();

    expect(http.requests).toHaveLength(2);
    expect(http.last().url).toBe(COOKWARE);
  });

  it('aborts the in-flight request when the URL changes', async () => {
    using http = installFetchMock();
    const url = ref(COFFEE);
    using ctx = withSetup(() => useFetch<Product[]>(url));
    void ctx;

    const first = http.last();
    expect(first.aborted).toBe(false);

    url.value = COOKWARE;
    await nextTick();

    expect(first.aborted).toBe(true);
    expect(http.requests).toHaveLength(2);
  });

  it('never surfaces an aborted request as an error', async () => {
    using http = installFetchMock();
    const url = ref(COFFEE);
    using ctx = withSetup(() => useFetch<Product[]>(url));
    const { data, error, loading } = ctx.result;

    url.value = COOKWARE;
    await nextTick();
    await flushPromises(); // let the abort rejection travel through the composable

    expect(error.value).toBeNull();
    // The cancelled run must not hand `loading` back: a request IS in flight.
    expect(loading.value).toBe(true);

    http.last().json([pan]);
    await flushPromises();

    expect(data.value).toEqual([pan]);
    expect(error.value).toBeNull();
    expect(loading.value).toBe(false);
  });

  it('ignores the response of a request that was aborted', async () => {
    using http = installFetchMock();
    const url = ref(COFFEE);
    using ctx = withSetup(() => useFetch<Product[]>(url));
    const { data } = ctx.result;

    const first = http.last();
    url.value = COOKWARE;
    await nextTick();

    // A late server answer for the abandoned category must never win.
    first.json([espresso]);
    http.last().json([pan]);
    await flushPromises();

    expect(data.value).toEqual([pan]);
  });

  it('clears a previous error when a new request starts', async () => {
    using http = installFetchMock();
    const url = ref(COFFEE);
    using ctx = withSetup(() => useFetch<Product[]>(url));
    const { error } = ctx.result;

    http.last().status(500);
    await flushPromises();
    expect(error.value).toBeInstanceOf(Error);

    url.value = COOKWARE;
    await nextTick();

    // Reset at the START of the run: the stale error must not survive until the
    // new response comes back.
    expect(error.value).toBeNull();
  });

  it('stops fetching and aborts once the owner is unmounted', async () => {
    using http = installFetchMock();
    const url = ref(COFFEE);
    using ctx = withSetup(() => useFetch<Product[]>(url));

    const first = http.last();
    ctx.unmount();

    expect(first.aborted).toBe(true);

    url.value = COOKWARE;
    await nextTick();

    expect(http.requests).toHaveLength(1);
  });
});
