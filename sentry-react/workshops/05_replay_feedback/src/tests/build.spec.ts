// @vitest-environment node
/// <reference types="node" />
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { build } from 'vite';

/**
 * Workshop 03 — Readable stack traces. Red on the starter.
 *
 * Runs YOUR production build (`vite.config.ts`, into `dist/` as `npm run build`
 * does) with a known release name, then reads what would be deployed.
 */

let outDir: string;
let files: string[];
let javascript: string;

beforeAll(async () => {
  outDir = join(process.cwd(), 'dist');
  process.env.SENTRY_RELEASE = 'issue-tracker-web@test';
  await build({ root: process.cwd(), configFile: join(process.cwd(), 'vite.config.ts'), logLevel: 'silent' });
  files = (await readdir(outDir, { recursive: true })).map(String);
  const scripts = files.filter((file) => file.endsWith('.js'));
  javascript = (await Promise.all(scripts.map((file) => readFile(join(outDir, file), 'utf8')))).join('\n');
}, 60_000);

afterAll(() => {
  delete process.env.SENTRY_RELEASE;
});

describe('step 1 — nothing for the public to download', () => {
  it('ships no source map', () => {
    expect(files.filter((file) => file.endsWith('.map'))).toEqual([]);
  });

  it('leaves no sourceMappingURL comment in the bundle', () => {
    expect(javascript).not.toContain('sourceMappingURL');
  });
});

describe('step 2 — the bundle knows its source maps and its release', () => {
  it('carries debug ids, to match its source maps in Sentry', () => {
    // The SDK itself mentions `_sentryDebugIds` (it reads them): look for the
    // id the plugin injects, a UUID.
    expect(javascript).toMatch(/sentry-dbid-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
  });

  it('carries the release, for Sentry.init to pick up', () => {
    expect(javascript).toContain('issue-tracker-web@test');
  });
});
