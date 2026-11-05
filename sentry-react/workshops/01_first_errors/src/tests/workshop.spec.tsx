import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Sentry from '@sentry/react';
import { rootOptions } from '../sentry';
import { renderApp } from './render';
import { sentry, settle } from './sentry';

/**
 * Workshop 01 — First errors. Red on the starter. Keep it running while you work:
 *
 *   npm run test:watch
 *
 * The specs render the whole app, click as a user would, then read the
 * envelopes your SDK sent to the fake transport (`./sentry.ts`).
 */

async function open(id: number) {
  const user = userEvent.setup();
  renderApp();
  await user.click(await screen.findByTestId(`open-${id}`));
}

describe('step 1 — the SDK is started', () => {
  it('has a client, with the environment of the build', () => {
    // Vitest runs with the mode `test`.
    expect(Sentry.getClient()?.getOptions().environment).toBe('test');
  });
});

describe('step 3 — the root error hooks of React 19', () => {
  it('reports what no boundary catches', () => {
    expect(rootOptions.onUncaughtError).toBeTypeOf('function');
    expect(rootOptions.onRecoverableError).toBeTypeOf('function');
  });
});

describe('step 2 — a crash in the detail panel', () => {
  it('shows a fallback instead of a blank page', async () => {
    await open(7);

    expect(await screen.findByTestId('error-fallback')).toBeTruthy();
    // The rest of the app is still there.
    expect(screen.getByTestId('issue-1')).toBeTruthy();
  });

  it('reports the crash once, with the id the fallback shows', async () => {
    await open(7);
    const shown = (await screen.findByTestId('error-event-id')).textContent;
    await settle();

    const errors = sentry.errors();
    expect(errors).toHaveLength(1);
    expect(sentry.messageOf(errors[0])).toContain("reading 'login'");
    expect(errors[0].event_id).toBe(shown);
  });
});

describe('step 4 — an API error the UI handles', () => {
  it('is shown to the user, and reported', async () => {
    await open(13);
    expect(await screen.findByTestId('detail-error')).toBeTruthy();
    await settle();

    const errors = sentry.errors();
    expect(errors).toHaveLength(1);
    expect(sentry.messageOf(errors[0])).toContain('/issues/13');
  });
});

describe('a healthy issue', () => {
  it('sends no error at all', async () => {
    await open(1);
    expect(await screen.findByTestId('detail-title')).toBeTruthy();
    await settle();

    expect(sentry.errors()).toEqual([]);
  });
});
