import { useActionState } from 'react';
import {
  createPersonAction,
  initialCreatePersonState,
  type CreatePersonState,
} from '../actions/createPersonAction';
import type { Person } from '../model/person';
import { RadioGroupField, SelectField, TextField } from './fields';
import { genderOptions, hairColorOptions } from './options';
import { SubmitButton } from './SubmitButton';

type Props = { onCreated: (person: Person) => void };

/** Way 1: an uncontrolled form, a React 19 action and `useActionState`. */
export function CreatePersonActionForm({ onCreated }: Props) {
  const [state, formAction] = useActionState(
    async (previous: CreatePersonState, formData: FormData) => {
      const next = await createPersonAction(previous, formData);
      // Telling the parent belongs here, with the result — not in an effect
      // watching `state`, which would run once more for every re-render.
      if (next.status === 'success') onCreated(next.person);
      return next;
    },
    initialCreatePersonState,
  );

  const errors = state.status === 'invalid' ? state.errors : {};
  // React resets an action form once the action is done. `defaultValue` is what
  // a reset puts back: after a failure, what the user typed; after a success, nothing.
  const values = state.status === 'invalid' || state.status === 'failed' ? state.values : {};

  return (
    <form action={formAction} aria-labelledby="action-form-title">
      <h2 id="action-form-title">With a form action</h2>
      <TextField id="action-name" name="name" label="Name" defaultValue={values.name} error={errors.name} />
      <TextField id="action-height" name="height" label="Height (cm)" type="number" defaultValue={values.height} error={errors.height} />
      <SelectField
        id="action-hairColor"
        name="hairColor"
        label="Hair color"
        options={hairColorOptions}
        defaultValue={values.hairColor ?? ''}
        error={errors.hairColor}
      />
      <RadioGroupField id="action-gender" name="gender" label="Gender" options={genderOptions} defaultValue={values.gender ?? ''} error={errors.gender} />
      <TextField id="action-birthYear" name="birthYear" label="Birth year" defaultValue={values.birthYear} error={errors.birthYear} />

      {state.status === 'failed' && <p role="alert">{state.message}</p>}
      {state.status === 'success' && <p role="status">{state.person.name} was created</p>}

      <SubmitButton>Create</SubmitButton>
    </form>
  );
}
