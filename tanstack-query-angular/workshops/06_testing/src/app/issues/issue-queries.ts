/**
 * Everything the app knows about reading issues lives here: the components
 * only ever call what this file exports.
 */
import { inject, Injectable } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import type { IssueFilter } from '../../api/fakeApi';
import { ISSUE_API } from './issue-api';

/**
 * The key factory. Every key starts with `issueKeys.all`, from the most generic
 * to the most specific — which is what lets ONE `invalidateQueries({ queryKey:
 * issueKeys.all })` hit every list at once.
 */
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

/**
 * The query options of the issues, as a service: the Angular way to give the
 * query functions what they need from DI — here, the API — while the
 * components keep calling `injectQuery(() => this.queries.list(filter))`.
 */
@Injectable({ providedIn: 'root' })
export class IssueQueries {
  private readonly api = inject(ISSUE_API);

  /** Key and fetcher travel together; the type of `data` is inferred from `queryFn`. */
  list(filter: IssueFilter) {
    return queryOptions({
      queryKey: issueKeys.list(filter),
      queryFn: () => this.api.fetchIssues(filter),
    });
  }
}
