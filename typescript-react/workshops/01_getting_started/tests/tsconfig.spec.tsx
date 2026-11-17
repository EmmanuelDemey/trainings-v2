import { expect, test } from 'vitest';
import tsconfig from '../tsconfig.json';

test('the compiler runs in strict mode', () => {
  expect(tsconfig.compilerOptions.strict).toBe(true);
});
