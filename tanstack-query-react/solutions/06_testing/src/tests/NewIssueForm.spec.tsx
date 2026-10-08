import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiSettings, resetApi, sent } from '../api/fakeApi';
import { IssueList } from '../components/IssueList';
import { renderWithClient } from './renderWithClient';

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 20;
});

const titleInput = () => screen.getByTestId<HTMLInputElement>('new-title');

describe('creating an issue', () => {
  it('adds the new row to the list, and clears the input', async () => {
    const user = userEvent.setup();
    // The list renders the form: the test sees what the user sees — the form
    // AND the list that must refresh after the creation.
    renderWithClient(<IssueList />);
    await screen.findByTestId('issue-1');

    await user.type(titleInput(), 'Totals are rounded three times');
    await user.click(screen.getByTestId('create-submit'));

    expect((await screen.findByTestId('issue-43')).textContent).toContain('Totals are rounded three times');
    await waitFor(() => expect(titleInput().value).toBe(''));
    expect(sent('POST /issues')).toBe(1);
  });

  it('keeps the title and shows the error when the server refuses', async () => {
    const user = userEvent.setup();
    renderWithClient(<IssueList />);
    await screen.findByTestId('issue-1');
    apiSettings.failWrites = true;

    await user.type(titleInput(), 'Totals are rounded three times');
    await user.click(screen.getByTestId('create-submit'));

    expect((await screen.findByTestId('create-error')).textContent).toContain('refused');
    expect(titleInput().value).toBe('Totals are rounded three times');
  });
});
