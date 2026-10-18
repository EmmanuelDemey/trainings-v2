import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { people } from '../data/people';
import type { Review } from '../model/review';
import { renderCountingCommits } from '../tests/commits';
import { ReviewPanel } from './ReviewPanel';

describe('ReviewPanel', () => {
  it('reviews the selected person', async () => {
    const user = userEvent.setup();
    renderCountingCommits(<ReviewPanel people={people} onSubmit={() => {}} />);

    await user.selectOptions(screen.getByLabelText('Person to review'), 'Leia Organa');

    expect(screen.getByRole('form', { name: 'Review Leia Organa' })).toBeInTheDocument();
  });

  it('starts a blank review when switching person', async () => {
    const user = userEvent.setup();
    renderCountingCommits(<ReviewPanel people={people} onSubmit={() => {}} />);

    await user.type(screen.getByLabelText('Comment'), 'Whiny, but brave');
    await user.selectOptions(screen.getByLabelText('Person to review'), 'R2-D2');

    expect(screen.getByLabelText('Comment')).toHaveValue('');
    expect(screen.getByLabelText('Stars')).toHaveValue(3);
  });

  it('switches person in a single commit', async () => {
    const user = userEvent.setup();
    const { commits, resetCommits } = renderCountingCommits(<ReviewPanel people={people} onSubmit={() => {}} />);
    await user.type(screen.getByLabelText('Comment'), 'Whiny, but brave');
    resetCommits();

    await user.selectOptions(screen.getByLabelText('Person to review'), 'Darth Vader');

    // A second commit means Vader's form was first shown holding Luke's
    // draft, then cleared by an effect.
    expect(commits()).toBe(1);
  });

  it('sends the review of the selected person', async () => {
    const user = userEvent.setup();
    const sent: Review[] = [];
    renderCountingCommits(<ReviewPanel people={people} onSubmit={(review) => sent.push(review)} />);

    await user.type(screen.getByLabelText('Comment'), 'Whiny, but brave');
    await user.click(screen.getByRole('button', { name: 'Send review' }));

    expect(sent).toEqual([{ personId: 'luke-skywalker', stars: 3, comment: 'Whiny, but brave' }]);
  });
});
