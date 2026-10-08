import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/vue';
import { apiSettings, resetApi } from '@/api/fakeApi';
import IssueList from '@/components/IssueList.vue';
import { renderWithClient } from './renderWithClient';

/**
 * The list against the REAL fake server: what goes over the "wire", how long
 * it takes, how it fails — nothing mocked. `apiSettings` is the switchboard.
 */

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 20;
});

describe('IssueList', () => {
  it('shows a loading state, then the open issues', async () => {
    renderWithClient(IssueList);

    // Synchronous: on the very first render, there is nothing in the cache.
    expect(screen.getByTestId('list-loading')).toBeTruthy();

    // `findBy*` polls until the element shows up (1 s by default) — the
    // query resolves after the fake latency, never in the same tick.
    expect(await screen.findByTestId('issue-1')).toBeTruthy();
    expect(screen.getByText(/Checkout button does nothing on Safari/)).toBeTruthy();
    expect(screen.queryByTestId('list-loading')).toBeNull();
    // Issue 3 is closed: not in the open list.
    expect(screen.queryByTestId('issue-3')).toBeNull();
  });

  it('shows the error when the server fails', async () => {
    // The fake server's own switch: the request really leaves, and really
    // comes back with a 503 — through `fetchIssues`, the `ApiError`, the query
    // and its (disabled) retries, down to the template.
    apiSettings.failNextRequest = true;

    renderWithClient(IssueList);

    expect((await screen.findByTestId('list-error')).textContent).toContain('temporarily unavailable');
    expect(screen.queryByTestId('issue-1')).toBeNull();
  });
});
