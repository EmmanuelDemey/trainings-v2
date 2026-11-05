#!/usr/bin/env node
// Copies what the two Sentry trainings share into every workshop and every
// solution of a training:
//
//   sentry-common/testkit/*.ts   →  <workshop>/src/tests/shared/
//
// The copies are gitignored: the single source is sentry-common/. They exist on
// disk because each workshop must stand alone — its starter ZIP and its online
// editor (StackBlitz) only ever see the workshop folder.
//
//   node ../sentry-common/scripts/sync.mjs            the training of the current folder
//   node sentry-common/scripts/sync.mjs <training>…   the trainings named
//
// The training's `postinstall` and `build` scripts run it: `pnpm install` is
// enough to get working copies.

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMON = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TESTKIT = join(COMMON, 'testkit');

/** `03_releases` → 3, `_07_draft` → 7, `README.md` → null. Same rule as training-kit. */
function numberOf(name) {
  const match = /^_?0*(\d+)/.exec(name);
  return match ? Number(match[1]) : null;
}

function banner(source) {
  return `// GENERATED — copied from sentry-common/${source} by the training's \`pnpm run sync\`.\n// Do not edit this copy: edit the original, then sync again.\n\n`;
}

async function syncProject(project) {
  // Only the folder the sync owns is replaced: a workshop's own specs, next to
  // it in src/tests/, are left alone.
  const target = join(project, 'src', 'tests', 'shared');
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  for (const name of await readdir(TESTKIT)) {
    const source = await readFile(join(TESTKIT, name), 'utf8');
    await writeFile(join(target, name), banner(`testkit/${name}`) + source);
  }
}

async function syncTraining(training) {
  let count = 0;
  for (const folder of ['workshops', 'solutions']) {
    const root = join(training, folder);
    if (!existsSync(root)) continue;
    for (const entry of await readdir(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || numberOf(entry.name) === null) continue;
      const project = join(root, entry.name);
      await syncProject(project);
      count += 1;
      console.log(`  ${relative(training, project)}`);
    }
  }
  return count;
}

const trainings = process.argv.slice(2).map((path) => resolve(path));
if (trainings.length === 0) trainings.push(process.cwd());

for (const training of trainings) {
  console.log(`sync ${basename(training)}:`);
  const count = await syncTraining(training);
  console.log(`  ${count} project(s) synced from ${relative(training, COMMON)}/`);
}
