/**
 * An in-memory backend, with latency and a validation error it raises on
 * purpose. Nothing to install, nothing to run: the whole workshop is offline.
 */

import { reactive } from 'vue';

/** Emails the "server" already knows about — used by the availability check. */
const TAKEN_EMAILS = new Set([
  'ada@lovelace.dev',
  'grace@hopper.dev',
  'alan@turing.dev',
]);

/**
 * Call counters, displayed in the UI. Watch `isEmailAvailable` while you type:
 * this is the number the async-validation step is about.
 */
export const apiStats = reactive({
  isEmailAvailable: 0,
  register: 0,
});

/** What the server answers on a 422. `fieldErrors` is keyed by *form path*. */
export class ApiValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string>) {
    super('Validation failed');
    this.name = 'ApiValidationError';
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Is this email free? Deliberately slow (600 ms) so a request per keystroke is
 * impossible to miss.
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  apiStats.isEmailAvailable++;
  await delay(600);
  return !TAKEN_EMAILS.has(email.trim().toLowerCase());
}

/**
 * The final submit. It re-validates server-side — a client-side check is UX,
 * never a guarantee.
 *
 * - an email already taken   -> 422 on `email`
 * - an attendee named "Bob"  -> 422 on `attendees[i].name`, to prove that
 *                               nested paths make it back to the right input
 * - a payload with `plan: 'pro'` and no company -> 422 on `company`
 */
export async function register(payload: {
  email: string;
  plan: string;
  company?: string;
  attendees: { name: string; email: string }[];
}): Promise<{ id: string }> {
  apiStats.register++;
  await delay(900);

  const fieldErrors: Record<string, string> = {};

  if (TAKEN_EMAILS.has(payload.email.trim().toLowerCase())) {
    fieldErrors.email = 'This email is already registered';
  }

  payload.attendees.forEach((attendee, index) => {
    if (attendee.name.trim().toLowerCase() === 'bob') {
      fieldErrors[`attendees[${index}].name`] = 'Bob is already registered for this session';
    }
  });

  if (payload.plan === 'pro' && !payload.company?.trim()) {
    fieldErrors.company = 'A company is required on the pro plan';
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new ApiValidationError(fieldErrors);
  }

  return { id: `reg_${Math.random().toString(36).slice(2, 10)}` };
}
