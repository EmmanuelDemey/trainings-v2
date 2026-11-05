// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
export default {
  // The test kit (`src/tests/shared/`) is a gitignored copy of sentry-common/:
  // write it before anything else.
  setup: 'node ../sentry-common/scripts/sync.mjs',
  // The production build is part of what workshop 03 teaches (source maps):
  // every solution must build.
  build: true,
};
