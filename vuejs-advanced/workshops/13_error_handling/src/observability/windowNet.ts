/**
 * The two channels that are **outside Vue entirely**.
 *
 * Vue only wraps the functions it calls itself. Hand a callback to `setTimeout`,
 * to `addEventListener`, to an `IntersectionObserver` — or let a promise reject
 * with nobody awaiting it — and the pipeline never sees it.
 *
 * TODO 3: install two listeners on `window` and route both to `capture()`:
 *
 *   - `'error'` — an `ErrorEvent`; the thrown value is on `event.error`, and
 *     `event.message` is the fallback when there is no error object. Report it
 *     with `source: 'window'` and an `info` naming where it came from.
 *   - `'unhandledrejection'` — the rejected value is on `event.reason`. Report it
 *     with `source: 'unhandledrejection'`.
 *
 *   Return a function that removes both, so a test — and a hot reload — can
 *   uninstall the net.
 */
export function installWindowNet(): () => void {
  return () => {};
}
