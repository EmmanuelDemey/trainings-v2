import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { renderAt } from '../tests/render';

function peopleList() {
  return screen.findByRole('list');
}

describe('the people page', () => {
  // Step 2. The list comes from the loader — that is, from the API.
  it('lists the people returned by the API', async () => {
    server.use(
      http.get('/api/people', () =>
        HttpResponse.json([
          { id: '20', name: 'Yoda', height: 66, mass: 17, birthYear: '896BBY' },
        ]),
      ),
    );

    renderAt('/');

    const list = await peopleList();
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(within(list).getByText('Yoda')).toBeInTheDocument();
  });

  // Step 3. Each name links to the person's route.
  it('links each person to their own page', async () => {
    renderAt('/');

    const list = await peopleList();

    expect(within(list).getByRole('link', { name: 'Luke Skywalker' })).toHaveAttribute('href', '/people/1');
    expect(within(list).getByRole('link', { name: 'Obi-Wan Kenobi' })).toHaveAttribute('href', '/people/10');
  });

  // Step 4. The filter lives in the URL: `?q=` is read on load…
  it('filters the list from the ?q= of the URL', async () => {
    renderAt('/?q=sky');

    const list = await peopleList();

    expect(within(list).getAllByRole('link')).toHaveLength(1);
    expect(within(list).getByRole('link', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Filter' })).toHaveValue('sky');
  });

  // …and written back as the user types.
  it('writes the filter to the URL as the user types', async () => {
    const user = userEvent.setup();
    const router = renderAt('/');
    await peopleList();

    await user.type(screen.getByRole('searchbox', { name: 'Filter' }), 'dar');

    // One loader run per keystroke: wait for the one of the last.
    await waitFor(() => expect(within(screen.getByRole('list')).getAllByRole('link')).toHaveLength(1));
    expect(screen.getByRole('link', { name: 'Darth Vader' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?q=dar');
  });

  it('removes ?q= from the URL when the filter is cleared', async () => {
    const user = userEvent.setup();
    const router = renderAt('/?q=dar');
    await peopleList();

    await user.clear(screen.getByRole('searchbox', { name: 'Filter' }));

    expect(await screen.findByRole('link', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('');
  });
});
