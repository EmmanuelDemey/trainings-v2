/**
 * Fetch a URL, aborting the request if it takes longer than `ms` milliseconds.
 *
 * The manual controller/timer pair is written out on purpose: it is what
 * `AbortSignal.timeout(ms)` does for you, and seeing it once makes the built-in
 * obvious. `fetchWithDeadline` below is the version you would actually ship.
 */
export async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    // Both on success AND on failure: an armed timer keeps the event loop
    // alive, so the process would refuse to exit until it fires.
    clearTimeout(timer);
  }
}

/** The same thing, with the built-in signal. This is the one to prefer. */
export function fetchWithDeadline(url: string, ms: number): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(ms) });
}

/**
 * Timeout AND user cancellation: `AbortSignal.any` aborts as soon as any of the
 * signals it was given aborts.
 */
export function fetchWithTimeoutOrCancel(
  url: string,
  ms: number,
  cancel: AbortSignal,
): Promise<Response> {
  return fetch(url, { signal: AbortSignal.any([AbortSignal.timeout(ms), cancel]) });
}
