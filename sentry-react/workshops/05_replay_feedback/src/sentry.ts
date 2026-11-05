import type { RootOptions } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { ApiError } from './api/client';
import { API_URL } from './api/fakeServer';

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
    integrations: [
      // Page loads, navigations, fetch/XHR calls, Web Vitals.
      Sentry.browserTracingIntegration(),
      // TODO (step 1): `Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })`.
      // TODO (step 2): `Sentry.feedbackIntegration({ autoInject: false })` — our
      // fallback shows its own form, no floating button.
      ...(import.meta.env.MODE === 'development' ? [Sentry.spotlightBrowserIntegration()] : []),
    ],
    // Every trace in development; one in five in production — tracing has a cost.
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1,
    // TODO (step 1): `replaysSessionSampleRate: 0` and `replaysOnErrorSampleRate: 1`
    // (0.1 and 1 in production).
    // `sentry-trace` and `baggage` go to OUR API only: a third party would get our
    // trace ids — and a CORS preflight it does not expect.
    tracePropagationTargets: [API_URL],
    // The health check runs every 30 s: thousands of identical, useless spans.
    ignoreSpans: [{ op: 'http.client', name: /\/health$/ }],
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
