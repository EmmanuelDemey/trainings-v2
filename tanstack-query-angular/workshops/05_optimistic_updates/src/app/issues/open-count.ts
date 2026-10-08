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
  // A field initializer runs in the injection context: `injectQuery` can
  // `inject(QueryClient)` there, and ties the query to this component's life.
  protected readonly openIssues = injectQuery(() => issuesQuery('open'));
}
