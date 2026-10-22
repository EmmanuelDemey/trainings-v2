#!/usr/bin/env node
// Copies what the Elastic trainings share into a training:
//
//   elasticsearch-common/images/   →  <training>/slides/public/images/common/
//   elasticsearch-common/lab/      →  <training>/workshops/<every workshop>/lab/   (with --lab)
//
// The shared fragments (elasticsearch-common/slides/) reference the images as
// /images/common/…: Slidev only serves the `public/` folder of the deck, so the
// images must be there. The lab — the Docker Compose stack the workshops run
// against — is copied into every workshop because each one must stand alone: its
// starter ZIP only ever sees the workshop folder. The copies are gitignored: the
// single source is elasticsearch-common/.
//
//   node ../elasticsearch-common/scripts/sync.mjs [--lab]            the training of the current folder
//   node elasticsearch-common/scripts/sync.mjs [--lab] <training>…   the trainings named
//
// The training's `postinstall`, `dev` and `build` scripts run it.

import { existsSync } from 'node:fs';
import { cp, readdir, rm } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMON = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = join(COMMON, 'images');
const LAB = join(COMMON, 'lab');

const args = process.argv.slice(2);
const withLab = args.includes('--lab');
const trainings = args.filter((arg) => arg !== '--lab').map((path) => resolve(path));
if (trainings.length === 0) trainings.push(process.cwd());

/** The numbered workshop folders of a training: `01_lab_fleet`, not `README.md` nor `_13_draft`. */
async function workshopsOf(training) {
  const root = join(training, 'workshops');
  if (!existsSync(root)) return [];
  return (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^\d/.test(entry.name))
    .map((entry) => join(root, entry.name));
}

for (const training of trainings) {
  const target = join(training, 'slides', 'public', 'images', 'common');
  await rm(target, { recursive: true, force: true });
  await cp(IMAGES, target, { recursive: true });
  console.log(`sync ${basename(training)}: ${relative(training, target)}/ ← ${relative(training, IMAGES)}/`);

  if (!withLab) continue;
  const workshops = await workshopsOf(training);
  for (const workshop of workshops) {
    const lab = join(workshop, 'lab');
    await rm(lab, { recursive: true, force: true });
    await cp(LAB, lab, { recursive: true });
  }
  console.log(`  ${workshops.length} workshop(s): lab/ ← ${relative(training, LAB)}/`);
}
