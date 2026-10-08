import { Component, effect, inject, signal } from '@angular/core';
import { injectQuery, keepPreviousData, QueryClient } from '@tanstack/angular-query-experimental';
import { issuePageQuery } from './issue-queries';

@Component({
  selector: 'app-issue-table',
  template: `
    <section>
      <h2>All issues</h2>

      @if (issues.data(); as current) {
        <!-- The previous page stays on screen, dimmed, while the next one loads. -->
        <table [class.dimmed]="issues.isPlaceholderData()">
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
          <!-- No "next" while the next page is not there yet: page() would run ahead of the screen. -->
          <button
            type="button"
            data-testid="page-next"
            [disabled]="issues.isPlaceholderData() || current.page >= current.totalPages"
            (click)="page.set(page() + 1)"
          >
            Next →
          </button>
          @if (issues.isPlaceholderData()) {
            <span class="muted">Loading page {{ page() }}…</span>
          }
        </div>
      } @else if (issues.isError()) {
        <p class="error">{{ issues.error().message }}</p>
      } @else {
        <!-- Nothing to show at all: the very first page, and only that one. -->
        <p class="muted" data-testid="issues-loading">Loading…</p>
      }
    </section>
  `,
})
export class IssueTable {
  private readonly queryClient = inject(QueryClient);

  protected readonly page = signal(1);

  protected readonly issues = injectQuery(() => ({
    ...issuePageQuery(this.page()),
    // A new page is a new key, so a new cache entry with nothing in it yet.
    // `keepPreviousData` shows the last page we had until the new one lands —
    // `isPending` stays false, `isPlaceholderData` is true in between.
    placeholderData: keepPreviousData,
  }));

  constructor() {
    // Whenever a real page is on screen, fetch the next one in the background:
    // by the time the user clicks "Next", it is already in the cache (and
    // fresh, thanks to `staleTime`, so the click sends nothing).
    effect(() => {
      const current = this.issues.data();
      if (!current || this.issues.isPlaceholderData() || current.page >= current.totalPages) return;
      void this.queryClient.prefetchQuery(issuePageQuery(current.page + 1));
    });
  }
}
