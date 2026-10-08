#!/usr/bin/env node
// Copies what the three TanStack Query trainings share into every workshop and
// every solution of a training:
//
//   tanstack-query-common/api/*.ts                 →  <workshop>/src/api/
//   tanstack-query-common/specs/<NN>_*.spec.ts     →  <workshop>/src/tests/shared/workshop.spec.ts
//
// The copies are gitignored: the single source is tanstack-query-common/. They
// exist on disk because each workshop must stand alone — its starter ZIP and its
// online editor (StackBlitz) only ever see the workshop folder.
//
//   node ../tanstack-query-common/scripts/sync.mjs            the training of the current folder
//   node tanstack-query-common/scripts/sync.mjs <training>…   the trainings named
//
// The training's `postinstall` and `build` scripts run it: `pnpm install` is
// enough to get working copies.

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMON = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API = join(COMMON, 'api');
const SPECS = join(COMMON, 'specs');

/** `03_pagination` → 3, `_07_draft` → 7, `README.md` → null. Same rule as training-kit. */
function numberOf(name) {
  const match = /^_?0*(\d+)/.exec(name);
  return match ? Number(match[1]) : null;
}

function banner(source) {
  return `// GENERATED — copied from tanstack-query-common/${source} by the training's \`pnpm run sync\`.\n// Do not edit this copy: edit the original, then sync again.\n\n`;
}

async function specsByNumber() {
  const specs = new Map();
  for (const name of await readdir(SPECS)) {
    const number = numberOf(name);
    if (number !== null && name.endsWith('.spec.ts')) specs.set(number, name);
  }
  return specs;
}

async function syncProject(project, specs) {
  const apiTarget = join(project, 'src', 'api');
  await rm(apiTarget, { recursive: true, force: true });
  await mkdir(apiTarget, { recursive: true });
  for (const name of await readdir(API)) {
    const source = await readFile(join(API, name), 'utf8');
    await writeFile(join(apiTarget, name), banner(`api/${name}`) + source);
  }

  // Only the folder the sync owns is replaced: a workshop's own specs, next to
  // it in src/tests/, are left alone.
  const sharedTests = join(project, 'src', 'tests', 'shared');
  await rm(sharedTests, { recursive: true, force: true });
  const spec = specs.get(numberOf(basename(project)));
  if (spec) {
    await mkdir(sharedTests, { recursive: true });
    const source = await readFile(join(SPECS, spec), 'utf8');
    await writeFile(join(sharedTests, 'workshop.spec.ts'), banner(`specs/${spec}`) + source);
  }
  return spec;
}

async function syncTraining(training, specs) {
  let count = 0;
  for (const folder of ['workshops', 'solutions']) {
    const root = join(training, folder);
    if (!existsSync(root)) continue;
    for (const entry of await readdir(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || numberOf(entry.name) === null) continue;
      const project = join(root, entry.name);
      const spec = await syncProject(project, specs);
      count += 1;
      console.log(`  ${relative(training, project)}${spec ? `  ← specs/${spec}` : ''}`);
    }
  }
  return count;
}

const trainings = process.argv.slice(2).map((path) => resolve(path));
if (trainings.length === 0) trainings.push(process.cwd());

const specs = await specsByNumber();
for (const training of trainings) {
  console.log(`sync ${basename(training)}:`);
  const count = await syncTraining(training, specs);
  console.log(`  ${count} project(s) synced from ${relative(training, COMMON)}/`);
}
