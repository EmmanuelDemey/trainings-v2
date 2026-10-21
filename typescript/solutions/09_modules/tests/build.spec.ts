import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const tsc = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));

/** Runs tsc; returns its output, '' when it succeeded. */
function runTsc(...args: string[]): string {
  try {
    execFileSync(process.execPath, [tsc, ...args], { cwd: root, encoding: 'utf8' });
    return '';
  } catch (error) {
    return String((error as { stdout?: string }).stdout ?? error);
  }
}

describe('npm run build', () => {
  let output = '';

  beforeAll(() => {
    rmSync(new URL('../dist', import.meta.url), { recursive: true, force: true });
    output = runTsc('-p', 'tsconfig.build.json');
  });

  test('compiles without an error', () => {
    expect(output).toBe('');
  });

  test('emits the JavaScript, with the imports rewritten to .js', () => {
    const index = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
    expect(index).toContain("from './articles.js'");
  });

  test('emits the declaration files next to it', () => {
    expect(existsSync(new URL('../dist/index.d.ts', import.meta.url))).toBe(true);
    const articles = readFileSync(new URL('../dist/articles.d.ts', import.meta.url), 'utf8');
    expect(articles).toContain('export declare function publish(title: string, now?: Date): Article;');
  });

  test('lets another project import the package by its name, types included', () => {
    expect(runTsc('-p', 'tests/consumer/tsconfig.json')).toBe('');
  });

  test('runs the emitted JavaScript on bare Node.js', () => {
    const script = "import('tp-09-modules').then((blog) => console.log(blog.publish('Hello, Wörld!').slug))";
    expect(execFileSync(process.execPath, ['-e', script], { cwd: root, encoding: 'utf8' }).trim()).toBe('hello-world');
  });
});
