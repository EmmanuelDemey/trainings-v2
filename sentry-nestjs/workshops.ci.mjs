// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
export default {
  // The test kit (`src/tests/shared/`) is a gitignored copy of
  // sentry-common/testkit/: write it before anything else.
  setup: 'node ../sentry-common/scripts/sync.mjs',
  // Workshop 03 checks what `npm run build` emits: build every solution.
  build: true,
};
