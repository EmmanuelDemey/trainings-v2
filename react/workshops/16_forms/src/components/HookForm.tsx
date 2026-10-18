import type { Person } from '../model/person';
import { RadioGroupField, SelectField, TextField } from './fields';
import { genderOptions, hairColorOptions } from './options';

type Props = { onCreated: (person: Person) => void };

/** Way 2: React Hook Form, validated by the same Zod schema. */
export function CreatePersonHookForm({ onCreated: _onCreated }: Props) {
  // TODO 3.1: `useForm({ resolver: zodResolver(personSchema), mode: 'onTouched',
  //           defaultValues: { name: '', birthYear: '' } })`.
  // TODO 3.2: spread `register('<field>')` on each field (it replaces `name`) —
  //           `register('height', { valueAsNumber: true })` — and pass
  //           `errors.<field>?.message` as its `error`.
  // TODO 3.3: `handleSubmit(async (person) => …)`: `createPerson`, `onCreated`,
  //           then `reset()`. An `ApiError` goes on the name field with `setError`.
  // TODO 3.4: disable the button and show 'Saving…' while `isSubmitting`.

  return (
    <form onSubmit={(event) => event.preventDefault()} aria-labelledby="hook-form-title" noValidate>
      <h2 id="hook-form-title">With React Hook Form</h2>
      <TextField id="hook-name" name="name" label="Name" />
      <TextField id="hook-height" name="height" label="Height (cm)" type="number" />
      <SelectField id="hook-hairColor" name="hairColor" label="Hair color" options={hairColorOptions} />
      <RadioGroupField id="hook-gender" name="gender" label="Gender" options={genderOptions} />
      <TextField id="hook-birthYear" name="birthYear" label="Birth year" />

      <button type="submit">Create</button>
    </form>
  );
}
