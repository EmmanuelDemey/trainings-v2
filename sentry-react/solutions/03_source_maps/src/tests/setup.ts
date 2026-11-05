import { afterEach, beforeAll, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as Sentry from '@sentry/react';
import { installFakeServer, resetServer, serverSettings } from '../api/fakeServer';
import { initSentry } from '../sentry';
import { TEST_DSN } from './shared/sentryTestkit';
import { sentry } from './sentry';

beforeAll(() => {
  // As in main.tsx: the fake backend first, so that the SDK wraps it.
  installFakeServer();
  // YOUR initSentry(): only the DSN and the transport are replaced — and the
  // Dedupe integration is left out, which would drop the same crash replayed
  // by two tests in a row. Your own `integrations` still apply.
  initSentry({
    dsn: TEST_DSN,
    transport: sentry.transport,
    defaultIntegrations: Sentry.getDefaultIntegrations({}).filter((integration) => integration.name !== 'Dedupe'),
  });
});

beforeEach(() => {
  serverSettings.latencyMs = 0;
  resetServer();
  sentry.reset();
  // The scopes outlive a test: forget the user and the breadcrumbs of the previous one.
  Sentry.getIsolationScope().setUser(null).clearBreadcrumbs();
  Sentry.getCurrentScope().clearBreadcrumbs();
});

// React Testing Library unmounts what it rendered after each test on its own
// only when Vitest runs with `globals: true`. Without globals, it is done here.
afterEach(() => {
  cleanup();
});
