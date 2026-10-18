import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    document.title = 'Star Wars people';
  });

  it('starts on the home page', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Star Wars people' })).toBeInTheDocument();
  });

  it('opens the page of the person the user clicks', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Leia Organa' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Leia Organa' })).toBeInTheDocument();
    expect(document.title).toBe('Leia Organa — Star Wars people');
  });

  it('comes back home, restores the title and focuses the filter again', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Leia Organa' }));

    await user.click(screen.getByRole('button', { name: 'Home' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Star Wars people' })).toBeInTheDocument();
    expect(document.title).toBe('Star Wars people');
    expect(screen.getByRole('searchbox', { name: 'Filter by name' })).toHaveFocus();
  });
});
