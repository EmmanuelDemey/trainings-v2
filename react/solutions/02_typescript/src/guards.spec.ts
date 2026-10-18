import { describe, expect, it } from 'vitest';
import { people } from './data/people';
import { isPerson, parsePeople } from './guards';

const [luke] = people;

describe('isPerson', () => {
  it('accepts a complete person', () => {
    expect(isPerson(luke)).toBe(true);
  });

  it('accepts a person with only the required fields', () => {
    expect(isPerson({ id: '9', name: 'Rey', films: [] })).toBe(true);
  });

  it.each([
    ['null', null],
    ['a string', 'Luke Skywalker'],
    ['an array', [luke]],
    ['an object without id', { name: 'Rey', films: [] }],
    ['a numeric id', { id: 9, name: 'Rey', films: [] }],
    ['a missing films list', { id: '9', name: 'Rey' }],
    ['films that are not strings', { id: '9', name: 'Rey', films: [1, 2] }],
    ['a numeric height', { id: '9', name: 'Rey', films: [], height: 170 }],
  ])('rejects %s', (_label, value) => {
    expect(isPerson(value)).toBe(false);
  });
});

describe('parsePeople', () => {
  it('keeps the valid people of a parsed JSON payload', () => {
    const payload: unknown = JSON.parse(JSON.stringify([luke, { id: 7 }, people[1]]));

    expect(parsePeople(payload).map(({ name }) => name)).toEqual(['Luke Skywalker', 'C-3PO']);
  });

  it('throws a TypeError when the payload is not an array', () => {
    expect(() => parsePeople({ results: [] })).toThrow(TypeError);
  });
});
