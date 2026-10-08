import { Component } from '@angular/core';
import { IssueList } from './issues/issue-list';
import { NewIssueForm } from './issues/new-issue-form';
import { OpenCount } from './issues/open-count';

@Component({
  selector: 'app-root',
  imports: [IssueList, NewIssueForm, OpenCount],
  template: `
    <header class="app-header">
      <h1>Issue tracker</h1>
      <!-- TODO (step 4): <span data-testid="saving">Saving…</span> while ANY mutation is in flight. -->
      <app-open-count />
    </header>
    <main>
      <app-new-issue-form />
      <app-issue-list />
    </main>
  `,
})
export class App {
  // TODO (step 4): `injectIsMutating()` — a signal of the number of mutations in flight.
}
