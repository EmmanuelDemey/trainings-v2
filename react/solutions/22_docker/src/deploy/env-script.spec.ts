// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { projectRoot } from './files';

let workDir = '';

/**
 * Runs docker/40-env-js.sh the way the container does — with `sh`, and only
 * the given environment — then evaluates the env.js it wrote, as a browser
 * would, and returns the resulting `window.__ENV__`.
 */
function generateEnvJs(env: Record<string, string>): unknown {
  const target = join(workDir, 'env.js');
  execFileSync('sh', [join(projectRoot, 'docker/40-env-js.sh')], {
    env: { PATH: process.env.PATH, ENV_JS_PATH: target, ...env },
  });
  const window: { __ENV__?: unknown } = {};
  runInNewContext(readFileSync(target, 'utf8'), { window });
  return window.__ENV__;
}

describe('docker/40-env-js.sh', () => {
  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), 'env-js-'));
  });

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true });
  });

  it('writes the container variables into window.__ENV__', () => {
    expect(generateEnvJs({ API_BASE_URL: 'https://swapi.example.com/api', APP_ENVIRONMENT: 'staging' })).toEqual({
      API_BASE_URL: 'https://swapi.example.com/api',
      APP_ENVIRONMENT: 'staging',
    });
  });

  it('writes an empty string for a variable the container was not given', () => {
    expect(generateEnvJs({})).toEqual({ API_BASE_URL: '', APP_ENVIRONMENT: '' });
  });

  it('escapes quotes and backslashes, so a value cannot break out of its string', () => {
    const hostile = 'https://x.example.com/"; window.pwned = true; "\\';

    expect(generateEnvJs({ API_BASE_URL: hostile })).toEqual({ API_BASE_URL: hostile, APP_ENVIRONMENT: '' });
  });
});
