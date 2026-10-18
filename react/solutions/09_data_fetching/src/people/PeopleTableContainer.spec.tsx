import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../mocks/server';
import { PeopleTableContainer } from './PeopleTableContainer';

describe('PeopleTableContainer', () => {
  it('shows a loader, then the characters from the API', async () => {
    render(<PeopleTableContainer onSelect={() => {}} />);

    expect(screen.getByRole('status')).toBeInTheDocument();

    const table = await screen.findByRole('table');
    // One header row + the six characters of the fake API.
    expect(within(table).getAllByRole('row')).toHaveLength(7);
    expect(within(table).getByRole('button', { name: 'Leia Organa' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an error, and no table, when the server fails', async () => {
    server.use(http.get('/api/people', () => new HttpResponse(null, { status: 500 })));
    render(<PeopleTableContainer onSelect={() => {}} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('500');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('loads the characters again when Retry is clicked', async () => {
    // `once`: the first request fails, the next ones reach the default handler.
    server.use(http.get('/api/people', () => new HttpResponse(null, { status: 500 }), { once: true }));
    render(<PeopleTableContainer onSelect={() => {}} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('requests the API at VITE_API_BASE_URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://swapi.example/api');
    server.use(
      http.get('https://swapi.example/api/people', () =>
        HttpResponse.json([
          {
            id: '86',
            name: 'Ahsoka Tano',
            height: '170',
            mass: '50',
            hairColor: 'none',
            skinColor: 'orange',
            eyeColor: 'blue',
            birthYear: '36BBY',
            gender: 'female',
          },
        ]),
      ),
    );
    render(<PeopleTableContainer onSelect={() => {}} />);

    expect(await screen.findByRole('button', { name: 'Ahsoka Tano' })).toBeInTheDocument();
  });

  it('tells its parent which character was clicked', async () => {
    const onSelect = vi.fn();
    render(<PeopleTableContainer onSelect={onSelect} />);

    await userEvent.click(await screen.findByRole('button', { name: 'R2-D2' }));

    expect(onSelect).toHaveBeenCalledWith('3');
  });
});
