// What .github/workflows/workshops.yml checks here — see scripts/workshops-ci.mjs.
export default {
  // The fake API (`src/api/`) and the spec (`src/tests/shared/`) of every
  // workshop are gitignored copies of tanstack-query-common/: write them before
  // anything else.
  setup: 'node ../tanstack-query-common/scripts/sync.mjs',
  // Each workshop is an Angular CLI project: the solution must also build.
  build: true,
  // `ng test` takes Vitest's reporters as `--reporters`.
  quietTest: '--reporters=default',
  // Workshop 06 is the one where the LEARNER writes the tests: it has no shared
  // spec, and its starter is a list of `it.todo`s — green from the start. Its
  // solution's tests must pass, and its starter must stay green.
  learnerWritesTests: ['06_testing'],
};
