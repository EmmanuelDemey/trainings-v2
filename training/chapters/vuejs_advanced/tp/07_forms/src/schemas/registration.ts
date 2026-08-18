import { z } from 'zod';

/**
 * STEP 1 — The schema is the source of truth.
 *
 * Everything the form knows about itself lives here: the rules, the messages
 * and — through `z.input` / `z.output` — the types. Both forms of this workshop
 * (`HandRolledForm.vue` and `VeeForm.vue`) read this one file.
 *
 * Shipped as a shape with no rule at all, so the app boots. Your job is to make
 * it say something.
 */

export const attendeeSchema = z.object({
  // TODO 1.1: `name` is required, with the message 'Name is required'.
  name: z.string(),
  // TODO 1.2: `email` must be a valid email, with the message 'Enter a valid email address'.
  email: z.string(),
});

export const registrationSchema = z
  .object({
    // TODO 1.3: a valid email — message: 'Enter a valid email address'.
    email: z.string(),

    // TODO 1.4: at least 12 characters — message: 'At least 12 characters'.
    password: z.string(),

    confirm: z.string(),

    // TODO 1.5: required — message: 'Your name is required'.
    fullName: z.string(),

    // TODO 1.6: the <input> holds a string; the API wants a whole number >= 18.
    //           Message: 'You must be 18 or over'.
    //           Hint: `z.string().min(1, '…').pipe(z.coerce.number().int().min(18, '…'))`
    //           keeps the *input* a string and makes the *output* a number — this is
    //           the field that makes `z.input` differ from `z.output`.
    //           Try `'abc'` once it works, and read the message you get.
    age: z.string(),

    plan: z.enum(['free', 'pro']),

    // Optional on the free plan; the server requires it on the pro plan.
    company: z.string().optional(),

    // TODO 1.7: at least one attendee — message: 'Add at least one attendee'.
    attendees: z.array(attendeeSchema),

    // TODO 1.8: must be `true` — message: 'You must accept the terms'.
    //           Hint: `.refine()` keeps the input type `boolean`; `z.literal(true)`
    //           narrows it to `true`, which no longer accepts `false` as an initial
    //           value. Pick the one that keeps `emptyRegistration` below compiling.
    consent: z.boolean(),
  });
// TODO 1.9: `confirm` must equal `password`.
//           Message: 'Passwords do not match', attached to the `confirm` field.
//           Hint: a `.refine()` on the object, with `path`. Without `path`, the
//           error lands on the form and no field ever displays it.

/**
 * STEP 4 — The asynchronous rule.
 *
 * TODO 4.2: add a `.refine()` that asks `isEmailAvailable(values.email)`, with
 *           the message 'This email is already registered' on `path: ['email']`.
 *
 *   - it makes the schema **async**: only `safeParseAsync` can run it, which is
 *     what `toTypedSchema` uses — and why the hand-rolled form keeps the
 *     synchronous `registrationSchema` above
 *   - the form re-validates on every keystroke of every field: skip the call
 *     when the value is not an email yet, and remember the answer per email.
 *     Watch the "availability calls" counter in the footer while you type
 *   - VeeValidate ignores field-level rules as soon as the form has a schema:
 *     this rule has to live here, at the object level
 */
export const registrationSchemaWithAvailability = registrationSchema;

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
