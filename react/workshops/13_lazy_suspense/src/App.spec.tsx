import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App', () => {
  it('opens on the people page', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'People' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('list', { name: 'People' })).toBeInTheDocument();
  });

  // Step 1. A lazy component suspends the first time it renders, while its
  // chunk downloads: the Suspense fallback is on screen in between. A statically
  // imported page renders at once, and this loading message never appears.
  it('shows a loading message while the statistics page downloads, then the page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Statistics' }));

    expect(screen.getByRole('status')).toHaveTextContent('Loading page…');
    expect(await screen.findByRole('heading', { name: 'Statistics' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
