import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clearPeopleCache } from '../api/people';
import { holdPersonRequests } from '../tests/hold';
import { PeoplePage } from './PeoplePage';

function panel() {
  return screen.getByRole('region', { name: 'Person details' });
}

describe('PeoplePage', () => {
  beforeEach(() => clearPeopleCache());

  // A click that makes a component suspend goes through an AWAITED `act`, so
  // that React retries the render once the data is there (see PersonPanel.spec).
  async function select(name: string) {
    const user = userEvent.setup();
    await act(() => user.click(screen.getByRole('button', { name })));
  }

  it('shows the person picked in the list', async () => {
    render(<PeoplePage />);

    await select('Luke Skywalker');

    expect(await within(panel()).findByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Luke Skywalker' })).toHaveAttribute('aria-pressed', 'true');
  });

  // Step 5. Inside a transition, React keeps what is already on screen while
  // the next person loads, and flags it with `isPending` (here `aria-busy`)
  // — instead of swapping it for the "Loading person…" fallback.
  it('keeps the current person on screen, marked busy, while the next one loads', async () => {
    render(<PeoplePage />);
    await select('Luke Skywalker');
    await within(panel()).findByRole('heading', { name: 'Luke Skywalker' });
    const release = holdPersonRequests();

    await select('C-3PO');

    expect(within(panel()).getByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(within(panel()).queryByRole('status')).not.toBeInTheDocument();
    expect(panel()).toHaveAttribute('aria-busy', 'true');

    release();

    expect(await within(panel()).findByRole('heading', { name: 'C-3PO' })).toBeInTheDocument();
    expect(panel()).toHaveAttribute('aria-busy', 'false');
  });
});
