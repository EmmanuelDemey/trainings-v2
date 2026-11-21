#!/usr/bin/env node
/**
 * Accessibility — pre-flight environment check (run it ~a week before the training).
 *
 *   node check-env.mjs              # check everything
 *   node check-env.mjs --offline    # skip the network checks
 *   node check-env.mjs --json       # machine-readable report
 *
 * It looks for what the workshops need: Node.js and pnpm (local server and the
 * `verify` script), a recent Chrome or Firefox, a screen reader (NVDA, VoiceOver
 * or Orca) and the axe DevTools browser extension.
 *
 * Zero dependency on purpose: nothing to install before running it. If this script
 * does not start at all, that IS the first finding — Node.js is missing or too old.
 */
import { execFile } from 'node:child_process';
import { access, readdir, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// --- What the training needs -------------------------------------------------

// Same floor as the `engines` field of the training's package.json.
const MIN_NODE = [22, 12, 0];
const MIN_PNPM = [9, 0, 0];
const MIN_CHROME = [120, 0, 0];
const MIN_FIREFOX = [128, 0, 0];
const ENDPOINTS = [
  {
    label: 'npm registry',
    url: 'https://registry.npmjs.org/axe-core',
    required: true,
    hint: 'Without it, `pnpm install` cannot download the verify script dependencies.',
  },
  {
    label: 'NVDA download',
    url: 'https://www.nvaccess.org',
    required: false,
    hint: 'Only needed on Windows, to download NVDA.',
  },
];
const NETWORK_TIMEOUT_MS = 10_000;

/** Chrome Web Store id of axe DevTools (Deque). Edge installs it from the same store. */
export const AXE_EXTENSION_IDS = ['lhdoppojpmngadmnindnejefpokejbdd'];

// --- Pure helpers (unit-tested in check-env.test.mjs) ------------------------

/**
 * Extract the first `x.y[.z]` found in a string. Tolerates `v22.12.0`,
 * `Google Chrome 142.0.7444.59`, `Mozilla Firefox 145.0`. Returns null when there is none.
 */
export function parseVersion(text) {
  const match = /(\d+)\.(\d+)(?:\.(\d+))?/.exec(String(text ?? ''));
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
}

/** Standard comparator over `[major, minor, patch]` triples. */
export function compareVersions(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return 1;
    if (a[i] < b[i]) return -1;
  }
  return 0;
}

/** True when `text` holds a version greater than or equal to `minimum`. */
export function meetsMinimum(text, minimum) {
  const version = parseVersion(text);
  return version !== null && compareVersions(version, minimum) >= 0;
}

/** Human-readable size, one decimal from KB upwards. */
export function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return unit === 0 ? `${value} B` : `${value.toFixed(1)} ${units[unit]}`;
}

/** Aggregate check results into counts plus the process exit code. */
export function summarize(results) {
  const summary = { ok: 0, warn: 0, fail: 0, exitCode: 0 };
  for (const result of results) summary[result.status] += 1;
  summary.exitCode = summary.fail > 0 ? 1 : 0;
  return summary;
}

const pathFor = (platform) => (platform === 'win32' ? path.win32 : path.posix);

/**
 * Where to look for each browser: `commands` are tried on the PATH (they print
 * their version), `paths` are install locations whose mere presence counts.
 */
export function browserCandidates(platform, env) {
  if (platform === 'darwin') {
    return [
      { name: 'Chrome', min: MIN_CHROME, commands: [], paths: ['/Applications/Google Chrome.app'] },
      { name: 'Firefox', min: MIN_FIREFOX, commands: [], paths: ['/Applications/Firefox.app'] },
      { name: 'Edge', min: MIN_CHROME, commands: [], paths: ['/Applications/Microsoft Edge.app'] },
    ];
  }
  if (platform === 'win32') {
    const { join } = path.win32;
    const roots = [env.ProgramFiles, env['ProgramFiles(x86)'], env.LOCALAPPDATA].filter(Boolean);
    return [
      {
        name: 'Chrome',
        min: MIN_CHROME,
        commands: [],
        paths: roots.map((root) => join(root, 'Google', 'Chrome', 'Application', 'chrome.exe')),
      },
      {
        name: 'Firefox',
        min: MIN_FIREFOX,
        commands: [],
        paths: roots.map((root) => join(root, 'Mozilla Firefox', 'firefox.exe')),
      },
      {
        name: 'Edge',
        min: MIN_CHROME,
        commands: [],
        paths: roots.map((root) => join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe')),
      },
    ];
  }
  return [
    {
      name: 'Chrome',
      min: MIN_CHROME,
      commands: ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'],
      paths: [],
    },
    { name: 'Firefox', min: MIN_FIREFOX, commands: ['firefox'], paths: [] },
  ];
}

/** Where to look for a screen reader. VoiceOver ships with macOS, nothing to find. */
export function screenReaderCandidates(platform, env) {
  if (platform === 'darwin') {
    return [{ name: 'VoiceOver', builtIn: true, commands: [], paths: [] }];
  }
  if (platform === 'win32') {
    const { join } = path.win32;
    const roots = [env.ProgramFiles, env['ProgramFiles(x86)']].filter(Boolean);
    return [
      { name: 'NVDA', builtIn: false, commands: [], paths: roots.map((root) => join(root, 'NVDA', 'nvda.exe')) },
      { name: 'Narrator', builtIn: true, commands: [], paths: [] },
    ];
  }
  return [{ name: 'Orca', builtIn: false, commands: ['orca'], paths: [] }];
}

/** User-data folders of the Chromium-based browsers, where extensions live per profile. */
export function extensionRoots(platform, env) {
  const { join } = pathFor(platform);
  const home = env.HOME ?? env.USERPROFILE ?? '';
  if (platform === 'darwin') {
    const support = join(home, 'Library', 'Application Support');
    return [join(support, 'Google', 'Chrome'), join(support, 'Chromium'), join(support, 'Microsoft Edge')];
  }
  if (platform === 'win32') {
    const local = env.LOCALAPPDATA ?? join(home, 'AppData', 'Local');
    return [
      join(local, 'Google', 'Chrome', 'User Data'),
      join(local, 'Chromium', 'User Data'),
      join(local, 'Microsoft', 'Edge', 'User Data'),
    ];
  }
  return [
    join(home, '.config', 'google-chrome'),
    join(home, '.config', 'chromium'),
    join(home, '.config', 'microsoft-edge'),
    join(home, 'snap', 'chromium', 'common', 'chromium'),
  ];
}

/** Folders that hold Firefox profiles. */
export function firefoxProfileRoots(platform, env) {
  const { join } = pathFor(platform);
  const home = env.HOME ?? env.USERPROFILE ?? '';
  if (platform === 'darwin') return [join(home, 'Library', 'Application Support', 'Firefox', 'Profiles')];
  if (platform === 'win32') {
    return [join(env.APPDATA ?? join(home, 'AppData', 'Roaming'), 'Mozilla', 'Firefox', 'Profiles')];
  }
  return [
    join(home, '.mozilla', 'firefox'),
    join(home, 'snap', 'firefox', 'common', '.mozilla', 'firefox'),
    join(home, '.var', 'app', 'org.mozilla.firefox', '.mozilla', 'firefox'),
  ];
}

/** True when one of the extension folder names is an axe id. */
export function hasExtension(entries, ids) {
  return entries.some((entry) => ids.includes(entry));
}

/** True when a Firefox `extensions.json` lists axe DevTools. */
export function firefoxHasAxe(extensionsJson) {
  try {
    const { addons = [] } = JSON.parse(extensionsJson);
    return addons.some((addon) => /\baxe\b/i.test(addon?.defaultLocale?.name ?? ''));
  } catch {
    return false;
  }
}

// --- Check primitives --------------------------------------------------------

const ok = (name, message, extra) => ({ status: 'ok', name, message, ...extra });
const warn = (name, message, hint) => ({ status: 'warn', name, message, hint });
const fail = (name, message, hint) => ({ status: 'fail', name, message, hint });

/** Run a command and return its first line of output, or null if it failed. */
async function run(command, args, timeout = 20_000) {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      timeout,
      shell: process.platform === 'win32',
    });
    const output = stdout.trim() || stderr.trim();
    return output.split('\n')[0].trim();
  } catch {
    return null;
  }
}

const exists = (target) =>
  access(target).then(
    () => true,
    () => false,
  );

async function safeReaddir(directory) {
  try {
    return await readdir(directory);
  } catch {
    return [];
  }
}

/** Look a candidate up: first a command that prints its version, then an install path. */
async function locate(candidate) {
  for (const command of candidate.commands) {
    const output = await run(command, ['--version'], 10_000);
    if (output !== null) return { found: true, version: output };
  }
  for (const target of candidate.paths) {
    if (await exists(target)) return { found: true, version: null, where: target };
  }
  return { found: false };
}

async function checkNode() {
  const version = process.versions.node;
  if (!meetsMinimum(version, MIN_NODE)) {
    return fail(
      'Node.js',
      `v${version} — too old, the verify script needs >= ${MIN_NODE.join('.')}`,
      'Install it with nvm (`nvm install 24 && nvm use 24`) or from https://nodejs.org.',
    );
  }
  return ok('Node.js', `v${version}`);
}

async function checkPnpm() {
  const output = await run('pnpm', ['--version']);
  if (output === null) {
    return warn(
      'pnpm',
      'not found',
      'Needed for `pnpm run verify`. Enable it with `corepack enable pnpm`, or `npm install -g pnpm`. The workshops themselves open with `npx serve .`.',
    );
  }
  if (!meetsMinimum(output, MIN_PNPM)) {
    return warn('pnpm', `v${output} — older than ${MIN_PNPM.join('.')}`, 'Update with `corepack use pnpm@latest`.');
  }
  return ok('pnpm', `v${output}`);
}

async function checkBrowsers(platform, env) {
  const results = [];
  for (const candidate of browserCandidates(platform, env)) {
    const located = await locate(candidate);
    if (!located.found) continue;
    if (located.version !== null && !meetsMinimum(located.version, candidate.min)) {
      results.push(
        warn(
          `Browser — ${candidate.name}`,
          `${located.version} — older than ${candidate.min[0]}`,
          'Update it: the workshops use <dialog>, :focus-visible and the accessibility tree panel.',
        ),
      );
      continue;
    }
    results.push(ok(`Browser — ${candidate.name}`, located.version ?? `installed (${located.where})`));
  }
  if (results.length === 0) {
    results.push(
      fail(
        'Browser',
        'no Chrome, Edge or Firefox found',
        'Install a recent Chrome or Firefox: the devtools accessibility panel is used all along.',
      ),
    );
  }
  return results;
}

async function checkScreenReader(platform, env) {
  const candidates = screenReaderCandidates(platform, env);
  for (const candidate of candidates.filter((c) => !c.builtIn)) {
    const located = await locate(candidate);
    if (located.found) return ok('Screen reader', located.version ?? `${candidate.name} installed`);
  }
  if (platform === 'darwin') {
    return ok('Screen reader', 'VoiceOver (built in)', {
      hint: 'Try it before day 1: Cmd+F5 toggles it.',
    });
  }
  if (platform === 'win32') {
    return warn(
      'Screen reader',
      'NVDA not found (Narrator is there, but the training uses NVDA)',
      'Install it from https://www.nvaccess.org/download — the portable copy works on locked-down laptops.',
    );
  }
  return warn('Screen reader', 'Orca not found', 'Install it with your package manager (`sudo apt install orca`).');
}

async function checkAxeExtension(platform, env) {
  const { join } = pathFor(platform);
  for (const root of extensionRoots(platform, env)) {
    for (const profile of await safeReaddir(root)) {
      const extensions = await safeReaddir(join(root, profile, 'Extensions'));
      if (hasExtension(extensions, AXE_EXTENSION_IDS)) {
        return ok('axe DevTools', `installed (${path.basename(root)} / ${profile})`);
      }
    }
  }
  for (const root of firefoxProfileRoots(platform, env)) {
    for (const profile of await safeReaddir(root)) {
      try {
        const content = await readFile(join(root, profile, 'extensions.json'), 'utf8');
        if (firefoxHasAxe(content)) return ok('axe DevTools', `installed (Firefox / ${profile})`);
      } catch {
        // Not a profile, or a profile without extensions.json.
      }
    }
  }
  return warn(
    'axe DevTools',
    'extension not found',
    'Install the free "axe DevTools" extension from the Chrome Web Store or Firefox Add-ons (workshop 08). Detection can miss unusual profile locations.',
  );
}

function proxyInfo() {
  const vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'];
  const set = vars.filter((name) => process.env[name]);
  if (set.length === 0) return null;
  return ok('Proxy', `configured via ${set.join(', ')}`, {
    hint: "Node's fetch ignores these variables, so a failed network check below may be a false alarm.",
  });
}

async function checkEndpoint({ label, url, required, hint }) {
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS) });
    return ok(`Network — ${label}`, `reachable (HTTP ${response.status})`);
  } catch (error) {
    const message = `unreachable (${error?.cause?.code ?? error.name})`;
    return required ? fail(`Network — ${label}`, message, hint) : warn(`Network — ${label}`, message, hint);
  }
}

// --- Reporting ---------------------------------------------------------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : text);
const ICONS = { ok: paint(32, '✔'), warn: paint(33, '!'), fail: paint(31, '✘') };

function printResult(result) {
  console.log(`${ICONS[result.status]} ${result.name.padEnd(24)} ${result.message}`);
  if (result.hint) console.log(`  ${paint(90, `↳ ${result.hint}`)}`);
}

function printFooter(summary) {
  console.log('');
  console.log(`${summary.ok} ok · ${summary.warn} warning(s) · ${summary.fail} blocker(s)`);
  if (summary.fail > 0) {
    console.log(
      paint(31, '\nSome blockers need fixing before the training.') +
        '\nCopy this whole output and send it to your trainer — most of these are quicker to solve now than on day 1.',
    );
  } else if (summary.warn > 0) {
    console.log(paint(33, '\nUsable, but look at the warnings above.'));
  } else {
    console.log(paint(32, '\nYou are all set. See you at the training!'));
  }
}

// --- Entry point -------------------------------------------------------------

async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(
      [
        'Accessibility — environment check',
        '',
        '  node check-env.mjs             check everything',
        '  node check-env.mjs --offline   skip the network checks',
        '  node check-env.mjs --json      machine-readable report',
      ].join('\n'),
    );
    return 0;
  }

  const asJson = argv.includes('--json');
  const offline = argv.includes('--offline');
  const { platform } = process;
  const env = { HOME: homedir(), ...process.env };
  const log = asJson ? () => {} : (line) => console.log(line);

  log(`Accessibility — environment check  (${platform}, ${process.arch})\n`);

  const results = [
    await checkNode(),
    await checkPnpm(),
    ...(await checkBrowsers(platform, env)),
    await checkScreenReader(platform, env),
    await checkAxeExtension(platform, env),
  ];

  const proxy = proxyInfo();
  if (proxy) results.push(proxy);

  if (offline) {
    log(paint(90, 'Network checks skipped (--offline).\n'));
  } else {
    results.push(...(await Promise.all(ENDPOINTS.map(checkEndpoint))));
  }

  const summary = summarize(results);
  if (asJson) {
    console.log(JSON.stringify({ platform, summary, results }, null, 2));
  } else {
    results.forEach(printResult);
    printFooter(summary);
  }
  return summary.exitCode;
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  process.exitCode = await main();
}
