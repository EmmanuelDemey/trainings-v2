import { describe, expect, it, vi } from 'vitest';
import { registrationSchema, emptyRegistration } from '@/schemas/registration';
import type { RegistrationInput } from '@/schemas/registration';
import { useZodForm } from '@/composables/useZodForm';

/**
 * The executable half of steps 1 and 2.
 *
 * These specs are given: they are the rules this README states, written down.
 * They are red on the skeleton — the schema ships as a shape with a single
 * rule, on `company`, and `validate()` returns `true` no matter what. Keep them running while you fill
 * both in:
 *
 *   npm run test:watch
 *
 * They deliberately stop at the edge of the DOM. Focus management, `aria-*`
 * wiring and "the whole form with the keyboard alone" are checked in the browser,
 * where they mean something — jsdom has no focus order and no screen reader.
 */

const validRegistration = {
  email: 'ada@example.com',
  password: 'correct horse battery',
  confirm: 'correct horse battery',
  fullName: 'Ada Lovelace',
  age: '42',
  plan: 'free',
  company: '',
  attendees: [{ name: 'Grace Hopper', email: 'grace@example.com' }],
  consent: true,
} satisfies RegistrationInput;

/** `['attendees', 0, 'name']` -> `attendees.0.name`, first message per path. */
function messagesByPath(input: RegistrationInput): Record<string, string> {
  const result = registrationSchema.safeParse(input);
  if (result.success) return {};

  const messages: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    if (!(key in messages)) messages[key] = issue.message;
  }
  return messages;
}

describe('the registration schema', () => {
  it('accepts a complete, valid registration', () => {
    expect(registrationSchema.safeParse(validRegistration).success).toBe(true);
  });

  it('states what is wrong with an empty form, field by field', () => {
    const messages = messagesByPath(emptyRegistration);

    expect(messages).toMatchObject({
      email: 'Enter a valid email address',
      password: 'At least 12 characters',
      fullName: 'Your name is required',
      age: 'You must be 18 or over',
      consent: 'You must accept the terms',
    });
  });

  it('puts the mismatch message on `confirm`, not on the form', () => {
    const messages = messagesByPath({ ...validRegistration, confirm: 'something else' });

    // Without `path: ['confirm']` the issue has an empty path, no input matches
    // it, and the user faces a form that refuses to submit with nothing marked.
    expect(messages.confirm).toBe('Passwords do not match');
  });

  it('refuses an empty attendee list', () => {
    const messages = messagesByPath({ ...validRegistration, attendees: [] });

    expect(messages.attendees).toBe('Add at least one attendee');
  });

  it('reports an attendee error under that row, not on the list', () => {
    const messages = messagesByPath({
      ...validRegistration,
      attendees: [{ name: '', email: 'grace@example.com' }],
    });

    expect(messages['attendees.0.name']).toBe('Name is required');
  });

  it('turns the age the <input> gave us into a number', () => {
    const result = registrationSchema.safeParse(validRegistration);

    // `age` is a string on the way in and a number on the way out. This is the
    // whole reason `z.input` and `z.output` are two different types — and the
    // reason a submit handler must send the parse result, never the raw values.
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.age).toBe(42);
  });

  it('refuses an age under 18 and an age that is not a number', () => {
    expect(messagesByPath({ ...validRegistration, age: '17' }).age).toBe('You must be 18 or over');
    expect(registrationSchema.safeParse({ ...validRegistration, age: 'abc' }).success).toBe(false);
  });
});

describe('useZodForm', () => {
  it('reports the form as invalid and collects one message per field', () => {
    const form = useZodForm(registrationSchema, emptyRegistration);

    expect(form.validate()).toBe(false);
    expect(form.errors.value.email).toBe('Enter a valid email address');
  });

  it('keys attendee errors the way the inputs are named', () => {
    const form = useZodForm(registrationSchema, {
      ...validRegistration,
      attendees: [{ name: '', email: 'grace@example.com' }],
    });

    form.validate();

    // `attendees[0].name`, not `attendees.0.name`: it has to be the exact string
    // the input uses as its name, or the message never finds its field.
    expect(form.errors.value['attendees[0].name']).toBe('Name is required');
  });

  it('stays quiet until the user leaves the field', () => {
    const form = useZodForm(registrationSchema, emptyRegistration);

    form.validate();
    expect(form.errorFor('email')).toBeUndefined();

    form.handleBlur('email');
    expect(form.errorFor('email')).toBe('Enter a valid email address');
  });

  it('shows every error once a submit has been attempted', async () => {
    const form = useZodForm(registrationSchema, emptyRegistration);
    const onValid = vi.fn();

    await form.handleSubmit(onValid)();

    expect(onValid).not.toHaveBeenCalled();
    expect(form.submitCount.value).toBe(1);
    // No field was blurred, but the user asked to submit: stop being discreet.
    expect(form.errorFor('email')).toBe('Enter a valid email address');
  });

  it('hands the submit handler the parsed output, never the raw values', async () => {
    const form = useZodForm(registrationSchema, validRegistration);
    const onValid = vi.fn();

    await form.handleSubmit(onValid)();

    expect(onValid).toHaveBeenCalledOnce();
    const submitted = onValid.mock.calls[0][0] as { age: unknown };
    expect(submitted.age).toBe(42);
  });

  it('displays a server-side error like any other', () => {
    const form = useZodForm(registrationSchema, validRegistration);

    // A 422 comes back with paths. The user never touched this field, so
    // `setErrors` has to mark it touched too — otherwise `errorFor` stays quiet
    // and the form silently refuses to move.
    form.setErrors({ email: 'This email is already registered' });

    expect(form.errorFor('email')).toBe('This email is already registered');
  });
});
