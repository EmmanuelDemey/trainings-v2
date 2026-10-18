import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { people } from '../data/people';
import { FavoriteButton } from './FavoriteButton';

const luke = people[0];

describe('FavoriteButton', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('tracks the click with the id of the person', async () => {
    const user = userEvent.setup();
    render(<FavoriteButton person={luke} onAdd={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Add Luke Skywalker to the lineup' }));

    expect(window.dataLayer).toEqual([{ event: 'add_to_lineup', personId: 'luke-skywalker' }]);
  });

  it('tracks every click, including a second click on the same person', async () => {
    const user = userEvent.setup();
    render(<FavoriteButton person={luke} onAdd={() => {}} />);
    const button = screen.getByRole('button', { name: 'Add Luke Skywalker to the lineup' });

    await user.click(button);
    await user.click(button);

    // Two clicks are two events. State set to the value it already holds does
    // not re-render, so an effect watching it never hears about the second one.
    expect(window.dataLayer).toHaveLength(2);
  });

  it('hands the person to the parent on click', async () => {
    const user = userEvent.setup();
    const added: string[] = [];
    render(<FavoriteButton person={luke} onAdd={(person) => added.push(person.id)} />);

    await user.click(screen.getByRole('button', { name: 'Add Luke Skywalker to the lineup' }));

    expect(added).toEqual(['luke-skywalker']);
  });
});
