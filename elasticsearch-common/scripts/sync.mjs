#!/usr/bin/env node
// Copies the images the Elastic trainings share into the deck of a training:
//
//   elasticsearch-common/images/   →  <training>/slides/public/images/common/
//
// The shared fragments (elasticsearch-common/slides/) reference them as
// /images/common/…: Slidev only serves the `public/` folder of the deck, so the
// images must be there. The copy is gitignored: the single source is
// elasticsearch-common/.
//
//   node ../elasticsearch-common/scripts/sync.mjs            the training of the current folder
//   node elasticsearch-common/scripts/sync.mjs <training>…   the trainings named
//
// The training's `postinstall`, `dev` and `build` scripts run it.

import { cp, rm } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMON = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = join(COMMON, 'images');

const trainings = process.argv.slice(2).map((path) => resolve(path));
if (trainings.length === 0) trainings.push(process.cwd());

for (const training of trainings) {
  const target = join(training, 'slides', 'public', 'images', 'common');
  await rm(target, { recursive: true, force: true });
  await cp(IMAGES, target, { recursive: true });
  console.log(`sync ${basename(training)}: ${relative(training, target)}/ ← ${relative(training, IMAGES)}/`);
}
