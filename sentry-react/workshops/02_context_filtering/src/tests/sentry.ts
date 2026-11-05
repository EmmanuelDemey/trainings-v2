import * as Sentry from '@sentry/react';
import { createSentryTestkit } from './shared/sentryTestkit';

/**
 * The envelopes the SDK sent during the current test — recorded by the fake
 * transport of the test kit, never sent anywhere. The setup file resets it
 * before each test.
 */
export const sentry = createSentryTestkit();

/**
 * Waits until the SDK has handed every pending envelope to the transport:
 * events are processed asynchronously, read them after this.
 */
export async function settle(): Promise<void> {
  await Sentry.flush(2000);
}
