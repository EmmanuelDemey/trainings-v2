import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ApiError, createPerson } from '../api/people';
import type { Person } from '../model/person';
import { personSchema } from '../schemas/person';
import { RadioGroupField, SelectField, TextField } from './fields';
import { genderOptions, hairColorOptions } from './options';

type Props = { onCreated: (person: Person) => void };

/** Way 2: React Hook Form, validated by the same Zod schema. */
export function CreatePersonHookForm({ onCreated }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    // The resolver hands every validation to Zod. The form's types come from the
    // schema too: `handleSubmit` receives its OUTPUT, with `height` a number.
    resolver: zodResolver(personSchema),
    // No message while the user is still typing a field for the first time;
    // after that, the message follows every keystroke.
    mode: 'onTouched',
    // No `height`: an empty number field, read as NaN until something is typed.
    defaultValues: { name: '', birthYear: '' },
  });

  // Only called when the schema accepted the values — no `if (valid)` needed.
  const onSubmit = handleSubmit(async (person) => {
    try {
      onCreated(await createPerson(person));
      reset();
    } catch (error) {
      // What only the server knows becomes an error like the others, on the
      // field it is about.
      setError('name', { message: error instanceof ApiError ? error.message : 'Something went wrong, try again' });
    }
  });

  return (
    // `handleSubmit` calls `preventDefault` itself.
    <form onSubmit={onSubmit} aria-labelledby="hook-form-title" noValidate>
      <h2 id="hook-form-title">With React Hook Form</h2>
      {/* `register` returns `name`, `onChange`, `onBlur` and `ref`: the input stays
          uncontrolled, React Hook Form reads it through the ref — no re-render per keystroke. */}
      <TextField id="hook-name" label="Name" {...register('name')} error={errors.name?.message} />
      <TextField id="hook-height" label="Height (cm)" type="number" {...register('height', { valueAsNumber: true })} error={errors.height?.message} />
      <SelectField
        id="hook-hairColor"
        label="Hair color"
        options={hairColorOptions}
        {...register('hairColor')}
        error={errors.hairColor?.message}
      />
      <RadioGroupField id="hook-gender" label="Gender" options={genderOptions} {...register('gender')} error={errors.gender?.message} />
      <TextField id="hook-birthYear" label="Birth year" {...register('birthYear')} error={errors.birthYear?.message} />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Create'}
      </button>
    </form>
  );
}
