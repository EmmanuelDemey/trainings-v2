// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const tsc = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));
const read = (path: string) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

/** Runs `tsc` from the root; returns its output, '' when it succeeded. */
function run(...args: string[]): string {
  try {
    return execFileSync(process.execPath, [tsc, ...args], { cwd: root, encoding: 'utf8' });
  } catch (error) {
    return String((error as { stdout?: string }).stdout ?? error) || 'tsc failed';
  }
}

describe('tsc -b', () => {
  let output = '';

  beforeAll(() => {
    for (const file of ['tsconfig.tsbuildinfo', 'tsconfig.app.tsbuildinfo', 'tsconfig.node.tsbuildinfo']) {
      rmSync(new URL(`../${file}`, import.meta.url), { force: true });
    }
    output = run('-b');
  });

  test('the root tsconfig.json references both projects, and compiles nothing itself', () => {
    const config = read('tsconfig.json');
    expect(config.files).toEqual([]);
    expect(config.references).toEqual([{ path: './tsconfig.app.json' }, { path: './tsconfig.node.json' }]);
  });

  test('the app is checked without the types of Node.js', () => {
    const files = run('-p', 'tsconfig.app.json', '--listFilesOnly');
    expect(files).toContain('src/SalesReport.tsx');
    expect(files).not.toContain('@types/node');
  });

  test('builds the app without an error', () => {
    expect(output).toBe('');
  });

  test('records what it built, for the next run', () => {
    expect(existsSync(new URL('../tsconfig.app.tsbuildinfo', import.meta.url))).toBe(true);
  });

  test('has nothing left to do on a second run', () => {
    expect(run('-b', '--verbose')).toContain("Project 'tsconfig.app.json' is up to date");
  });
});
