import { Component, signal } from '@angular/core';
import { createIssue } from '../../api/fakeApi';

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
      <!-- TODO (step 3): disabled while the creation is pending. -->
      <button type="submit" data-testid="create-submit">Create</button>
    </form>
    <!-- TODO (step 2): <p data-testid="create-error"> with the error's message. -->
  `,
})
export class NewIssueForm {
  protected readonly title = signal('');

  // TODO (step 1): `protected readonly createIssue = injectCreateIssue();`, and
  // call its `mutate(title, { onSuccess })` below.
  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    try {
      // Nobody else hears about it: the list and the counter keep showing
      // what they had cached. Read the Network panel — nothing is refetched.
      await createIssue({ title: this.title() });
    } catch (error) {
      console.error(error);
    }
    // TODO (step 2): clear the input in the `onSuccess` of `mutate()` ONLY —
    // here it is cleared even when the server refused the issue.
    this.title.set('');
  }
}
