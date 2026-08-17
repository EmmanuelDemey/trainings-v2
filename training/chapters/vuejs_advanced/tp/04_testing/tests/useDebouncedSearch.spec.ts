import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { useDebouncedSearch } from '@/composables/useDebouncedSearch';
import { withSetup } from './helpers';

/**
 * STEP 5 (PART 1 — chapter 4) — Fake timers and spies.
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

    // TODO 5.1: assert `search` has NOT been called yet.

    // TODO 5.2: advance the timers past the debounce with
    //   `await vi.advanceTimersByTimeAsync(300)` — the async variant also flushes
    //   the promises the timer resolved. Then assert `search` was called exactly
    //   once, with 'vue', and that `results` holds the returned value.
    void results;

    app.unmount();
    expect(search).toBeDefined();
  });

  it('clears the results when the query is emptied', async () => {
    const search = vi.fn(async () => ['whatever']);
    const [{ query, results }, app] = withSetup(() => useDebouncedSearch(search, 300));

    // TODO 5.3: type something, let the debounce elapse, then set the query back
    //   to '' and assert `results` is empty AND that no further call was made.
    void query;
    void results;

    app.unmount();
  });
});

/**
 * TODO 5.4: write a test using `using` for a spy:
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
