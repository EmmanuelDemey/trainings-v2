import { describe, expectTypeOf, it } from 'vitest';
import { people } from '../data/people';
import type { Gender, NewPerson, PeopleById, Person, PersonPatch, PersonPreview } from './person';
import { updatePerson } from './person';

describe('the Person type', () => {
  it('requires an id and a name, both strings', () => {
    expectTypeOf<Person['id']>().toEqualTypeOf<string>();
    expectTypeOf<Person['name']>().toEqualTypeOf<string>();
  });

  it('makes the measurements optional strings', () => {
    expectTypeOf<Person['height']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Person['mass']>().toEqualTypeOf<string | undefined>();
  });

  it('lists the films as an array of strings', () => {
    expectTypeOf<Person['films']>().toEqualTypeOf<string[]>();
  });

  it('types the gender as a union of literals', () => {
    expectTypeOf<Gender>().toEqualTypeOf<'male' | 'female' | 'hermaphrodite' | 'n/a' | 'none'>();
    expectTypeOf(people[0].gender).toEqualTypeOf<Gender | undefined>();
  });

  it('rejects a misspelt field and an unknown gender', () => {
    // @ts-expect-error — `heigth` is not a field of Person
    const typo: Person = { id: '9', name: 'Typo', films: [], heigth: '180' };
    // @ts-expect-error — 'robot' is not a Gender
    const robot: Person = { id: '9', name: 'K-2SO', films: [], gender: 'robot' };
    expectTypeOf(typo).toEqualTypeOf(robot);
  });
});

describe('the types derived from Person', () => {
  it('PersonPreview is only the id and the name', () => {
    expectTypeOf<PersonPreview>().toEqualTypeOf<{ id: string; name: string }>();
  });

  it('NewPerson is a Person without its id', () => {
    expectTypeOf<NewPerson>().not.toHaveProperty('id');
    expectTypeOf<NewPerson>().toHaveProperty('name').toEqualTypeOf<string>();
  });

  it('PersonPatch makes every field optional, and still has no id', () => {
    expectTypeOf<PersonPatch['name']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<PersonPatch>().not.toHaveProperty('id');
    // @ts-expect-error — an update cannot change the id
    updatePerson(people[0], { id: '2' });
  });

  it('PeopleById maps a string id to a Person', () => {
    expectTypeOf<PeopleById>().toEqualTypeOf<Record<string, Person>>();
  });
});
