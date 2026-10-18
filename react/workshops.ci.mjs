// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
export default {
  // Workshop 3 is the one where the LEARNER writes the tests: its starter ships
  // `it.todo`s, green from the start. "The starter must fail" is meaningless there.
  learnerWritesTests: ['03_unit_testing'],
  // Workshop 21 is graded by Cypress against a running dev server, which this
  // check does not start.
  skip: ['21_e2e'],
};
