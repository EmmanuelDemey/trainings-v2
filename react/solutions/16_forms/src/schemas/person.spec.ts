import { describe, expect, it } from 'vitest';
import { personSchema, type PersonFormValues } from './person';

const valid: PersonFormValues = {
  name: 'Leia Organa',
  height: 150,
  hairColor: 'brown',
  gender: 'female',
  birthYear: '19BBY',
};

/** The message Zod gives for `field`, or undefined when the field is valid. */
function errorOf(values: Record<string, unknown>, field: keyof PersonFormValues): string | undefined {
  const result = personSchema.safeParse(values);
  return result.success ? undefined : result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe('step 1 — personSchema', () => {
  it('accepts a complete person', () => {
    expect(personSchema.parse(valid)).toEqual(valid);
  });

  it('trims the name and refuses one made of spaces', () => {
    expect(personSchema.parse({ ...valid, name: '  Leia  ' }).name).toBe('Leia');
    expect(errorOf({ ...valid, name: '   ' }, 'name')).toBe('Name is required');
  });

  it('refuses a height that is not a number — what an empty number field gives', () => {
    expect(errorOf({ ...valid, height: Number.NaN }, 'height')).toBe('Height must be a number');
    expect(errorOf({ ...valid, height: '150' }, 'height')).toBe('Height must be a number');
  });

  it('refuses a height that is not a whole number', () => {
    expect(errorOf({ ...valid, height: 172.5 }, 'height')).toBe('Height must be a whole number');
  });

  it('refuses a height outside 0–250, and accepts both bounds', () => {
    expect(errorOf({ ...valid, height: 251 }, 'height')).toBe('Height must be between 0 and 250');
    expect(errorOf({ ...valid, height: -1 }, 'height')).toBe('Height must be between 0 and 250');
    expect(errorOf({ ...valid, height: 0 }, 'height')).toBeUndefined();
    expect(errorOf({ ...valid, height: 250 }, 'height')).toBeUndefined();
  });

  it('only accepts a hair color of the list', () => {
    expect(errorOf({ ...valid, hairColor: '' }, 'hairColor')).toBe('Pick a hair color');
    expect(errorOf({ ...valid, hairColor: 'green' }, 'hairColor')).toBe('Pick a hair color');
  });

  it('requires a gender, even when the field is missing altogether', () => {
    const { gender: _gender, ...withoutGender } = valid;
    expect(errorOf(withoutGender, 'gender')).toBe('Pick a gender');
  });

  it('wants the birth year in the galactic calendar', () => {
    expect(errorOf({ ...valid, birthYear: '1977' }, 'birthYear')).toBe('Use the galactic calendar, e.g. 19BBY');
    expect(errorOf({ ...valid, birthYear: '41.9BBY' }, 'birthYear')).toBeUndefined();
    expect(errorOf({ ...valid, birthYear: '4ABY' }, 'birthYear')).toBeUndefined();
  });
});
