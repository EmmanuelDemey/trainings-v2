import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { apiLog, apiSettings, inFlight, resetApi } from '../../api/fakeApi';
import { renderApp } from '../render';

/**
 * Workshop 5 — Optimistic updates and rollbacks. Same specs for React, Angular
 * and Vue: `renderApp()` (in `../render.ts`) is the only part that knows the
 * framework.
 *
 * Given, and red on the starter:
 *
 *   npm run test:watch
 */

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 50;
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('step 1 — an optimistic update through the cache', () => {
  it('moves the issue the moment you click, before the server answers', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');
    await waitFor(() => expect(screen.getByTestId('open-count').textContent).toContain('28 open'));

    apiSettings.latencyMs = 1_000;
    await user.click(screen.getByTestId('toggle-1'));
    await sleep(150);

    // The PATCH is on its way, and nothing came back yet…
    expect(inFlight('PATCH /issues/1')).toHaveLength(1);
    // …yet the list and the counter already show the result.
    expect(screen.queryByTestId('issue-1')).toBeNull();
    expect(screen.getByTestId('open-count').textContent).toContain('27 open');
  });
});

describe('step 2 — the rollback', () => {
  it('puts the issue back, and says so, when the server refuses', async () => {
    // Green on the starter too — which never moves the issue in the first
    // place. It is the guard rail of step 2: an optimistic update without its
    // rollback turns it red.
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');
    await waitFor(() => expect(screen.getByTestId('open-count').textContent).toContain('28 open'));
    apiSettings.failWrites = true;

    await user.click(screen.getByTestId('toggle-1'));
    await waitFor(() => expect(apiLog.some((call) => call.label === 'PATCH /issues/1')).toBe(true));
    // The PATCH left with the short latency. Whatever the app sends next — the
    // refetch of `onSettled` — will not be back before the assertions: only the
    // rollback of `onError` can put the issue back in time.
    apiSettings.latencyMs = 5_000;

    expect(await screen.findByTestId('toggle-error')).toBeTruthy();
    expect(screen.getByTestId('issue-1')).toBeTruthy();
    expect(screen.getByTestId('open-count').textContent).toContain('28 open');
  });
});

describe('step 3 — an optimistic update through the UI', () => {
  it('shows the new issue at once, greyed out, until the server gives it an id', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');

    apiSettings.latencyMs = 1_000;
    await user.type(screen.getByTestId('new-title'), 'Totals are rounded three times');
    await user.click(screen.getByTestId('create-submit'));
    await sleep(150);

    expect(inFlight('POST /issues')).toHaveLength(1);
    expect(screen.getByTestId('pending-issue').textContent).toContain('Totals are rounded three times');

    // Once created, the real row (with its id) replaces the pending one.
    expect(await screen.findByTestId('issue-43', {}, { timeout: 4_000 })).toBeTruthy();
    await waitFor(() => expect(screen.queryByTestId('pending-issue')).toBeNull(), { timeout: 4_000 });
  });
});
