import { describe, it } from 'vitest';

/**
 * STEP 3 — A component, through Testing Library.
 *
 * `render(<PeopleTable people={…} />)`, then query the way a user (or a screen
 * reader) finds things: `screen.getByRole('table', { name })`,
 * `getByRole('row', { name })`, `within(row).getByRole('cell', { name })`.
 * No CSS selector, no `container.querySelector`.
 */
describe('PeopleTable', () => {
  it.todo('shows one row per person, under a header row');
  it.todo('shows the formatted height and mass of each person');
  it.todo('shows a message instead of an empty table');
  // TODO 3.4: `toMatchInlineSnapshot()` on the row of a single person.
  it.todo('renders the markup of a row');
});
