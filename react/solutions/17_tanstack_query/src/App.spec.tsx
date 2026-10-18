import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { likeFromAnotherTab, requestsTo } from './mocks/handlers';
import { renderWithClient } from './tests/render';
import { App } from './App';

afterEach(() => {
  vi.useRealTimers();
});

describe('step 3 — the cache', () => {
  it('shows a person seen a moment ago at once, without asking the server again', async () => {
    const user = userEvent.setup();
    renderWithClient(<App />);
    const list = await screen.findByRole('list', { name: 'People' });

    await user.click(within(list).getByRole('button', { name: 'Luke Skywalker' }));
    await screen.findByRole('heading', { name: 'Luke Skywalker' });
    await user.click(within(list).getByRole('button', { name: 'C-3PO' }));
    await screen.findByRole('heading', { name: 'C-3PO' });

    await user.click(within(list).getByRole('button', { name: 'Luke Skywalker' }));
    // `getBy`, not `findBy`: Luke is on screen in the very same render — no "Loading…".
    expect(screen.getByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();
    // Still fresh (`staleTime`): served from the cache, the server never heard of it.
    expect(requestsTo('GET /api/people/1')).toBe(1);
  });
});

describe('step 4 — invalidation', () => {
  it('updates the count in the list too after a like', async () => {
    const user = userEvent.setup();
    renderWithClient(<App />);
    const list = await screen.findByRole('list', { name: 'People' });
    await user.click(within(list).getByRole('button', { name: 'C-3PO' }));

    await user.click(await screen.findByRole('button', { name: 'Like C-3PO' }));

    expect(await within(list).findByText('4 likes')).toBeInTheDocument();
  });
});

describe('step 5 — polling', () => {
  it('refreshes the list on its own every 10 seconds', async () => {
    // Only the timers are faked; `shouldAdvanceTime` keeps them moving with
    // real time too, so MSW's delay and Testing Library's `findBy` still work.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithClient(<App />);
    const list = await screen.findByRole('list', { name: 'People' });
    expect(within(list).getByText('3 likes')).toBeInTheDocument();

    likeFromAnotherTab('2');
    await vi.advanceTimersByTimeAsync(5_000);
    expect(within(list).getByText('3 likes')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(5_000);
    expect(await within(list).findByText('4 likes')).toBeInTheDocument();
    expect(requestsTo('GET /api/people')).toBe(2);
  });
});
