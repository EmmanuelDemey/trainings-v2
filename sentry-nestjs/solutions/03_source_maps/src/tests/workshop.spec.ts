import { execFile } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp, flushed } from './app.js';
import { sentry } from './setup.js';

/**
 * Workshop 03 — Readable stack traces. Given, and red on the starter.
 *
 *   npm run test:watch
 */

const root = join(import.meta.dirname, '..', '..');
const readJson = async (file: string) => JSON.parse(await readFile(join(root, file), 'utf8'));

describe('step 1 — the build emits source maps', () => {
  it('turns on source maps, with the TypeScript sources inside them', async () => {
    const { compilerOptions } = await readJson('tsconfig.json');

    expect(compilerOptions.sourceMap).toBe(true);
    // Sentry can then show the TypeScript lines without access to the repository.
    expect(compilerOptions.inlineSources).toBe(true);
  });

  it('runs Node with --enable-source-maps in production', async () => {
    const { scripts } = await readJson('package.json');

    // The stack traces of the logs, and of the events, point at the .ts files.
    expect(scripts['start:prod']).toContain('--enable-source-maps');
  });
});

describe('step 2 — every event says which build sent it', () => {
  it('falls back to the version of the app when SENTRY_RELEASE is not set', async () => {
    await using app = await createApp();

    await request(app.getHttpServer()).get('/issues/13');
    await flushed();

    // The SDK reads SENTRY_RELEASE on its own; vitest.config.ts clears it, and the
    // commit variables of the CI, so that the fallback is what is checked.
    const { version } = await readJson('package.json');
    expect(sentry.errors()[0]?.release).toBe(`issue-tracker-api@${version}`);
  });
});

describe('step 3 — the source maps can be matched to the code', () => {
  it('injects a debug id into every file of the build, then uploads them', async () => {
    const { scripts } = await readJson('package.json');

    expect(scripts['sentry:sourcemaps']).toMatch(/sentry-cli sourcemaps inject \.\/dist/);
    expect(scripts['sentry:sourcemaps']).toMatch(/sentry-cli sourcemaps upload/);
  });

  it('stamps the built files with the same debug id as their source map', async () => {
    const dist = await mkdtemp(join(tmpdir(), 'sentry-nestjs-dist-'));
    try {
      const run = promisify(execFile);
      // The real build, to a temporary folder, then the offline half of the script.
      await run('npx', ['tsc', '-p', 'tsconfig.build.json', '--outDir', dist], { cwd: root });
      await run('npx', ['sentry-cli', 'sourcemaps', 'inject', dist], { cwd: root });

      const files = await readdir(dist);
      expect(files).toContain('main.js.map');
      const main = await readFile(join(dist, 'main.js'), 'utf8');
      const map = JSON.parse(await readFile(join(dist, 'main.js.map'), 'utf8'));
      const debugId = /\/\/# debugId=([0-9a-f-]+)/.exec(main)?.[1];
      expect(debugId).toBeDefined();
      expect(map.debugId).toBe(debugId);
      expect(map.sourcesContent?.[0]).toContain('NestFactory');
    } finally {
      await rm(dist, { recursive: true, force: true });
    }
  }, 60_000);
});
