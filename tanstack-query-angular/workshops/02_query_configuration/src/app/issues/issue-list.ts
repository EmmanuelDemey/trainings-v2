import { Component, output, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import type { IssueFilter } from '../../api/fakeApi';
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
        <!-- A request in flight BEHIND data already on screen: isFetching, not isPending. -->
        @if (issues.isFetching() && !issues.isPending()) {
          <span class="muted" data-testid="list-refreshing">Refreshing…</span>
        }
      </div>

      @if (issues.isPending()) {
        <!-- Nothing to show yet for this key: the only time a "Loading…" belongs here. -->
        <p class="muted" data-testid="list-loading">Loading…</p>
      } @else if (issues.isError()) {
        <p class="error" data-testid="list-error">{{ issues.error().message }}</p>
      } @else {
        <ul>
          @for (issue of issues.data(); track issue.id) {
            <li [attr.data-testid]="'issue-' + issue.id">
              <span class="muted">#{{ issue.id }}</span> {{ issue.title }}
              <button type="button" [attr.data-testid]="'select-' + issue.id" (click)="selected.emit(issue.id)">
                Details
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

  /** The id of the issue the user wants to see in the detail panel. */
  readonly selected = output<number>();

  // `this.filter()` is read INSIDE the options function: the function runs in a
  // `computed`, so the key follows the signal and the query switches to the new
  // key on every click. `injectQuery(() => issuesQuery('open'))` would never move.
  protected readonly issues = injectQuery(() => issuesQuery(this.filter()));
}
