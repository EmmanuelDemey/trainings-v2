import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

async function buildLineup() {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Add Luke Skywalker to the lineup' }));
  await user.click(screen.getByRole('button', { name: 'Add Leia Organa to the lineup' }));
  return user;
}

describe('App', () => {
  it('adds people to the lineup, in click order', async () => {
    await buildLineup();

    const lineup = screen.getByRole('list', { name: 'Lineup' });
    expect(within(lineup).getAllByRole('listitem').map((row) => row.querySelector('span')?.textContent)).toEqual([
      'Luke Skywalker',
      'Leia Organa',
    ]);
  });

  it('keeps the note of each person when the lineup is reordered', async () => {
    const user = await buildLineup();
    await user.type(screen.getByLabelText('Note for Luke Skywalker'), 'Farm boy');

    await user.click(screen.getByRole('button', { name: 'Move Luke Skywalker down' }));

    // The note was typed for Luke: it moves with Luke, not with the position.
    expect(screen.getByLabelText('Note for Luke Skywalker')).toHaveValue('Farm boy');
    expect(screen.getByLabelText('Note for Leia Organa')).toHaveValue('');
  });
});
