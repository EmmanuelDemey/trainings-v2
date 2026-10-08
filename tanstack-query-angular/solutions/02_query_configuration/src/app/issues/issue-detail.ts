import { Component, inject, input } from '@angular/core';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { issueDetailQuery, issueSummaryFromLists } from './issue-queries';

@Component({
  selector: 'app-issue-detail',
  template: `
    <aside class="detail">
      @if (issueId() === undefined) {
        <p class="muted" data-testid="detail-empty">Select an issue to see its details.</p>
      } @else if (detail.data(); as issue) {
        <h2 data-testid="detail-title">#{{ issue.id }} {{ issue.title }}</h2>
        <p class="muted">{{ issue.status }} · {{ issue.assignee ?? 'unassigned' }} · {{ issue.commentCount }} comment(s)</p>
        <!-- The placeholder came from a list: it has no description. -->
        @if (detail.isPlaceholderData()) {
          <p class="muted">Loading the description…</p>
        } @else {
          <p data-testid="detail-description">{{ issue.description }}</p>
        }
      } @else if (detail.isError()) {
        <p class="error">{{ detail.error().message }}</p>
      } @else {
        <p class="muted">Loading…</p>
      }
    </aside>
  `,
})
export class IssueDetail {
  readonly issueId = input<number>();

  private readonly queryClient = inject(QueryClient);

  protected readonly detail = injectQuery(() => {
    const id = this.issueId();
    return {
      ...issueDetailQuery(id),
      // Shown while the detail is on its way, and NEVER written to the cache:
      // the query stays pending, so it fetches the real issue. `initialData`
      // would be cached as if it came from the server — fresh for 30 seconds,
      // so the description would never be fetched.
      placeholderData: () => (id === undefined ? undefined : issueSummaryFromLists(this.queryClient, id)),
    };
  });
}
