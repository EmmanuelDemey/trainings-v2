import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Sentry from '@sentry/react';
import { renderApp } from './render';
import { sentry, settle } from './sentry';

/**
 * Workshop 05 — Session Replay & User Feedback. Red on the starter. Keep it
 * running while you work:
 *
 *   npm run test:watch
 *
 * jsdom has no rendering engine: the specs check how Replay is configured, not
 * the recording itself — watch that one in Spotlight or in Sentry.
 */

interface ReplayOptions {
  maskAllText?: boolean;
  blockAllMedia?: boolean;
}

describe('step 1 — Session Replay', () => {
  it('is installed, with every text masked and every media blocked', () => {
    const replay = Sentry.getClient()?.getIntegrationByName<{ name: string; _initialOptions?: ReplayOptions }>('Replay');
    expect(replay).toBeDefined();
    expect(replay?._initialOptions?.maskAllText).toBe(true);
    expect(replay?._initialOptions?.blockAllMedia).toBe(true);
  });

  it('records the sessions with an error, and no other', () => {
    const options = Sentry.getClient<Sentry.BrowserClient>()?.getOptions();
    expect(options?.replaysOnErrorSampleRate).toBe(1);
    expect(options?.replaysSessionSampleRate).toBe(0);
  });
});

describe('step 2 and 3 — User Feedback', () => {
  it('sends what the user wrote, linked to the crash', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(await screen.findByTestId('open-7'));
    const eventId = (await screen.findByTestId('error-event-id')).textContent;

    await user.type(screen.getByTestId('feedback-message'), 'I opened issue 7 and the page broke');
    await user.click(screen.getByTestId('feedback-submit'));
    expect(await screen.findByTestId('feedback-sent')).toBeTruthy();
    await settle();

    const feedbacks = sentry.feedbacks();
    expect(feedbacks).toHaveLength(1);
    expect(feedbacks[0].contexts?.feedback).toMatchObject({
      message: 'I opened issue 7 and the page broke',
      associated_event_id: eventId,
    });
  });
});
