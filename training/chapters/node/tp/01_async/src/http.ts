/**
 * Fetch a URL, aborting the request if it takes longer than `ms` milliseconds.
 *
 * TODO Task 3 (part 1): implement this with an AbortController.
 *  - Create an AbortController and pass its `signal` to fetch.
 *  - Start a timer (setTimeout) that calls controller.abort() after `ms`.
 *  - Make sure to clear the timer once fetch settles (success OR failure),
 *    otherwise the timer keeps the process alive.
 *  - When aborted, fetch rejects with an AbortError — let it propagate (or
 *    rethrow a clearer error of your choosing).
 *
 * Tip: once it works, try replacing the manual controller/timer with the
 * built-in `AbortSignal.timeout(ms)` (see "Going further" in the README).
 */
export function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  // TODO: remove this throw and implement the timeout logic described above.
  throw new Error(`Not implemented yet: fetchWithTimeout(${url}, ${ms})`);
}
