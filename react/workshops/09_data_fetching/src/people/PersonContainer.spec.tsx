import { render, screen, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { people } from '../data/people';
import { server } from '../mocks/server';
import { PersonContainer } from './PersonContainer';

const luke = people.find(({ id }) => id === '1')!;

describe('PersonContainer', () => {
  it('shows a loader, then the details of the character', async () => {
    render(<PersonContainer id="1" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(screen.getByText('19BBY')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an error when the character does not exist', async () => {
    render(<PersonContainer id="999" />);

    expect(await screen.findByRole('alert')).toHaveTextContent('404');
  });

  it('loads the new character when the id changes', async () => {
    const { rerender } = render(<PersonContainer id="1" />);
    await screen.findByRole('heading', { name: 'Luke Skywalker' });

    rerender(<PersonContainer id="5" />);

    expect(await screen.findByRole('heading', { name: 'Leia Organa' })).toBeInTheDocument();
  });

  it('keeps the LAST selected character when an earlier response arrives late', async () => {
    // Luke's answer takes 200 ms, Leia's a few: Luke's arrives second.
    server.use(
      http.get('/api/people/1', async () => {
        await delay(200);
        return HttpResponse.json(luke);
      }),
    );
    const { rerender } = render(<PersonContainer id="1" />);

    rerender(<PersonContainer id="5" />);
    await screen.findByRole('heading', { name: 'Leia Organa' });
    // Leave Luke's late response the time to arrive — and to do damage.
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(screen.getByRole('heading', { name: 'Leia Organa' })).toBeInTheDocument();
    expect(screen.queryByText('Luke Skywalker')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('aborts the pending request when the id changes', async () => {
    let lukeRequest: Request | undefined;
    server.use(
      http.get('/api/people/1', async ({ request }) => {
        lukeRequest = request;
        await delay('infinite');
        return HttpResponse.json(luke);
      }),
    );
    const { rerender } = render(<PersonContainer id="1" />);
    await waitFor(() => expect(lukeRequest).toBeDefined());

    rerender(<PersonContainer id="5" />);

    await waitFor(() => expect(lukeRequest?.signal.aborted).toBe(true));
  });

  it('aborts the pending request when it unmounts', async () => {
    let lukeRequest: Request | undefined;
    server.use(
      http.get('/api/people/1', async ({ request }) => {
        lukeRequest = request;
        await delay('infinite');
        return HttpResponse.json(luke);
      }),
    );
    const { unmount } = render(<PersonContainer id="1" />);
    await waitFor(() => expect(lukeRequest).toBeDefined());

    unmount();

    await waitFor(() => expect(lukeRequest?.signal.aborted).toBe(true));
  });
});
