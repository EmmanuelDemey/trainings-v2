import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const tsc = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));
const read = (path: string) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

/** Runs `tsc -b` from the root; returns its output, '' when it succeeded. */
function build(...args: string[]): string {
  try {
    return execFileSync(process.execPath, [tsc, '-b', ...args], { cwd: root, encoding: 'utf8' });
  } catch (error) {
    return String((error as { stdout?: string }).stdout ?? error) || 'tsc -b failed';
  }
}

describe('tsc -b', () => {
  let output = '';

  beforeAll(() => {
    for (const dir of ['packages/core/dist', 'packages/cli/dist']) {
      rmSync(new URL(`../${dir}`, import.meta.url), { recursive: true, force: true });
    }
    for (const file of ['packages/core/tsconfig.tsbuildinfo', 'packages/cli/tsconfig.tsbuildinfo']) {
      rmSync(new URL(`../${file}`, import.meta.url), { force: true });
    }
    output = build();
  });

  test('the root tsconfig.json references both packages, and compiles nothing itself', () => {
    const config = read('tsconfig.json');
    expect(config.files).toEqual([]);
    expect(config.references).toEqual([{ path: './packages/core' }, { path: './packages/cli' }]);
  });

  test('the cli references the core', () => {
    expect(read('packages/cli/tsconfig.json').references).toEqual([{ path: '../core' }]);
  });

  test('builds the workspace without an error', () => {
    expect(output).toBe('');
  });

  test('emits the declarations of the core, which the cli is checked against', () => {
    expect(existsSync(new URL('../packages/core/dist/index.d.ts', import.meta.url))).toBe(true);
  });

  test('has nothing left to do on a second run', () => {
    expect(build('--verbose')).toContain("Project 'packages/core/tsconfig.json' is up to date");
  });
});
