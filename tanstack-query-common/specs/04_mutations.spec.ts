import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { apiSettings, resetApi, sent } from '../../api/fakeApi';
import { renderApp } from '../render';

/**
 * Workshop 4 — Mutations and their callbacks. Same specs for React, Angular
 * and Vue: `renderApp()` (in `../render.ts`) is the only part that knows the
 * framework.
 *
 * Given, and red on the starter:
 *
 *   npm run test:watch
 */

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 50;
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const titleInput = () => screen.getByTestId('new-title') as HTMLInputElement;

describe('step 1 — a mutation that invalidates', () => {
  it('creates an issue, and every component that shows the open issues refreshes', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');

    await user.type(titleInput(), 'Totals are rounded three times');
    await user.click(screen.getByTestId('create-submit'));

    expect(await screen.findByTestId('issue-43')).toBeTruthy();
    // The counter lives in another component, and nobody told it anything: only
    // an invalidation of the shared key keeps it honest.
    await waitFor(() => expect(screen.getByTestId('open-count').textContent).toContain('29 open'));
    expect(sent('POST /issues')).toBe(1);
  });
});

describe('step 2 — the callbacks of mutate()', () => {
  it('keeps what the user typed when the server refuses, and clears it once accepted', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');

    apiSettings.failWrites = true;
    await user.type(titleInput(), 'Totals are rounded three times');
    await user.click(screen.getByTestId('create-submit'));

    expect((await screen.findByTestId('create-error')).textContent).toContain('refused');
    // A failed write must not throw away what the user typed.
    expect(titleInput().value).toBe('Totals are rounded three times');

    apiSettings.failWrites = false;
    await user.click(screen.getByTestId('create-submit'));

    await waitFor(() => expect(titleInput().value).toBe(''));
    expect(screen.queryByTestId('create-error')).toBeNull();
  });
});

describe('step 3 — the state of a mutation', () => {
  it('disables the button while the issue is being created', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');

    apiSettings.latencyMs = 500;
    await user.type(titleInput(), 'Totals are rounded three times');
    await user.click(screen.getByTestId('create-submit'));
    await sleep(100);

    expect((screen.getByTestId('create-submit') as HTMLButtonElement).disabled).toBe(true);
    await waitFor(() => expect((screen.getByTestId('create-submit') as HTMLButtonElement).disabled).toBe(false), {
      timeout: 3_000,
    });
  });
});

describe('step 4 — every mutation in flight, from anywhere', () => {
  it('shows a "Saving…" indicator in the header while any write is in flight', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByTestId('issue-1');
    expect(screen.queryByTestId('saving')).toBeNull();

    apiSettings.latencyMs = 500;
    await user.click(screen.getByTestId('delete-1'));
    await sleep(100);

    // The header knows nothing about the row that deleted: it reads the
    // mutation cache.
    expect(screen.getByTestId('saving')).toBeTruthy();

    await waitFor(() => expect(screen.queryByTestId('issue-1')).toBeNull(), { timeout: 3_000 });
    await waitFor(() => expect(screen.queryByTestId('saving')).toBeNull(), { timeout: 3_000 });
    await waitFor(() => expect(screen.getByTestId('open-count').textContent).toContain('27 open'), {
      timeout: 3_000,
    });
  });
});
