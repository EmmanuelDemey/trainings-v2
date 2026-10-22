// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
//
// The workshops are guided, run in Kibana: no solutions to test, but every
// Dev Tools request of every README is replayed against the Elasticsearch of
// ../elasticsearch-common/ci/Dockerfile — the one the elasticsearch training
// uses too — and its « Résultat attendu » checked (scripts/check-console.mjs).
// The fixtures of the chapters stay in ci/fixtures/.
export default { elasticsearch: '../elasticsearch-common/ci' };
