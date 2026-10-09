// What scripts/check-workshops.mjs checks in a training — read by it, and by
// the `Workshops` job of .github/workflows/training.yml.
//
//   node scripts/workshops-ci.mjs <training dir>
//
// Prints a JSON object. Its `workshops` are every folder of solutions/ holding a
// package.json: there is no list to maintain, a new workshop is checked as soon
// as it is pushed. The training's optional workshops.ci.mjs only states what
// differs from the defaults:
//
//   setup               a command run in the training folder before any install
//                       (e.g. the sync of the files shared between trainings)
//   build               also `npm run build` each solution
//   quietTest           the `npm test` argument that drops Vitest's
//                       github-actions reporter on a starter expected to fail
//   learnerWritesTests  workshops whose starter must be GREEN, not red: the
//                       learner writes the tests, the starter ships todos
//   skip                workshops not checked at all
//   verifyScript        the training checks all its workshops at once with its
//                       own `pnpm run verify` (solutions) and
//                       `pnpm run verify --dir workshops` (starters)
//   elasticsearch       guided workshops, run in Kibana Dev Tools: the folder of the
//                       Dockerfile of the Elasticsearch their README requests are
//                       replayed against (scripts/check-console.mjs)

import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULTS = {
  setup: '',
  build: false,
  quietTest: '--reporter=default',
  learnerWritesTests: [],
  skip: [],
  verifyScript: false,
  elasticsearch: '',
};

/** The checks of the training in `dir`. */
export async function workshopChecks(dir) {
  const configFile = join(dir, 'workshops.ci.mjs');
  const config = existsSync(configFile) ? (await import(pathToFileURL(configFile))).default : {};
  const { setup, build, quietTest, learnerWritesTests, skip, verifyScript, elasticsearch } = { ...DEFAULTS, ...config };

  // A training without solutions (guided workshops, nothing to run) has nothing to check.
  const solutions = join(dir, 'solutions');
  const workshops = (existsSync(solutions) ? await readdir(solutions, { withFileTypes: true }) : [])
    .filter((entry) => entry.isDirectory() && existsSync(join(solutions, entry.name, 'package.json')))
    .map((entry) => entry.name)
    .filter((name) => !skip.includes(name))
    .sort()
    .map((name) => ({ name, starter: learnerWritesTests.includes(name) ? 'green' : 'red' }));

  return { workshops, setup, build, quietTest, verifyScript, elasticsearch };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await workshopChecks(resolve(process.argv[2]))));
}
