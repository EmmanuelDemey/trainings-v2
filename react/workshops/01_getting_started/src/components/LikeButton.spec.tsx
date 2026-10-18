import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LikeButton } from './LikeButton';

describe('LikeButton', () => {
  it('counts one more like on each click', async () => {
    const user = userEvent.setup();
    render(<LikeButton label="Luke Skywalker" />);

    await user.click(screen.getByRole('button', { name: /0 likes/ }));
    await user.click(screen.getByRole('button', { name: /1 likes/ }));

    expect(screen.getByRole('button', { name: /2 likes/ })).toBeInTheDocument();
  });

  it('keeps the document title in sync with the number of likes', async () => {
    const user = userEvent.setup();
    render(<LikeButton label="Luke Skywalker" />);

    await user.click(screen.getByRole('button'));

    expect(document.title).toBe('Luke Skywalker — 1 likes');
  });
});
