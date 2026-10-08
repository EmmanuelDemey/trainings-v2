import { describe, it } from 'vitest';

describe('IssueList, with the API mocked', () => {
  // TODO (step 3): render `IssueList` with `{ provide: ISSUE_API, useValue: api }`
  // in the providers — `api.fetchIssues` a `vi.fn()` that rejects. (Why not
  // `vi.mock('../api/fakeApi')`? Read src/app/issues/issue-api.ts.) Then: which
  // of the two error tests tests more?
  it.todo('shows the error the query function rejected with');
});
