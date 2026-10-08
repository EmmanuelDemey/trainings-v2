// What .github/workflows/workshops.yml checks here — see scripts/workshops-ci.mjs.
export default {
  // The fake API (`src/api/`) and the spec of each workshop
  // (`src/tests/shared/workshop.spec.ts`) are gitignored copies of
  // tanstack-query-common/: write them before anything else.
  setup: 'node ../tanstack-query-common/scripts/sync.mjs',
  // Workshop 06 is the one where the LEARNER writes the tests: it has no shared
  // spec, and its starter ships `it.todo`s — green from the start. Its solution's
  // tests, the worked answer, must pass, and its starter must stay green.
  learnerWritesTests: ['06_testing'],
};
