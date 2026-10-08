import { Component } from '@angular/core';
import { IssueList } from './issues/issue-list';
import { OpenCount } from './issues/open-count';

@Component({
  selector: 'app-root',
  imports: [IssueList, OpenCount],
  template: `
    <header class="app-header">
      <h1>Issue tracker</h1>
      <app-open-count />
    </header>
    <main>
      <app-issue-list />
    </main>
  `,
})
export class App {}
