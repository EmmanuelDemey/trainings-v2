import { Component, signal } from '@angular/core';
import { injectCreateIssue } from './issue-mutations';

@Component({
  selector: 'app-new-issue-form',
  template: `
    <form class="toolbar" (submit)="submit($event)">
      <input
        #titleInput
        data-testid="new-title"
        placeholder="What is broken?"
        aria-label="Title of the new issue"
        [value]="title()"
        (input)="title.set(titleInput.value)"
      />
      <!-- Pending until the lists have refetched: no double submit. -->
      <button type="submit" data-testid="create-submit" [disabled]="createIssue.isPending()">Create</button>
    </form>
    @if (createIssue.isError()) {
      <p class="error" data-testid="create-error">{{ createIssue.error().message }}</p>
    }
  `,
})
export class NewIssueForm {
  protected readonly title = signal('');
  protected readonly createIssue = injectCreateIssue();

  protected submit(event: Event): void {
    event.preventDefault();
    this.createIssue.mutate(this.title(), {
      // The callbacks of `mutate()` belong to THIS call, from THIS component:
      // the place for what only the form cares about. Clear the input on
      // success only — a refused write keeps what the user typed.
      onSuccess: () => this.title.set(''),
    });
  }
}
