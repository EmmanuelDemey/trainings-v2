// Checks that the workshops of a training still teach what they claim to — run
// by the `Workshops` job of .github/workflows/training.yml, and runnable as is:
//
//   node scripts/check-workshops.mjs <training dir> [--concurrency <n>]
//
// For every workshop listed by scripts/workshops-ci.mjs, the solution passes its
// specs and typechecks, and the starter typechecks but must NOT pass them — a
// starter that does means an answer leaked into it. A workshop where the learner
// writes the tests is checked the other way round: its starter must be green.
//
// The workshops run side by side, each in its own npm project. Each one's log is
// printed in one block once it is done (a collapsible group on GitHub Actions),
// then a summary table, also written to the job summary. Exits 1 if any failed.

import { spawn } from 'node:child_process';
import { appendFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { workshopChecks } from './workshops-ci.mjs';

/** Runs a shell command; resolves with its exit code and its interleaved output. */
function sh(command, cwd) {
  return new Promise((done) => {
    const child = spawn(command, { cwd, shell: true });
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('close', (code) => done({ code, output }));
  });
}

/** The steps of one workshop: [name, folder, command, whether it must pass]. */
function stepsOf(dir, workshop, { build, quietTest }) {
  const solution = join(dir, 'solutions', workshop.name);
  const starter = join(dir, 'workshops', workshop.name);
  return [
    ['Install the solution', solution, 'npm ci', true],
    ['The solution passes its specs', solution, 'npm test', true],
    ['The solution typechecks', solution, 'npm run typecheck', true],
    ...(build ? [['The solution builds', solution, 'npm run build', true]] : []),
    ['Install the starter', starter, 'npm ci', true],
    // The specs are part of the typecheck program, so this also proves they only
    // reference what the starter already exposes: a spec that fails to COMPILE
    // would be a broken exercise, not a red test.
    ['The starter still typechecks', starter, 'npm run typecheck', true],
    workshop.starter === 'green'
      ? ['The starter is green — nothing but todos', starter, 'npm test', true]
      : // quietTest drops the github-actions reporter Vitest adds under CI: every
        // red spec here is expected, and would otherwise surface as an error
        // annotation on a green run.
        ['The starter must still be unsolved', starter, `npm test -- ${quietTest}`, false],
  ];
}

async function checkWorkshop(dir, workshop, plan) {
  let log = '';
  for (const [step, cwd, command, mustPass] of stepsOf(dir, workshop, plan)) {
    const { code, output } = await sh(command, cwd);
    log += `── ${step}: ${command}\n${output}`;
    if ((code === 0) !== mustPass) return { result: { name: workshop.name, ok: false, failedStep: step }, log };
  }
  return { result: { name: workshop.name, ok: true, failedStep: null }, log };
}

/**
 * Checks every workshop of the training in `dir`, `concurrency` at a time.
 * `report(result, log)` is called as each one is done.
 */
export async function checkWorkshops(dir, { concurrency = 1, report = () => {} } = {}) {
  const plan = await workshopChecks(dir);
  if (plan.setup) {
    const { code, output } = await sh(plan.setup, dir);
    if (code !== 0) throw new Error(`The setup \`${plan.setup}\` failed:\n${output}`);
  }

  const results = [];
  const queue = plan.workshops.entries();
  const worker = async () => {
    for (const [index, workshop] of queue) {
      const { result, log } = await checkWorkshop(dir, workshop, plan);
      results[index] = result;
      report(result, log);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { concurrency: { type: 'string', default: String(availableParallelism()) } },
  });
  const dir = resolve(positionals[0]);
  const github = Boolean(process.env.GITHUB_ACTIONS);

  const results = await checkWorkshops(dir, {
    concurrency: Number(values.concurrency),
    report({ name, ok, failedStep }, log) {
      const title = `${ok ? '✅' : '❌'} ${name}${ok ? '' : ` — ${failedStep}`}`;
      console.log(github ? `::group::${title}\n${log}::endgroup::` : `${title}\n${log}`);
      if (github && !ok) console.log(`::error title=${name}::${failedStep}`);
    },
  });

  const table = [
    '| Workshop | |',
    '|---|---|',
    ...results.map(({ name, ok, failedStep }) => `| ${name} | ${ok ? '✅' : `❌ ${failedStep}`} |`),
  ].join('\n');
  console.log(`\n${table}`);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${table}\n`);
  if (results.some(({ ok }) => !ok)) process.exit(1);
}
