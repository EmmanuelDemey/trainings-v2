import { Component, type OnInit, signal } from '@angular/core';
import { fetchIssues, type IssueFilter, type IssueSummary } from '../../api/fakeApi';

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
            (click)="select(option)"
          >
            {{ option }}
          </button>
        }
        <!-- TODO (step 4): show <span data-testid="list-refreshing"> while a
             request is in flight BEHIND data already on screen. -->
      </div>

      <!-- TODO (step 4): "Loading…" only when there is nothing to show yet. -->
      @if (loading()) {
        <p class="muted" data-testid="list-loading">Loading…</p>
      } @else if (error(); as error) {
        <p class="error" data-testid="list-error">{{ error.message }}</p>
      } @else {
        <ul>
          @for (issue of issues(); track issue.id) {
            <li [attr.data-testid]="'issue-' + issue.id">
              <span class="muted">#{{ issue.id }}</span> {{ issue.title }}
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class IssueList implements OnInit {
  protected readonly filters: readonly IssueFilter[] = ['open', 'closed', 'all'];
  protected readonly filter = signal<IssueFilter>('open');

  // TODO (step 2): the three pieces of state below, `ngOnInit`, `select` and
  // `load` all go away: `injectQuery(() => issuesQuery(...))` gives you `data`,
  // `isPending`, `isFetching` and `error` — as signals.
  // TODO (step 3): read `this.filter()` INSIDE the options function, so the key
  // follows the filter.
  protected readonly issues = signal<IssueSummary[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<Error | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  protected select(filter: IssueFilter): void {
    this.filter.set(filter);
    void this.load();
  }

  private async load(): Promise<void> {
    // Every load starts from scratch: the list we had for this filter a second
    // ago is thrown away, and "Loading…" comes back.
    this.loading.set(true);
    this.error.set(null);
    try {
      // Whichever answer comes back LAST wins — even when it is the answer to
      // a filter the user has already left.
      this.issues.set(await fetchIssues(this.filter()));
    } catch (error) {
      this.error.set(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.loading.set(false);
    }
  }
}
