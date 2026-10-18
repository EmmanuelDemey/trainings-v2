import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderCountingCommits } from '../tests/commits';
import { rankFor } from '../ranks';
import { JediTraining } from './JediTraining';

describe('rankFor', () => {
  it('maps training points to a rank', () => {
    expect([0, 2, 3, 6, 10, 42].map(rankFor)).toEqual([
      'Youngling',
      'Youngling',
      'Padawan',
      'Knight',
      'Master',
      'Master',
    ]);
  });
});

describe('JediTraining', () => {
  it('promotes and announces it once enough training is done', async () => {
    const user = userEvent.setup();
    renderCountingCommits(<JediTraining />);

    for (let i = 0; i < 3; i += 1) await user.click(screen.getByRole('button', { name: 'Train' }));

    expect(screen.getByText('Rank: Padawan')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Promoted to Padawan!');
  });

  it('commits exactly once per click, promotion included', async () => {
    const user = userEvent.setup();
    const { commits, resetCommits } = renderCountingCommits(<JediTraining />);
    resetCommits();

    for (let i = 0; i < 3; i += 1) await user.click(screen.getByRole('button', { name: 'Train' }));

    // Three clicks, three commits. Every link of an effect chain adds one.
    expect(commits()).toBe(3);
  });
});
