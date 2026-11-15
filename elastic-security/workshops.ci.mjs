// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
//
// The workshops run in Kibana: every Dev Tools request of every README (the
// setup), then of its solutions/<workshop>/SOLUTION.md, is replayed against the
// Elasticsearch of ../elasticsearch-common/ci/Dockerfile — the one the
// elasticsearch training uses too — and its « Expected result » checked
// (scripts/check-console.mjs).
// The fixtures of the chapters stay in ci/fixtures/.
export default { elasticsearch: '../elasticsearch-common/ci' };
