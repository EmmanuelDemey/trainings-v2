import type { RootOptions } from 'react-dom/client';
import type * as Sentry from '@sentry/react';

/**
 * Starts the Sentry SDK — ONCE, before React renders anything. `main.tsx` calls
 * it with no argument; the specs call it with a fake `transport` and a test DSN
 * as `overrides`, so everything you write here applies in the specs too.
 */
export function initSentry(overrides: Partial<Sentry.BrowserOptions> = {}): void {
  // TODO (step 1): call `Sentry.init({ … })` (import * as Sentry from '@sentry/react'):
  //   - dsn: import.meta.env.VITE_SENTRY_DSN
  //   - environment: import.meta.env.MODE
  //   - integrations: [Sentry.spotlightBrowserIntegration()] in development only
  //   - ...overrides LAST, so the specs can replace the DSN and the transport
  void overrides;
}

/**
 * The error hooks of React 19's root (`createRoot(container, rootOptions)`).
 *
 * TODO (step 3): `onUncaughtError` and `onRecoverableError`, both
 * `Sentry.reactErrorHandler()`. Not `onCaughtError`: the boundary of step 2
 * already reports what it catches.
 */
export const rootOptions: RootOptions = {};
