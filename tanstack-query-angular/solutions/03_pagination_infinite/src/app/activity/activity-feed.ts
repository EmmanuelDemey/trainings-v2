import { Component } from '@angular/core';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { activityFeedQuery } from './activity-queries';

@Component({
  selector: 'app-activity-feed',
  template: `
    <section>
      <h2>Activity</h2>

      @if (feed.isPending()) {
        <p class="muted">Loading…</p>
      } @else if (feed.isError()) {
        <p class="error">{{ feed.error().message }}</p>
      } @else {
        <ul>
          <!-- data().pages: one entry per page loaded, in order — appended, never replaced. -->
          @for (page of feed.data().pages; track $index) {
            @for (event of page.items; track event.id) {
              <li [attr.data-testid]="'activity-' + event.id">{{ event.message }}</li>
            }
          }
        </ul>

        @if (feed.isFetchingNextPage()) {
          <p class="muted" data-testid="activity-loading-more">Loading more…</p>
        }
        <!-- No button at all once getNextPageParam returned undefined. -->
        @if (feed.hasNextPage()) {
          <button
            type="button"
            data-testid="load-more"
            [disabled]="feed.isFetchingNextPage()"
            (click)="feed.fetchNextPage()"
          >
            Load more
          </button>
        }
      }
    </section>
  `,
})
export class ActivityFeed {
  protected readonly feed = injectInfiniteQuery(() => activityFeedQuery());
}
