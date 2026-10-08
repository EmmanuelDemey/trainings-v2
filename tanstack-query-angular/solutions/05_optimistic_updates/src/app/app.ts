import { Component } from '@angular/core';
import { injectIsMutating } from '@tanstack/angular-query-experimental';
import { IssueList } from './issues/issue-list';
import { NewIssueForm } from './issues/new-issue-form';
import { OpenCount } from './issues/open-count';

@Component({
  selector: 'app-root',
  imports: [IssueList, NewIssueForm, OpenCount],
  template: `
    <header class="app-header">
      <h1>Issue tracker</h1>
      @if (mutating() > 0) {
        <span class="muted" data-testid="saving">Saving…</span>
      }
      <app-open-count />
    </header>
    <main>
      <app-new-issue-form />
      <app-issue-list />
    </main>
  `,
})
export class App {
  // A signal: how many mutations are in flight right now, anywhere in the app.
  // The header knows nothing about the form or the rows — it reads the cache.
  protected readonly mutating = injectIsMutating();
}
