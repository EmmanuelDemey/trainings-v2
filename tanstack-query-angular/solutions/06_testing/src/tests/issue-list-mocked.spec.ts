import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/angular';
import { ApiError } from '../api/fakeApi';
import { type IssueApi, ISSUE_API } from '../app/issues/issue-api';
import { IssueList } from '../app/issues/issue-list';
import { renderWithClient } from './render-with-client';

/**
 * The same error state, with the API replaced by a mock. With Vite and Vitest
 * alone you would write `vi.mock('../api/fakeApi')`; Angular's unit-test
 * builder refuses it (it bundles the specs with the app first), so the mock
 * goes where Angular wants it: in the providers.
 */
describe('IssueList, with the API mocked', () => {
  it('shows the error the query function rejected with', async () => {
    const api: IssueApi = {
      fetchIssues: vi.fn<IssueApi['fetchIssues']>().mockRejectedValue(new ApiError(500, 'Boom')),
      createIssue: vi.fn<IssueApi['createIssue']>(),
      deleteIssue: vi.fn<IssueApi['deleteIssue']>(),
    };

    await renderWithClient(IssueList, { providers: [{ provide: ISSUE_API, useValue: api }] });

    expect((await screen.findByTestId('list-error')).textContent).toContain('Boom');
    expect(api.fetchIssues).toHaveBeenCalledWith('open');
    // What the mock does NOT test: that `fetchIssues` sends the right request,
    // and fails the way the real server fails — it never ran. The switch of
    // the fake server (issue-list.spec.ts) tests all of that, for the same
    // price: prefer it, and keep mocks for what you cannot run in a test.
  });
});
