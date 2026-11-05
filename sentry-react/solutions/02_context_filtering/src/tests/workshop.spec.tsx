import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Sentry from '@sentry/react';
import { fetchIssue } from '../api/client';
import { renderApp } from './render';
import { sentry, settle } from './sentry';

/**
 * Workshop 02 — Context & filtering. Red on the starter. Keep it running while you work:
 *
 *   npm run test:watch
 */

async function setup() {
  const user = userEvent.setup();
  renderApp();
  await screen.findByTestId('open-1');
  return user;
}

describe('step 1 — who was it?', () => {
  it('sends the id of the logged-in user, never the email', async () => {
    const user = await setup();
    await user.click(screen.getByTestId('login'));
    await user.click(screen.getByTestId('open-13'));
    await screen.findByTestId('detail-error');
    await settle();

    const [event] = sentry.errors();
    expect(event.user?.id).toBe('u-42');
    expect(event.user?.email).toBeUndefined();
  });

  it('forgets the user on logout', async () => {
    const user = await setup();
    await user.click(screen.getByTestId('login'));
    await user.click(screen.getByTestId('logout'));
    await user.click(screen.getByTestId('open-13'));
    await screen.findByTestId('detail-error');
    await settle();

    const [event] = sentry.errors();
    expect(event.user?.id).toBeUndefined();
  });
});

describe('step 2 — which issue?', () => {
  it('tags the API error with the issue', async () => {
    const user = await setup();
    await user.click(screen.getByTestId('open-13'));
    await screen.findByTestId('detail-error');
    await settle();

    const [event] = sentry.errors();
    expect(event.tags?.['issue.id']).toBe('13');
    expect(event.contexts?.issue).toMatchObject({ id: 13 });
  });

  it('tags the crash with the issue', async () => {
    const user = await setup();
    await user.click(screen.getByTestId('open-7'));
    await screen.findByTestId('error-fallback');
    await settle();

    const [event] = sentry.errors();
    expect(event.tags?.['issue.id']).toBe('7');
    expect(event.contexts?.issue).toMatchObject({ id: 7 });
  });
});

describe('step 3 — what did the user do before?', () => {
  it('leaves a breadcrumb when the filter changes', async () => {
    const user = await setup();
    await user.click(screen.getByTestId('filter-all'));
    await user.click(await screen.findByTestId('open-13'));
    await screen.findByTestId('detail-error');
    await settle();

    const [event] = sentry.errors();
    const crumb = event.breadcrumbs?.find((breadcrumb) => breadcrumb.category === 'ui.filter');
    expect(crumb?.data).toMatchObject({ filter: 'all' });
  });
});

describe('step 4 — one bug, one issue', () => {
  it('groups the 500s of two issues by route, not by URL', async () => {
    const user = await setup();
    await user.click(screen.getByTestId('open-13'));
    await screen.findByTestId('detail-error');
    await user.click(screen.getByTestId('open-14'));
    await screen.findByText(/Could not load issue #14/);
    await settle();

    const [first, second] = sentry.errors();
    expect(first.fingerprint).toEqual(['api-error', 'GET', '/issues/:id', '500']);
    expect(second.fingerprint).toEqual(first.fingerprint);
  });
});

describe('step 5 — the noise stays out', () => {
  it('drops the ResizeObserver warning', async () => {
    Sentry.captureException(new Error('ResizeObserver loop completed with undelivered notifications'));
    await settle();

    expect(sentry.errors()).toEqual([]);
  });

  it('drops a 404: the user asked for an issue that does not exist', async () => {
    // A stale link to issue 99: the app reports what fails, as the detail panel does.
    await fetchIssue(99).catch((error: unknown) => Sentry.captureException(error));
    await settle();

    expect(sentry.errors()).toEqual([]);
  });

  it('still reports a 500', async () => {
    await fetchIssue(13).catch((error: unknown) => Sentry.captureException(error));
    await settle();

    expect(sentry.errors()).toHaveLength(1);
  });
});
