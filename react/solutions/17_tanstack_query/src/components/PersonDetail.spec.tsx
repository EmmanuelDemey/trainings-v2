import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { people } from '../data/people';
import { requestsTo } from '../mocks/handlers';
import { server } from '../mocks/node';
import { renderWithClient } from '../tests/render';
import { PersonDetail } from './PersonDetail';

/** The `<dd>` that follows the `<dt>` named `term`. */
function valueOf(term: string): string | null | undefined {
  return screen.getByText(term, { selector: 'dt' }).nextElementSibling?.textContent;
}

describe('step 3 — the detail with useQuery', () => {
  it('shows the person once loaded', async () => {
    renderWithClient(<PersonDetail id="1" />);

    expect(await screen.findByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(valueOf('Height')).toBe('172 cm');
  });

  it('shows an error for a person the server does not know', async () => {
    renderWithClient(<PersonDetail id="99" />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this person.');
  });
});

describe('step 4 — liking with useMutation', () => {
  it('sends the like and shows the new count', async () => {
    const user = userEvent.setup();
    renderWithClient(<PersonDetail id="1" />);

    await user.click(await screen.findByRole('button', { name: 'Like Luke Skywalker' }));

    await screen.findByRole('button', { name: 'Like Luke Skywalker' });
    expect(valueOf('Likes')).toBe('13');
    expect(requestsTo('POST /api/people/1/like')).toBe(1);
  });

  it('disables the button while the like is on its way', async () => {
    server.use(
      http.post('/api/people/:id/like', async () => {
        await delay(200);
        return HttpResponse.json({ ...people[0], likes: 13 });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<PersonDetail id="1" />);

    await user.click(await screen.findByRole('button', { name: 'Like Luke Skywalker' }));

    expect(await screen.findByRole('button', { name: 'Liking…' })).toBeDisabled();
    expect(await screen.findByRole('button', { name: 'Like Luke Skywalker' })).toBeEnabled();
  });
});
