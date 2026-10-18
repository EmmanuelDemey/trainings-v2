import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

afterEach(() => {
  localStorage.clear();
});

describe('step 2 — the theme switcher', () => {
  it('starts light: the page has the light background', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
    // `CssBaseline` paints <body> with the theme's `background.default`.
    expect(document.body).toHaveStyle({ backgroundColor: '#f5f7fa' });
  });

  it('switches the whole page to the dark theme, and back', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.body).toHaveStyle({ backgroundColor: '#121212' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveStyle({ color: '#90caf9' });

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.body).toHaveStyle({ backgroundColor: '#f5f7fa' });
  });

  it('is still dark after a reload', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    unmount();

    render(<App />);

    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    expect(document.body).toHaveStyle({ backgroundColor: '#121212' });
  });
});

describe('the page', () => {
  it('shows the title and the people', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Star Wars people' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Star Wars people' })).toBeInTheDocument();
  });
});
