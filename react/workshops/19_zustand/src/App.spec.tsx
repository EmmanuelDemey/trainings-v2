import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { useLikes } from './store/likes';

beforeEach(() => {
  localStorage.clear();
  useLikes.setState(useLikes.getInitialState(), true);
});

describe('App, through the components', () => {
  it('liking a person presses the button and counts the like in the header', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Like Luke Skywalker' }));

    expect(screen.getByRole('button', { name: 'Like Luke Skywalker' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Like Darth Vader' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('1 liked');
  });

  it('clicking a pressed like button unlikes the person', async () => {
    const user = userEvent.setup();
    render(<App />);
    const likeLeia = screen.getByRole('button', { name: 'Like Leia Organa' });

    await user.click(likeLeia);
    await user.click(likeLeia);

    expect(likeLeia).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('0 liked');
  });

  it('"Reset likes" clears every like, then disables itself', async () => {
    const user = userEvent.setup();
    render(<App />);
    const reset = screen.getByRole('button', { name: 'Reset likes' });
    expect(reset).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Like Luke Skywalker' }));
    await user.click(screen.getByRole('button', { name: 'Like R2-D2' }));
    expect(screen.getByRole('status')).toHaveTextContent('2 liked');

    await user.click(reset);

    expect(screen.getByRole('status')).toHaveTextContent('0 liked');
    expect(screen.getByRole('button', { name: 'Like R2-D2' })).toHaveAttribute('aria-pressed', 'false');
    expect(reset).toBeDisabled();
  });

  it('shows the likes the store already holds when it mounts', () => {
    useLikes.setState({ likedIds: ['4'] });

    render(<App />);

    expect(screen.getByRole('button', { name: 'Like Darth Vader' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('1 liked');
  });
});
