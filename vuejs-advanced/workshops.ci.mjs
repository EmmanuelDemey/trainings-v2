// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
export default {
  // The workshops where the LEARNER writes the tests, so their starters are
  // green from the start: `03_testing` ships empty tests that assert nothing,
  // next to a few given worked examples, and `12_testing_integration` ships
  // `it.todo`s. "The starter must fail" is meaningless there.
  skip: ['03_testing', '12_testing_integration'],
};
