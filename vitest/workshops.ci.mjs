// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
//
// Nothing differs from the defaults. In workshops 1 to 6 the learner writes the
// tests, yet their starters are still red: the specs ship as `test.todo`, and
// the coverage thresholds of each config (100 % of src/) fail the run until the
// tests are written. Workshop 7 ships red specs, like the other trainings.
export default {};
