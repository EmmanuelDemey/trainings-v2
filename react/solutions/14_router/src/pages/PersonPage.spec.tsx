import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { renderAt } from '../tests/render';

describe('the person page', () => {
  // Step 3. `/people/:id` loads the person before showing the page.
  it('shows the person of the URL', async () => {
    renderAt('/people/4');

    expect(await screen.findByRole('heading', { name: 'Darth Vader' })).toBeInTheDocument();
    expect(screen.getByText('202 cm')).toBeInTheDocument();
    expect(screen.getByText('41.9BBY')).toBeInTheDocument();
  });

  it('opens from the list, and "Back" returns to the list as it was', async () => {
    const user = userEvent.setup();
    const router = renderAt('/?q=o');

    await user.click(await screen.findByRole('link', { name: 'Leia Organa' }));
    expect(await screen.findByRole('heading', { name: 'Leia Organa' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/people/5');

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByRole('heading', { name: 'People' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?q=o');
  });

  // Step 5. A thrown 404 renders the error element — inside the layout.
  it('shows "Not found" for an unknown person, keeping the navigation', async () => {
    renderAt('/people/999');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Not found');
    expect(alert).toHaveTextContent('No person with id 999.');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('shows "Something went wrong" when the API fails', async () => {
    server.use(http.get('/api/people/:id', () => HttpResponse.json(null, { status: 500 })));

    renderAt('/people/1');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong');
    expect(alert).toHaveTextContent('HTTP 500');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });
});
