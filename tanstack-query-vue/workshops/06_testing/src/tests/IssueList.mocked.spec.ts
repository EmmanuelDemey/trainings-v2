import { describe, it } from 'vitest';

// TODO (step 3) — the same error, with the API module mocked:
//
//   vi.mock('../api/fakeApi', async (importOriginal) => ({
//     ...(await importOriginal<typeof import('../api/fakeApi')>()),
//     fetchIssues: vi.fn(),
//   }));
//
// A file of its own: `vi.mock` replaces the module for the WHOLE file.

describe('IssueList, with the API module mocked', () => {
  it.todo('shows the error the API rejects with');
  it.todo('shows what the API resolves with');
});
