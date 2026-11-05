import * as Sentry from '@sentry/nestjs';
import type { NodeOptions } from '@sentry/nestjs';

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
    // Spotlight, in development only — `SENTRY_SPOTLIGHT=1` in .env. `true`: the
    // SDK reads the sidecar's URL from SENTRY_SPOTLIGHT when it is one.
    spotlight: process.env.NODE_ENV === 'development' && Boolean(process.env.SENTRY_SPOTLIGHT),

    // TODO (step 4): `dataCollection` — no request body, no cookie, no
    // authorization header, no IP address.

    // TODO (step 3): `beforeSend` — one fingerprint per DatabaseError code.

    ...overrides,
  });
}
