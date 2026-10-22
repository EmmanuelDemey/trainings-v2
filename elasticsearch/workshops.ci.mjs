// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
//
// The workshops are guided, run in Kibana Dev Tools: no solutions to test, but
// every request of every README is replayed against the Elasticsearch of
// ../elasticsearch-common/ci/Dockerfile — shared with elastic-security, so both
// trainings pin the same version — and its « Résultat attendu » checked
// (scripts/check-console.mjs). The fixtures stay in ci/fixtures/.
export default { elasticsearch: '../elasticsearch-common/ci' };
