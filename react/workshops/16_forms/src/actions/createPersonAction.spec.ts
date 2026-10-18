import { describe, expect, it } from 'vitest';
import { storedPeople } from '../mocks/handlers';
import { createPersonAction, initialCreatePersonState } from './createPersonAction';

function formDataOf(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(values)) formData.append(name, value);
  return formData;
}

const leia = { name: 'Leia Organa', height: '150', hairColor: 'brown', gender: 'female', birthYear: '19BBY' };

describe('step 2 — createPersonAction', () => {
  it('saves a valid person and returns it, with the id the server gave it', async () => {
    const state = await createPersonAction(initialCreatePersonState, formDataOf(leia));

    expect(state).toEqual({
      status: 'success',
      person: { id: '5', name: 'Leia Organa', height: 150, hairColor: 'brown', gender: 'female', birthYear: '19BBY' },
    });
    expect(storedPeople().map((person) => person.name)).toContain('Leia Organa');
  });

  it('returns one message per invalid field and what was typed, without calling the server', async () => {
    const state = await createPersonAction(
      initialCreatePersonState,
      formDataOf({ name: '', height: '300', hairColor: '', birthYear: '19BBY' }),
    );

    expect(state).toEqual({
      status: 'invalid',
      errors: {
        name: 'Name is required',
        height: 'Height must be between 0 and 250',
        hairColor: 'Pick a hair color',
        gender: 'Pick a gender',
      },
      values: { name: '', height: '300', hairColor: '', birthYear: '19BBY' },
    });
    expect(storedPeople()).toHaveLength(4);
  });

  it('takes an empty height for a missing one, not for 0', async () => {
    const state = await createPersonAction(initialCreatePersonState, formDataOf({ ...leia, height: '' }));

    expect(state).toMatchObject({ status: 'invalid', errors: { height: 'Height must be a number' } });
  });

  it('turns a refusal of the server into a message, and keeps what was typed', async () => {
    const luke = { ...leia, name: 'Luke Skywalker' };
    const state = await createPersonAction(initialCreatePersonState, formDataOf(luke));

    expect(state).toEqual({ status: 'failed', message: 'Luke Skywalker already exists', values: luke });
  });
});
