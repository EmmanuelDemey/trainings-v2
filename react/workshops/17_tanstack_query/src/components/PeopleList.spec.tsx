import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/node';
import { renderWithClient } from '../tests/render';
import { PeopleList } from './PeopleList';

describe('step 3 — the list with useQuery', () => {
  it('says it is loading, then shows every person with their likes', async () => {
    renderWithClient(<PeopleList selectedId={null} onSelect={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading the people…');
    const list = await screen.findByRole('list', { name: 'People' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(within(list).getByRole('button', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(within(list).getByText('12 likes')).toBeInTheDocument();
  });

  it('shows an error when the server fails', async () => {
    server.use(http.get('/api/people', () => HttpResponse.json({ message: 'Boom' }, { status: 500 })));
    renderWithClient(<PeopleList selectedId={null} onSelect={vi.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the people.');
  });
});
