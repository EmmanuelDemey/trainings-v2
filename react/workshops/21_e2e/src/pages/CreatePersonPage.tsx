import { Form, redirect, useActionData, useNavigation, type ActionFunctionArgs } from 'react-router';
import { createPerson } from '../api/client';

interface ActionResult {
  error: string;
}

export async function createPersonAction({ request }: ActionFunctionArgs): Promise<ActionResult | Response> {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  if (!name) return { error: 'Name is required' };

  try {
    const person = await createPerson({
      name,
      height: String(form.get('height') ?? '') || undefined,
      gender: String(form.get('gender') ?? '') || undefined,
    });
    return redirect(`/people/${person.id}`);
  } catch {
    return { error: 'The person could not be created. Try again.' };
  }
}

export function CreatePersonPage() {
  const result = useActionData<ActionResult>();
  const submitting = useNavigation().state === 'submitting';

  return (
    <section>
      <h2>Create a person</h2>
      {/* noValidate: the validation is ours, so that it is the same in every browser. */}
      <Form method="post" noValidate>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          aria-invalid={result ? true : undefined}
          aria-describedby={result ? 'create-error' : undefined}
        />

        <label htmlFor="height">Height (cm)</label>
        <input id="height" name="height" inputMode="numeric" />

        <label htmlFor="gender">Gender</label>
        <select id="gender" name="gender" defaultValue="">
          <option value="">Unknown</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="n/a">n/a</option>
        </select>

        {result && (
          <p id="create-error" role="alert">
            {result.error}
          </p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create'}
        </button>
      </Form>
    </section>
  );
}
