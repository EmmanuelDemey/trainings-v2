// @vitest-environment node
// The build runs tsc and Node.js: no DOM needed — and jsdom's own `URL` is not
// one `fileURLToPath` accepts.
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
    expect(index).toContain("from './ArticleCard.js'");
  });

  test('emits the declaration files next to it', () => {
    expect(existsSync(new URL('../dist/index.d.ts', import.meta.url))).toBe(true);
    const card = readFileSync(new URL('../dist/ArticleCard.d.ts', import.meta.url), 'utf8');
    expect(card).toContain('export declare function ArticleCard({ title, tags }: ArticleCardProps): ReactElement;');
  });

  test('lets another project import the library by its name, types included', () => {
    expect(runTsc('-p', 'tests/consumer/tsconfig.json')).toBe('');
  });

  test('renders the emitted JavaScript on bare Node.js', () => {
    const script = [
      "Promise.all([import('tp-react-09-modules'), import('react'), import('react-dom/server')])",
      ".then(([lib, react, server]) => console.log(server.renderToStaticMarkup(react.createElement(lib.ArticleCard, { title: 'Hello, Wörld!' }))))",
    ].join('');
    expect(execFileSync(process.execPath, ['-e', script], { cwd: root, encoding: 'utf8' }).trim()).toBe(
      '<article><h2 id="hello-world">Hello, Wörld!</h2></article>',
    );
  });
});
