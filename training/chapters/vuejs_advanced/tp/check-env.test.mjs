/**
 * Unit tests for the pure helpers of check-env.mjs.
 *
 *   node --test chapters/vuejs_advanced/tp/
 *
 * No dependency, no test framework to install: Node's built-in runner.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseVersion,
  compareVersions,
  meetsMinimum,
  formatBytes,
  summarize,
} from './check-env.mjs';

describe('parseVersion', () => {
  test('reads a plain semver', () => {
    assert.deepEqual(parseVersion('10.9.2'), [10, 9, 2]);
  });

  test('tolerates the v prefix used by node -v', () => {
    assert.deepEqual(parseVersion('v22.11.0'), [22, 11, 0]);
  });

  test('extracts the version out of a noisy CLI banner', () => {
    assert.deepEqual(parseVersion('git version 2.43.0'), [2, 43, 0]);
  });

  test('defaults a missing patch to 0', () => {
    assert.deepEqual(parseVersion('22.11'), [22, 11, 0]);
  });

  test('ignores a pre-release suffix', () => {
    assert.deepEqual(parseVersion('v23.0.0-nightly'), [23, 0, 0]);
  });

  test('returns null when there is no version at all', () => {
    assert.equal(parseVersion('command not found'), null);
    assert.equal(parseVersion(''), null);
    assert.equal(parseVersion(undefined), null);
  });
});

describe('compareVersions', () => {
  test('orders by major first', () => {
    assert.equal(compareVersions([22, 0, 0], [20, 99, 99]), 1);
    assert.equal(compareVersions([20, 99, 99], [22, 0, 0]), -1);
  });

  test('orders by minor then patch', () => {
    assert.equal(compareVersions([22, 11, 0], [22, 9, 5]), 1);
    assert.equal(compareVersions([22, 11, 0], [22, 11, 1]), -1);
  });

  test('reports equality', () => {
    assert.equal(compareVersions([22, 11, 0], [22, 11, 0]), 0);
  });
});

describe('meetsMinimum', () => {
  test('accepts a version above the floor', () => {
    assert.equal(meetsMinimum('v22.11.0', [22, 0, 0]), true);
  });

  test('accepts the floor itself', () => {
    assert.equal(meetsMinimum('22.0.0', [22, 0, 0]), true);
  });

  test('rejects a version below the floor', () => {
    assert.equal(meetsMinimum('v20.19.0', [22, 0, 0]), false);
  });

  test('rejects an unparseable version', () => {
    assert.equal(meetsMinimum('not installed', [22, 0, 0]), false);
  });
});

describe('formatBytes', () => {
  test('keeps small values in bytes', () => {
    assert.equal(formatBytes(0), '0 B');
    assert.equal(formatBytes(512), '512 B');
  });

  test('scales to the right unit with one decimal', () => {
    assert.equal(formatBytes(1536), '1.5 KB');
    assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
    assert.equal(formatBytes(2 * 1024 ** 3), '2.0 GB');
  });
});

describe('summarize', () => {
  test('counts each status', () => {
    const summary = summarize([
      { status: 'ok' },
      { status: 'warn' },
      { status: 'ok' },
      { status: 'fail' },
    ]);
    assert.equal(summary.ok, 2);
    assert.equal(summary.warn, 1);
    assert.equal(summary.fail, 1);
  });

  test('exits 0 when everything passes', () => {
    assert.equal(summarize([{ status: 'ok' }, { status: 'ok' }]).exitCode, 0);
  });

  test('exits 0 when there are only warnings', () => {
    assert.equal(summarize([{ status: 'ok' }, { status: 'warn' }]).exitCode, 0);
  });

  test('exits 1 as soon as one check fails', () => {
    assert.equal(summarize([{ status: 'ok' }, { status: 'fail' }]).exitCode, 1);
  });

  test('handles an empty run', () => {
    assert.deepEqual(summarize([]), { ok: 0, warn: 0, fail: 0, exitCode: 0 });
  });
});
