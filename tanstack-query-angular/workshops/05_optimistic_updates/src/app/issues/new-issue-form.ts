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
      <button type="submit" data-testid="create-submit" [disabled]="createIssue.isPending()">Create</button>
    </form>
    @if (createIssue.isError()) {
      <p class="error" data-testid="create-error">{{ createIssue.error().message }}</p>
    }
    <!-- TODO (step 3): while the creation is pending, show what was SENT —
         createIssue.variables() — in a greyed-out <li data-testid="pending-issue">. -->
  `,
})
export class NewIssueForm {
  protected readonly title = signal('');
  protected readonly createIssue = injectCreateIssue();

  protected submit(event: Event): void {
    event.preventDefault();
    this.createIssue.mutate(this.title(), {
      onSuccess: () => this.title.set(''),
    });
  }
}
