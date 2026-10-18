import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LikeButton } from './LikeButton';

describe('LikeButton', () => {
  beforeEach(() => {
    // `shouldAdvanceTime`: the fake clock still follows real time a little, so
    // the `setTimeout(0)` Testing Library awaits after each user-event action
    // fires. The 2-second timers are still driven by `advanceTimersByTime`.
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup() {
    // user-event pauses between its steps with `setTimeout`: let it move the
    // fake clock itself.
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const result = render(<LikeButton name="Luke" />);
    return { user, ...result };
  }

  it('starts with no like', () => {
    setup();

    expect(screen.getByText('0 likes')).toBeInTheDocument();
  });

  it('counts the likes, with the right plural', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'Like Luke' }));
    expect(screen.getByText('1 like')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Like Luke' }));
    expect(screen.getByText('2 likes')).toBeInTheDocument();
  });

  it('adds two likes at once with a super like', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'Super like' }));

    expect(screen.getByText('2 likes')).toBeInTheDocument();
  });

  it('thanks the user for two seconds', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'Like Luke' }));
    expect(screen.getByRole('status')).toHaveTextContent('Thanks for liking Luke!');

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('restarts the two seconds on every like', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'Like Luke' }));
    act(() => vi.advanceTimersByTime(1500));
    await user.click(screen.getByRole('button', { name: 'Like Luke' }));
    act(() => vi.advanceTimersByTime(1500));

    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('leaves no pending timer behind when it is removed', async () => {
    const { user, unmount } = setup();
    await user.click(screen.getByRole('button', { name: 'Like Luke' }));

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
