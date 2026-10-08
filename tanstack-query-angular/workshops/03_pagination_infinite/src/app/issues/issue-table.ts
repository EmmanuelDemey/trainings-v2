import { Component, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { issuePageQuery } from './issue-queries';

@Component({
  selector: 'app-issue-table',
  template: `
    <section>
      <h2>All issues</h2>

      @if (issues.data(); as current) {
        <!-- TODO (step 1): dim the table while it shows the previous page (isPlaceholderData()). -->
        <table>
          <tbody>
            @for (issue of current.items; track issue.id) {
              <tr [attr.data-testid]="'issue-' + issue.id">
                <td class="muted">#{{ issue.id }}</td>
                <td>{{ issue.title }}</td>
                <td class="muted">{{ issue.status }}</td>
              </tr>
            }
          </tbody>
        </table>

        <div class="pager">
          <button type="button" data-testid="page-prev" [disabled]="page() === 1" (click)="page.set(page() - 1)">
            ← Previous
          </button>
          <span data-testid="page-indicator">Page {{ current.page }} / {{ current.totalPages }}</span>
          <!-- TODO (step 1): also disabled while the next page is not there yet. -->
          <button
            type="button"
            data-testid="page-next"
            [disabled]="current.page >= current.totalPages"
            (click)="page.set(page() + 1)"
          >
            Next →
          </button>
        </div>
      } @else if (issues.isError()) {
        <p class="error">{{ issues.error().message }}</p>
      } @else {
        <p class="muted" data-testid="issues-loading">Loading…</p>
      }
    </section>
  `,
})
export class IssueTable {
  protected readonly page = signal(1);

  // Every page is a new key, so a new cache entry with nothing in it: the table
  // empties and "Loading…" comes back at every click.
  // TODO (step 1): keep the previous page on screen — `placeholderData: keepPreviousData`.
  protected readonly issues = injectQuery(() => issuePageQuery(this.page()));

  // TODO (step 2): whenever a real page is on screen, prefetch the next one
  // with `queryClient.prefetchQuery(...)` — in an `effect()` of the constructor,
  // with `inject(QueryClient)` as a field.
}
