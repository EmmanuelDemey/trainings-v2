import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { clearPeopleCache } from '../api/people';
import { holdPersonRequests } from '../tests/hold';
import { PersonPanel } from './PersonPanel';

// A render that suspends on `use()` must happen inside an AWAITED `act`: React
// then retries the render once the promise settles. With a plain `render`,
// React warns "A component suspended inside an `act` scope…" and never retries.
async function renderPanel(id: string | null) {
  await act(async () => {
    render(<PersonPanel id={id} isPending={false} />);
  });
}

describe('PersonPanel', () => {
  beforeEach(() => clearPeopleCache());

  it('asks to select a person when there is none', async () => {
    await renderPanel(null);

    expect(screen.getByText('Select a person to see their details.')).toBeInTheDocument();
  });

  // Step 3. `use(getPerson(id))` suspends, the <Suspense> fallback shows, then
  // the details replace it.
  it('shows a loading message while the person loads', async () => {
    const release = holdPersonRequests();

    await renderPanel('1');

    expect(screen.getByRole('status')).toHaveTextContent('Loading person…');
    release();
    expect(await screen.findByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();
  });

  it('shows the details of the person', async () => {
    await renderPanel('1');

    expect(await screen.findByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(screen.getByText('172 cm')).toBeInTheDocument();
    expect(screen.getByText('77 kg')).toBeInTheDocument();
    expect(screen.getByText('19BBY')).toBeInTheDocument();
  });

  // Step 4. A rejected promise is thrown by `use()`: the error boundary around
  // the details catches it, instead of the whole app going blank.
  it('shows an alert when the person cannot be loaded', async () => {
    using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(http.get('/api/people/:id', () => HttpResponse.json(null, { status: 500 })));

    await renderPanel('4');

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this person.');
  });

  it('loads the person again when "Try again" is clicked after a failure', async () => {
    using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(
      http.get('/api/people/:id', () => HttpResponse.json(null, { status: 500 }), { once: true }),
    );
    const user = userEvent.setup();
    await renderPanel('4');

    const retry = await screen.findByRole('button', { name: 'Try again' });
    await act(() => user.click(retry));

    expect(await screen.findByRole('heading', { name: 'Darth Vader' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
