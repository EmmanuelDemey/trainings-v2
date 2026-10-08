import { describe, it } from 'vitest';

describe('creating an issue', () => {
  // TODO (4): render `<IssueList />` (it holds the form), type a title with
  // `userEvent`, submit, then `issue-43` in the list and an empty input.
  it.todo('adds the new row to the list, and clears the input');

  // TODO (4): the same with `apiSettings.failWrites = true`: `create-error`
  // shows, and the input keeps the title.
  it.todo('keeps the title and shows the error when the server refuses');
});
