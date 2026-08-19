#!/usr/bin/env node
/**
 * Advanced Vue.js — pre-flight environment check (run it ~a week before the training).
 *
 *   node check-env.mjs              # check everything
 *   node check-env.mjs --install    # check, then `npm install` every workshop
 *   node check-env.mjs --offline    # skip the network checks
 *   node check-env.mjs --json       # machine-readable report
 *
 * Zero dependency on purpose: nothing to install before running it. If this script
 * does not start at all, that IS the first finding — Node.js is missing or too old.
 */
import { execFile } from 'node:child_process';
import { createServer } from 'node:net';
import { access, readdir, statfs } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// --- What the training needs -------------------------------------------------

const MIN_NODE = [22, 0, 0];
const MIN_NPM = [10, 0, 0];
const PORTS = [
  { port: 5173, usedBy: 'vite dev', hint: 'Free it before the session, or Vite will silently move to another port.' },
  { port: 4173, usedBy: 'vite preview', hint: 'Free it before the session, or Vite will silently move to another port.' },
  // Workshop 9 serves its build from a local nginx/Caddy container (step 5bis).
  { port: 8080, usedBy: 'nginx, TP 9', hint: 'Only needed for the local deployment of workshop 9; edit `docker/compose.yml` if it is taken.' },
  { port: 8081, usedBy: 'Caddy, TP 9', hint: 'Only needed for the local deployment of workshop 9; edit `docker/compose.yml` if it is taken.' },
];
const ENDPOINTS = [
  {
    label: 'npm registry',
    url: 'https://registry.npmjs.org/vue',
    required: true,
    hint: 'Without it, `npm install` cannot download anything.',
  },
  {
    label: 'Cypress CDN',
    url: 'https://download.cypress.io/desktop.json',
    required: true,
    hint: 'Chapters 4 & 7 install Cypress, which downloads its own browser binary.',
  },
  {
    label: 'GitHub',
    url: 'https://github.com',
    required: false,
    hint: 'Some packages resolve to GitHub tarballs.',
  },
];
const DISK_WARN_BYTES = 3 * 1024 ** 3;
const DISK_FAIL_BYTES = 1 * 1024 ** 3;
const NETWORK_TIMEOUT_MS = 10_000;

// --- Pure helpers (unit-tested in check-env.test.mjs) ------------------------

/**
 * Extract the first `x.y[.z]` found in a string. Tolerates `v22.11.0`,
 * `git version 2.43.0`, `23.0.0-nightly`. Returns null when there is none.
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

// --- Check primitives --------------------------------------------------------

const ok = (name, message, extra) => ({ status: 'ok', name, message, ...extra });
const warn = (name, message, hint) => ({ status: 'warn', name, message, hint });
const fail = (name, message, hint) => ({ status: 'fail', name, message, hint });

/**
 * Run a command and return its first line of output, or null if it failed.
 * stdout wins over stderr: npm happily writes config warnings to stderr, and they
 * must not end up in the value we report.
 */
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

async function checkNode() {
  const version = process.versions.node;
  if (!meetsMinimum(version, MIN_NODE)) {
    return fail(
      'Node.js',
      `v${version} — too old, the workshops need >= ${MIN_NODE.join('.')}`,
      'Install it with nvm (`nvm install 22 && nvm use 22`) or from https://nodejs.org.',
    );
  }
  return ok('Node.js', `v${version}`);
}

async function checkNpm() {
  const output = await run('npm', ['--version']);
  if (output === null) {
    return fail('npm', 'not found', 'npm ships with Node.js — reinstall Node.js.');
  }
  if (!meetsMinimum(output, MIN_NPM)) {
    return warn(
      'npm',
      `v${output} — older than the recommended ${MIN_NPM.join('.')}`,
      'Update with `npm install -g npm@latest`.',
    );
  }
  return ok('npm', `v${output}`);
}

async function checkGit() {
  const output = await run('git', ['--version']);
  if (output === null) {
    return warn(
      'Git',
      'not found',
      'Not strictly required, but chapter 9 (CI/CD) assumes a Git repository.',
    );
  }
  return ok('Git', output.replace(/^git version /, 'v'));
}

async function checkRegistryConfig() {
  const registry = await run('npm', ['config', 'get', 'registry']);
  if (registry === null) return warn('npm registry', 'could not read `npm config get registry`');
  if (/registry\.npmjs\.org/.test(registry)) return ok('npm registry', registry);
  return warn(
    'npm registry',
    `${registry} (private mirror)`,
    'Make sure this mirror proxies the public registry and Cypress, or the installs will fail.',
  );
}

function proxyInfo() {
  const vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'NO_PROXY', 'no_proxy'];
  const set = vars.filter((name) => process.env[name]);
  if (set.length === 0) return null;
  return ok('Proxy', `configured via ${set.join(', ')}`, {
    hint: "Node's fetch ignores these variables, so a failed network check below may be a false alarm — `npm ping` is the tie-breaker.",
  });
}

async function checkEndpoint({ label, url, required, hint }) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS),
    });
    // Any HTTP answer means we got through; the status code itself is irrelevant.
    return ok(`Network — ${label}`, `reachable (HTTP ${response.status})`);
  } catch (error) {
    const message = `unreachable (${error?.cause?.code ?? error.name})`;
    return required
      ? fail(`Network — ${label}`, message, hint)
      : warn(`Network — ${label}`, message, hint);
  }
}

function checkPort({ port, usedBy, hint }) {
  const label = `Port ${port} (${usedBy})`;
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', (error) => {
      resolve(
        error.code === 'EADDRINUSE'
          ? warn(label, 'already in use', hint)
          : warn(label, `could not be tested (${error.code})`),
      );
    });
    server.once('listening', () => server.close(() => resolve(ok(label, 'free'))));
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Optional: workshop 9 deploys its build to a local nginx/Caddy container when
 * you do not have (or do not want) a Netlify/Vercel account. Everything else in
 * the training runs without it, so a missing Docker is a warning, never a failure.
 */
async function checkDocker() {
  const output = await run('docker', ['--version']);
  if (output === null) {
    return warn(
      'Docker',
      'not found',
      'Optional — only workshop 9 step 5bis (deploying the build locally) uses it. Podman with `podman compose` works too.',
    );
  }
  const compose = await run('docker', ['compose', 'version']);
  if (compose === null) {
    return warn(
      'Docker',
      `v${parseVersion(output)?.join('.') ?? output} — but \`docker compose\` is missing`,
      'Install the Compose v2 plugin, or start the containers by hand with `docker run`.',
    );
  }
  return ok('Docker', `v${parseVersion(output)?.join('.') ?? output} with compose`);
}

async function checkDisk(directory) {
  try {
    const stats = await statfs(directory);
    const free = stats.bavail * stats.bsize;
    if (free < DISK_FAIL_BYTES) {
      return fail('Disk space', `${formatBytes(free)} free`, 'The workshops need ~2 GB once installed.');
    }
    if (free < DISK_WARN_BYTES) {
      return warn('Disk space', `${formatBytes(free)} free`, 'Comfortable would be 3 GB or more.');
    }
    return ok('Disk space', `${formatBytes(free)} free`);
  } catch (error) {
    return warn('Disk space', `could not be measured (${error.code ?? error.message})`);
  }
}

async function listWorkshops(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const workshops = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^\d{2}_/.test(entry.name)) continue;
    const directory = join(root, entry.name);
    try {
      await access(join(directory, 'package.json'));
      workshops.push({ name: entry.name, directory });
    } catch {
      // A numbered folder without package.json is not a workshop.
    }
  }
  return workshops.sort((a, b) => a.name.localeCompare(b.name));
}

async function checkWorkshops(workshops) {
  if (workshops.length === 0) {
    return [
      fail(
        'Workshops',
        'no workshop folder found next to this script',
        'Run the script from inside the `tp/` folder you were given.',
      ),
    ];
  }
  const installed = [];
  const missing = [];
  for (const workshop of workshops) {
    try {
      await access(join(workshop.directory, 'node_modules'));
      installed.push(workshop.name);
    } catch {
      missing.push(workshop.name);
    }
  }
  const results = [ok('Workshops', `${workshops.length} found`)];
  results.push(
    missing.length === 0
      ? ok('Dependencies', 'installed in every workshop')
      : warn(
          'Dependencies',
          `not installed in ${missing.length}/${workshops.length} (${missing.join(', ')})`,
          'Re-run with `--install` to do it now — much better than on day 1 on the room Wi-Fi.',
        ),
  );
  return results;
}

async function installWorkshops(workshops, log) {
  const results = [];
  for (const workshop of workshops) {
    log(`  → npm install in ${workshop.name} …`);
    try {
      await execFileAsync('npm', ['install', '--no-audit', '--no-fund'], {
        cwd: workshop.directory,
        timeout: 10 * 60_000,
        shell: process.platform === 'win32',
      });
      results.push(ok(`Install — ${workshop.name}`, 'done'));
    } catch (error) {
      // Keep the first meaningful npm error lines — the trailing "complete log"
      // path is noise for whoever reads the report.
      const detail =
        `${error.stderr ?? error.message}`
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !/complete log of this run/i.test(line))
          .slice(0, 2)
          .join(' ') || 'npm exited with an error';
      results.push(fail(`Install — ${workshop.name}`, 'failed', detail));
    }
  }
  return results;
}

// --- Reporting ---------------------------------------------------------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (useColor ? `[${code}m${text}[0m` : text);
const ICONS = { ok: paint(32, '✔'), warn: paint(33, '!'), fail: paint(31, '✘') };

function printResult(result) {
  console.log(`${ICONS[result.status]} ${result.name.padEnd(24)} ${result.message}`);
  if (result.hint) console.log(`  ${paint(90, `↳ ${result.hint}`)}`);
}

function printFooter(summary) {
  console.log('');
  console.log(
    `${summary.ok} ok · ${summary.warn} warning(s) · ${summary.fail} blocker(s)`,
  );
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
        'Advanced Vue.js — environment check',
        '',
        '  node check-env.mjs             check everything',
        '  node check-env.mjs --install   check, then npm install every workshop',
        '  node check-env.mjs --offline   skip the network checks',
        '  node check-env.mjs --json      machine-readable report',
      ].join('\n'),
    );
    return 0;
  }

  const asJson = argv.includes('--json');
  const offline = argv.includes('--offline');
  const doInstall = argv.includes('--install');
  const root = dirname(fileURLToPath(import.meta.url));
  const log = asJson ? () => {} : (line) => console.log(line);

  log(`Advanced Vue.js — environment check  (${process.platform}, ${process.arch})\n`);

  const results = [
    await checkNode(),
    await checkNpm(),
    await checkGit(),
    await checkDocker(),
    await checkRegistryConfig(),
  ];

  const proxy = proxyInfo();
  if (proxy) results.push(proxy);

  if (offline) {
    log(paint(90, 'Network checks skipped (--offline).\n'));
  } else {
    results.push(...(await Promise.all(ENDPOINTS.map(checkEndpoint))));
  }

  results.push(...(await Promise.all(PORTS.map(checkPort))));
  results.push(await checkDisk(root));

  const workshops = await listWorkshops(root);
  results.push(...(await checkWorkshops(workshops)));

  if (!asJson) results.forEach(printResult);

  if (doInstall && workshops.length > 0) {
    log('\nInstalling dependencies (this can take a few minutes)…');
    const installResults = await installWorkshops(workshops, log);
    results.push(...installResults);
    if (!asJson) installResults.forEach(printResult);
  }

  const summary = summarize(results);
  if (asJson) {
    console.log(JSON.stringify({ platform: process.platform, summary, results }, null, 2));
  } else {
    printFooter(summary);
  }
  return summary.exitCode;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  process.exitCode = await main();
}
