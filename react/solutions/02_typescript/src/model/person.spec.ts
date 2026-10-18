import { describe, expect, it } from 'vitest';
import { people } from '../data/people';
import { createPerson, toPreview, updatePerson } from './person';

const [luke] = people;

describe('toPreview', () => {
  it('keeps only the id and the name', () => {
    expect(toPreview(luke)).toEqual({ id: '1', name: 'Luke Skywalker' });
  });
});

describe('createPerson', () => {
  it('gives the draft the id it receives', () => {
    const person = createPerson({ name: 'Rey', gender: 'female', films: [] }, '42');

    expect(person).toEqual({ id: '42', name: 'Rey', gender: 'female', films: [] });
  });
});

describe('updatePerson', () => {
  it('changes the patched fields and keeps the others', () => {
    const updated = updatePerson(luke, { mass: '80', hairColor: 'grey' });

    expect(updated).toMatchObject({ id: '1', name: 'Luke Skywalker', mass: '80', hairColor: 'grey' });
  });

  it('returns a new object and leaves the original untouched', () => {
    const updated = updatePerson(luke, { mass: '80' });

    expect(updated).not.toBe(luke);
    expect(luke.mass).toBe('77');
  });
});
