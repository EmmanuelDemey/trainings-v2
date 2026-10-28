// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
//
// The workshops run in OpenSearch Dashboards Dev Tools: every request of every
// README (the setup), then of its solutions/<workshop>/SOLUTION.md, is replayed
// against the OpenSearch of ci/Dockerfile, and its « Résultat attendu » checked
// (scripts/check-console.mjs) — the script speaks the REST API OpenSearch shares
// with Elasticsearch 7.10, hence the key's name. The fixtures of the chapters stay
// in ci/fixtures/.
export default { elasticsearch: 'ci' };
