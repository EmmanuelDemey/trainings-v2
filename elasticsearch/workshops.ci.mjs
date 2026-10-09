// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
//
// The workshops are guided, run in Kibana Dev Tools: no solutions to test, but
// every request of every README is replayed against the Elasticsearch of
// ci/Dockerfile (scripts/check-console.mjs), and its « Résultat attendu » checked.
export default { elasticsearch: 'ci' };
