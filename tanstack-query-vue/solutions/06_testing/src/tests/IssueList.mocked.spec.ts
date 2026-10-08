import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/vue';
import { ApiError, fetchIssues } from '../api/fakeApi';
import IssueList from '@/components/IssueList.vue';
import { renderWithClient } from './renderWithClient';

/**
 * The same error state, with the API module MOCKED. `vi.mock` is hoisted to
 * the top of the file and replaces the module for EVERY import of it — the
 * component's `@/api/fakeApi` included, since both resolve to the same file.
 * Hence a file of its own: the other specs keep the real server.
 *
 * `importOriginal` keeps the rest of the module real (`ApiError`, the other
 * endpoints); only `fetchIssues` becomes a `vi.fn()`.
 *
 * Which one to prefer? The switch of the fake server (IssueList.spec.ts)
 * tests MORE: the real request, the real `ApiError` with its real message,
 * the real latency. Here, the error is whatever we made up — if `fetchIssues`
 * changed its signature or its errors, this test would stay green. Mock a
 * module when you cannot drive the real thing (a third-party SDK, a browser
 * API); with MSW or a fake server at hand, prefer them.
 */
vi.mock('../api/fakeApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/fakeApi')>()),
  fetchIssues: vi.fn(),
}));

describe('IssueList, with the API module mocked', () => {
  it('shows the error the API rejects with', async () => {
    vi.mocked(fetchIssues).mockRejectedValue(new ApiError(500, 'Mocked: the tracker is down'));

    renderWithClient(IssueList);

    expect((await screen.findByTestId('list-error')).textContent).toContain('Mocked: the tracker is down');
    expect(fetchIssues).toHaveBeenCalledWith('open');
  });

  it('shows what the API resolves with', async () => {
    vi.mocked(fetchIssues).mockResolvedValue([
      { id: 7, title: 'A row that only exists in this test', status: 'open', assignee: null, commentCount: 0 },
    ]);

    renderWithClient(IssueList);

    expect(await screen.findByTestId('issue-7')).toBeTruthy();
    expect(screen.queryByTestId('issue-1')).toBeNull();
  });
});
