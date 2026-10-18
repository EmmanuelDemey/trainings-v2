import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAt } from './tests/render';

function mainNav() {
  return screen.getByRole('navigation', { name: 'Main' });
}

describe('the layout and the routes', () => {
  // Step 1. The layout route renders the header, and its <Outlet /> the page.
  it('renders the people page inside the layout at /', async () => {
    renderAt('/');

    expect(await screen.findByRole('heading', { name: 'People' })).toBeInTheDocument();
    expect(within(mainNav()).getByRole('link', { name: 'People' })).toHaveAttribute('href', '/');
  });

  it('marks the link of the current page with aria-current', async () => {
    renderAt('/create');

    await screen.findByRole('heading', { name: 'Create a person' });

    expect(within(mainNav()).getByRole('link', { name: 'Create a person' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(mainNav()).getByRole('link', { name: 'People' })).not.toHaveAttribute('aria-current');
  });

  it('goes to the create page when its link is clicked', async () => {
    const user = userEvent.setup();
    const router = renderAt('/');
    await screen.findByRole('heading', { name: 'People' });

    await user.click(within(mainNav()).getByRole('link', { name: 'Create a person' }));

    expect(await screen.findByRole('heading', { name: 'Create a person' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/create');
  });

  it('shows "Page not found" for an unknown URL, still inside the layout', async () => {
    renderAt('/starships/12');

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(mainNav()).toBeInTheDocument();
  });
});
