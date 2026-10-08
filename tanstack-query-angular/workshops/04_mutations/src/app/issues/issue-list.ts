import { Component, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { deleteIssue, type IssueFilter } from '../../api/fakeApi';
import { issuesQuery } from './issue-queries';

@Component({
  selector: 'app-issue-list',
  template: `
    <section>
      <div class="toolbar" role="group" aria-label="Filter">
        @for (option of filters; track option) {
          <button
            type="button"
            [attr.data-testid]="'filter-' + option"
            [attr.aria-pressed]="filter() === option"
            (click)="filter.set(option)"
          >
            {{ option }}
          </button>
        }
        @if (issues.isFetching() && !issues.isPending()) {
          <span class="muted" data-testid="list-refreshing">Refreshing…</span>
        }
      </div>

      @if (issues.isPending()) {
        <p class="muted" data-testid="list-loading">Loading…</p>
      } @else if (issues.isError()) {
        <p class="error" data-testid="list-error">{{ issues.error().message }}</p>
      } @else {
        <ul>
          @for (issue of issues.data(); track issue.id) {
            <li [attr.data-testid]="'issue-' + issue.id">
              <span class="muted">#{{ issue.id }}</span> {{ issue.title }}
              <button type="button" [attr.data-testid]="'delete-' + issue.id" (click)="remove(issue.id)">
                Delete
              </button>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class IssueList {
  protected readonly filters: readonly IssueFilter[] = ['open', 'closed', 'all'];
  protected readonly filter = signal<IssueFilter>('open');

  protected readonly issues = injectQuery(() => issuesQuery(this.filter()));

  // TODO (step 4): `protected readonly deleteIssue = injectDeleteIssue();`,
  // and `deleteIssue.mutate(issue.id)` in the template.
  protected async remove(id: number): Promise<void> {
    // Deleted on the server — and still on screen, until a refetch nobody asks for.
    await deleteIssue(id);
  }
}
