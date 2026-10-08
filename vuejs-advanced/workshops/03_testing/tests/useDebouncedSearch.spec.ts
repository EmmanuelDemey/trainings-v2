import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { useDebouncedSearch } from '@/composables/useDebouncedSearch';
import { withSetup } from './helpers';

/**
 * STEP 3 — Fake timers and spies.
 *
 * Three keystrokes must produce exactly ONE search call. Without fake timers
 * this test would either be slow or flaky.
 */
describe('useDebouncedSearch', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls the search function only once for a burst of keystrokes', async () => {
    const search = vi.fn(async (q: string) => [`${q} result`]);
    const [{ query, results }, app] = withSetup(() => useDebouncedSearch(search, 300));

    query.value = 'v';
    await nextTick();
    query.value = 'vu';
    await nextTick();
    query.value = 'vue';
    await nextTick();

    // TODO 3.1: assert `search` has NOT been called yet.

    // TODO 3.2: advance the timers past the debounce with
    //   `await vi.advanceTimersByTimeAsync(300)` — the async variant also flushes
    //   the promises the timer resolved. Then assert `search` was called exactly
    //   once, with 'vue', and that `results` holds the returned value.
    void results;

    app.unmount();
    expect(search).toBeDefined();
  });

  // GIVEN — the same timer dance, on the way back to an empty query.
  it('clears the results when the query is emptied', async () => {
    const search = vi.fn(async () => ['whatever']);
    const [{ query, results }, app] = withSetup(() => useDebouncedSearch(search, 300));

    query.value = 'vue';
    await nextTick();
    await vi.advanceTimersByTimeAsync(300);
    expect(results.value).toEqual(['whatever']);

    query.value = '';
    await nextTick();

    // Cleared synchronously — an empty query is not a search worth debouncing.
    expect(results.value).toEqual([]);

    await vi.advanceTimersByTimeAsync(300);
    expect(search).toHaveBeenCalledOnce(); // still one: the empty query fired nothing

    app.unmount();
  });
});

/**
 * TODO 3.3: write a test using `using` for a spy:
 *
 *   it('warns on an invalid input', () => {
 *     using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
 *     ...
 *     expect(warn).toHaveBeenCalled();
 *   });   // ← mockRestore() runs automatically at the end of the scope
 *
 * If TypeScript complains about `Symbol.dispose`, check the `lib` in
 * `tsconfig.json` — this is exactly the prerequisite the slides mentioned.
 */
