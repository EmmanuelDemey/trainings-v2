import { z } from 'zod';
import { isEmailAvailable } from '@/api/fakeApi';

/**
 * STEP 1 — The schema is the source of truth.
 *
 * Everything the form knows about itself lives here: the rules, the messages
 * and — through `z.input` / `z.output` — the types. Both forms of this workshop
 * (`HandRolledForm.vue` and `VeeForm.vue`) read this one file.
 */

export const attendeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
});

export const registrationSchema = z
  .object({
    email: z.string().email('Enter a valid email address'),

    password: z.string().min(12, 'At least 12 characters'),

    confirm: z.string(),

    fullName: z.string().min(1, 'Your name is required'),

    /**
     * The field that makes `z.input` differ from `z.output`.
     *
     * An `<input>` holds a string, always — even `type="number"`. `.pipe()`
     * keeps the INPUT a string (so `emptyRegistration` below still type-checks
     * with `age: ''`) and makes the OUTPUT a number, which is what the API
     * wants. `z.coerce.number()` alone would type the input as `unknown` and
     * quietly accept `null`.
     *
     * The leading `.min(1)` exists so an empty field says "required" rather
     * than "expected number, received nan".
     */
    age: z
      .string()
      .min(1, 'You must be 18 or over')
      .pipe(z.coerce.number().int().min(18, 'You must be 18 or over')),

    plan: z.enum(['free', 'pro']),

    // Optional on the free plan; the server requires it on the pro plan.
    company: z.string().optional(),

    attendees: z.array(attendeeSchema).min(1, 'Add at least one attendee'),

    /**
     * `.refine()`, not `z.literal(true)`.
     *
     * `z.literal(true)` narrows the INPUT type to `true`, so `consent: false` in
     * `emptyRegistration` would stop compiling — and an unchecked checkbox is
     * exactly the initial state. `.refine()` keeps the input `boolean` and
     * rejects `false` at validation time, which is what we want.
     */
    consent: z.boolean().refine((value) => value, 'You must accept the terms'),
  })
  /**
   * A cross-field rule has to live on the OBJECT: at the time `confirm` is
   * parsed, the schema has no access to `password`.
   *
   * `path: ['confirm']` is what makes the message land on an input. Without it
   * the issue has an empty path, no field matches it, and the user sees a form
   * that refuses to submit with nothing marked wrong.
   */
  .refine((values) => values.confirm === values.password, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })
  /**
   * `company` is optional in the shape and required on the pro plan. A
   * discriminated union would encode that in the TYPE, which is stricter and
   * genuinely better — at the cost of two `emptyRegistration` variants and a
   * `v-if` on the union tag in every consumer. On a form this size, the refine
   * is the one you would maintain.
   */
  .refine((values) => values.plan !== 'pro' || Boolean(values.company?.trim()), {
    message: 'A company is required on the pro plan',
    path: ['company'],
  });

/**
 * STEP 4 — The asynchronous rule.
 *
 * Three things make this usable rather than a request per keystroke:
 *
 *  1. it skips the call when the value is not an email yet — most keystrokes;
 *  2. it caches one answer per email, so re-validating the form (which happens
 *     on every field's change) does not re-ask;
 *  3. `TextField` validates on blur rather than on input (see
 *     `validateOnValueUpdate: false`), which is the lever that actually cuts the
 *     count down.
 *
 * Watch the "availability calls" counter in the footer while you type.
 */
const availabilityCache = new Map<string, boolean>();

async function checkAvailability(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  const cached = availabilityCache.get(normalized);
  if (cached !== undefined) return cached;

  const available = await isEmailAvailable(normalized);
  availabilityCache.set(normalized, available);
  return available;
}

export const registrationSchemaWithAvailability = registrationSchema.refine(
  async (values) => {
    // Not an email yet? Nothing to ask the server. This single guard removes
    // most of the calls, because it fires on every character of "a", "ad",
    // "ada", "ada@"…
    if (!z.string().email().safeParse(values.email).success) return true;
    return checkAvailability(values.email);
  },
  { message: 'This email is already registered', path: ['email'] },
);

export type Attendee = z.output<typeof attendeeSchema>;

/** What the form holds — `age` is still the string the <input> gave us. */
export type RegistrationInput = z.input<typeof registrationSchema>;

/** What the parse produced — this is what you send to the API. */
export type Registration = z.output<typeof registrationSchema>;

export const emptyRegistration: RegistrationInput = {
  email: '',
  password: '',
  confirm: '',
  fullName: '',
  age: '',
  plan: 'free',
  company: '',
  attendees: [{ name: '', email: '' }],
  consent: false,
};
