import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { people } from '../data/people';
import { renderCountingCommits } from '../tests/commits';
import { PeopleSearch } from './PeopleSearch';

describe('PeopleSearch', () => {
  it('lists only the people whose name matches the query', async () => {
    const user = userEvent.setup();
    renderCountingCommits(<PeopleSearch people={people} onAdd={() => {}} />);

    await user.type(screen.getByLabelText('Search by name'), 'sky');

    const list = screen.getByRole('list', { name: 'Matching people' });
    expect(within(list).getAllByRole('listitem').map((item) => item.firstChild?.textContent?.trim())).toEqual([
      'Luke Skywalker',
    ]);
  });

  it('shows every person on the very first commit', () => {
    const { commits } = renderCountingCommits(<PeopleSearch people={people} onAdd={() => {}} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(people.length);
    expect(commits()).toBe(1);
  });

  it('updates the list in the same commit as the keystroke', async () => {
    const user = userEvent.setup();
    const { commits, resetCommits } = renderCountingCommits(<PeopleSearch people={people} onAdd={() => {}} />);
    resetCommits();

    await user.type(screen.getByLabelText('Search by name'), 'r');

    // One keystroke, one commit. A second one is the effect catching up with
    // a list the screen already showed stale.
    expect(commits()).toBe(1);
  });
});
