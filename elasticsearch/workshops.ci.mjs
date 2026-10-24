// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
//
// The workshops run in Kibana Dev Tools: every request of every README (the
// setup), then of its solutions/<workshop>/SOLUTION.md, is replayed against the
// Elasticsearch of ../elasticsearch-common/ci/Dockerfile — shared with
// elastic-security, so both trainings pin the same version — and its « Expected
// result » checked (scripts/check-console.mjs). The fixtures stay in ci/fixtures/.
export default { elasticsearch: '../elasticsearch-common/ci' };
