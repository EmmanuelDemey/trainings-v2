import type { RootOptions } from 'react-dom/client';
import * as Sentry from '@sentry/react';

/**
 * Starts the Sentry SDK — ONCE, before React renders anything. `main.tsx` calls
 * it with no argument; the specs call it with a fake `transport` and a test DSN
 * as `overrides`, so everything else written here applies in the specs too.
 */
export function initSentry(overrides: Partial<Sentry.BrowserOptions> = {}): void {
  Sentry.init({
    // Empty in `.env.local`? Then the SDK sends nothing to sentry.io — Spotlight
    // still gets everything in development.
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    // Spotlight is the local Sentry UI (`npx @spotlightjs/spotlight`). In
    // development only: never in the tests, never in production.
    integrations: import.meta.env.MODE === 'development' ? [Sentry.spotlightBrowserIntegration()] : [],
    ...overrides,
  });
}

/**
 * The error hooks of React 19's root (`createRoot(container, rootOptions)`).
 * `onCaughtError` is left out on purpose: the errors a `Sentry.ErrorBoundary`
 * catches are already reported by the boundary itself.
 */
export const rootOptions: RootOptions = {
  onUncaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
};
