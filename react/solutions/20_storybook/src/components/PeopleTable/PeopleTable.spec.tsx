import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { composeStories } from '@storybook/react-vite';
import { people } from '../../data/people';
import * as stories from './PeopleTable.stories';

const { Default, Empty, Loading } = composeStories(stories);

describe('PeopleTable stories', () => {
  it('Default lists every person, one row each', () => {
    render(<Default />);

    const [, ...rows] = screen.getAllByRole('row');
    expect(rows).toHaveLength(people.length);
    expect(within(rows[0]!).getByRole('button', { name: 'Luke Skywalker' })).toBeInTheDocument();
  });

  it('Default reports the clicked person to the onSelect action', async () => {
    const user = userEvent.setup();
    render(<Default />);

    await user.click(screen.getByRole('button', { name: 'Darth Vader' }));

    expect(Default.args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Darth Vader' }));
  });

  it('Empty says that no people were found, without a table', () => {
    render(<Empty />);

    expect(screen.getByRole('status')).toHaveTextContent('No people found');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('Loading shows the loading message, without a table', () => {
    render(<Loading />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading people…');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
