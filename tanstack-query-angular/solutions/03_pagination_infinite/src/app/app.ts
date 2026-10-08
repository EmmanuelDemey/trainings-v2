import { Component } from '@angular/core';
import { ActivityFeed } from './activity/activity-feed';
import { IssueTable } from './issues/issue-table';

@Component({
  selector: 'app-root',
  imports: [ActivityFeed, IssueTable],
  template: `
    <header class="app-header">
      <h1>Issue tracker</h1>
    </header>
    <main class="columns">
      <app-issue-table />
      <app-activity-feed />
    </main>
  `,
})
export class App {}
