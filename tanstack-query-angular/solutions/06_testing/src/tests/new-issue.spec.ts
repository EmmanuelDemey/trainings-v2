import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { apiSettings, resetApi } from '../api/fakeApi';
import { App } from '../app/app';
import { renderWithClient } from './render-with-client';

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 20;
});

describe('Creating an issue', () => {
  it('shows the new issue in the list, and clears the input', async () => {
    const user = userEvent.setup();
    // The whole app: the form and the list are two components, and only the
    // shared cache links them — exactly what this test is about.
    await renderWithClient(App);
    await screen.findByTestId('issue-1');

    const input = screen.getByTestId('new-title') as HTMLInputElement;
    await user.type(input, 'Totals are rounded three times');
    await user.click(screen.getByTestId('create-submit'));

    expect((await screen.findByTestId('issue-43')).textContent).toContain('Totals are rounded three times');
    await waitFor(() => expect(input.value).toBe(''));
    expect(screen.getByTestId('open-count').textContent).toContain('29 open');
  });
});
