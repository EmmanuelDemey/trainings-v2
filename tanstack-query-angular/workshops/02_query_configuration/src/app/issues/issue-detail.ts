import { Component, input } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { issueDetailQuery } from './issue-queries';

@Component({
  selector: 'app-issue-detail',
  template: `
    <aside class="detail">
      @if (issueId() === undefined) {
        <p class="muted" data-testid="detail-empty">Select an issue to see its details.</p>
      } @else if (detail.data(); as issue) {
        <h2 data-testid="detail-title">#{{ issue.id }} {{ issue.title }}</h2>
        <p class="muted">{{ issue.status }} · {{ issue.assignee ?? 'unassigned' }} · {{ issue.commentCount }} comment(s)</p>
        <!-- TODO (step 3): while the data is a placeholder (isPlaceholderData()),
             there is no description to show yet. -->
        <p data-testid="detail-description">{{ issue.description }}</p>
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

  // The `as number` silences TypeScript, not the request: with nothing
  // selected, this sends `GET /issues/undefined`. Read the Network panel.
  // TODO (step 2): no request at all until an issue is selected.
  // TODO (step 3): `placeholderData` — the summary from the list cache, so the
  // title shows at once. Why not `initialData`?
  protected readonly detail = injectQuery(() => issueDetailQuery(this.issueId() as number));
}
