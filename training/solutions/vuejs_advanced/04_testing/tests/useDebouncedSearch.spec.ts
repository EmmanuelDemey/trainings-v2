import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { useDebouncedSearch } from '@/composables/useDebouncedSearch';
import { withSetup } from './helpers';

/**
 * STEP 5 — Fake timers and spies.
 *
 * Three keystrokes must produce exactly ONE search call. Without fake timers
 * this test would either be slow (a real 300 ms wait per case) or flaky (a
 * `setTimeout` racing the assertion).
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

    expect(search).not.toHaveBeenCalled();

    // The ASYNC variant. `advanceTimersByTime` would fire the timer but leave the
    // promise it returned unresolved, so `results` would still be empty here and
    // the last assertion would fail for a reason that has nothing to do with the
    // debounce.
    await vi.advanceTimersByTimeAsync(300);

    expect(search).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledWith('vue');
    expect(results.value).toEqual(['vue result']);

    app.unmount();
  });

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

  /**
   * A test that documents a REAL leak rather than the behaviour you would wish
   * for. Unmounting stops the watcher, but the `setTimeout` it already scheduled
   * is still armed: the search fires against a component that no longer exists.
   *
   * The fix is one `onScopeDispose(() => clearTimeout(timer))` in the composable
   * — and the reason this test asserts `toHaveBeenCalledOnce()` instead is that
   * the workshop's sabotage step (7) mutates this exact source file. Add the
   * cleanup, flip this assertion to `not.toHaveBeenCalled()`, and you have done
   * the most useful thing a test suite can do: turn a latent bug into a
   * regression test.
   */
  it('still fires a pending search after the owner is unmounted (a leak)', async () => {
    const search = vi.fn(async () => ['whatever']);
    const [{ query }, app] = withSetup(() => useDebouncedSearch(search, 300));

    query.value = 'vue';
    await nextTick();
    app.unmount();

    await vi.advanceTimersByTimeAsync(300);

    expect(search).toHaveBeenCalledOnce();
  });

  /**
   * A spy with `using` (step 5.4). `MockInstance` implements `Symbol.dispose`,
   * so `mockRestore()` runs at the end of the scope — no `afterEach`, and no way
   * to leak a patched `console.warn` into the next test by forgetting one.
   */
  it('restores a spy automatically at the end of the scope', () => {
    using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    console.warn('something the app would warn about');

    expect(warn).toHaveBeenCalledWith('something the app would warn about');
  });
});
