import type { RootOptions } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { ApiError } from './api/client';

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
    // TODO (step 1): add `Sentry.browserTracingIntegration()` to the integrations,
    // and `tracesSampleRate`: 1 outside production, 0.2 in production
    // (`import.meta.env.PROD`).
    integrations: import.meta.env.MODE === 'development' ? [Sentry.spotlightBrowserIntegration()] : [],
    // TODO (step 2): `tracePropagationTargets: [API_URL]` (./api/fakeServer) — the
    // trace headers go to OUR API, never to the avatars CDN.
    //
    // TODO (bonus): `ignoreSpans` for the health check, `GET …/health` every 30 s.
    // Noise: the browser's own warning, harmless, and thousands of times a day.
    ignoreErrors: [/ResizeObserver loop/],
    beforeSend(event, hint) {
      const error = hint.originalException;
      if (error instanceof ApiError) {
        // A 4xx is the user asking for something that is not there — not a bug.
        if (error.status >= 400 && error.status < 500) return null;
        // One issue per route and status, whatever the id in the URL.
        event.fingerprint = ['api-error', error.method, error.route, String(error.status)];
      }
      return event;
    },
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
