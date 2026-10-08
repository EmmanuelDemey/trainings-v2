import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { apiSettings, resetApi, sent } from '@/api/fakeApi';
import App from '@/App.vue';
import { renderWithClient } from './renderWithClient';

/**
 * The creation, through the screen: the form AND the list, so the test sees
 * what the user sees — the invalidation that refreshes a component the form
 * knows nothing about. `App` holds both, with the same client.
 */

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 20;
});

const titleInput = () => screen.getByTestId('new-title') as HTMLInputElement;

describe('creating an issue', () => {
  it('adds the new row to the list, and clears the input', async () => {
    const user = userEvent.setup();
    renderWithClient(App);
    await screen.findByTestId('issue-1');

    await user.type(titleInput(), 'Totals are rounded three times');
    await user.click(screen.getByTestId('create-submit'));

    // Issue 43: the server's next id. Found in the list, which was only told
    // through the cache.
    expect((await screen.findByTestId('issue-43')).textContent).toContain('Totals are rounded three times');
    await waitFor(() => expect(titleInput().value).toBe(''));
    expect(sent('POST /issues')).toBe(1);
  });

  it('keeps the title and shows the error when the server refuses', async () => {
    const user = userEvent.setup();
    renderWithClient(App);
    await screen.findByTestId('issue-1');
    apiSettings.failWrites = true;

    await user.type(titleInput(), 'Totals are rounded three times');
    await user.click(screen.getByTestId('create-submit'));

    expect((await screen.findByTestId('create-error')).textContent).toContain('refused');
    expect(titleInput().value).toBe('Totals are rounded three times');
    expect(screen.queryByTestId('issue-43')).toBeNull();
  });
});
