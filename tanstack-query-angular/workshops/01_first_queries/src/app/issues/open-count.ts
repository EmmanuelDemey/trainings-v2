import { Component, type OnInit, signal } from '@angular/core';
import { fetchIssues } from '../../api/fakeApi';

/**
 * The counter in the header. It fetches the open issues by hand, on its own —
 * the list below fetches the very same thing, on ITS own. Read the Network panel.
 */
@Component({
  selector: 'app-open-count',
  template: `
    <span class="badge" data-testid="open-count">
      @if (count() !== null) {
        {{ count() }} open
      } @else {
        … open
      }
    </span>
  `,
})
export class OpenCount implements OnInit {
  // TODO (step 2): replace this signal and `ngOnInit` with
  // `injectQuery(() => issuesQuery('open'))`, and read `.data()` in the template.
  protected readonly count = signal<number | null>(null);

  async ngOnInit(): Promise<void> {
    const issues = await fetchIssues('open');
    this.count.set(issues.length);
  }
}
