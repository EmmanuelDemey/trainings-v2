import { describe, expectTypeOf, it } from 'vitest';
import { isPerson, parsePeople } from './guards';
import type { Person } from './model/person';

describe('isPerson', () => {
  it('is a type guard for Person', () => {
    expectTypeOf(isPerson).guards.toEqualTypeOf<Person>();
  });

  it('narrows an unknown value', () => {
    const value: unknown = JSON.parse('{}');
    if (isPerson(value)) {
      expectTypeOf(value.name).toEqualTypeOf<string>();
    }
  });
});

describe('parsePeople', () => {
  it('takes unknown and returns people', () => {
    expectTypeOf(parsePeople).parameter(0).toEqualTypeOf<unknown>();
    expectTypeOf(parsePeople).returns.toEqualTypeOf<Person[]>();
  });
});
