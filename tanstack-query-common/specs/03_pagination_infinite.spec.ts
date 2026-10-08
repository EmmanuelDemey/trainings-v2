import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { apiSettings, resetApi, sent } from '../../api/fakeApi';
import { renderApp } from '../render';

/**
 * Workshop 3 — Paginated and infinite queries. Same specs for React, Angular
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

const activityItems = () => screen.queryAllByTestId(/^activity-\d+$/);

describe('step 1 — a paginated query', () => {
  it('keeps the current page on screen while the next one loads', async () => {
    const user = userEvent.setup();
    apiSettings.latencyMs = 300;
    await renderApp();
    await screen.findByTestId('issue-1', {}, { timeout: 2_000 });
    expect(screen.getByTestId('page-indicator').textContent).toContain('1 / 5');

    await user.click(screen.getByTestId('page-next'));
    await sleep(50);

    // Page 2 is on its way. Until it lands, page 1 stays — no empty table, no
    // "Loading…" in the middle of the screen.
    expect(screen.getByTestId('issue-1')).toBeTruthy();
    expect(screen.queryByTestId('issues-loading')).toBeNull();

    expect(await screen.findByTestId('issue-11', {}, { timeout: 2_000 })).toBeTruthy();
    expect(screen.queryByTestId('issue-1')).toBeNull();
    expect(screen.getByTestId('page-indicator').textContent).toContain('2 / 5');
  });
});

describe('step 2 — prefetching', () => {
  it('fetches the next page before the user asks for it', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');

    // Nobody clicked yet.
    await waitFor(() => expect(sent('GET /issues?page=2')).toBe(1));
    await sleep(100);

    await user.click(screen.getByTestId('page-next'));
    expect(await screen.findByTestId('issue-11')).toBeTruthy();
    // Already in the cache: the click itself sent nothing.
    expect(sent('GET /issues?page=2')).toBe(1);
  });
});

describe('step 3 — an infinite query', () => {
  it('loads the activity feed page by page, and stops at the end', async () => {
    const user = userEvent.setup();
    await renderApp();

    // Newest first.
    expect(await screen.findByTestId('activity-34')).toBeTruthy();
    expect(activityItems()).toHaveLength(10);

    await user.click(screen.getByTestId('load-more'));
    await waitFor(() => expect(activityItems()).toHaveLength(20));
    // The first page is still there: pages are appended, not replaced.
    expect(screen.getByTestId('activity-34')).toBeTruthy();

    await user.click(screen.getByTestId('load-more'));
    await waitFor(() => expect(activityItems()).toHaveLength(30));
    await user.click(screen.getByTestId('load-more'));
    await waitFor(() => expect(activityItems()).toHaveLength(34));

    // `nextCursor` is null on the last page: nothing more to load.
    await waitFor(() => expect(screen.queryByTestId('load-more')).toBeNull());
    for (const cursor of [0, 10, 20, 30]) {
      expect(sent(`GET /activity?cursor=${cursor}`)).toBe(1);
    }
  });
});
