import { Component, signal } from '@angular/core';
import { IssueDetail } from './issues/issue-detail';
import { IssueList } from './issues/issue-list';
import { OpenCount } from './issues/open-count';

@Component({
  selector: 'app-root',
  imports: [IssueDetail, IssueList, OpenCount],
  template: `
    <header class="app-header">
      <h1>Issue tracker</h1>
      <app-open-count />
    </header>
    <main class="columns">
      <app-issue-list (selected)="selectedId.set($event)" />
      <app-issue-detail [issueId]="selectedId()" />
    </main>
  `,
})
export class App {
  // Client state — which issue is selected — stays a plain signal. Only the
  // SERVER state goes through TanStack Query.
  protected readonly selectedId = signal<number | undefined>(undefined);
}
