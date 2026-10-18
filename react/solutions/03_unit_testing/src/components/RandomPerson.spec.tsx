import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { people } from '../data/people';
import { RandomPerson } from './RandomPerson';

describe('RandomPerson', () => {
  it('shows nobody before the first click', () => {
    render(<RandomPerson people={people} />);

    expect(screen.queryByText(/your random person/i)).not.toBeInTheDocument();
  });

  it('shows the person the random draw lands on', async () => {
    // Randomness made deterministic: 0.7 × 5 people → index 3, Darth Vader.
    using _random = vi.spyOn(Math, 'random').mockReturnValue(0.7);
    const user = userEvent.setup();
    render(<RandomPerson people={people} />);

    await user.click(screen.getByRole('button', { name: 'Pick a random person' }));

    expect(screen.getByText('Your random person: Darth Vader')).toBeInTheDocument();
  });

  it('can land on the first and on the last person', async () => {
    using random = vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.99);
    const user = userEvent.setup();
    render(<RandomPerson people={people} />);
    const button = screen.getByRole('button', { name: 'Pick a random person' });

    await user.click(button);
    expect(screen.getByText('Your random person: Luke Skywalker')).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText('Your random person: Leia Organa')).toBeInTheDocument();
    expect(random).toHaveBeenCalledTimes(2);
  });
});
