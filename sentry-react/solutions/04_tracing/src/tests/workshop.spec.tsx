import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Sentry from '@sentry/react';
import { API_URL, AVATARS_URL, serverLog } from '../api/fakeServer';
import { renderApp } from './render';
import { sentry, settle } from './sentry';

/**
 * Workshop 04 — Tracing. Red on the starter. Keep it running while you work:
 *
 *   npm run test:watch
 *
 * Besides the envelopes, these specs read `serverLog`: every request the fake
 * backend received, headers included.
 */

async function open(id: number) {
  const user = userEvent.setup();
  renderApp();
  await user.click(await screen.findByTestId(`open-${id}`));
  await screen.findByTestId('detail-title');
}

const requestsTo = (origin: string) => serverLog.filter((request) => request.url.startsWith(origin));

describe('step 1 — tracing is on', () => {
  it('samples every trace outside production', () => {
    const options = Sentry.getClient()?.getOptions();
    expect(options?.tracesSampleRate).toBe(1);
    expect(Sentry.getClient()?.getIntegrationByName('BrowserTracing')).toBeDefined();
  });
});

describe('step 2 — the trace goes to our API, and only there', () => {
  it('sends sentry-trace and baggage to the API', async () => {
    await open(1);

    const [request] = requestsTo(`${API_URL}/issues/1`);
    expect(request.headers['sentry-trace']).toMatch(/^[0-9a-f]{32}-[0-9a-f]{16}(-[01])?$/);
    expect(request.headers.baggage).toContain('sentry-trace_id=');
  });

  it('never sends them to the avatars CDN', async () => {
    await open(1);
    await waitFor(() => expect(requestsTo(AVATARS_URL)).not.toHaveLength(0));

    for (const request of requestsTo(AVATARS_URL)) {
      expect(request.headers['sentry-trace']).toBeUndefined();
      expect(request.headers.baggage).toBeUndefined();
    }
  });
});

describe('step 3 — a span for what the user did', () => {
  it('records issue.open, with the issue id', async () => {
    await open(1);
    await settle();

    const span = sentry.spans().find((candidate) => candidate.name === 'issue.open');
    expect(span).toBeDefined();
    expect(sentry.attr(span!, 'sentry.op')).toBe('ui.action');
    expect(sentry.attr(span!, 'issue.id')).toBe(1);
  });

  it('puts the API call in the same trace', async () => {
    await open(1);
    // The http.client span ends with the response, a moment after the click.
    await waitFor(async () => {
      await settle();
      expect(sentry.spans().some((candidate) => sentry.attr(candidate, 'url.full') === `${API_URL}/issues/1`)).toBe(true);
    });

    const action = sentry.spans().find((candidate) => candidate.name === 'issue.open');
    const call = sentry.spans().find((candidate) => sentry.attr(candidate, 'url.full') === `${API_URL}/issues/1`);
    expect(sentry.attr(call!, 'sentry.op')).toBe('http.client');
    expect(call!.trace_id).toBe(action?.trace_id);
  });
});
