import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { apiLog, apiSettings, inFlight, resetApi, sent, simulateExternalChange } from '../../api/fakeApi';
import { renderApp } from '../render';

/**
 * Workshop 2 — Query configuration. Same specs for React, Angular and Vue:
 * `renderApp()` (in `../render.ts`) is the only part that knows the framework.
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

describe('step 1 — staleTime', () => {
  it('comes back to a filter it loaded a second ago without asking the server', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');

    await user.click(screen.getByTestId('filter-closed'));
    await screen.findByTestId('issue-3');
    await user.click(screen.getByTestId('filter-open'));

    expect(await screen.findByTestId('issue-1')).toBeTruthy();
    // Still fresh: served from the cache, and the server never hears about it.
    expect(sent('GET /issues?status=open')).toBe(1);
  });
});

describe('step 2 — enabled', () => {
  it('asks for no detail until an issue is selected', async () => {
    await renderApp();
    await screen.findByTestId('issue-1');
    await sleep(100);

    expect(screen.getByTestId('detail-empty')).toBeTruthy();
    // Not `GET /issues/undefined`, not `GET /issues/null`: nothing at all.
    expect(apiLog.filter((call) => /^GET \/issues\/[^?]/.test(call.label))).toEqual([]);
  });
});

describe('step 3 — placeholderData', () => {
  it('shows the title from the list at once, and the description when it arrives', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');

    apiSettings.latencyMs = 1_000;
    await user.click(screen.getByTestId('select-1'));
    await sleep(150);

    // The list already knows the title: no need to wait for the server.
    expect(screen.getByTestId('detail-title').textContent).toContain('Checkout button does nothing on Safari');
    expect(inFlight('GET /issues/1')).toHaveLength(1);
    // The description is not in the list: it comes with the detail, and only then.
    expect(screen.queryByTestId('detail-description')).toBeNull();

    expect(await screen.findByTestId('detail-description', {}, { timeout: 2_000 })).toBeTruthy();
    expect(sent('GET /issues/1')).toBe(1);
  });
});

describe('step 4 — refetch on window focus', () => {
  it('refreshes the counter when the user comes back to the tab, even while it is fresh', async () => {
    await renderApp();
    await waitFor(() => expect(screen.getByTestId('open-count').textContent).toContain('28 open'));

    // Someone else closes an issue, in another tab: the app is not told.
    simulateExternalChange();
    // The user comes back to this tab.
    window.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => expect(screen.getByTestId('open-count').textContent).toContain('27 open'));
  });
});
