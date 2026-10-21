import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const { compilerOptions } = JSON.parse(readFileSync(new URL('../tsconfig.json', import.meta.url), 'utf8'));

test('the compiler runs in strict mode', () => {
  expect(compilerOptions.strict).toBe(true);
});
