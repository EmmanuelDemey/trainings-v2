import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { apiSettings, resetApi, sent } from '../../api/fakeApi';
import { renderApp } from '../render';

/**
 * Workshop 1 — First queries. The same specs for React, Angular and Vue: they
 * render the whole app with `renderApp()` (see `../render.ts`, the only file
 * that knows the framework), then read two things only — what the page shows,
 * and `apiLog`, the requests the fake server received.
 *
 * Given, and red on the starter. Keep them running while you work:
 *
 *   npm run test:watch
 */

beforeEach(() => {
  resetApi();
  // Slow enough to catch the page BEFORE the server answers, fast enough to
  // keep the run short.
  apiSettings.latencyMs = 50;
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('step 2 — one cache for the whole app', () => {
  it('asks the server for the open issues once, though two components show them', async () => {
    await renderApp();

    expect(await screen.findByTestId('issue-1')).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId('open-count').textContent).toContain('28 open'));
    // The list and the header counter both need the open issues. Same key: one request.
    expect(sent('GET /issues?status=open')).toBe(1);
  });
});

describe('step 3 — a key that follows the filter', () => {
  it('shows each filter, and asks for each one once', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');

    await user.click(screen.getByTestId('filter-closed'));
    expect(await screen.findByTestId('issue-3')).toBeTruthy();
    expect(screen.queryByTestId('issue-1')).toBeNull();
    expect(sent('GET /issues?status=closed')).toBe(1);
  });
});

describe('step 4 — fetching is not loading', () => {
  it('shows a filter it already has at once, and refreshes it behind the data', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');
    await user.click(screen.getByTestId('filter-closed'));
    await screen.findByTestId('issue-3');

    // From now on the server takes a full second: whatever shows up before
    // that came from the cache.
    apiSettings.latencyMs = 1_000;
    await user.click(screen.getByTestId('filter-open'));
    await sleep(150);

    expect(screen.getByTestId('issue-1')).toBeTruthy();
    // Data on screen and a request in flight: `isFetching`, not `isPending`.
    expect(screen.queryByTestId('list-loading')).toBeNull();
    expect(screen.getByTestId('list-refreshing')).toBeTruthy();
    // `staleTime` is still 0 here: coming back DOES refetch — in the background.
    expect(sent('GET /issues?status=open')).toBe(2);

    await waitFor(() => expect(screen.queryByTestId('list-refreshing')).toBeNull(), { timeout: 2_000 });
  });
});
