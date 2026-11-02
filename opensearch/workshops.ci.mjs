// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
//
// The workshops run in OpenSearch Dashboards Dev Tools: every request of every
// README (the setup), then of its solutions/<workshop>/SOLUTION.md, is replayed
// against the OpenSearch of ci/Dockerfile, and its « Résultat attendu » checked
// (scripts/check-console.mjs) — the script speaks the REST API OpenSearch shares
// with Elasticsearch 7.10, hence the key's name. The fixtures of the chapters stay
// in ci/fixtures/.
//
// Workshop 8 is done in the Dashboards UI: nothing to replay, but its sample data
// must still load in the lab of workshops/01_installation, and still hold the
// fields its README lists (scripts/check-dashboards.mjs).
//
// The `restaurants` setup several workshops and fixtures share lives once, in
// data/restaurants.md, copied where an include marks it (scripts/sync-includes.mjs).
export default { elasticsearch: 'ci', dashboards: 'workshops/01_installation' };
