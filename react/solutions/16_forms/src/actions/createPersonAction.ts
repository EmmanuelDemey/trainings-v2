import { z } from 'zod';
import { ApiError, createPerson } from '../api/people';
import type { Person } from '../model/person';
import { personSchema, type PersonFormValues } from '../schemas/person';

/** What the user typed, as the form holds it: strings. */
type TypedValues = Partial<Record<keyof PersonFormValues, string>>;

export type FieldErrors = Partial<Record<keyof PersonFormValues, string>>;

/** Everything the form needs to render after a submit — the action's return value. */
export type CreatePersonState =
  | { status: 'idle' }
  | {
      status: 'invalid';
      /** One message per invalid field. */
      errors: FieldErrors;
      /** What the user typed: React resets the form after the action, these refill it. */
      values: TypedValues;
    }
  | { status: 'failed'; message: string; values: TypedValues }
  | { status: 'success'; person: Person };

export const initialCreatePersonState: CreatePersonState = { status: 'idle' };

/**
 * The action of the uncontrolled form, written for `useActionState`: it gets
 * the PREVIOUS state and the submitted `FormData`, and returns the NEXT state.
 * No `useState`, no `onChange`, no `preventDefault` — the form is the source.
 */
export async function createPersonAction(
  _previous: CreatePersonState,
  formData: FormData,
): Promise<CreatePersonState> {
  // `FormData` values are `string | File`, and an unchecked radio group is
  // simply absent. Only strings are kept: there is no file input here.
  const values = Object.fromEntries(
    [...formData].filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );

  // What `valueAsNumber` does in React Hook Form: an empty field is NaN — not
  // `Number('')`, which is 0 and would be a valid height.
  const height = values.height?.trim() ? Number(values.height) : Number.NaN;
  const result = personSchema.safeParse({ ...values, height });
  if (!result.success) {
    // `flattenError` groups the issues by field; the first message is enough to show.
    const { fieldErrors } = z.flattenError(result.error);
    const errors: FieldErrors = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]]),
    );
    return { status: 'invalid', errors, values };
  }

  try {
    return { status: 'success', person: await createPerson(result.data) };
  } catch (error) {
    // A 409 is a message for the user; anything else is not ours to explain.
    const message = error instanceof ApiError ? error.message : 'Something went wrong, try again';
    return { status: 'failed', message, values };
  }
}
