import { readFileSync } from 'node:fs';
import * as Sentry from '@sentry/nestjs';
import type { NodeOptions } from '@sentry/nestjs';
import { DatabaseError } from './issues/database.error.js';

/** The version of package.json — one level up from src/ and from dist/ alike. */
function appVersion(): string {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
  return version;
}

/**
 * Starts the Sentry SDK. Called once, by src/instrument.ts, before the app is
 * loaded — and by the specs, with a fake transport in `overrides`.
 *
 * Every option you write here applies in the specs too: they only override
 * `dsn` and `transport`.
 */
export function initSentry(overrides: Partial<NodeOptions> = {}): void {
  Sentry.init({
    // Empty in development: nothing goes to sentry.io, Spotlight still works.
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    // The build this is — the same name as the upload of its source maps. The
    // SDK reads SENTRY_RELEASE on its own; without it, the version of the app.
    release: process.env.SENTRY_RELEASE || `issue-tracker-api@${appVersion()}`,
    // Spotlight, in development only — `SENTRY_SPOTLIGHT=1` in .env. `true`: the
    // SDK reads the sidecar's URL from SENTRY_SPOTLIGHT when it is one.
    spotlight: process.env.NODE_ENV === 'development' && Boolean(process.env.SENTRY_SPOTLIGHT),

    dataCollection: {
      userInfo: false,
      cookies: false,
      httpBodies: [],
      httpHeaders: { request: { allow: ['content-type', 'user-agent', 'x-user-id'] }, response: false },
    },

    beforeSend(event, hint) {
      const error = hint.originalException;
      if (error instanceof DatabaseError) {
        event.fingerprint = ['database-error', error.code];
      }
      return event;
    },

    // A trace for every request but the health checks; a request that comes with
    // a decision (the browser's `sentry-trace`) keeps it.
    tracesSampler: ({ attributes, inheritOrSampleWith }) => {
      if (attributes?.['url.path'] === '/health') return 0;
      return inheritOrSampleWith(process.env.NODE_ENV === 'production' ? 0.2 : 1);
    },

    ...overrides,
  });
}
