import { capture } from './reporter';

/**
 * The two channels that are **outside Vue entirely**.
 *
 * Vue only wraps the functions it calls itself. Hand a callback to `setTimeout`,
 * to `addEventListener`, to an `IntersectionObserver` — or let a promise reject
 * with nobody awaiting it — and the pipeline never sees it. No boundary, no
 * `errorHandler`, no console entry you can act on.
 *
 * Returns its own uninstaller: a net that cannot be removed is a leak in a test
 * suite and a duplicate after a hot reload.
 */
export function installWindowNet(): () => void {
  const onError = (event: ErrorEvent): void => {
    capture(event.error ?? event.message, { info: 'window error', source: 'window' });
  };

  const onRejection = (event: PromiseRejectionEvent): void => {
    capture(event.reason, { info: 'unhandled rejection', source: 'unhandledrejection' });
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}
