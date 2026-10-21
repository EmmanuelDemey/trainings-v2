import { expect, test } from 'vitest';
import { createSelect } from '../src/select.ts';

test('starts on the initial option', () => {
  expect(createSelect(['light', 'dark'], 'dark')).toEqual({ options: ['light', 'dark'], selected: 'dark' });
});
