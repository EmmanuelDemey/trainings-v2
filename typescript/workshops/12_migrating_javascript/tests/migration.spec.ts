import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const root = new URL('../', import.meta.url);
const { compilerOptions } = JSON.parse(readFileSync(new URL('tsconfig.json', root), 'utf8'));
const source = (file: string) => readFileSync(new URL(`src/${file}`, root), 'utf8');

describe('the migration', () => {
  test('the compiler checks the JavaScript files', () => {
    expect(compilerOptions.allowJs).toBe(true);
    expect(compilerOptions.checkJs).toBe(true);
  });

  test('cart.js stays JavaScript, typed with JSDoc', () => {
    expect(existsSync(new URL('src/cart.js', root))).toBe(true);
    expect(source('cart.js')).toContain('@typedef');
  });

  test('format.js has become format.ts', () => {
    expect(existsSync(new URL('src/format.js', root))).toBe(false);
    expect(existsSync(new URL('src/format.ts', root))).toBe(true);
  });

  test('no file silences the checker any more', () => {
    for (const file of readdirSync(new URL('src/', root))) {
      expect(source(file), file).not.toMatch(/@ts-(nocheck|ignore|expect-error)/);
    }
  });
});
