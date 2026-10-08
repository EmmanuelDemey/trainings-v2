import { InjectionToken } from '@angular/core';
import { createIssue, deleteIssue, fetchIssues } from '../../api/fakeApi';

/** What the issue tracker needs from the server. */
export interface IssueApi {
  fetchIssues: typeof fetchIssues;
  createIssue: typeof createIssue;
  deleteIssue: typeof deleteIssue;
}

/**
 * The server, behind Angular's dependency injection: the app gets the fake API
 * by default, and a test can provide anything else in its place —
 * `{ provide: ISSUE_API, useValue: … }`.
 *
 * Why not `vi.mock('../api/fakeApi')`, as with Vite? Angular's unit-test
 * builder bundles the specs with the app before Vitest runs them: there is no
 * module left to swap, and it refuses `vi.mock` of a relative import outright.
 * DI is the seam Angular gives you instead.
 */
export const ISSUE_API = new InjectionToken<IssueApi>('ISSUE_API', {
  providedIn: 'root',
  factory: () => ({ fetchIssues, createIssue, deleteIssue }),
});
