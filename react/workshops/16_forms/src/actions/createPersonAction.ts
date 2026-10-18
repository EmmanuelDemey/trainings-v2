import type { Person } from '../model/person';
import type { PersonFormValues } from '../schemas/person';

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
 */
export async function createPersonAction(
  _previous: CreatePersonState,
  _formData: FormData,
): Promise<CreatePersonState> {
  // TODO 2.1: turn the FormData into a plain object of strings
  //           (`Object.fromEntries`), convert `height` to a number — an empty
  //           field is NaN, not `Number('')` (0) — and `personSchema.safeParse` it.
  // TODO 2.2: invalid → { status: 'invalid', errors, values }, with the FIRST
  //           message of each field (`z.flattenError(error).fieldErrors`).
  // TODO 2.3: valid → `createPerson(result.data)` (src/api/people.ts) and
  //           { status: 'success', person }. An `ApiError` → { status: 'failed',
  //           message: error.message, values }.
  return { status: 'idle' };
}
