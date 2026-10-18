import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App, SEARCH_DELAY } from './App';

describe('App search', () => {
  // Fake timers: the 300 ms of the debounce pass when the test says so,
  // instantly. `shouldAdvanceTime` also lets the fake clock follow the real one:
  // Testing Library's async `act` waits on a `setTimeout(0)` that would
  // otherwise never fire, and every `await user.type()` would hang.
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  // user-event waits between keystrokes with timers too: it must advance the
  // fake clock, or every `type` would hang.
  const setup = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  it('shows everybody before any search', () => {
    render(<App />);

    expect(screen.getAllByRole('row')).toHaveLength(6);
  });

  it('does not filter while the user is still typing', async () => {
    const user = setup();
    render(<App />);
    const search = screen.getByLabelText('Search');

    // Two bursts of keystrokes, each one shorter than the delay: every keystroke
    // must restart the countdown, so nothing is filtered yet.
    await user.type(search, 'v');
    act(() => vi.advanceTimersByTime(SEARCH_DELAY / 2));
    await user.type(search, 'ader');
    act(() => vi.advanceTimersByTime(SEARCH_DELAY / 2));

    expect(screen.getAllByRole('row')).toHaveLength(6);
  });

  it('filters the table once the user stops typing', async () => {
    const user = setup();
    render(<App />);

    await user.type(screen.getByLabelText('Search'), 'vader');
    act(() => vi.advanceTimersByTime(SEARCH_DELAY));

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('row', { name: /darth vader/i })).toBeInTheDocument();
  });

  it('shows the empty state when nobody matches', async () => {
    const user = setup();
    render(<App />);

    await user.type(screen.getByLabelText('Search'), 'yoda');
    act(() => vi.advanceTimersByTime(SEARCH_DELAY));

    expect(screen.getByRole('status')).toHaveTextContent('No people match your search.');
  });
});
