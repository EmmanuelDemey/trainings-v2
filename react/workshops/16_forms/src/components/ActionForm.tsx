import type { Person } from '../model/person';
import { RadioGroupField, SelectField, TextField } from './fields';
import { genderOptions, hairColorOptions } from './options';
import { SubmitButton } from './SubmitButton';

type Props = { onCreated: (person: Person) => void };

/** Way 1: an uncontrolled form, a React 19 action and `useActionState`. */
export function CreatePersonActionForm({ onCreated: _onCreated }: Props) {
  // TODO 2.4: `const [state, formAction] = useActionState(…, initialCreatePersonState)`,
  //           with an action that awaits `createPersonAction` and calls `onCreated`
  //           on a success. Pass `formAction` to `<form action>` and drop `onSubmit`.
  // TODO 2.6: show `state.errors` on the fields, refill them with `state.values`
  //           (`defaultValue`), render the server's message in a `role="alert"`
  //           and "<name> was created" in a `role="status"`.

  return (
    <form onSubmit={(event) => event.preventDefault()} aria-labelledby="action-form-title">
      <h2 id="action-form-title">With a form action</h2>
      <TextField id="action-name" name="name" label="Name" />
      <TextField id="action-height" name="height" label="Height (cm)" type="number" />
      <SelectField id="action-hairColor" name="hairColor" label="Hair color" options={hairColorOptions} defaultValue="" />
      <RadioGroupField id="action-gender" name="gender" label="Gender" options={genderOptions} />
      <TextField id="action-birthYear" name="birthYear" label="Birth year" />

      <SubmitButton>Create</SubmitButton>
    </form>
  );
}
