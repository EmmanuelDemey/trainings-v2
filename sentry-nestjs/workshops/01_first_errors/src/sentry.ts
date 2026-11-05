import type { NodeOptions } from '@sentry/nestjs';

/**
 * Starts the Sentry SDK. Called once, by src/instrument.ts, before the app is
 * loaded — and by the specs, with a fake transport in `overrides`.
 *
 * Every option you write here applies in the specs too: they only override
 * `dsn` and `transport`.
 */
export function initSentry(overrides: Partial<NodeOptions> = {}): void {
  // TODO (step 1): Sentry.init({ dsn, environment, spotlight, ...overrides })
  void overrides;
}
