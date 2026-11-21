/**
 * Unit tests for the pure helpers of check-env.mjs.
 *
 *   node --test workshops/check-env.test.mjs
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
  browserCandidates,
  screenReaderCandidates,
  extensionRoots,
  AXE_EXTENSION_IDS,
  hasExtension,
  firefoxHasAxe,
} from './check-env.mjs';

describe('parseVersion', () => {
  test('reads a plain semver', () => {
    assert.deepEqual(parseVersion('10.9.2'), [10, 9, 2]);
  });

  test('tolerates the v prefix used by node -v', () => {
    assert.deepEqual(parseVersion('v22.12.0'), [22, 12, 0]);
  });

  test('extracts the version out of a noisy CLI banner', () => {
    assert.deepEqual(parseVersion('Google Chrome 142.0.7444.59'), [142, 0, 7444]);
  });

  test('defaults a missing patch to 0', () => {
    assert.deepEqual(parseVersion('22.12'), [22, 12, 0]);
  });

  test('returns null when there is no version at all', () => {
    assert.equal(parseVersion('command not found'), null);
    assert.equal(parseVersion(''), null);
    assert.equal(parseVersion(undefined), null);
  });
});

describe('compareVersions', () => {
  test('orders by major, then minor, then patch', () => {
    assert.equal(compareVersions([22, 0, 0], [20, 99, 99]), 1);
    assert.equal(compareVersions([22, 11, 0], [22, 12, 0]), -1);
    assert.equal(compareVersions([22, 12, 1], [22, 12, 0]), 1);
  });

  test('reports equality', () => {
    assert.equal(compareVersions([22, 12, 0], [22, 12, 0]), 0);
  });
});

describe('meetsMinimum', () => {
  test('accepts the floor itself and above', () => {
    assert.equal(meetsMinimum('v22.12.0', [22, 12, 0]), true);
    assert.equal(meetsMinimum('v24.1.0', [22, 12, 0]), true);
  });

  test('rejects a version below the floor', () => {
    assert.equal(meetsMinimum('v22.11.0', [22, 12, 0]), false);
  });

  test('rejects an unparseable version', () => {
    assert.equal(meetsMinimum('not installed', [22, 12, 0]), false);
  });
});

describe('formatBytes', () => {
  test('keeps small values in bytes and scales the rest', () => {
    assert.equal(formatBytes(512), '512 B');
    assert.equal(formatBytes(1536), '1.5 KB');
    assert.equal(formatBytes(2 * 1024 ** 3), '2.0 GB');
  });
});

describe('summarize', () => {
  test('counts each status', () => {
    const summary = summarize([{ status: 'ok' }, { status: 'warn' }, { status: 'ok' }, { status: 'fail' }]);
    assert.deepEqual(summary, { ok: 2, warn: 1, fail: 1, exitCode: 1 });
  });

  test('exits 0 when there are only warnings', () => {
    assert.equal(summarize([{ status: 'ok' }, { status: 'warn' }]).exitCode, 0);
  });

  test('handles an empty run', () => {
    assert.deepEqual(summarize([]), { ok: 0, warn: 0, fail: 0, exitCode: 0 });
  });
});

describe('browserCandidates', () => {
  test('lists Chrome and Firefox commands on Linux', () => {
    const candidates = browserCandidates('linux', {});
    const names = candidates.map((c) => c.name);
    assert.ok(names.includes('Chrome'));
    assert.ok(names.includes('Firefox'));
    const chrome = candidates.find((c) => c.name === 'Chrome');
    assert.ok(chrome.commands.includes('google-chrome'));
  });

  test('points at the .app bundles on macOS', () => {
    const chrome = browserCandidates('darwin', {}).find((c) => c.name === 'Chrome');
    assert.ok(chrome.paths.includes('/Applications/Google Chrome.app'));
  });

  test('builds Windows paths from the environment', () => {
    const env = { ProgramFiles: 'C:\\PF', LOCALAPPDATA: 'C:\\Users\\me\\AppData\\Local' };
    const chrome = browserCandidates('win32', env).find((c) => c.name === 'Chrome');
    assert.ok(chrome.paths.some((p) => p.startsWith('C:\\PF')));
    assert.ok(chrome.paths.some((p) => p.startsWith('C:\\Users\\me\\AppData\\Local')));
  });
});

describe('screenReaderCandidates', () => {
  test('VoiceOver is built into macOS', () => {
    const [voiceOver] = screenReaderCandidates('darwin', {});
    assert.equal(voiceOver.name, 'VoiceOver');
    assert.equal(voiceOver.builtIn, true);
  });

  test('looks for NVDA in both Program Files folders on Windows', () => {
    const env = { ProgramFiles: 'C:\\PF', 'ProgramFiles(x86)': 'C:\\PF86' };
    const nvda = screenReaderCandidates('win32', env).find((c) => c.name === 'NVDA');
    assert.ok(nvda.paths.some((p) => p.startsWith('C:\\PF86')));
    assert.ok(nvda.paths.some((p) => p.startsWith('C:\\PF\\')));
  });

  test('looks for the orca command on Linux', () => {
    const orca = screenReaderCandidates('linux', {}).find((c) => c.name === 'Orca');
    assert.deepEqual(orca.commands, ['orca']);
  });
});

describe('extensionRoots', () => {
  test('covers Chrome and Chromium profiles on Linux', () => {
    const roots = extensionRoots('linux', { HOME: '/home/me' });
    assert.ok(roots.includes('/home/me/.config/google-chrome'));
    assert.ok(roots.includes('/home/me/.config/chromium'));
  });

  test('uses LOCALAPPDATA on Windows', () => {
    const roots = extensionRoots('win32', { LOCALAPPDATA: 'C:\\L', HOME: 'C:\\Users\\me' });
    assert.ok(roots.some((r) => r.startsWith('C:\\L')));
  });
});

describe('hasExtension', () => {
  const [chromeAxe] = AXE_EXTENSION_IDS;

  test('finds the axe id among the installed extension folders', () => {
    assert.equal(hasExtension(['aapbdbdomjkkjkaonfhkkikfgjllcleb', chromeAxe], AXE_EXTENSION_IDS), true);
  });

  test('says no when axe is not there', () => {
    assert.equal(hasExtension(['aapbdbdomjkkjkaonfhkkikfgjllcleb'], AXE_EXTENSION_IDS), false);
    assert.equal(hasExtension([], AXE_EXTENSION_IDS), false);
  });
});

describe('firefoxHasAxe', () => {
  const addons = (...names) =>
    JSON.stringify({ addons: names.map((name) => ({ defaultLocale: { name }, active: true })) });

  test('finds axe DevTools in a Firefox profile extensions.json', () => {
    assert.equal(firefoxHasAxe(addons('uBlock Origin', 'axe DevTools - Web Accessibility Testing')), true);
  });

  test('says no when the add-on is absent', () => {
    assert.equal(firefoxHasAxe(addons('uBlock Origin')), false);
  });

  test('does not match words that merely contain "axe"', () => {
    assert.equal(firefoxHasAxe(addons('Taxes calculator')), false);
  });

  test('survives a broken or empty file', () => {
    assert.equal(firefoxHasAxe('{not json'), false);
    assert.equal(firefoxHasAxe(''), false);
  });
});
