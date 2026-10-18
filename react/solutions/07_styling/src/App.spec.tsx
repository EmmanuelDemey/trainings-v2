import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { people } from './data/people';

describe('App', () => {
  it('renders one card per person', () => {
    render(<App />);

    expect(screen.getAllByRole('article')).toHaveLength(people.length);
  });

  it('switches between the light and the dark theme', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('data-theme', 'light');

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(root).toHaveAttribute('data-theme', 'dark');

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(root).toHaveAttribute('data-theme', 'light');
  });
});
