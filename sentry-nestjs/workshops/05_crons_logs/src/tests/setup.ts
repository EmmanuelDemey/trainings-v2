import * as Sentry from '@sentry/nestjs';
import { beforeEach } from 'vitest';
import { initSentry } from '../sentry.js';
import { createSentryTestkit, TEST_DSN } from './shared/sentryTestkit.js';

/**
 * Runs before the spec imports the app — what `node --import` does for the real
 * server. YOUR initSentry(), with two overrides only: a DSN that points nowhere,
 * and a transport that records the envelopes instead of sending them.
 */
export const sentry = createSentryTestkit();

initSentry({
  dsn: TEST_DSN,
  transport: sentry.transport,
  // The SDK drops an event identical to the previous one — right in production,
  // confusing in specs that send the same error twice on purpose.
  // `tracesSampleRate` here only selects the integration list: whether a request
  // is traced is up to YOUR sampling options.
  defaultIntegrations: (Sentry.getDefaultIntegrations({ tracesSampleRate: 1 }) ?? []).filter(
    (integration) => integration.name !== 'Dedupe',
  ),
});

beforeEach(() => {
  sentry.reset();
  Sentry.getGlobalScope().setUser(null);
  Sentry.getIsolationScope().setUser(null);
});
