import { expect, test } from 'vitest';
import { getIDFromUrl } from './url';

test('extract url id', () => {
	expect(getIDFromUrl('https://swapi.dev/api/people/5')).toBe('5');
});
