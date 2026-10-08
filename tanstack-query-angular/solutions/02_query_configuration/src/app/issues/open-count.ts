import { Component } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { issuesQuery } from './issue-queries';

/**
 * The counter in the header. It asks for the open issues too — with the SAME
 * key as the list, so both share one cache entry and one request.
 */
@Component({
  selector: 'app-open-count',
  template: `
    <span class="badge" data-testid="open-count">
      @if (openIssues.data(); as issues) {
        {{ issues.length }} open
      } @else {
        … open
      }
    </span>
  `,
})
export class OpenCount {
  protected readonly openIssues = injectQuery(() => ({
    ...issuesQuery('open'),
    // Other people close issues too. A FRESH query is not refetched on focus
    // (`true`, the default, only refetches stale ones); `'always'` refetches
    // it anyway — for this observer, the counter, and nowhere else.
    refetchOnWindowFocus: 'always',
  }));
}
