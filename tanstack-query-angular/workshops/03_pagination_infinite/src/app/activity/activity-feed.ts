import { Component } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { activityFeedQuery } from './activity-queries';

@Component({
  selector: 'app-activity-feed',
  template: `
    <section>
      <h2>Activity</h2>

      @if (feed.data(); as page) {
        <!-- TODO (step 3): one entry per page loaded — data().pages — each with its items. -->
        <ul>
          @for (event of page.items; track event.id) {
            <li [attr.data-testid]="'activity-' + event.id">{{ event.message }}</li>
          }
        </ul>

        <!-- TODO (step 3): <p data-testid="activity-loading-more"> while the next page loads. -->
        <!-- TODO (step 3): no button at all when there is nothing more to load. -->
        <button type="button" data-testid="load-more" (click)="loadMore()">Load more</button>
      } @else if (feed.isError()) {
        <p class="error">{{ feed.error().message }}</p>
      } @else {
        <p class="muted">Loading…</p>
      }
    </section>
  `,
})
export class ActivityFeed {
  // TODO (step 3): `injectInfiniteQuery(() => activityFeedQuery())`.
  protected readonly feed = injectQuery(() => activityFeedQuery());

  protected loadMore(): void {
    // TODO (step 3): `this.feed.fetchNextPage()` — once the feed is an infinite query.
  }
}
