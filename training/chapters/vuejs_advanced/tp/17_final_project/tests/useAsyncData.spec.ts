import { describe, expect, it } from 'vitest';
import { useAsyncData } from '@/composables/useAsyncData';
import { abortError, deferredFetcher, flushPromises, withSetup } from './helpers';

/**
 * STEP 1 — the executable spec of `useAsyncData`.
 *
 * These tests are GIVEN: they are the contract of the composable, written down.
 * They are red on the skeleton. Run them in watch mode and make them green one
 * by one:
 *
 *   npm run test:watch
 *
 * This is the only spec you are handed. The two you write yourself are in
 * step 6 — and the reviewers will read them.
 */
describe('useAsyncData', () => {
  it('fetches immediately and exposes the payload', async () => {
    const { fetcher, last } = deferredFetcher<string>();
    using ctx = withSetup(() => useAsyncData(fetcher));
    const { data, error, loading } = ctx.result;

    expect(loading.value).toBe(true);
    expect(data.value).toBeNull();

    last().resolve('invoices');
    await flushPromises();

    expect(data.value).toBe('invoices');
    expect(error.value).toBeNull();
    expect(loading.value).toBe(false);
  });

  it('does not fetch on its own when `immediate` is false', async () => {
    const { fetcher, calls } = deferredFetcher<string>();
    using ctx = withSetup(() => useAsyncData(fetcher, { immediate: false }));

    await flushPromises();
    expect(calls).toHaveLength(0);
    expect(ctx.result.loading.value).toBe(false);

    void ctx.result.refresh();
    await flushPromises();
    expect(calls).toHaveLength(1);
  });

  it('aborts the request in flight when a new one starts', async () => {
    const { fetcher, calls } = deferredFetcher<string>();
    using ctx = withSetup(() => useAsyncData(fetcher));

    void ctx.result.refresh();
    await flushPromises();

    expect(calls).toHaveLength(2);
    expect(calls[0].signal.aborted).toBe(true);
    expect(calls[1].signal.aborted).toBe(false);
  });

  it('never lets a stale response overwrite a fresher one', async () => {
    const { fetcher, calls } = deferredFetcher<string>();
    using ctx = withSetup(() => useAsyncData(fetcher));
    const { data, loading } = ctx.result;

    void ctx.result.refresh();
    await flushPromises();

    // The newest request answers first…
    calls[1].resolve('fresh');
    await flushPromises();
    expect(data.value).toBe('fresh');
    expect(loading.value).toBe(false);

    // …and the cancelled one answers late, as cancelled requests do.
    calls[0].resolve('stale');
    await flushPromises();
    expect(data.value).toBe('fresh');
  });

  it('keeps `loading` true while the newest request is still in flight', async () => {
    const { fetcher, calls } = deferredFetcher<string>();
    using ctx = withSetup(() => useAsyncData(fetcher));
    const { data, loading } = ctx.result;

    void ctx.result.refresh();
    await flushPromises();

    calls[0].resolve('stale');
    await flushPromises();

    expect(loading.value).toBe(true);
    expect(data.value).toBeNull();

    calls[1].resolve('fresh');
    await flushPromises();

    expect(loading.value).toBe(false);
    expect(data.value).toBe('fresh');
  });

  it('exposes a failure as an error', async () => {
    const { fetcher, last } = deferredFetcher<string>();
    using ctx = withSetup(() => useAsyncData(fetcher));
    const { data, error, loading } = ctx.result;

    last().reject(new Error('503'));
    await flushPromises();

    expect(error.value).toBeInstanceOf(Error);
    expect(error.value?.message).toBe('503');
    expect(data.value).toBeNull();
    expect(loading.value).toBe(false);
  });

  it('does not report an aborted request as an error, and keeps the data', async () => {
    const { fetcher, calls } = deferredFetcher<string>();
    using ctx = withSetup(() => useAsyncData(fetcher));
    const { data, error } = ctx.result;

    calls[0].resolve('first');
    await flushPromises();
    expect(data.value).toBe('first');

    void ctx.result.refresh();
    await flushPromises();
    calls[1].reject(abortError());
    await flushPromises();

    expect(error.value).toBeNull();
    expect(data.value).toBe('first');
  });

  it('aborts the request in flight when the scope is disposed', async () => {
    const { fetcher, calls } = deferredFetcher<string>();
    const ctx = withSetup(() => useAsyncData(fetcher));

    await flushPromises();
    expect(calls[0].signal.aborted).toBe(false);

    ctx.unmount();

    expect(calls[0].signal.aborted).toBe(true);
  });
});
