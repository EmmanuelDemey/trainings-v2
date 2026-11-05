import * as Sentry from '@sentry/nestjs';
import type { NodeOptions } from '@sentry/nestjs';
import { DatabaseError } from './issues/database.error.js';

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
    // TODO (step 2): the release — SENTRY_RELEASE, or issue-tracker-api@<the
    // version of package.json> when it is not set.
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

    ...overrides,
  });
}
